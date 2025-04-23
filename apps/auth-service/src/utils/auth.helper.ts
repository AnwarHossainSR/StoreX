import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import crypto from "crypto";
import { NextFunction } from "express";
import { sendEmail } from "./sendEmail";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (!name || !email || !password || !phone_number || !country) {
    throw new ValidationError("Missing required fields");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError("Please wait before requesting another OTP")
    );
  }

  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts, please try again after 30 minutes"
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many otp requests, please try again after 1 hour"
      )
    );
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

export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequests = parseInt(
    (await redis.get(`otp_request:${email}`)) || "0"
  );
  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600); // 1 hour lock
    return next(
      new ValidationError(
        "Too many otp requests, please try again after 1 hour"
      )
    );
  }

  await redis.set(`otp_request:${email}`, otpRequests + 1, "EX", 3600); // track request for one hour
};
