import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

interface CartItem {
  id: string;
  quantity: number;
  sale_price: number;
  shopId: string;
  selectedOptions?: Record<string, string>;
}

interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  discountedProductId?: string;
}

interface SellerData {
  shopId: string;
  sellerId: string;
  stripeAccountId: string;
}

interface SessionData {
  userId: string;
  cart: CartItem[];
  sellers: SellerData[];
  shopTotals: Record<string, number>;
  totalAmount: number;
  shippingAddressId: string;
  coupon: Coupon | null;
  orderIds: string[];
  createdAt: number;
}

// Create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, sellerStripeAccountId, sessionId } = req.body;
    const userId = req.user?.id;

    if (!amount || !sellerStripeAccountId || !sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: amount, sellerStripeAccountId, sessionId, or userId",
      });
    }

    const sessionData = await redis.get(`payment-session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    const session: SessionData = JSON.parse(sessionData);
    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    const seller = session.sellers.find(
      (s) => s.stripeAccountId === sellerStripeAccountId
    );
    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller for this session",
      });
    }

    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round(amountInCents * 0.05);

    if (amountInCents < 50) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least $0.50",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId,
        sellerStripeAccountId,
        shopId: seller.shopId,
        originalAmount: amount.toString(),
        platformFee: (platformFee / 100).toString(),
      },
    });

    console.log(
      `Payment intent created: ${paymentIntent.id} for shop: ${seller.shopId}`
    );

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error.message);
    if (error.type === "StripeCardError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

// Create payment session
export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user?.id;

    if (!cart || !selectedAddressId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: cart, selectedAddressId, or userId",
      });
    }

    const address = await prisma.shippingAddress.findFirst({
      where: { id: selectedAddressId, userId },
    });
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unauthorized shipping address",
      });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or invalid",
      });
    }

    for (const item of cart) {
      if (!item.id || !item.quantity || !item.sale_price || !item.shopId) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item format",
        });
      }
      if (item.quantity <= 0 || item.sale_price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity or price",
        });
      }
    }

    // Validate coupon if provided
    if (coupon?.code) {
      const discountCode = await prisma.discountCode.findUnique({
        where: { discountCode: coupon.code },
      });
      if (!discountCode) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item) => ({
          id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys("payment-session:*");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session: SessionData = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a, b) => a.id.localeCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            console.log(`Reusing existing session: ${key.split(":")[1]}`);
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            await redis.del(key);
            if (session.orderIds?.length > 0) {
              await releaseInventoryForOrders(session.orderIds);
            }
          }
        }
      }
    }

    const uniqueShopIds = [...new Set(cart.map((item) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: { id: { in: uniqueShopIds } },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
            id: true,
          },
        },
      },
    });

    const foundShopIds = shops.map((shop) => shop.id);
    const missingShops = uniqueShopIds.filter(
      (id) => !foundShopIds.includes(id)
    );
    if (missingShops.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Shops not found: ${missingShops.join(", ")}`,
      });
    }

    const missingStripeAccounts = shops.filter(
      (shop) => !shop.sellers?.stripeId
    );
    if (missingStripeAccounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some sellers lack Stripe accounts: ${missingStripeAccounts
          .map((s) => s.id)
          .join(", ")}`,
      });
    }

    const sellerData = shops.reduce((acc, shop) => {
      acc[shop.id] = {
        shopId: shop.id,
        sellerId: shop.sellerId,
        stripeAccountId: shop.sellers!.stripeId!,
      };
      return acc;
    }, {} as Record<string, SellerData>);

    const shopGrouped = cart.reduce((acc: Record<string, CartItem[]>, item) => {
      if (!acc[item.shopId]) acc[item.shopId] = [];
      acc[item.shopId].push(item);
      return acc;
    }, {});

    const sessionId = randomUUID();

    const pendingOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const shopId of uniqueShopIds) {
        const shopCart = shopGrouped[shopId];
        let shopTotal = shopCart.reduce(
          (sum: number, item: CartItem) =>
            sum + item.quantity * item.sale_price,
          0
        );

        let discountAmount = 0;
        if (coupon?.discountedProductId) {
          const discountedItem = shopCart.find(
            (item) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            discountAmount =
              coupon?.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount || 0;
            shopTotal = Math.max(0, shopTotal - discountAmount);
          }
        }

        for (const item of shopCart) {
          const product = await tx.product.findUnique({
            where: { id: item.id },
            select: { stock: true, title: true },
          });

          if (!product) {
            throw new Error(`Product not found: ${item.id}`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }

          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const orderItems = shopCart.map((item: CartItem) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.sale_price,
          selectedOptions: item.selectedOptions || {},
        }));

        const order = await tx.order.create({
          data: {
            userId,
            shopId,
            total: shopTotal,
            status: "Pending",
            shippingAddressId: selectedAddressId,
            couponCode: coupon?.code || null,
            discountAmount,
            items: { create: orderItems },
          },
        });

        orders.push(order);
      }

      return orders;
    });

    const shopTotals = Object.entries(shopGrouped).reduce(
      (acc, [shopId, items]: [string, CartItem[]]) => {
        let total = items.reduce(
          (sum, item) => sum + item.quantity * item.sale_price,
          0
        );
        if (coupon?.discountedProductId) {
          const shopCart = items.filter((item) => item.shopId === shopId);
          const discountedItem = shopCart.find(
            (item) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount || 0;
            total = Math.max(0, total - discount);
          }
        }
        acc[shopId] = total;
        return acc;
      },
      {} as Record<string, number>
    );

    const sessionData: SessionData = {
      userId,
      cart,
      sellers: Object.values(sellerData),
      shopTotals,
      totalAmount: Object.values(shopTotals).reduce(
        (sum: number, val: number) => sum + val,
        0
      ),
      shippingAddressId: selectedAddressId,
      coupon: coupon || null,
      orderIds: pendingOrders.map((order) => order.id),
      createdAt: Date.now(),
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      3600,
      JSON.stringify(sessionData)
    );

    console.log(`Session created: ${sessionId} for user: ${userId}`);

    return res.status(200).json({ sessionId });
  } catch (error: any) {
    console.error("Create payment session error:", error.message);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "One or more items not found",
      });
    }
    return next(error);
  }
};

// Verify payment session
export const verifyPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;
    const userId = req.user?.id;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Session ID and user ID are required",
      });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    const session: SessionData = JSON.parse(sessionData);

    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        id: { in: session.orderIds },
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
              },
            },
          },
        },
        shop: {
          select: {
            name: true,
          },
        },
      },
    });

    if (orders.length !== session.orderIds.length) {
      console.warn(`Some orders missing for session: ${sessionId}`);
    }

    return res.status(200).json({
      success: true,
      session,
      orders,
    });
  } catch (error: any) {
    console.error("Verify payment session error:", error.message);
    return next(error);
  }
};

// Webhook handler for completed payments
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];
    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rawBody = (req as any).rawBody;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { sessionId, sellerStripeAccountId, shopId } =
        paymentIntent.metadata;

      if (!sessionId || !sellerStripeAccountId || !shopId) {
        console.error("Missing required metadata in payment intent");
        return res.status(200).send("Missing metadata");
      }

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn(`Session data expired or missing for ${sessionId}`);
        return res.status(200).send("Session not found");
      }

      const session: SessionData = JSON.parse(sessionData);

      await prisma.$transaction(async (tx) => {
        const orders = await tx.order.findMany({
          where: {
            id: { in: session.orderIds },
            shopId,
            status: "Pending",
          },
        });

        for (const order of orders) {
          let finalTotal = session.shopTotals[shopId];

          if (session?.coupon?.discountedProductId) {
            const shopCart = session.cart.filter(
              (item) => item.shopId === shopId
            );
            const discountedItem = shopCart.find(
              (item) => item.id === session?.coupon?.discountedProductId
            );

            if (discountedItem) {
              const discount =
                session?.coupon?.discountPercent &&
                session?.coupon?.discountPercent > 0
                  ? (discountedItem.sale_price *
                      discountedItem.quantity *
                      session.coupon.discountPercent) /
                    100
                  : session.coupon.discountAmount || 0;
              finalTotal = Math.max(0, finalTotal - discount);
            }
          }

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "Paid",
              total: finalTotal,
              paidAt: new Date(),
              paymentIntentId: paymentIntent.id,
            },
          });

          await tx.paymentDistribution.create({
            data: {
              orderId: order.id,
              shopId,
              sellerId: session.sellers.find((s) => s.shopId === shopId)!
                .sellerId,
              amount: finalTotal,
              platformFee: finalTotal * 0.05,
              paymentIntentId: paymentIntent.id,
              status: "Completed",
              createdAt: new Date(),
            },
          });

          console.log(`Order ${order.id} marked as paid for shop ${shopId}`);
        }
      });

      const remainingPendingOrders = await prisma.order.count({
        where: {
          id: { in: session.orderIds },
          status: "Pending",
        },
      });

      if (remainingPendingOrders === 0) {
        await redis.del(sessionKey);
        console.log(`Session ${sessionId} completed and cleaned up`);
      }
    }

    return res.status(200).send("OK");
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return next(error);
  }
};

// Release inventory for failed/expired orders
export const releaseInventoryForOrders = async (orderIds: string[]) => {
  try {
    await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: {
          id: { in: orderIds },
          status: "Pending",
        },
        include: {
          items: true,
        },
      });

      for (const order of orders) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.deleteMany({
        where: {
          id: { in: orderIds },
          status: "Pending",
        },
      });
    });

    console.log(`Released inventory for orders: ${orderIds.join(", ")}`);
  } catch (error: any) {
    console.error("Error releasing inventory:", error.message);
  }
};

// Cleanup expired sessions
export const cleanupExpiredSessions = async () => {
  try {
    const keys = await redis.keys("payment-session:*");
    const currentTime = Date.now();
    let cleanedCount = 0;

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session: SessionData = JSON.parse(data);
        if (currentTime - session.createdAt > 3600 * 1000) {
          await releaseInventoryForOrders(session.orderIds);
          await redis.del(key);
          cleanedCount++;
        }
      }
    }

    console.log(`Cleaned up ${cleanedCount} expired sessions`);
  } catch (error: any) {
    console.error("Error cleaning up expired sessions:", error.message);
  }
};
