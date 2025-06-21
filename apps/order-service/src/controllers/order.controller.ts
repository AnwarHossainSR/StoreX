import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { z } from "zod";
import { sendOrderEmail } from "../utils/sendOrderEmail";

import {
  notifySellerOrderReceived,
  notifySellerPaymentReceived,
} from "../services/notificationService";
import { generateOrderId, generatePaymentId } from "../utils/helper";
import {
  allowedSortFields,
  CartItem,
  CustomRequest,
  OrderIdSchema,
  ProcessFullPaymentRequest,
  ProcessFullPaymentSchema,
  SellerData,
  SessionData,
  SortField,
  stripe,
} from "../utils/types";

// process full payment and disburse to sellers
export const processFullPayment = async (
  req: ProcessFullPaymentRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { paymentMethodId, sessionId } = ProcessFullPaymentSchema.parse(
      req.body
    );
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Retrieve session from Redis
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    if (!sessionData) {
      console.error(`Session not found or expired for sessionId: ${sessionId}`);
      return res.status(400).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    const session: SessionData = JSON.parse(sessionData);
    if (session.userId !== userId) {
      console.error(
        `Unauthorized access: session userId ${session.userId} does not match request userId ${userId}`
      );
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    // Calculate total amount including shipping
    const subtotal = session.totalAmount;
    const shipping =
      subtotal > 100 || session.coupon?.code.toUpperCase() === "FREESHIP"
        ? 0
        : 10;
    const totalAmount = Math.max(0, subtotal + shipping);
    const amountInCents = Math.round(totalAmount * 100);

    if (amountInCents < 50) {
      return res.status(400).json({
        success: false,
        message: "Total amount must be at least $0.50",
      });
    }

    // Validate FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL || "https://localhost:3000";
    const sellerUrl = process.env.SELLER_URL || "https://localhost:6004";

    if (!frontendUrl.match(/^https?:\/\//)) {
      console.error(
        "FRONTEND_URL must include an explicit scheme (http or https)"
      );
      throw new Error("Invalid FRONTEND_URL configuration");
    }

    if (!sellerUrl.match(/^https?:\/\//)) {
      console.error(
        "SELLER_URL must include an explicit scheme (http or https)"
      );
      throw new Error("Invalid SELLER_URL configuration");
    }

    // Log platform balance for debugging
    const balance = await stripe.balance.retrieve();
    const availableBalance =
      balance.available.find((b) => b.currency === "usd")?.amount || 0;
    console.log(`Platform available balance: ${availableBalance / 100} USD`);

    // Find or create a Stripe Customer
    let customer = await prisma.users.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    let customerId: string;
    if (!customer?.stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer?.email,
        name: customer?.name,
        metadata: { userId },
      });
      customerId = stripeCustomer.id;
      console.log("Created Stripe Customer:", customerId);
      await prisma.users.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
      console.log("Updated user with Stripe Customer ID:", customerId);
    } else {
      customerId = customer.stripeCustomerId;
      console.log("Found Stripe Customer:", customerId);
    }

    // Attach PaymentMethod to Customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    console.log("Attached PaymentMethod to Customer:", paymentMethodId);

    // Validate connected accounts
    for (const seller of session.sellers) {
      try {
        const account = await stripe.accounts.retrieve(seller.stripeAccountId);
        if (!account.charges_enabled || !account.payouts_enabled) {
          console.error(
            `Connected account ${seller.stripeAccountId} is not fully onboarded`
          );
          throw new Error(
            `Seller account ${seller.stripeAccountId} is not ready for transfers`
          );
        }
        console.log(`Validated connected account: ${seller.stripeAccountId}`);
      } catch (error) {
        console.error(
          `Error validating connected account ${seller.stripeAccountId}:`,
          error
        );
        throw error;
      }
    }

    // Create PaymentIntent
    const paymentIntent: any = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method: paymentMethodId,
      payment_method_types: ["card"],
      confirm: true,
      customer: customerId,
      return_url: `${frontendUrl}/checkout?tab=complete&session_id=${sessionId}`,
      metadata: {
        sessionId,
        userId,
      },
    });

    if (paymentIntent.status !== "succeeded") {
      console.error(
        `PaymentIntent failed: ${paymentIntent.id}, status: ${paymentIntent.status}`
      );
      throw new Error("Payment confirmation failed");
    }
    console.log("PaymentIntent created:", paymentIntent.id);

    // Function to get charge with retry logic
    const getChargeWithRetry = async (
      paymentIntentId: string,
      maxRetries = 5,
      delay = 1000
    ): Promise<string> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // First, try to get the charge from the PaymentIntent
          const updatedPaymentIntent: any =
            await stripe.paymentIntents.retrieve(paymentIntentId, {
              expand: ["charges"],
            });

          if (updatedPaymentIntent.charges?.data?.[0]?.id) {
            return updatedPaymentIntent.charges.data[0].id;
          }

          // If no charge found, try listing charges for this PaymentIntent
          const charges = await stripe.charges.list({
            payment_intent: paymentIntentId,
            limit: 1,
          });

          if (charges.data.length > 0) {
            return charges.data[0].id;
          }

          if (attempt < maxRetries) {
            console.log(
              `Attempt ${attempt}: No charge found for PaymentIntent ${paymentIntentId}, retrying in ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 1.5; // Exponential backoff
          }
        } catch (error) {
          console.error(
            `Error retrieving charge on attempt ${attempt}:`,
            error
          );
          if (attempt === maxRetries) throw error;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      throw new Error(
        `No charge found for PaymentIntent ${paymentIntentId} after ${maxRetries} attempts`
      );
    };

    // Get the charge ID with retry logic
    const chargeId = await getChargeWithRetry(paymentIntent.id);
    console.log(
      `Found charge: ${chargeId} for PaymentIntent: ${paymentIntent.id}`
    );

    // Prepare email data
    let allOrderItems: any[] = [];
    let allOrders: any[] = [];
    let discountAmount = 0;

    // Calculate discount amount
    if (session.coupon?.discountedProductId) {
      const discountedItem = session.cart.find(
        (item) => item.id === session.coupon?.discountedProductId
      );
      if (discountedItem) {
        discountAmount =
          session.coupon.discountPercent && session.coupon.discountPercent > 0
            ? (discountedItem.sale_price *
                discountedItem.quantity *
                session.coupon.discountPercent) /
              100
            : session.coupon.discountAmount || 0;
      }
    }

    // Create Transfers for each seller and collect order data
    await prisma.$transaction(async (tx: any) => {
      for (const seller of session.sellers) {
        const sellerItems = session.cart.filter(
          (item) => item.shopId === seller.shopId
        );
        if (sellerItems.length === 0) continue;

        let sellerAmount = session.shopTotals[seller.shopId];
        if (session.coupon?.discountedProductId) {
          const discountedItem = sellerItems.find(
            (item) => item.id === session.coupon?.discountedProductId
          );
          if (discountedItem) {
            const discount =
              session.coupon.discountPercent &&
              session.coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    session.coupon.discountPercent) /
                  100
                : session.coupon.discountAmount || 0;
            sellerAmount = Math.max(0, sellerAmount - discount);
          }
        }

        const sellerAmountInCents = Math.round(sellerAmount * 100);
        const platformFee = Math.round(sellerAmountInCents * 0.05);
        const transferAmount = sellerAmountInCents - platformFee;

        console.log(
          `Preparing transfer of ${transferAmount / 100} USD to ${
            seller.stripeAccountId
          }`
        );

        if (transferAmount > 0) {
          await stripe.transfers.create({
            amount: transferAmount,
            currency: "usd",
            destination: seller.stripeAccountId,
            source_transaction: chargeId,
            metadata: {
              sessionId,
              userId,
              shopId: seller.shopId,
              sellerStripeAccountId: seller.stripeAccountId,
              originalAmount: sellerAmount.toString(),
              platformFee: (platformFee / 100).toString(),
            },
          });
          console.log(
            `Transfer created to ${seller.stripeAccountId} for ${
              transferAmount / 100
            } USD`
          );

          // Get seller details for notifications
          const sellerDetails = await tx.sellers.findUnique({
            where: { id: seller.sellerId },
            select: { email: true, name: true },
          });

          // Update order status and collect order data
          const orders = await tx.order.findMany({
            where: {
              id: { in: session.orderIds },
              shopId: seller.shopId,
              status: "Pending",
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          });

          for (const order of orders) {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: "Paid",
                total: sellerAmount,
                paidAt: new Date(),
                paymentIntentId: paymentIntent.id,
              },
            });

            await tx.paymentDistribution.create({
              data: {
                orderId: order.id,
                shopId: seller.shopId,
                sellerId: seller.sellerId,
                amount: sellerAmount,
                platformFee: platformFee / 100,
                paymentIntentId: paymentIntent.id,
                status: "Completed",
                createdAt: new Date(),
              },
            });

            // Collect order data for email
            allOrders.push(order);

            // Transform order items for email template
            const emailOrderItems = order.items.map((item: any) => ({
              name: item.product.title,
              quantity: item.quantity,
              price: item.price,
              selectedOptions: item.selectedOptions || {},
            }));

            allOrderItems.push(...emailOrderItems);

            console.log(
              `Order ${order.id} marked as paid for shop ${seller.shopId}`
            );

            // Send notifications to seller (async - don't wait)
            if (sellerDetails?.email) {
              // Send order received notification
              notifySellerOrderReceived(
                seller.sellerId,
                order.id,
                sellerAmount,
                customer?.name || "Customer",
                sellerDetails.email,
                userId
              ).catch((error) => {
                console.error(
                  `Failed to send order notification to seller ${seller.sellerId}:`,
                  error
                );
              });

              // Send payment received notification
              notifySellerPaymentReceived(
                seller.sellerId,
                order.id,
                sellerAmount,
                platformFee / 100,
                sellerDetails.email,
                userId
              ).catch((error) => {
                console.error(
                  `Failed to send payment notification to seller ${seller.sellerId}:`,
                  error
                );
              });
            }
          }
        }
      }

      // Clean up session if all orders are paid
      const remainingPendingOrders = await tx.order.count({
        where: {
          id: { in: session.orderIds },
          status: "Pending",
        },
      });

      if (remainingPendingOrders === 0) {
        await redis.del(sessionKey);
        console.log(`Session ${sessionId} completed and cleaned up`);
      }
    });

    // Send order confirmation email
    if (customer?.email && allOrderItems.length > 0) {
      const shippingData = await prisma.shippingAddress.findUnique({
        where: { id: session?.shippingAddressId },
      });
      const orderConfirmationData = {
        customerName: customer.name || "Valued Customer",
        orderId: sessionId,
        orderDate: new Date().toLocaleDateString(),
        orderItems: allOrderItems,
        totalAmount: totalAmount,
        shippingCost: shipping,
        discountAmount: discountAmount,
        shippingAddress: shippingData || {
          name: customer.name || "N/A",
          address: "Address not provided",
          city: "N/A",
          state: "N/A",
          postalCode: "N/A",
          country: "N/A",
          phone: "N/A",
        },
        trackOrderUrl: `${frontendUrl}/orders/${sessionId}`,
      };

      try {
        await sendOrderEmail(
          customer.email,
          "Order Confirmation - StoreX",
          "order-confirmation",
          orderConfirmationData
        );
        console.log(`Order confirmation email sent to ${customer.email}`);
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }

      // Send payment received email
      const paymentReceivedData = {
        customerName: customer.name || "Valued Customer",
        orderId: sessionId,
        paymentAmount: totalAmount,
        paymentDate: new Date().toLocaleDateString(),
        paymentMethod: "Card",
        paymentIntentId: paymentIntent.id,
        transactionId: chargeId,
        orderItems: allOrderItems,
        shippingCost: shipping,
        discountAmount: discountAmount,
      };

      try {
        await sendOrderEmail(
          customer.email,
          "Payment Confirmation - StoreX",
          "payment-received",
          paymentReceivedData
        );
        console.log(`Payment confirmation email sent to ${customer.email}`);
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError);
        // Don't fail the entire payment process if email fails
      }
    }

    console.log(
      "Payment processing completed for PaymentIntent:",
      paymentIntent.id
    );

    return res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Process full payment error:", error.message);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
    }
    if (
      error.type === "StripeCardError" ||
      error.type === "InvalidRequestError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === "balance_insufficient") {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds in platform account to process transfers.",
      });
    }
    return next(error);
  }
};

// Existing createPaymentSession (unchanged)
export const createPaymentSession = async (
  req: CustomRequest,
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

    const foundShopIds = shops.map((shop: any) => shop.id);
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
      (shop: any) => !shop.sellers?.stripeId
    );
    if (missingStripeAccounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some sellers lack Stripe accounts: ${missingStripeAccounts
          .map((s: any) => s.id)
          .join(", ")}`,
      });
    }

    const sellerData = shops.reduce((acc: any, shop: any) => {
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

    const pendingOrders = await prisma.$transaction(async (tx: any) => {
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

        const orderId = await generateOrderId(shopId);
        const userId = req.user?.id!;
        const selectedAddressId = req.body.selectedAddressId;

        const order = await tx.order.create({
          data: {
            userId,
            shopId,
            orderId,
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
      orderIds: pendingOrders.map((order: any) => order.id),
      createdAt: Date.now(),
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      7200,
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

// Verify payment session (unchanged)
export const verifyPaymentSession = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;
    const userId = req.user?.id;

    if (!sessionId || !userId) {
      console.error("Missing sessionId or userId:", { sessionId, userId });
      return res.status(400).json({
        success: false,
        message: "Session ID and user ID are required",
      });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      console.error("Session not found or expired:", { sessionId });
      return res.status(200).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    const session: SessionData = JSON.parse(sessionData);

    if (session.userId !== userId) {
      console.error("Unauthorized session access:", {
        sessionId,
        sessionUserId: session.userId,
        requestingUserId: userId,
      });
      return res.status(200).json({
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
      console.warn(`Some orders missing for session: ${sessionId}`, {
        expectedOrderIds: session.orderIds,
        foundOrders: orders.map((o: any) => o.id),
      });
    }

    return res.status(200).json({
      success: true,
      session,
      orders,
    });
  } catch (error: any) {
    console.error("Verify payment session error:", {
      sessionId: req.query.sessionId,
      error: error.message,
      stack: error.stack,
    });
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
      const { sessionId } = paymentIntent.metadata;

      if (!sessionId) {
        console.error("Missing sessionId in payment intent metadata");
        return res.status(200).send("Missing metadata");
      }

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn(`Session data expired or missing for ${sessionId}`);
        return res.status(200).send("Session not found");
      }

      const session: SessionData = JSON.parse(sessionData);

      await prisma.$transaction(async (tx: any) => {
        for (const seller of session.sellers) {
          const orders = await tx.order.findMany({
            where: {
              id: { in: session.orderIds },
              shopId: seller.shopId,
              status: "Pending",
            },
          });

          for (const order of orders) {
            let finalTotal = session.shopTotals[seller.shopId];

            if (session?.coupon?.discountedProductId) {
              const shopCart = session.cart.filter(
                (item) => item.shopId === seller.shopId
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
                paymentId: await generatePaymentId(order.id, seller.shopId),
                shopId: seller.shopId,
                sellerId: seller.sellerId,
                amount: finalTotal,
                platformFee: finalTotal * 0.05,
                paymentIntentId: paymentIntent.id,
                status: "Completed",
                createdAt: new Date(),
              },
            });

            console.log(
              `Order ${order.id} marked as paid for shop ${seller.shopId}`
            );
          }
        }

        // Clean up session
        await redis.del(sessionKey);
        console.log(`Session ${sessionId} completed and cleaned up`);
      });
    }

    return res.status(200).send("OK");
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return next(error);
  }
};

// Release inventory for failed/expired orders (unchanged)
export const releaseInventoryForOrders = async (orderIds: string[]) => {
  try {
    await prisma.$transaction(async (tx: any) => {
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

// Cleanup expired sessions (unchanged)
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

// Get all orders for a user
export const getAllOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        shop: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        shippingAddress: {
          select: {
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: orders.map((order: any) => ({
        id: order.id,
        orderId: order.orderId,
        date: order.createdAt.toISOString().split("T")[0],
        status: order.status,
        total: `$${order.total.toFixed(2)}`,
        items: order.items.length,
        shopName: order.shop.name,
      })),
    });
  } catch (error: any) {
    console.error("Get all orders error:", error.message);
    return next(error);
  }
};

// Get single order by ID
export const getSingleOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = OrderIdSchema.parse(req.params);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        shop: {
          select: {
            name: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderId: order.orderId,
        date: order.createdAt.toISOString().split("T")[0],
        status: order.status,
        total: order.total,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        shop: {
          name: order.shop.name,
          address: order.shop.address,
        },
        shippingAddress: order.shippingAddress,
        items: order.items.map((item: any) => ({
          productId: item.productId,
          title: item.product.title,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0]?.url,
          selectedOptions: item.selectedOptions,
        })),
      },
    });
  } catch (error: any) {
    console.error("Get single order error:", error.message);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
    }
    return next(error);
  }
};

// Get all orders for a seller
export const getSellerOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;

    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      sortField = "createdAt",
      sortDirection = "desc",
    } = req.query;

    // Validate sortField
    const validatedSortField: SortField = allowedSortFields.includes(
      sortField as SortField
    )
      ? (sortField as SortField)
      : "createdAt";

    // Validate sortDirection
    const validatedSortDirection = sortDirection === "asc" ? "asc" : "desc";

    const shop = await prisma.shops.findUnique({
      where: {
        sellerId,
      },
      select: {
        id: true,
      },
    });

    const where: any = {
      shopId: shop?.id,
    };

    console.log("where:", where);

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  images: {
                    select: { url: true },
                  },
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [validatedSortField]: validatedSortDirection },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders.map((order: any) => ({
        id: order.id,
        orderId: order.orderId,
        date: order.createdAt.toISOString().split("T")[0],
        status: order.status,
        total: `${order.total.toFixed(2)}`,
        items: order.items.map((item: any) => ({
          productId: item.productId,
          title: item.product.title,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0]?.url,
        })),
        customer: order.user?.name || "Unknown",
        email: order.user?.email || "",
        phone: order.shippingAddress?.phone || order.user?.phone || "",
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    console.error("Get orders error:", error.message);
    return next(error);
  }
};

