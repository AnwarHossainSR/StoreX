import { AuthError } from "@packages/error-handler";
import { NextFunction, Response } from "express";
import Jwt from "jsonwebtoken";

import prisma from "@packages/libs/prisma";

export const getAuthenticatedAccount = async (
  role: "user" | "seller",
  id: string
) => {
  if (role === "user") {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    return { role: "user", account: user };
  }

  if (role === "seller") {
    const seller = await prisma.sellers.findUnique({
      where: { id },
      include: { shop: true },
    });
    return { role: "seller", account: seller };
  }

  return { role, account: null };
};

export const getTokenFromRequest = (
  req: any,
  role: "user" | "seller" = "user"
): string | undefined => {
  if (role === "seller") {
    return (
      req.cookies["access_seller_token"] ||
      req.headers.authorization?.split(" ")[1]
    );
  }

  // Default to user token
  return (
    req.cookies["access_token"] || req.headers.authorization?.split(" ")[1]
  );
};

const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction,
  role?: "user" | "seller"
) => {
  try {
    const token = getTokenFromRequest(req, role);

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

    // Optional role match validation
    if (role && decoded.role !== role) {
      throw new AuthError("Unauthorized! Role mismatch");
    }

    const { account } = await getAuthenticatedAccount(decoded.role, decoded.id);

    if (!account) {
      throw new AuthError("Unauthenticated! Account not found");
    }

    // Attach to req object
    req[decoded.role] = account;
    req.role = decoded.role;

    console.log("req authentciated page", req.role);

    return next();
  } catch (error: any) {
    console.log("error in isAuthenticated", error.message || error);
    return next(new AuthError("Unauthenticated! Token expired or invalid"));
  }
};

export const withAuth =
  (role?: "user" | "seller") => (req: any, res: Response, next: NextFunction) =>
    isAuthenticated(req, res, next, role);

export default isAuthenticated;
