
import { Request, Response, NextFunction } from "express";
import { logger } from "../infrastructure/logger";
import { env } from "../config/env";

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({ err: error }, "Request failed");

  const statusCode =
    (error as Error & { statusCode?: number }).statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message
  });
};
