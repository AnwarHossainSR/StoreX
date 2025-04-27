import isAuthenticated from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createDiscountCode,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
  validateDiscountCode,
} from "../controller/product.controller";
const router = express.Router();

router.get("/get-categories", getCategories);
router.get("/discount-codes", isAuthenticated, getDiscountCodes);
router.post("/discount-codes", isAuthenticated, createDiscountCode);
router.delete("/discount-codes/:id", isAuthenticated, deleteDiscountCode);
router.get("/discount-codes/:code", validateDiscountCode);

export default router;
