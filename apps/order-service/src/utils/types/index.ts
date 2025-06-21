import { Request } from "express";
import Stripe from "stripe";
import { z } from "zod";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Schema for validating order ID
export const OrderIdSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});
// Define request body schema
export const ProcessFullPaymentSchema = z.object({
  paymentMethodId: z.string().min(1, "PaymentMethod ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export interface CartItem {
  id: string;
  quantity: number;
  sale_price: number;
  shopId: string;
  selectedOptions?: Record<string, string>;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  discountedProductId?: string;
}

export interface SellerData {
  shopId: string;
  sellerId: string;
  stripeAccountId: string;
}

export interface SessionData {
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

// Define request interface
export interface ProcessFullPaymentRequest extends Request {
  body: z.infer<typeof ProcessFullPaymentSchema>;
  user?: { id: string };
}

export interface CustomRequest extends Request {
  user?: any;
  seller?: any;
}

// Define allowed sort fields to ensure type safety
export const allowedSortFields = [
  "id",
  "createdAt",
  "total",
  "status",
] as const;
export type SortField = (typeof allowedSortFields)[number];
