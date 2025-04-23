import express from "express";
import { userRegistration, verifyUserOtp } from "../controller/auth.controller";

const router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-otp", verifyUserOtp);

export default router;
