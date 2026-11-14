
import { Server } from "node:http";
import mongoose from "mongoose";

import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import {
  connectRedis,
  disconnectRedis,
} from "./config/redis";
import { logger } from "./infrastructure/logger";

let server: Server | null = null;
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  // Force shutdown if graceful shutdown takes too long.
  const forceExit = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out");
    process.exit(1);
  }, 10000);

  forceExit.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await disconnectRedis();
    logger.info("Redis disconnected successfully");

    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully");

    clearTimeout(forceExit);

    logger.info("Server shutdown completed");

    process.exit(0);
  } catch (error) {
    clearTimeout(forceExit);

    logger.error({ err: error }, "Graceful shutdown failed");
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

const startServer = async (): Promise<void> => {
  try {
    // Connect MongoDB first.
    await connectDatabase();

    // Connect Redis before accepting API requests.
    await connectRedis();

    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        "School Portal server started"
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Server startup failed");

    await disconnectRedis().catch(() => undefined);
    await mongoose.disconnect().catch(() => undefined);

    process.exit(1);
  }
};

void startServer();
