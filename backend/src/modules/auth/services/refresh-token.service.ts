import { randomBytes, createHash } from "node:crypto";

export const generateRefreshToken = (): string => {
  return randomBytes(64).toString("base64url");
};

export const hashRefreshToken = (token: string): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};