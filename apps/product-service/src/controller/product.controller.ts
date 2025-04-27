import { ValidationError } from "@packages/error-handler";
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
