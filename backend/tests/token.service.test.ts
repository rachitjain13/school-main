import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import {
  createAccessToken,
  verifyAccessToken,
} from "../src/modules/auth/services/token.service";
import { env } from "../src/config/env";

describe("JWT Token Service", () => {
  const user = {
    userId: "691234567890123456789012",
    role: "super_admin" as const,
  };

  it("should generate an access token", async () => {
    const token = await createAccessToken(user);

    expect(token).toBeTypeOf("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("should verify a valid access token", async () => {
    const token = await createAccessToken(user);
    const decoded = await verifyAccessToken(token);

    expect(decoded.userId).toBe(user.userId);
    expect(decoded.role).toBe("super_admin");
  });

  it("should reject an invalid token", async () => {
    await expect(
      verifyAccessToken("invalid.token.value")
    ).rejects.toThrow();
  });

  it("should reject an expired token", async () => {
    const expiredToken = jwt.sign(
      {
        role: "super_admin",
        tokenType: "access",
      },
      env.JWT_ACCESS_SECRET,
      {
        algorithm: "HS256",
        subject: user.userId,
        expiresIn: -1,
      }
    );

    await expect(
      verifyAccessToken(expiredToken)
    ).rejects.toThrow();
  });

  it("should reject a token with an invalid role", async () => {
    const invalidToken = jwt.sign(
      {
        role: "student",
        tokenType: "access",
      },
      env.JWT_ACCESS_SECRET,
      {
        algorithm: "HS256",
        subject: user.userId,
        expiresIn: "15m",
      }
    );

    await expect(
      verifyAccessToken(invalidToken)
    ).rejects.toThrow("Invalid access token");
  });
});