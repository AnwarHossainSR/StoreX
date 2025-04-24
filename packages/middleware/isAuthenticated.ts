import { AuthError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AuthError("Unauthenticated! Token not found");
    }

    const decoded = Jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      throw new AuthError("Unauthenticated! Invalid token");
    }

    const account = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!account) {
      throw new AuthError("Unauthenticated! Account not found");
    }
    // @ts-ignore
    req.user = account;

    return next();
  } catch (error) {
    return next(new AuthError("Unauthenticated! Token expired or invalid"));
  }
};

export default isAuthenticated;
