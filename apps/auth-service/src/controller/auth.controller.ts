import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import {
  checkOtpRestriction,
  handleForgotPassword,
  sentOTP,
  trackOtpRequest,
  validateRegistrationData,
  verifyForgotPasswordOtp,
} from "../utils/auth.helper";
import { setCookie } from "../utils/cookies/setCookie";
import { verifyOtpHelper } from "../utils/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

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

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw next(new ValidationError("Missing required fields"));
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw next(new ValidationError("User not found"));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!);

    if (!isPasswordMatch) {
      throw next(new ValidationError("Invalid password"));
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user",
      },
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: "1m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user",
      },
      process.env.JWT_REFRESH_SECRET_KEY!,
      {
        expiresIn: "7d",
      }
    );

    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

export const verifyForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

export const ResetUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw next(new ValidationError("Missing required fields"));
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw next(new ValidationError("User not found"));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!);

    if (isPasswordMatch) {
      throw next(
        new ValidationError("New password must be different from old password")
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    return next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.body;
    let refreshToken;
    if (type === "user") {
      refreshToken = req.cookies["refresh_token"];
    } else if (type === "seller") {
      refreshToken = req.cookies["refresh_seller_token"];
    }
    if (!refreshToken) {
      return next(new ValidationError("Refresh token not found"));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY!
    ) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: type,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "1h" }
    );

    setCookie(
      res,
      type === "user" ? "access_token" : "access_seller_token",
      accessToken
    );

    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error: any) {
    console.log("error", error);
    return next(error);
  }
};

export const getAuthenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const user = req.user;
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    return next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error: any) {
    return next(error);
  }
};

export const logoutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refresh_seller_token");
    res.clearCookie("access_seller_token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error: any) {
    return next(error);
  }
};

// Sellers controller

export const createSellerAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const userExist = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      throw next(new ValidationError("Seller already exist with this email"));
    }

    await checkOtpRestriction(email);
    await trackOtpRequest(email);
    await sentOTP(name, email, "user-activation-email", "Verify Your Email!");
    return res
      .status(200)
      .json({ message: "OTP sent to email, please verify" });
  } catch (error) {
    return next(error);
  }
};

export const VerifySellerOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      throw next(new ValidationError("Missing required fields"));
    }

    const isExistSeller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (isExistSeller) {
      throw next(new ValidationError("Seller already exist with this email"));
    }

    await verifyOtpHelper(email, otp);

    const hashPassword = await bcrypt.hash(password, 10);

    const newSeller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashPassword,
        phone_number,
        country,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        country: true,
      }, // Exclude password
    });

    res.status(200).json({
      message: "Seller created successfully",
      sellerId: newSeller.id,
      seller: newSeller,
    });
  } catch (error) {
    return next(error);
  }
};

export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw next(new ValidationError("Missing required fields"));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw next(new ValidationError("Seller not found"));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!);

    if (!isPasswordMatch) {
      throw next(new ValidationError("Invalid password"));
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "seller",
      },
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: "1h",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "seller",
      },
      process.env.JWT_REFRESH_SECRET_KEY!,
      {
        expiresIn: "7d",
      }
    );

    setCookie(res, "refresh_seller_token", refreshToken);
    setCookie(res, "access_seller_token", accessToken);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const cerateShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hour, website, category, sellerId } =
      req.body;

    if (!sellerId) {
      throw next(new ValidationError("Seler id is missing"));
    }

    if (!name || !address || !opening_hour || !category) {
      throw next(new ValidationError("Missing required fields"));
    }

    let shopData: any = {
      name,
      bio,
      address,
      opening_hour,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData = {
        ...shopData,
        website,
      };
    }

    await prisma.shops.create({
      data: shopData,
    });

    res.status(200).json({ message: "Shop created successfully" });
  } catch (error) {
    return next(error);
  }
};

export const createStripeConnectAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId, country, currency } = req.body;

    if (!sellerId || !country || !currency) {
      throw new ValidationError(
        "Missing required fields: sellerId, country, or currency"
      );
    }

    // Validate country (basic check for ISO 3166-1 alpha-2 code)
    if (!/^[A-Z]{2}$/.test(country)) {
      throw new ValidationError(
        "Invalid country code. Use ISO 3166-1 alpha-2 format (e.g., US, GB)."
      );
    }

    // Validate currency (basic check for ISO 4217 code)
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new ValidationError(
        "Invalid currency code. Use ISO 4217 format (e.g., USD, GBP)."
      );
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      throw new ValidationError("Seller not found");
    }

    const account = await stripe.accounts.create({
      type: "express",
      country: country.toUpperCase(),
      default_currency: currency.toLowerCase(),
      email: seller.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
        currency: currency.toUpperCase(),
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: process.env.STRIPE_CONNECT_REDIRECT_URL,
      return_url: process.env.STRIPE_CONNECT_REDIRECT_URL,
      type: "account_onboarding",
    });

    res.status(200).json({
      message: "Stripe connect account created successfully",
      accountLink: accountLink.url,
    });
  } catch (error: any) {
    if (error.type === "StripeInvalidRequestError") {
      return next(
        new ValidationError(
          error.message.includes("Connect")
            ? "Stripe Connect is not enabled for this account. Please complete Connect onboarding in the Stripe Dashboard."
            : error.message
        )
      );
    }
    return next(error);
  }
};

export const getAuthenticatedSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const user = req.seller;
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    return next(error);
  }
};
