
import mongoose, { Types } from "mongoose";

import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
} from "vitest";

import { env } from "../src/config/env";
import { connectDatabase } from "../src/config/database";

import { PlatformSession } from "../src/modules/auth/models/platform-session.model";
import { RefreshTokenHistory } from "../src/modules/auth/models/refresh-token-history.model";

import {
  createSession,
  rotateRefreshToken,
  revokeSession,
} from "../src/modules/auth/services/session.service";

import { hashRefreshToken } from "../src/modules/auth/services/refresh-token.service";

const testUserId = new Types.ObjectId();

beforeAll(async () => {
  if (env.NODE_ENV === "production") {
    throw new Error("Integration tests cannot run in production");
  }

  if (env.TEST_MONGODB_DB_NAME !== "school_portal_test") {
    throw new Error("Unexpected MongoDB test database");
  }

  await connectDatabase(env.TEST_MONGODB_DB_NAME);
});

beforeEach(async () => {
  await PlatformSession.deleteMany({});
  await RefreshTokenHistory.deleteMany({});
});

afterAll(async () => {
  await PlatformSession.deleteMany({});
  await RefreshTokenHistory.deleteMany({});
  await mongoose.disconnect();
});

describe("Session Service - MongoDB Integration", () => {
  it("should create and store a session", async () => {
    const result = await createSession({
      userId: testUserId,
      userAgent: "Vitest",
      ipAddress: "127.0.0.1",
    });

    const storedSession = await PlatformSession.findById(
      result.sessionId
    ).select("+refreshTokenHash");

    expect(storedSession).not.toBeNull();

    expect(storedSession?.refreshTokenHash).toBe(
      hashRefreshToken(result.refreshToken)
    );
  });

  it("should rotate a refresh token", async () => {
    const initial = await createSession({
      userId: testUserId,
    });

    const rotated = await rotateRefreshToken(
      initial.refreshToken
    );

    expect(rotated.userId).toBe(testUserId.toString());

    expect(rotated.refreshToken).not.toBe(
      initial.refreshToken
    );

    await expect(
      rotateRefreshToken(initial.refreshToken)
    ).rejects.toThrow();

    const storedSession = await PlatformSession.findById(
      rotated.sessionId
    ).select("+refreshTokenHash");

    expect(storedSession?.refreshTokenHash).toBe(
      hashRefreshToken(rotated.refreshToken)
    );
  });

  it("should reject an expired refresh token", async () => {
    const token = "expired-test-refresh-token";

    await PlatformSession.create({
      userId: testUserId,
      refreshTokenHash: hashRefreshToken(token),
      expiresAt: new Date(Date.now() - 60_000),
      revokedAt: null,
    });

    await expect(
      rotateRefreshToken(token)
    ).rejects.toThrow("Invalid or expired refresh token");
  });

  it("should revoke a session", async () => {
    const session = await createSession({
      userId: testUserId,
    });

    const revoked = await revokeSession(
      session.sessionId,
      testUserId
    );

    expect(revoked).toBe(true);

    await expect(
      rotateRefreshToken(session.refreshToken)
    ).rejects.toThrow("Invalid or expired refresh token");
  });

  it("should not allow another user to revoke a session", async () => {
    const session = await createSession({
      userId: testUserId,
    });

    const anotherUserId = new Types.ObjectId();

    const revoked = await revokeSession(
      session.sessionId,
      anotherUserId
    );

    expect(revoked).toBe(false);
  });

  it("should record the old token hash during rotation", async () => {
    const initial = await createSession({
      userId: testUserId,
    });

    await rotateRefreshToken(initial.refreshToken);

    const history = await RefreshTokenHistory.findOne({
      tokenHash: hashRefreshToken(initial.refreshToken),
    });

    expect(history).not.toBeNull();

    expect(history?.sessionId.toString()).toBe(
      initial.sessionId
    );
  });

  it("should detect reuse and revoke the compromised session", async () => {
    const initial = await createSession({
      userId: testUserId,
    });

    const rotated = await rotateRefreshToken(
      initial.refreshToken
    );

    await expect(
      rotateRefreshToken(initial.refreshToken)
    ).rejects.toThrow(
      "Refresh token reuse detected. Session revoked."
    );

    const storedSession = await PlatformSession.findById(
      initial.sessionId
    );

    expect(storedSession?.revokedAt).not.toBeNull();

    await expect(
      rotateRefreshToken(rotated.refreshToken)
    ).rejects.toThrow(
      "Invalid or expired refresh token"
    );
  });

  it("should not flag an unknown token as reuse", async () => {
    await expect(
      rotateRefreshToken("unknown-refresh-token")
    ).rejects.toThrow(
      "Invalid or expired refresh token"
    );
  });
});
