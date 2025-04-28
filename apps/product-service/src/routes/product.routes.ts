import isAuthenticated from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
  validateDiscountCode,
} from "../controller/product.controller";
const router = express.Router();

router.get("/get-categories", getCategories);
router.get("/discount-codes", isAuthenticated, getDiscountCodes);
router.post("/discount-codes", isAuthenticated, createDiscountCode);
router.delete("/discount-codes/:id", isAuthenticated, deleteDiscountCode);
router.get("/discount-codes/:code", validateDiscountCode);
router.post("/upload-product-image", uploadProductImage);
router.post("/delete-product-image", deleteProductImage);
router.post("/create-product", createProduct);

export default router;
