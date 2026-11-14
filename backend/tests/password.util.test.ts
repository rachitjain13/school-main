
import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword
} from "../src/utils/password.utils";

describe("Password Utility", () => {
  const password = "SchoolPortal@2026Secure";

  it("should generate an Argon2id password hash", async () => {
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("should verify the correct password", async () => {
    const hash = await hashPassword(password);

    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await hashPassword(password);

    const result = await verifyPassword(
      "WrongPassword@2026",
      hash
    );

    expect(result).toBe(false);
  });

  it("should reject passwords shorter than 12 characters", async () => {
    await expect(hashPassword("short")).rejects.toThrow(
      "Password must contain at least 12 characters"
    );
  });

  it("should return false for an invalid hash", async () => {
    const result = await verifyPassword(
      password,
      "invalid-hash"
    );

    expect(result).toBe(false);
  });
});
