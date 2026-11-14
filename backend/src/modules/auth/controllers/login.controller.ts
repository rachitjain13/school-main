
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";

import {
  authenticateSuperAdmin,
  AuthenticationError,
} from "../services/login.service";
import { createAccessToken } from "../services/token.service";
import { createSession } from "../services/session.service";
import { env } from "../../../config/env";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export const superAdminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
      return;
    }

    const user = await authenticateSuperAdmin(
      parsed.data.email,
      parsed.data.password
    );

    const accessToken = await createAccessToken({
      userId: user.userId.toString(),
      role: "super_admin",
    });

    const session = await createSession({
      userId: new Types.ObjectId(user.userId),
      userAgent: req.get("user-agent")?.slice(0, 500),
      ipAddress: req.ip,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: `${env.API_PREFIX}/auth`,
      maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    } as const;

    res.cookie("school_refresh", session.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.userId.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    next(error);
  }
};
