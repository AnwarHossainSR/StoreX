import express from "express";
import {
  loginUser,
  userRegistration,
  verifyUserOtp,
} from "../controller/auth.controller";

const router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-otp", verifyUserOtp);
router.post("/login", loginUser);

export default router;
