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
    const cusAmount = Math.round(amount * 100);
    const platformFee = Math.round(cusAmount * 0.05);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: cusAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user.id,
      },
    });
    return res
      .status(200)
      .json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
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
        .sort((a, b) => a.id.localCompare(b.id))
    );

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
              .sort((a: any, b: any) => a.id.localCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    // fetch sellers and their stripe accounts
    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop.sellers?.stripeId,
    }));

    // calculate total amount
    const totalAmount = cart.reduce(
      (total, item) => total + item.quantity * item.sale_price,
      0
    );

    // create session
    const sessionId = randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );

    return res.status(200).json({ sessionId });
  } catch (error) {
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
      return res.status(400).json({ error: "Session ID is required." });
    }

    // Fetch session from Redis
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({ error: "Session not found or expired." });
    }

    const session = JSON.parse(sessionData);
    return res.status(200).json({ success: true, session });
  } catch (error) {
    return next(error);
  }
};

// create order
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
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn("Session data expired or missing for", sessionId);
        return res
          .status(200)
          .send("No session found, skipping order creation");
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name;
      const email = user?.email;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];
        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );

        // Apply discount if applicable
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;
            orderTotal -= discount;
          }
        }

        await prisma.order.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: "Paid",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions,
              })),
            },
          },
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};
