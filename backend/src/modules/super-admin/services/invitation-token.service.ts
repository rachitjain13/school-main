
import { createHash, randomBytes } from "node:crypto";

const INVITATION_EXPIRY_HOURS = 72;

export const generateInvitationToken = (): string => {
  return randomBytes(32).toString("base64url");
};

export const hashInvitationToken = (token: string): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getInvitationExpiry = (): Date => {
  const expiry = new Date();

  expiry.setHours(
    expiry.getHours() + INVITATION_EXPIRY_HOURS
  );

  return expiry;
};

export const isInvitationExpired = (
  expiresAt: Date
): boolean => {
  return expiresAt.getTime() <= Date.now();
};
