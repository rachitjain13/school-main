
import { Server } from "node:http";
import mongoose from "mongoose";

import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
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

    await mongoose.disconnect();

    clearTimeout(forceExit);

    logger.info("MongoDB disconnected successfully");
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
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV
        },
        "School Portal server started"
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Server startup failed");
    await mongoose.disconnect();
    process.exit(1);
  }
};

void startServer();
