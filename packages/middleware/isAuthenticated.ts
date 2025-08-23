import { AuthError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import Jwt from "jsonwebtoken";

export const getAuthenticatedAccount = async (
  role: "user" | "seller" | "admin",
  id: string
) => {
  if (role === "user") {
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        points: true,
        phone: true,
        country: true,
        following: true,
        avatarId: true,
        stripeCustomerId: true,
        createdAt: true,
        avatar: {
          select: {
            id: true,
            file_id: true,
            url: true,
          },
        },
      }, // Excludes password and updatedAt
    });
    console.log("user", user);
    return { role: "user", account: user };
  }
  if (role === "seller") {
    const seller = await prisma.sellers.findUnique({
      where: { id },
      include: { shop: true },
    });
    return { role: "seller", account: seller };
  }
  if (role === "admin") {
    const admin = await prisma.admins.findUnique({
      where: { id },
    });
    return { role: "admin", account: admin };
  }
  return { role, account: null };
};

export const getTokenFromRequest = (
  req: any,
  role: "user" | "seller" | "admin"
): string | undefined => {
  if (role === "seller") {
    return req.cookies["access_seller_token"];
  }
  if (role === "admin") {
    return req.cookies["access_admin_token"];
  }
  // Default to user token
  return req.cookies["access_token"];
};

// Renamed from isAuthenticated to validateAuthToken
const validateAuthToken = async (
  req: any,
  res: Response,
  next: NextFunction,
  role: "user" | "seller" | "admin"
) => {
  try {
    const token = getTokenFromRequest(req, role);
    if (!token) {
      throw new AuthError("Unauthenticated! Token not found");
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      id: string;
      role: "user" | "seller" | "admin";
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
    if (process.env.NODE_ENV !== "production") {
      console.log("req", req[decoded.role]);
    }
    return next();
  } catch (error: any) {
    console.log("error in validateAuthToken", error.message || error);
    return next(new AuthError("Unauthenticated! Token expired or invalid"));
  }
};

// New isAuthenticated middleware that returns boolean
export const isAuthenticated = (role: "user" | "seller" | "admin") => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const token = getTokenFromRequest(req, role);
      if (!token) {
        return res
          .status(401)
          .json({ authenticated: false, message: "Token not found" });
      }

      const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
        id: string;
        role: "user" | "seller" | "admin";
      };

      if (!decoded) {
        return res
          .status(401)
          .json({ authenticated: false, message: "Invalid token" });
      }

      // Optional role match validation
      if (role && decoded.role !== role) {
        return res
          .status(401)
          .json({ authenticated: false, message: "Role mismatch" });
      }

      const { account } = await getAuthenticatedAccount(
        decoded.role,
        decoded.id
      );
      if (!account) {
        return res
          .status(401)
          .json({ authenticated: false, message: "Account not found" });
      }

      return res.json({ authenticated: true });
    } catch (error: any) {
      console.log("error in isAuthenticated", error.message || error);
      return res
        .status(401)
        .json({ authenticated: false, message: "Token expired or invalid" });
    }
  };
};

export const withAuth =
  (role: "user" | "seller" | "admin") =>
  (req: any, res: Response, next: NextFunction) => {
    const userType = role || "user";
    if (req[userType]) {
      if (req[userType].password) {
        delete req[userType].password;
      }
      return next();
    }
    return validateAuthToken(req, res, next, role);
  };

export default validateAuthToken;
