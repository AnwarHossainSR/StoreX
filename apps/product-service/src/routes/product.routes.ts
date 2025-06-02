import isAuthenticated from "@packages/middleware/isAuthenticated";
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
router.get("/discount-codes", isAuthenticated, getDiscountCodes);
router.post("/discount-codes", isAuthenticated, createDiscountCode);
router.delete("/discount-codes/:id", isAuthenticated, deleteDiscountCode);
router.get("/discount-codes/:code", validateDiscountCode);
router.post("/upload-product-image", uploadProductImage);
router.post("/delete-product-image", deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct);
router.get("/seller", isAuthenticated, getSellerProducts);
router.put("/seller/:id", isAuthenticated, updateProduct);
router.delete("/seller/:id", isAuthenticated, deleteProduct);
router.put("/seller/restore/:id", isAuthenticated, restoreProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-product/:slug", getProductBySlug);

export default router;
