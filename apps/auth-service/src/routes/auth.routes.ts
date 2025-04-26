import isAuthenticated from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  cerateShop,
  createSellerAccount,
  createStripeConnectAccount,
  getAuthenticatedSeller,
  getAuthenticatedUser,
  loginUser,
  logout,
  refreshAccessToken,
  ResetUserForgotPassword,
  sellerLogin,
  userForgotPassword,
  userRegistration,
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
router.get("/logged-in-user", isAuthenticated, getAuthenticatedUser);

// seller
router.post("/register-seller", createSellerAccount);
router.post("/seller-login", sellerLogin);
router.post("/verify-seller-otp", VerifySellerOtp);
router.post("/create-shop", cerateShop);
router.post("/create-stripe-connect-account", createStripeConnectAccount);
router.get("/logged-in-seller", isAuthenticated, getAuthenticatedSeller);

router.post("/logout", isAuthenticated, logout);

export default router;
