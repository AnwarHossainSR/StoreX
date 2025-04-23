import { NextFunction, Request, Response } from "express";
import { AppError } from "./index";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`${req.method} ${req.url} - ${err.message}`);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }
  console.log("Unhandled error:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong, please try again!",
  });
};
