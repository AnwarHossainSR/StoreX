import { ValidationError } from "@packages/error-handler";
import { imageKit } from "@packages/libs/imagekit";
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
import {
  addressSchema,
  handleDefaultAddress,
} from "../utils/shippingAddress.helper";

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
        expiresIn: "1h",
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
    } else if (type === "admin") {
      refreshToken = req.cookies["refresh_admin_token"];
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
      type === "user" ? "access_token" : `access_${type}_token`,
      accessToken
    );

    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error: any) {
    console.log("error", error);
    return next(error);
  }
};

export const getAuthenticatedUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    console.log("user ", user);
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

export const userDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        avatar: true,
      },
    });
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    return next(error);
  }
};

export const chnageUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { id } = req.user;
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw next(new ValidationError("Missing required fields"));
    }
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw next(new ValidationError("User not found"));
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password!);
    if (!isPasswordMatch) {
      throw next(new ValidationError("Old password is incorrect"));
    }
    if (newPassword !== confirmPassword) {
      throw next(
        new ValidationError("New password and confirm password do not match")
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

export const userShippingAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        shippingAddresses: true,
      },
    });
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    return next(error);
  }
};

export const createShippingAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const validatedData = addressSchema.parse(req.body);

    if (validatedData.isDefault) {
      await handleDefaultAddress(userId);
    }

    const newAddress = await prisma.shippingAddress.create({
      data: {
        userId,
        ...validatedData,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Shipping address created successfully",
      data: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateShippingAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate ID format (assuming UUID or similar)
    if (!id || typeof id !== "string") {
      throw new ValidationError("Invalid address ID");
    }

    const validatedData = addressSchema.partial().parse(req.body); // Allow partial updates
    if (Object.keys(validatedData).length === 0) {
      throw new ValidationError(
        "At least one field must be provided for update"
      );
    }

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.shippingAddress.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      throw new ValidationError("Shipping address not found or unauthorized");
    }

    if (validatedData.isDefault) {
      await handleDefaultAddress(userId, id);
    }

    const updatedAddress = await prisma.shippingAddress.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Shipping address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteShippingAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.shippingAddress.delete({
      where: {
        id,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "Shipping address deleted" });
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
      message: "Seller logged in successfully",
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
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(200).json({ success: true, seller });
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

// Update user profile
export const updateUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id; // From authentication middleware
    const { name, email, phone, country } = req.body;

    // Validate required fields
    if (!name && !email && !phone && !country) {
      throw new ValidationError("At least one field is required to update");
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.users.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ValidationError("Email is already taken");
      }
    }

    // Update user profile
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(country && { country }),
        updatedAt: new Date(),
      },
      include: {
        avatar: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

// Upload profile image
export const uploadProfileImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { file } = req.body;

    if (!file) {
      throw new ValidationError("Image file is required");
    }

    // Get current user to check if they have an existing avatar
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    // Delete existing avatar if it exists
    if (currentUser?.avatar?.file_id) {
      try {
        await imageKit.deleteFile(currentUser.avatar.file_id);
        await prisma.images.delete({
          where: { id: currentUser.avatar.id },
        });
      } catch (deleteError) {
        console.error("Error deleting existing avatar:", deleteError);
      }
    }

    // Upload new image to ImageKit
    const uploadedImage: any = await imageKit.upload({
      file: file,
      fileName: `profile-avatar-${userId}-${Date.now()}.jpg`,
      folder: "profile-avatars",
    });

    // Save image record in database
    const imageRecord = await prisma.images.create({
      data: {
        file_id: uploadedImage.fileId,
        url: uploadedImage.url,
        userId: userId,
      },
    });

    // Update user's avatar reference
    await prisma.users.update({
      where: { id: userId },
      data: {
        avatarId: imageRecord.id,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      file_name: uploadedImage.fileId,
      file_url: uploadedImage.url,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete profile image
export const deleteProfileImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { fileId } = req.body;

    if (!fileId) {
      throw new ValidationError("File ID is required");
    }

    // Find the image record
    const imageRecord = await prisma.images.findFirst({
      where: {
        file_id: fileId,
        userId: userId,
      },
    });

    if (!imageRecord) {
      throw new ValidationError(
        "Image not found or you don't have permission to delete it"
      );
    }

    // Delete from ImageKit
    await imageKit.deleteFile(fileId);

    // Delete from database
    await prisma.images.delete({
      where: { id: imageRecord.id },
    });

    // Update user to remove avatar reference
    await prisma.users.update({
      where: { id: userId },
      data: {
        avatarId: null,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Admin methods

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw next(new ValidationError("Missing required fields"));
    }

    const user = await prisma.admins.findUnique({
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
        expiresIn: "1h",
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
        expiresIn: "1d",
      }
    );

    setCookie(res, "refresh_admin_token", refreshToken);
    setCookie(res, "access_admin_token", accessToken);

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

export const logoutAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refresh_admin_token");
    res.clearCookie("access_admin_token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error: any) {
    return next(error);
  }
};

export const getAuthenticatedAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req", req);
    const admin = req.admin;
    res.status(200).json({ success: true, admin });
  } catch (error: any) {
    return next(error);
  }
};