// Get a single order for a seller
export const getSingleSellerOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        shopId: sellerId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: {
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        shippingAddress: {
          select: {
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        date: order.createdAt.toISOString().split("T")[0],
        status: order.status,
        total: `${order.total.toFixed(2)}`,
        items: order.items.map((item: any) => ({
          productTitle: item.product.title,
          image: item.product.images[0]?.url || "",
          quantity: item.quantity,
          price: item.price.toFixed(2),
        })),
        customer: order.user?.name || "Unknown",
        email: order.user?.email || "",
        phone: order.shippingAddress?.phone || order.user?.phone || "",
        shippingAddress: order.shippingAddress || null,
      },
    });
  } catch (error: any) {
    console.error("Get single order error:", error.message);
    return next(error);
  }
};

// Export orders (unchanged)
export const exportSellerOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    const { search = "", status } = req.query;

    const where: any = {
      shopId: sellerId,
    };

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        shippingAddress: {
          select: {
            phone: true,
          },
        },
      },
    });

    const csv = [
      "Order ID,Date,Customer,Email,Phone,Status,Total,Items",
      ...orders.map(
        (order) =>
          `${order.orderId},${order.createdAt.toISOString().split("T")[0]},${
            order.user?.name || "Unknown"
          },${order.user?.email || ""},${
            order.shippingAddress?.phone || order.user?.phone || ""
          },${order.status},${order.total.toFixed(2)},${order.items.length}`
      ),
    ].join("\n");

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    return res.send(csv);
  } catch (error: any) {
    console.error("Export orders error:", error.message);
    return next(error);
  }
};

