import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../../config/env";

const secret = env.JWT_ACCESS_SECRET;

export interface AccessTokenPayload {
  userId: string;
  role: "super_admin" | "school_main_admin";
}

export const createAccessToken = async (
  payload: AccessTokenPayload
): Promise<string> => {
  return jwt.sign(
    {
      role: payload.role,
      tokenType: "access",
    },
    secret,
    {
      algorithm: "HS256",
      subject: payload.userId,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
};

export const verifyAccessToken = async (
  token: string
): Promise<AccessTokenPayload> => {
  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });

  if (typeof decoded === "string") {
    throw new Error("Invalid access token");
  }

  const payload = decoded as JwtPayload & {
    role?: string;
    tokenType?: string;
  };

  if (
    payload.tokenType !== "access" ||
    typeof payload.sub !== "string" ||
    (payload.role !== "super_admin" &&
      payload.role !== "school_main_admin")
  ) {
    throw new Error("Invalid access token");
  }

  return {
    userId: payload.sub,
    role: payload.role,
  };
};