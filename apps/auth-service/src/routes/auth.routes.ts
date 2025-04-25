import isAuthenticated from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  getAuthenticatedUser,
  loginUser,
  refreshAccessToken,
  ResetUserForgotPassword,
  userForgotPassword,
  userRegistration,
  verifyForgotPassword,
  verifyUserOtp,
} from "../controller/auth.controller";

const router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-otp", verifyUserOtp);
router.post("/login", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", ResetUserForgotPassword);
router.post("/verify-forgot-password-user", verifyForgotPassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/logged-in-user", isAuthenticated, getAuthenticatedUser);

export default router;
