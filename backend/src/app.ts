import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./infrastructure/logger";
import apiRouter from "./routes";

const app = express();

// Security headers
app.use(helmet());

// Allow authorized frontend origins
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true
  })
);

// Parse incoming JSON
app.use(express.json({ limit: "1mb" }));

// HTTP request logging
app.use(pinoHttp({ logger }));

// API routes
app.use(env.API_PREFIX, apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
