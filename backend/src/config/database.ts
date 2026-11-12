
import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../infrastructure/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: env.DB_MAX_POOL_SIZE,
      minPoolSize: env.DB_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: env.NODE_ENV !== "production"
    });

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(
      { err: error },
      "MongoDB connection failed"
    );

    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error({ err: error }, "MongoDB connection error");
});
