import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { PlatformUser } from "../../super-admin/models/plateform-user.model";
import {
  rotateRefreshToken,
  revokeRefreshToken,
  revokeSession,
} from "../services/session.service";
import { createAccessToken } from "../services/token.service";
import { env } from "../../../config/env";

const COOKIE_NAME = "school_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: `${env.API_PREFIX}/auth`,
  maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
} as const;

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const oldToken = req.cookies?.[COOKIE_NAME];

    if (!oldToken) {
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Always call the service directly.
    // It handles both normal rotation and reuse detection.
    const rotated = await rotateRefreshToken(oldToken);

    const user = await PlatformUser.findOne({
      _id: rotated.userId,
      role: "super_admin",
      status: "active",
    });

    if (!user) {
      await revokeSession(
  rotated.sessionId.toString(),
  new Types.ObjectId(rotated.userId)
);
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.status(401).json({
        success: false,
        message: "Account is not active",
      });
      return;
    }

    const accessToken = await createAccessToken({
      userId: user._id.toString(),
      role: "super_admin",
    });

    res.cookie(COOKIE_NAME, rotated.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: { accessToken },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message === "Invalid or expired refresh token" ||
        error.message === "Refresh token reuse detected. Session revoked."
      )
    ) {
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please log in again.",
      });
      return;
    }

    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[COOKIE_NAME];

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie(COOKIE_NAME, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
