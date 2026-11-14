
import { Request, Response, NextFunction } from "express";
import { env } from "../../../config/env";

export const requireTrustedOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = req.get("origin");

  if (!origin || !env.CORS_ORIGINS.includes(origin)) {
    res.status(403).json({
      success: false,
      message: "Request origin is not allowed",
    });
    return;
  }

  next();
};