// Update order status (unchanged from previous response)
export const updateSellerOrderStatus = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Paid", "Pending", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        shopId: sellerId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: {
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        shippingAddress: {
          select: {
            phone: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updatedOrder.id,
        date: updatedOrder.createdAt.toISOString().split("T")[0],
        status: updatedOrder.status,
        total: `${updatedOrder.total.toFixed(2)}`,
        items: updatedOrder.items.length,
        customer: updatedOrder.user?.name || "Unknown",
        email: updatedOrder.user?.email || "",
        phone:
          updatedOrder.shippingAddress?.phone || updatedOrder.user?.phone || "",
      },
    });
  } catch (error: any) {
    console.error("Update order status error:", error.message);
    return next(error);
  }
};

// get selelr payments
export const getSellerPayments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;

    console.log("sellerId", sellerId);
    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      sortField = "createdAt",
      sortDirection = "desc",
    } = req.query;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing seller ID",
      });
    }

    // Validate sortField as string
    const validSortFields = [
      "paymentId",
      "orderId",
      "amount",
      "status",
      "createdAt",
    ];
    const validatedSortField =
      typeof sortField === "string" && validSortFields.includes(sortField)
        ? sortField
        : "createdAt";

    // Validate sortDirection
    const validatedSortDirection = sortDirection === "asc" ? "asc" : "desc";

    const [payments, total] = await Promise.all([
      prisma.paymentDistribution.findMany({
        where: {
          sellerId,
          ...(search
            ? {
                OR: [
                  {
                    paymentId: {
                      contains: search as string,
                      mode: "insensitive",
                    },
                  },
                  {
                    order: {
                      orderId: {
                        contains: search as string,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    seller: {
                      name: { contains: search as string, mode: "insensitive" },
                    },
                  },
                ],
              }
            : {}),
          ...(status ? { status: status as string } : {}),
        },
        include: {
          order: { select: { orderId: true } },
          seller: { select: { name: true } },
        },
        orderBy: {
          [validatedSortField]: validatedSortDirection,
        } as Record<string, "asc" | "desc">,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.paymentDistribution.count({
        where: {
          sellerId,
          ...(search
            ? {
                OR: [
                  {
                    paymentId: {
                      contains: search as string,
                      mode: "insensitive",
                    },
                  },
                  {
                    order: {
                      orderId: {
                        contains: search as string,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    seller: {
                      name: { contains: search as string, mode: "insensitive" },
                    },
                  },
                ],
              }
            : {}),
          ...(status ? { status: status as string } : {}),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: payments.map((payment) => ({
        id: payment.paymentId,
        orderId: payment.order.orderId,
        customer: payment.seller.name || "Unknown",
        amount: payment.amount,
        method: payment.paymentIntentId.startsWith("pi_")
          ? "Credit Card"
          : "Unknown",
        status: payment.status,
        date: payment.createdAt.toISOString().split("T")[0],
        cardLast4: null,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    console.error("Get payments error:", error.message);
    return next(error);
  }
};

export const exportSellerPayments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    const {
      search = "",
      status,
      method,
      startDate,
      endDate,
      amountMin,
      amountMax,
    } = req.query;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing seller ID",
      });
    }

    // Validate date range
    const start = startDate ? new Date(startDate as string) : null;
    const end = endDate ? new Date(endDate as string) : null;
    if (start && isNaN(start.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid startDate" });
    }
    if (end && isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid endDate" });
    }

    // Validate amount range
    const minAmount = amountMin ? parseFloat(amountMin as string) : null;
    const maxAmount = amountMax ? parseFloat(amountMax as string) : null;
    if (minAmount !== null && isNaN(minAmount)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amountMin" });
    }
    if (maxAmount !== null && isNaN(maxAmount)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amountMax" });
    }

    // Fetch payments
    const payments = await prisma.paymentDistribution.findMany({
      where: {
        sellerId,
        ...(search
          ? {
              OR: [
                {
                  paymentId: {
                    contains: search as string,
                    mode: "insensitive",
                  },
                },
                {
                  order: {
                    orderId: {
                      contains: search as string,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  seller: {
                    name: { contains: search as string, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
        ...(status ? { status: status as string } : {}),
        ...(start || end
          ? {
              createdAt: {
                ...(start ? { gte: start } : {}),
                ...(end ? { lte: end } : {}),
              },
            }
          : {}),
        ...(minAmount || maxAmount
          ? {
              amount: {
                ...(minAmount ? { gte: minAmount } : {}),
                ...(maxAmount ? { lte: maxAmount } : {}),
              },
            }
          : {}),
      },
      include: {
        order: { select: { orderId: true } },
        seller: { select: { name: true } },
      },
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payments_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    // Pipe PDF directly to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text("Payment Distribution Report", { align: "center" });
    doc.moveDown();

    // Add filter summary
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
    if (startDate) doc.text(`Start Date: ${startDate}`);
    if (endDate) doc.text(`End Date: ${endDate}`);
    if (search) doc.text(`Search: ${search}`);
    if (status) doc.text(`Status: ${status}`);
    if (method) doc.text(`Method: ${method}`);
    if (minAmount) doc.text(`Min Amount: $${minAmount}`);
    if (maxAmount) doc.text(`Max Amount: $${maxAmount}`);
    doc.moveDown();

    // Table headers
    const headers = [
      "Payment ID",
      "Order ID",
      "Customer",
      "Amount",
      "Method",
      "Status",
      "Date",
      "Card Last4",
    ];
    let tableTop = doc.y;
    const initialX = 50;
    const rowHeight = 20;
    const columnWidths = [100, 100, 80, 60, 80, 60, 80, 60];
    const pageHeight = doc.page.height - 100; // Leave margin at bottom

    // Function to draw headers
    const drawHeaders = () => {
      doc.fontSize(10).font("Helvetica-Bold");
      headers.forEach((header, i) => {
        doc.text(
          header,
          initialX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          tableTop,
          {
            width: columnWidths[i],
            align: "left",
          }
        );
      });
      doc.moveDown(0.5);
    };

    // Draw initial headers
    drawHeaders();

    // Draw rows
    doc.font("Helvetica");
    payments.forEach((payment, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;

      // Check for page overflow
      if (y > pageHeight) {
        doc.addPage();
        tableTop = 50;
        drawHeaders();
      }

      const rowData = [
        payment.paymentId || "",
        payment.order.orderId || "",
        payment.seller.name || "Unknown",
        `$${payment.amount.toFixed(2)}`,
        payment.paymentIntentId.startsWith("pi_") ? "Credit Card" : "Unknown",
        payment.status || "",
        payment.createdAt.toISOString().split("T")[0],
        "", // cardLast4 is null
      ];

      rowData.forEach((cell, i) => {
        doc.text(
          cell,
          initialX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          tableTop + (rowIndex + 1) * rowHeight,
          {
            width: columnWidths[i],
            align: "left",
          }
        );
      });
    });

    // Handle empty payments
    if (payments.length === 0) {
      doc.text(
        "No payments found for the specified filters.",
        initialX,
        tableTop + rowHeight
      );
    }

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error("Export payments error:", error.message);
    return next(error);
  }
};
