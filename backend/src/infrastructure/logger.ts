
import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",

  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "accessToken",
      "refreshToken",
      "*.accessToken",
      "*.refreshToken",
      "authorization",
      "*.authorization",
      "req.headers.authorization",
      "req.headers.cookie",
      "cookie",
      "*.cookie",
      "MONGODB_URI"
    ],
    censor: "[REDACTED]"
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  base: {
    service: "school-portal-backend",
    environment: env.NODE_ENV
  }
});
