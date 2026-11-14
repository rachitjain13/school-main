
import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../infrastructure/logger";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is required for Redis");
}

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 10000,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

redis.on("ready", () => {
  logger.info("Redis ready");
});

redis.on("error", (error) => {
  logger.error(
    { err: error.message },
    "Redis connection error"
  );
});

export const connectRedis = async (): Promise<void> => {
  if (redis.status === "wait") {
    await redis.connect();
  }

  if (redis.status !== "ready") {
    throw new Error("Redis is not ready");
  }

  const response = await redis.ping();

  if (response !== "PONG") {
    throw new Error("Redis health check failed");
  }

  logger.info("Redis connected successfully");
};

export const disconnectRedis = async (): Promise<void> => {
  redis.disconnect();
};
