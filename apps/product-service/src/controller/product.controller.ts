import { NotFoundError, ValidationError } from "@packages/error-handler";
import { imageKit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.siteConfig.findFirst();
    if (!config) {
      throw new ValidationError("Site Config not found");
    }
    res.status(200).json(config);
  } catch (error) {
    return next(error);
  }
};

export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discountCodes = await prisma.discountCode.findMany({
      where: {
        sellerId: req.seller.id,
      },
      select: {
        id: true,
        public_name: true,
        discountType: true,
        discountValue: true,
        discountCode: true,
        createdAt: true,
      },
    });

    res.status(200).json(discountCodes);
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    if (!public_name || !discountType || !discountValue || !discountCode) {
      throw new ValidationError("All fields are required");
    }

    if (!["percentage", "fixed"].includes(discountType)) {
      throw new ValidationError(
        "Invalid discount type. Must be 'percentage' or 'fixed'"
      );
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      throw new ValidationError("Discount value must be a positive number");
    }
    if (discountType === "percentage" && discountValue > 100) {
      throw new ValidationError("Percentage discount cannot exceed 100");
    }

    if (!/^[A-Z0-9-]{4,20}$/.test(discountCode)) {
      throw new ValidationError(
        "Discount code must be 4-20 characters, uppercase letters, numbers, or hyphens"
      );
    }

    const existingCode = await prisma.discountCode.findUnique({
      where: { discountCode },
    });
    if (existingCode) {
      throw new ValidationError("Discount code already exists");
    }

    const newDiscountCode = await prisma.discountCode.create({
      data: {
        public_name,
        discountType,
        discountValue,
        discountCode,
        sellerId: req.seller.id,
      },
      select: {
        id: true,
        public_name: true,
        discountType: true,
        discountValue: true,
        discountCode: true,
        createdAt: true,
      },
    });

    res.status(201).json(newDiscountCode);
  } catch (error) {
    return next(error);
  }
};

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new NotFoundError("Discount code ID is required");
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!discountCode) {
      throw new ValidationError("Discount code not found");
    }

    if (discountCode.sellerId !== req.seller.id) {
      throw new ValidationError("Unauthorized to delete this discount code");
    }

    await prisma.discountCode.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const validateDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      throw new ValidationError("Discount code is required");
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { discountCode: code },
      select: {
        id: true,
        public_name: true,
        discountType: true,
        discountValue: true,
        discountCode: true,
        sellerId: true,
        createdAt: true,
      },
    });

    if (!discountCode) {
      throw new ValidationError("Invalid discount code");
    }

    res.status(200).json(discountCode);
  } catch (error) {
    return next(error);
  }
};

export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file } = req.body;
    if (!file) {
      throw new ValidationError("Image is required");
    }
    const uplaodImageToIK: any = await imageKit.upload({
      file: file,
      fileName: `product-image-${Date.now()}.png`,
      folder: "product-images",
    });

    res.status(200).json({
      file_name: uplaodImageToIK.fileId,
      file_url: uplaodImageToIK.url,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      throw new ValidationError("fileId is required");
    }
    const deleteImageFromIK: any = await imageKit.deleteFile(fileId);
    res.status(200).json(deleteImageFromIK);
  } catch (error) {
    return next(error);
  }
};
