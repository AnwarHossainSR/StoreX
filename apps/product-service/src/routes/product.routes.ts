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
router.get("/discount-codes", getDiscountCodes);
router.post("/discount-codes", createDiscountCode);
router.delete("/discount-codes/:id", deleteDiscountCode);
router.get("/discount-codes/:code", validateDiscountCode);

export default router;
