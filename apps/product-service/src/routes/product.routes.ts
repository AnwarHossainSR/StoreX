import { withAuth } from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getProductBySlug,
  getSellerProducts,
  restoreProduct,
  updateProduct,
  uploadProductImage,
  validateDiscountCode,
} from "../controller/product.controller";
const router = express.Router();

router.get("/get-categories", getCategories);
router.get("/discount-codes", withAuth("seller"), getDiscountCodes);
router.post("/discount-codes", withAuth("seller"), createDiscountCode);
router.delete("/discount-codes/:id", withAuth("seller"), deleteDiscountCode);
router.get("/discount-codes/:code", validateDiscountCode);
router.post("/upload-product-image", uploadProductImage);
router.post("/delete-product-image", deleteProductImage);
router.post("/create-product", withAuth("seller"), createProduct);
router.get("/seller", withAuth("seller"), getSellerProducts);
router.put("/seller/:id", withAuth("seller"), updateProduct);
router.delete("/seller/:id", withAuth("seller"), deleteProduct);
router.put("/seller/restore/:id", withAuth("seller"), restoreProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-product/:slug", getProductBySlug);

export default router;
