import { withAuth } from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createOrder,
  createPaymentSession,
  getAllOrders,
  getSingleOrder,
  processFullPayment,
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

router.get("/get-all-orders", withAuth("user"), getAllOrders);
router.get("/:id", withAuth("user"), getSingleOrder);

export default router;
