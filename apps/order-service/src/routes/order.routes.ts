import { withAuth } from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createPaymentIntent,
  createPaymentSession,
  verifyPaymentSession,
} from "../controllers/order.controller";

const router = express.Router();

router.post("/create-payment-intent", withAuth("user"), createPaymentIntent);
router.post("/create-payment-session", withAuth("user"), createPaymentSession);
router.get("/verify-payment-session", withAuth("user"), verifyPaymentSession);

export default router;
