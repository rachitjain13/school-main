
import { describe, it, expect } from "vitest";
import { PlatformSession } from "../src/modules/auth/models/platform-session.model";
import mongoose from "mongoose";

describe("PlatformSession Model", () => {
  it("should create a valid session", () => {
    const session = new PlatformSession({
      userId: new mongoose.Types.ObjectId(),
      refreshTokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    expect(session.validateSync()).toBeUndefined();
    expect(session.revokedAt).toBeNull();
  });

  it("should reject a missing userId", () => {
    const session = new PlatformSession({
      refreshTokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 86400000)
    });

    expect(session.validateSync()?.errors.userId).toBeDefined();
  });

  it("should reject a missing refresh token hash", () => {
    const session = new PlatformSession({
      userId: new mongoose.Types.ObjectId(),
      expiresAt: new Date(Date.now() + 86400000)
    });

    expect(session.validateSync()?.errors.refreshTokenHash).toBeDefined();
  });

  it("should hide refreshTokenHash by default", () => {
    expect(
      PlatformSession.schema.path("refreshTokenHash")?.options.select
    ).toBe(false);
  });

  it("should define the TTL index", () => {
    const indexes = PlatformSession.schema.indexes();

    const ttlIndex = indexes.find(
      ([fields]) => fields.expiresAt === 1
    );

    expect(ttlIndex?.[1].expireAfterSeconds).toBe(0);
  });
});
