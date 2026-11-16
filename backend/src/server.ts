
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

import {
  startSchoolProvisioningWorker,
  closeSchoolProvisioningWorker,
} from "./infrastructure/workers/school-provisioning.worker";

import {
  closeSchoolProvisioningQueue,
} from "./infrastructure/queues/school-provisioning.queue";

let server: Server | null = null;
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  const forceExit = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out");
    process.exit(1);
  }, 10000);

  forceExit.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await closeSchoolProvisioningWorker();
    await closeSchoolProvisioningQueue();

    await disconnectRedis();

    await closeTenantConnections();

    await mongoose.disconnect();

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
    await connectDatabase();

    await connectRedis();

    startSchoolProvisioningWorker();

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

    await closeSchoolProvisioningWorker().catch(() => undefined);
    await closeSchoolProvisioningQueue().catch(() => undefined);
    await disconnectRedis().catch(() => undefined);
    await closeTenantConnections().catch(() => undefined);
    await mongoose.disconnect().catch(() => undefined);

    process.exit(1);
  }
};

void startServer();
