import { AuthError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import Jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.cookies["access_seller_token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AuthError("Unauthenticated! Token not found");
    }

    const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      throw new AuthError("Unauthenticated! Invalid token");
    }

    let account;

    if (decoded.role === "user") {
      await prisma.users.findUnique({
        where: {
          id: decoded.id,
        },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: {
          id: decoded.id,
        },
        include: {
          shop: true,
        },
      });
      req.seller = account;
    }

    if (!account) {
      throw new AuthError("Unauthenticated! Account not found");
    }

    req.role = decoded.role;

    return next();
  } catch (error: any) {
    console.log("error", error.message || error);
    return next(new AuthError("Unauthenticated! Token expired or invalid"));
  }
};

export default isAuthenticated;
