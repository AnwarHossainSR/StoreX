import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestriction,
  sentOTP,
  trackOtpRequest,
  validateRegistrationData,
} from "../utils/auth.helper";
import { verifyOtpHelper } from "../utils/sendEmail";

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;
    //  password, phone_number, country
    const userExist = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (userExist)
      return next(new ValidationError("User already exist with this email"));

    await checkOtpRestriction(email);
    await trackOtpRequest(email);
    await sentOTP(name, email, "user-activation-email", "Verify Your Email!");
    res.status(200).json({ message: "OTP sent to email, please verify" });
  } catch (error: any) {
    return next(error);
  }
};

export const verifyUserOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      throw next(new ValidationError("Missing required fields"));
    }

    const userExist = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      throw next(new ValidationError("User already exist with this email"));
    }

    await verifyOtpHelper(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "User registered successfully" });
  } catch (error: any) {
    return next(error);
  }
};
