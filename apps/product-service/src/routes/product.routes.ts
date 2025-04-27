import { isSeller } from "@packages/middleware/authorizeRole";
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
router.get("/discount-codes", isAuthenticated, isSeller, getDiscountCodes);
router.post("/discount-codes", isAuthenticated, isSeller, createDiscountCode);
router.delete(
  "/discount-codes/:id",
  isAuthenticated,
  isSeller,
  deleteDiscountCode
);
router.get("/discount-codes/:code", validateDiscountCode);

export default router;
