import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { randomUUID } from "crypto";
import { NextFunction, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, sellerStripeAccountId, sessionId } = req.body;

    if (!amount || !sellerStripeAccountId || !sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: amount, sellerStripeAccountId, sessionId",
      });
    }

    // Verify session exists
    const sessionData = await redis.get(`payment-session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    const session = JSON.parse(sessionData);

    // Verify the seller exists in the session
    const seller = session.sellers.find(
      (s: any) => s.stripeAccountId === sellerStripeAccountId
    );
    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller for this session",
      });
    }

    // Convert amount to cents (amount is received in dollars)
    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round(amountInCents * 0.05); // 5% platform fee

    // Validate minimum amount (Stripe requires at least $0.50)
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
        userId: req.user.id,
        sellerStripeAccountId,
        shopId: seller.shopId,
        originalAmount: amount.toString(),
        platformFee: (platformFee / 100).toString(),
      },
    });

    console.log(
      `Payment intent created: ${paymentIntent.id} for seller: ${seller.shopId}`
    );

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeCardError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

// create payment session
export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user.id;

    if (!cart || !selectedAddressId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: cart, selectedAddressId",
      });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or invalid",
      });
    }

    // Validate cart items
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

    // Normalize cart for comparison
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

    // Check for existing sessions for this user
    const keys = await redis.keys("payment-session:*");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            console.log(`Reusing existing session: ${key.split(":")[1]}`);
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            // Clean up old session
            await redis.del(key);
            if (session.orderIds && session.orderIds.length > 0) {
              await releaseInventoryForOrders(session.orderIds);
            }
          }
        }
      }
    }

    // Get unique shop IDs from cart
    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    // Fetch shop and seller information
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

    // Validate that all shops exist
    const foundShopIds = shops.map((shop) => shop.id);
    const missingShops = uniqueShopIds.filter(
      (id) => !foundShopIds.includes(id)
    );
    if (missingShops.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some shops not found: ${missingShops.join(", ")}`,
      });
    }

    // Validate that all shops have Stripe accounts
    const missingStripeAccounts = shops.filter(
      (shop) => !shop.sellers?.stripeId
    );
    if (missingStripeAccounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some sellers don't have Stripe accounts configured: ${missingStripeAccounts
          .map((s) => s.id)
          .join(", ")}`,
      });
    }

    // Create seller data mapping
    const sellerData = shops.reduce((acc, shop) => {
      acc[shop.id] = {
        shopId: shop.id,
        sellerId: shop.sellerId,
        stripeAccountId: shop.sellers?.stripeId,
      };
      return acc;
    }, {} as Record<string, any>);

    // Group cart items by shop
    const shopGrouped = cart.reduce((acc: any, item: any) => {
      if (!acc[item.shopId]) acc[item.shopId] = [];
      acc[item.shopId].push(item);
      return acc;
    }, {});

    const sessionId = randomUUID();

    // Create pending orders with inventory reservation
    const pendingOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const shopId of uniqueShopIds) {
        const shopCart = shopGrouped[shopId];
        const shopTotal = shopCart.reduce(
          (sum: number, item: any) => sum + item.quantity * item.sale_price,
          0
        );

        // Check and reserve inventory
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

          // Reserve inventory
          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Create order items
        const orderItems = shopCart.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.sale_price,
          selectedOptions: item.selectedOptions || {},
        }));

        // Create pending order
        const order = await tx.order.create({
          data: {
            userId,
            shopId,
            total: shopTotal,
            status: "Pending",
            shippingAddressId: selectedAddressId,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: { create: orderItems },
          },
        });

        orders.push(order);
      }

      return orders;
    });

    // Calculate shop totals
    const shopTotals = Object.entries(shopGrouped).reduce(
      (acc, [shopId, items]) => {
        acc[shopId] = (items as any[]).reduce(
          (sum, item) => sum + item.quantity * item.sale_price,
          0
        );
        return acc;
      },
      {} as Record<string, number>
    );

    // Create session data
    const sessionData = {
      userId,
      cart,
      sellers: Object.values(sellerData),
      shopTotals,
      totalAmount: cart.reduce(
        (total, item) => total + item.quantity * item.sale_price,
        0
      ),
      shippingAddressId: selectedAddressId,
      coupon: coupon || null,
      orderIds: pendingOrders.map((order) => order.id),
      createdAt: Date.now(),
    };

    // Store session in Redis with 1 hour expiration
    await redis.setex(
      `payment-session:${sessionId}`,
      3600,
      JSON.stringify(sessionData)
    );

    console.log(`Session created: ${sessionId} for user: ${userId}`);

    return res.status(200).json({ sessionId });
  } catch (error: any) {
    console.error("Create payment session error:", error);

    // Handle specific database errors
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "One or more items not found",
      });
    }

    return next(error);
  }
};

// verify payment session
export const verifyPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
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

    const session = JSON.parse(sessionData);

    // Verify session belongs to current user
    if (session.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    // Get current orders status
    const orders = await prisma.order.findMany({
      where: {
        id: { in: session.orderIds },
        userId: req.user.id,
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
      },
    });

    // Check if any orders are missing
    if (orders.length !== session.orderIds.length) {
      console.warn(`Some orders missing for session: ${sessionId}`);
    }

    return res.status(200).json({
      success: true,
      session,
      orders,
    });
  } catch (error) {
    console.error("Verify payment session error:", error);
    return next(error);
  }
};

// Webhook handler for completed payments
export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];

    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rawBody = (req as any).rawBody;
    let event;

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
        console.warn("Session data expired or missing for", sessionId);
        return res.status(200).send("Session not found");
      }

      const session = JSON.parse(sessionData);

      await prisma.$transaction(async (tx) => {
        // Find orders for this specific shop
        const orders = await tx.order.findMany({
          where: {
            id: { in: session.orderIds },
            shopId: shopId,
            status: "Pending",
          },
        });

        for (const order of orders) {
          // Apply coupon discount if applicable
          let finalTotal = session.shopTotals[shopId];

          if (session.coupon && session.coupon.discountedProductId) {
            const shopCart = session.cart.filter(
              (item: any) => item.shopId === shopId
            );
            const discountedItem = shopCart.find(
              (item: any) => item.id === session.coupon.discountedProductId
            );

            if (discountedItem) {
              const discount =
                session.coupon.discountPercent > 0
                  ? (discountedItem.sale_price *
                      discountedItem.quantity *
                      session.coupon.discountPercent) /
                    100
                  : session.coupon.discountAmount;
              finalTotal = Math.max(0, finalTotal - discount);
            }
          }

          // Update order to paid status
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "Paid",
              total: finalTotal,
              paidAt: new Date(),
              paymentIntentId: paymentIntent.id,
            },
          });

          console.log(`Order ${order.id} marked as paid`);
        }
      });

      // Check if all orders in this session are now paid
      const remainingPendingOrders = await prisma.order.count({
        where: {
          id: { in: session.orderIds },
          status: "Pending",
        },
      });

      // Clean up session if all orders are processed
      if (remainingPendingOrders === 0) {
        await redis.del(sessionKey);
        console.log(`Session ${sessionId} completed and cleaned up`);
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    return next(error);
  }
};

// Helper function to release inventory for failed/expired orders
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
        // Release inventory for each item
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Delete the pending orders
      await tx.order.deleteMany({
        where: {
          id: { in: orderIds },
          status: "Pending",
        },
      });
    });

    console.log(`Released inventory for orders: ${orderIds.join(", ")}`);
  } catch (error) {
    console.error("Error releasing inventory:", error);
  }
};

// Cleanup expired sessions (call this periodically)
export const cleanupExpiredSessions = async () => {
  try {
    const keys = await redis.keys("payment-session:*");
    const currentTime = Date.now();
    let cleanedCount = 0;

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        // If session is older than 1 hour, clean it up
        if (currentTime - session.createdAt > 3600000) {
          await releaseInventoryForOrders(session.orderIds);
          await redis.del(key);
          cleanedCount++;
        }
      }
    }

    console.log(`Cleaned up ${cleanedCount} expired sessions`);
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
};
