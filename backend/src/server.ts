
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
import { closeTenantConnections } from "./infrastructure/tenant-connection.manager";

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
    // Stop accepting new HTTP requests.
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

    // Disconnect Redis.
    await disconnectRedis();
    logger.info("Redis disconnected successfully");

    // Close all school tenant database connections.
    await closeTenantConnections();
    logger.info("Tenant database connections closed");

    // Disconnect central platform_core database.
    await mongoose.disconnect();
    logger.info("Central MongoDB disconnected successfully");

    clearTimeout(forceExit);

    logger.info("Server shutdown completed");

    process.exit(0);
  } catch (error) {
    clearTimeout(forceExit);

    logger.error(
      { err: error },
      "Graceful shutdown failed"
    );

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
    // Connect central MongoDB first.
    await connectDatabase();

    // Connect Redis before accepting API requests.
    await connectRedis();

    // Start HTTP server only after dependencies are ready.
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
    logger.fatal(
      { err: error },
      "Server startup failed"
    );

    await disconnectRedis().catch(() => undefined);

    await closeTenantConnections().catch(() => undefined);

    await mongoose.disconnect().catch(() => undefined);

    process.exit(1);
  }
};

void startServer();
