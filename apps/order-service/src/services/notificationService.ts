// Create this as a new file: src/utils/notificationService.ts

import prisma from "@packages/libs/prisma";
import { sendOrderEmail } from "../utils/sendOrderEmail";

export interface NotificationData {
  type:
    | "ORDER_RECEIVED"
    | "PAYMENT_RECEIVED"
    | "ORDER_CANCELLED"
    | "ORDER_REFUNDED"
    | "PRODUCT_APPROVED"
    | "PRODUCT_REJECTED"
    | "ACCOUNT_VERIFIED"
    | "PAYOUT_PROCESSED"
    | "LOW_STOCK"
    | "REVIEW_RECEIVED";
  title: string;
  message: string;
  data?: Record<string, any>;
  sellerId?: string;
  userId?: string;
}

export const createNotification = async (notification: NotificationData) => {
  try {
    const createdNotification = await prisma.notifications.create({
      data: {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        sellerId: notification.sellerId,
        userId: notification.userId,
      },
    });

    console.log(
      `Notification created: ${createdNotification.id} for ${
        notification.sellerId ? "seller" : "user"
      }`
    );
    return createdNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const notifySellerOrderReceived = async (
  sellerId: string,
  orderId: string,
  orderAmount: number,
  customerName: string,
  sellerEmail: string
) => {
  try {
    // Create database notification
    await createNotification({
      type: "ORDER_RECEIVED",
      title: "New Order Received!",
      message: `You have received a new order from ${customerName} worth $${orderAmount.toFixed(
        2
      )}`,
      data: {
        orderId,
        orderAmount,
        customerName,
        orderDate: new Date().toISOString(),
      },
      sellerId,
    });

    // Send email notification to seller
    const emailData = {
      sellerName: "Seller", // You might want to fetch actual seller name
      orderId,
      orderAmount,
      customerName,
      orderDate: new Date().toLocaleDateString(),
      dashboardUrl: `${process.env.FRONTEND_URL}/seller/orders/${orderId}`,
    };

    await sendOrderEmail(
      sellerEmail,
      "New Order Received - StoreX",
      "seller-order-notification",
      emailData
    );

    console.log(
      `Seller notification sent for order ${orderId} to seller ${sellerId}`
    );
  } catch (error) {
    console.error("Error sending seller notification:", error);
    // Don't throw error to avoid breaking the payment flow
  }
};

export const notifySellerPaymentReceived = async (
  sellerId: string,
  orderId: string,
  paymentAmount: number,
  platformFee: number,
  sellerEmail: string
) => {
  try {
    const netAmount = paymentAmount - platformFee;

    // Create database notification
    await createNotification({
      type: "PAYMENT_RECEIVED",
      title: "Payment Received!",
      message: `Payment of $${netAmount.toFixed(
        2
      )} has been transferred to your account (Order: ${orderId})`,
      data: {
        orderId,
        paymentAmount,
        platformFee,
        netAmount,
        timestamp: new Date().toISOString(),
      },
      sellerId,
    });

    // Send email notification to seller
    const emailData = {
      sellerName: "Seller", // You might want to fetch actual seller name
      orderId,
      paymentAmount,
      platformFee,
      netAmount,
      paymentDate: new Date().toLocaleDateString(),
      dashboardUrl: `${process.env.FRONTEND_URL}/seller/payments`,
    };

    await sendOrderEmail(
      sellerEmail,
      "Payment Received - StoreX",
      "seller-payment-notification",
      emailData
    );

    console.log(
      `Seller payment notification sent for order ${orderId} to seller ${sellerId}`
    );
  } catch (error) {
    console.error("Error sending seller payment notification:", error);
    // Don't throw error to avoid breaking the payment flow
  }
};
