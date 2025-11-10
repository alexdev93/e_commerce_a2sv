import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../model/ApiResponse";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.url}`, err);

  // If the error is our custom AppError
  if (err instanceof AppError) {
    const response = new ApiResponse({
      success: false,
      message: err.message,
      object: null,
      errors: [err.message],
    });
    res.status(err.statusCode).json(response);
    return;
  }

  // Fallback for unexpected/unhandled errors
  const response = new ApiResponse({
    success: false,
    message: "Internal Server Error",
    object: null,
    errors: [err.message || "Unexpected error"],
  });
  res.status(500).json(response);
};
