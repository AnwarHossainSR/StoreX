import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { sendEmail, verifyOtpHelper } from "./sendEmail";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new ValidationError("Missing required fields");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestriction = async (email: string) => {
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      "Too many otp requests, please try again after 1 hour"
    );
  }

  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      "Account locked due to multiple failed attempts, please try again after 30 minutes"
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError("Please wait before requesting another OTP");
  }
};

export const sentOTP = async (
  name: string,
  email: string,
  template: string,
  subject: string = "Verify Your Email!"
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, subject, template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const trackOtpRequest = async (email: string) => {
  const otpRequests = parseInt(
    (await redis.get(`otp_request:${email}`)) || "0"
  );
  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600); // 1 hour lock
    throw new ValidationError(
      "Too many otp requests, please try again after 1 hour"
    );
  }

  await redis.set(`otp_request:${email}`, otpRequests + 1, "EX", 3600); // track request for one hour
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw next(new ValidationError("Missing required fields"));
    }

    const user =
      userType === "user" &&
      (await prisma.users.findUnique({ where: { email } }));

    if (!user) {
      throw next(new ValidationError("User not found"));
    }

    await checkOtpRestriction(email);
    await trackOtpRequest(email);

    // genearte otp and send email
    await sentOTP(user.name!, email, "reset-password-email", "Reset Password!");

    res.status(200).json({ message: "OTP sent to email, please verify" });
  } catch (error: any) {
    return next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      throw next(new ValidationError("Missing required fields"));
    }

    await verifyOtpHelper(email, otp);

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error: any) {
    return next(error);
  }
};
