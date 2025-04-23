import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestriction,
  sentOTP,
  trackOtpRequest,
  validateRegistrationData,
} from "../utils/auth.helper";

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
