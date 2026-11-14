
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../../config/redis";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(args[0], ...args.slice(1)) as Promise<number | string>,
    prefix: "school-portal:login-limit:",
  }),

  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});
