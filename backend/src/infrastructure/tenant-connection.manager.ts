
import mongoose, { Connection } from "mongoose";
import { env } from "../config/env";
import { logger } from "./logger";

const tenantConnections = new Map<string, Promise<Connection>>();

const DATABASE_NAME_PATTERN = /^school_[a-z0-9_]{1,50}$/;

export const getTenantConnection = async (
  databaseName: string
): Promise<Connection> => {
  if (!DATABASE_NAME_PATTERN.test(databaseName)) {
    throw new Error("Invalid tenant database name");
  }

  const existing = tenantConnections.get(databaseName);

  if (existing) {
    return existing;
  }

  const connectionPromise = mongoose
    .createConnection(env.MONGODB_URI, {
      dbName: databaseName,
      maxPoolSize: env.DB_MAX_POOL_SIZE,
      minPoolSize: env.DB_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: env.NODE_ENV !== "production",
    })
    .asPromise()
    .then((connection) => {
      logger.info(
        { databaseName },
        "Tenant database connected"
      );

      return connection;
    })
    .catch((error: unknown) => {
      tenantConnections.delete(databaseName);

      logger.error(
        { err: error, databaseName },
        "Tenant database connection failed"
      );

      throw error;
    });

  tenantConnections.set(databaseName, connectionPromise);

  return connectionPromise;
};

export const closeTenantConnections = async (): Promise<void> => {
  const connections = [...tenantConnections.values()];

  tenantConnections.clear();

  await Promise.allSettled(
    connections.map(async (connectionPromise) => {
      const connection = await connectionPromise;
      await connection.close();
    })
  );

  logger.info("Tenant database connections closed");
};
