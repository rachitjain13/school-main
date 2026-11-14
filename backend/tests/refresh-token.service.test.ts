import { describe, it, expect } from "vitest";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../src/modules/auth/services/refresh-token.service";

describe("Refresh Token Service", () => {
  it("should generate a refresh token", () => {
    const token = generateRefreshToken();

    expect(token).toBeTypeOf("string");
    expect(token.length).toBeGreaterThan(50);
  });

  it("should generate unique tokens", () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();

    expect(token1).not.toBe(token2);
  });

  it("should generate a SHA-256 hash", () => {
    const hash = hashRefreshToken("sample-refresh-token");

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should generate the same hash for the same token", () => {
    const token = generateRefreshToken();

    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("should generate different hashes for different tokens", () => {
    const hash1 = hashRefreshToken(generateRefreshToken());
    const hash2 = hashRefreshToken(generateRefreshToken());

    expect(hash1).not.toBe(hash2);
  });
});