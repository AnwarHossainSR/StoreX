import { withAuth } from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  adminLogin,
  cerateShop,
  changeUserPassword,
  createSellerAccount,
  createShippingAddress,
  createStripeConnectAccount,
  deleteProfileImage,
  deleteShippingAddress,
  getAuthenticatedAdmin,
  getAuthenticatedSeller,
  getAuthenticatedUser,
  loginUser,
  logoutAdmin,
  logoutSeller,
  logoutUser,
  refreshAccessToken,
  ResetUserForgotPassword,
  sellerLogin,
  updateShippingAddress,
  updateUserProfile,
  uploadProfileImage,
  userDetails,
  userForgotPassword,
  userRegistration,
  userShippingAddress,
  verifyForgotPassword,
  VerifySellerOtp,
  verifyUserOtp,
} from "../controller/auth.controller";

const router = express.Router();

// user
router.post("/register", userRegistration);
router.post("/verify-otp", verifyUserOtp);
router.post("/login", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", ResetUserForgotPassword);
router.post("/verify-forgot-password-user", verifyForgotPassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/logged-in-user", withAuth("user"), getAuthenticatedUser);
router.get("/user-details", withAuth("user"), userDetails);
router.put("/change-password-user", withAuth("user"), changeUserPassword);
router.get("/shipping-address-user", withAuth("user"), userShippingAddress);
router.post("/shipping-address", withAuth("user"), createShippingAddress);
router.put("/shipping-address/:id", withAuth("user"), updateShippingAddress);
router.delete("/shipping-address/:id", withAuth("user"), deleteShippingAddress);

// seller
router.post("/register-seller", createSellerAccount);
router.post("/seller-login", sellerLogin);
router.post("/verify-seller-otp", VerifySellerOtp);
router.post("/create-shop", cerateShop);
router.post("/create-stripe-connect-account", createStripeConnectAccount);
router.get("/logged-in-seller", withAuth("seller"), getAuthenticatedSeller);

router.post("/logout-seller", withAuth("seller"), logoutSeller);
router.post("/logout-user", withAuth("user"), logoutUser);

router.put("/update-profile", withAuth("user"), updateUserProfile);
router.post("/upload-profile-image", withAuth("user"), uploadProfileImage);
router.delete("/delete-profile-image", withAuth("user"), deleteProfileImage);

// admin routes

router.post("/admin-login", adminLogin);
router.post("/logout-admin", withAuth("admin"), logoutAdmin);
router.get("/logged-in-admin", withAuth("admin"), getAuthenticatedAdmin);

export default router;
