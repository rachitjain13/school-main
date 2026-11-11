import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  API_PREFIX: z.string().default("/api/v1"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  CORS_ORIGINS: z.string().default("http://localhost:5173"),

  DB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),

  DB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  console.error(z.prettifyError(parsedEnv.error));
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  CORS_ORIGINS: parsedEnv.data.CORS_ORIGINS
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};
