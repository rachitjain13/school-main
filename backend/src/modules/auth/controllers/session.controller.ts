
import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";

import { PlatformUser } from "../../super-admin/models/plateform-user.model";
import { SchoolMembership } from "../../super-admin/models/school-membership.model";

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

// Refresh access token for Super Admin and School Main Admin.
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

        // Rotate refresh token and detect token reuse.
        const rotated = await rotateRefreshToken(oldToken);

        const user = await PlatformUser.findOne({
            _id: rotated.userId,
            status: "active",
        });

        let membershipIsActive = true;

        // School Main Admin must have an active school membership.
        if (user?.role === "school_main_admin") {
            const membership = await SchoolMembership.findOne({
                userId: user._id,
                status: "active",
            });

            membershipIsActive = Boolean(membership);
        }

        // Reject inactive, missing, or unauthorized accounts.
        if (!user || !membershipIsActive) {
            await revokeSession(
                rotated.sessionId,
                new Types.ObjectId(rotated.userId)
            );

            res.clearCookie(COOKIE_NAME, cookieOptions);

            res.status(401).json({
                success: false,
                message: "Account is not active or school membership is suspended",
            });

            return;
        }

        // Generate a new access token using the user's actual role.
        const accessToken = await createAccessToken({
            userId: user._id.toString(),
            role: user.role,
        });

        res.cookie(
            COOKIE_NAME,
            rotated.refreshToken,
            cookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Access token refreshed",
            data: {
                accessToken,
            },
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

// Logout and revoke the current refresh-token session.
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
