import { NotFoundError, ValidationError } from "@packages/error-handler";
import { imageKit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
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
      fileName: `product-image-${Date.now()}.jpg`,
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

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cashOnDelivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discount_codes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !detailed_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price ||
      !stock
    ) {
      throw new ValidationError("Missing required fields");
    }

    if (!req.seller.id) {
      throw new ValidationError("Seller ID is required");
    }

    const productExist = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (productExist) {
      throw new ValidationError("Product already exists");
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        custom_specifications,
        slug,
        tags,
        cashOnDelivery,
        brand,
        video_url,
        category,
        colors,
        sizes,
        discount_codes,
        stock,
        sale_price,
        regular_price,
        subCategory,
        custom_properties,
        images: {
          create: images.map((image: any) => ({
            file_id: image.file_name,
            url: image.file_url,
            shopsId: req.seller.shop.id,
          })),
        },
        sellerId: req.seller.id,
        shopId: req.seller.shop.id,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;

    const skip = (page - 1) * limit;

    // Build dynamic filters based on search and category
    const whereConditions: any = {
      sellerId: req.seller.id,
    };

    if (search) {
      whereConditions.title = {
        contains: search, // Searching for products by title
        mode: "insensitive", // Case-insensitive search
      };
    }

    if (category) {
      whereConditions.category = category; // Filter by category
    }

    // Fetching products with the necessary filters and pagination
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: whereConditions,
        include: {
          images: true,
        },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({
        where: whereConditions,
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Returning the response with paginated data
    return res.status(200).json({
      data: products,
      total: totalProducts,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Product ID is required");
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!product) {
      throw new ValidationError("Product not found");
    }

    if (product.sellerId !== req.seller.id) {
      throw new ValidationError("Unauthorized to delete this product");
    }

    const deletedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "Deleted",
      },
    });

    res.status(200).json({
      success: true,
      message:
        "Product is scheduled for deletion in 24 hours. you can restore it within that time period",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Product ID is required");
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!product) {
      throw new ValidationError("Product not found");
    }

    if (product.sellerId !== req.seller.id) {
      throw new ValidationError("Unauthorized to restore this product");
    }

    const restoredProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product restored successfully",
      isDeleted: restoredProduct.isDeleted,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new Error("Invalid pagination parameters");
    }

    const baseFilter = {
      isDeleted: false, // Simplified filter
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { createdAt: "asc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          images: { select: { id: true, url: true } }, // Adjust fields
          Shop: { select: { id: true, name: true } }, // Adjust fields
        },
        where: baseFilter,
        orderBy: [{ totalSales: "desc" }, { createdAt: "desc" }],
      }),
      prisma.product.count({
        where: baseFilter,
      }),
      prisma.product.findMany({
        take: 10,
        include: {
          images: { select: { id: true, url: true } },
          Shop: { select: { id: true, name: true } },
        },
        orderBy,
      }),
    ]);

    const response = {
      data: products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    return next(error);
  }
};
