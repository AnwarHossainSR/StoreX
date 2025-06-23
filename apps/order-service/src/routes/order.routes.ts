import { withAuth } from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createOrder,
  createPaymentSession,
  exportSellerOrders,
  exportSellerPayments,
  getAllOrders,
  getSellerOrders,
  getSellerPayments,
  getSingleOrder,
  getSingleSellerOrder, // Use the new single order controller
  processFullPayment,
  updateSellerOrderStatus,
  verifyCoupon,
  verifyPaymentSession,
} from "../controllers/order.controller";

const router = express.Router();

// Create a payment session
router.post("/create-payment-session", withAuth("user"), createPaymentSession);

// Verify a payment session
router.get("/verify-payment-session", withAuth("user"), verifyPaymentSession);

// Process full payment and disburse to sellers
router.post("/process-full-payment", withAuth("user"), processFullPayment);

router.post("/verify-coupon-code", withAuth("user"), verifyCoupon);

// Handle Stripe webhook for payment completion
router.post("/create-order-webhook", createOrder);

// Get all orders for a user
router.get("/get-all-orders", withAuth("user"), getAllOrders);

// Get single order by ID (for users)
router.get("/get-order/:id", withAuth("user"), getSingleOrder);

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

// get Sellers payments
router.get("/get-seller-payments", withAuth("seller"), getSellerPayments);

// export seller payments
router.get("/export-seller-payments", withAuth("seller"), exportSellerPayments);

export default router;
