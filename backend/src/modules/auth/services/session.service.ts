
import mongoose, { Types } from "mongoose";

import { PlatformSession } from "../models/platform-session.model";
import { RefreshTokenHistory } from "../models/refresh-token-history.model";

import {
  generateRefreshToken,
  hashRefreshToken,
} from "./refresh-token.service";

import { env } from "../../../config/env";

interface CreateSessionInput {
  userId: Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;
}

interface RotationResult {
  userId: string;
  sessionId: string;
  refreshToken: string;
  expiresAt: Date;
}

const getExpiryDate = (): Date => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
  return expiry;
};

// Create a new session
export const createSession = async (input: CreateSessionInput) => {
  const refreshToken = generateRefreshToken();

  const session = await PlatformSession.create({
    userId: input.userId,
    refreshTokenHash: hashRefreshToken(refreshToken),
    expiresAt: getExpiryDate(),
    revokedAt: null,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
    lastUsedAt: new Date(),
  });

  return {
    sessionId: session._id.toString(),
    refreshToken,
    expiresAt: session.expiresAt,
  };
};

// Rotate refresh token and detect reuse of previously rotated tokens
export const rotateRefreshToken = async (
  refreshToken: string
): Promise<RotationResult> => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const oldTokenHash = hashRefreshToken(refreshToken);
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);

  const dbSession = await mongoose.startSession();

  let rotationResult: RotationResult | null = null;
  let reuseDetected = false;

  try {
    await dbSession.withTransaction(async () => {
      rotationResult = null;
      reuseDetected = false;

      const currentSession = await PlatformSession.findOne({
        refreshTokenHash: oldTokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
        .select("+refreshTokenHash")
        .session(dbSession);

      if (currentSession) {
        const newExpiry = getExpiryDate();

        // Record the previously used token hash.
        await RefreshTokenHistory.create(
          [
            {
              sessionId: currentSession._id,
              tokenHash: oldTokenHash,
              expiresAt: newExpiry,
            },
          ],
          { session: dbSession }
        );

        // Replace the old token hash atomically.
        const updateResult = await PlatformSession.updateOne(
          {
            _id: currentSession._id,
            refreshTokenHash: oldTokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
          },
          {
            $set: {
              refreshTokenHash: newTokenHash,
              lastUsedAt: new Date(),
              expiresAt: newExpiry,
            },
          },
          { session: dbSession }
        );

        if (updateResult.modifiedCount !== 1) {
          throw new Error("Session rotation conflict");
        }

        rotationResult = {
          userId: currentSession.userId.toString(),
          sessionId: currentSession._id.toString(),
          refreshToken: newRefreshToken,
          expiresAt: newExpiry,
        };

        return;
      }

      // The token is not current. Check whether it was used previously.
      const previousToken = await RefreshTokenHistory.findOne({
        tokenHash: oldTokenHash,
        expiresAt: { $gt: new Date() },
      }).session(dbSession);

      if (previousToken) {
        // A previously rotated token has been reused.
        await PlatformSession.updateOne(
          {
            _id: previousToken.sessionId,
            revokedAt: null,
          },
          {
            $set: { revokedAt: new Date() },
          },
          { session: dbSession }
        );

        reuseDetected = true;
      }
    });
  } finally {
    await dbSession.endSession();
  }

  if (reuseDetected) {
    throw new Error("Refresh token reuse detected. Session revoked.");
  }

  if (!rotationResult) {
    throw new Error("Invalid or expired refresh token");
  }

  return rotationResult;
};

// Revoke a specific session belonging to a user
export const revokeSession = async (
  sessionId: string,
  userId: Types.ObjectId
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(sessionId)) {
    return false;
  }

  const result = await PlatformSession.updateOne(
    {
      _id: sessionId,
      userId,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );

  return result.modifiedCount === 1;
};

// Revoke a session using its current refresh token
export const revokeRefreshToken = async (
  refreshToken: string
): Promise<boolean> => {
  if (!refreshToken) {
    return false;
  }

  const result = await PlatformSession.updateOne(
    {
      refreshTokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );

  return result.modifiedCount === 1;
};
