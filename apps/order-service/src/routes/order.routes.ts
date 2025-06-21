import { withAuth } from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createOrder,
  createPaymentSession,
  exportSellerOrders,
  getAllOrders,
  getSellerOrders,
  getSingleSellerOrder, // Use the new single order controller
  processFullPayment,
  updateSellerOrderStatus,
  verifyPaymentSession,
} from "../controllers/order.controller";

const router = express.Router();

// Create a payment session
router.post("/create-payment-session", withAuth("user"), createPaymentSession);

// Verify a payment session
router.get("/verify-payment-session", withAuth("user"), verifyPaymentSession);

// Process full payment and disburse to sellers
router.post("/process-full-payment", withAuth("user"), processFullPayment);

// Handle Stripe webhook for payment completion
router.post("/create-order-webhook", createOrder);

// Get all orders for a user
router.get("/get-all-orders", withAuth("user"), getAllOrders);

// Get single order by ID (for sellers)
router.get("/get-seller-order/:id", withAuth("seller"), getSingleSellerOrder);

// Get all orders for a seller
router.get("/get-seller-orders", withAuth("seller"), getSellerOrders);

// Export orders for a seller
router.get("/export-seller-orders", withAuth("seller"), exportSellerOrders);

// Update order status
router.put(
  "/update-seller-order-status/:id",
  withAuth("seller"),
  updateSellerOrderStatus
);

export default router;
