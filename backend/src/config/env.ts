
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    TEST_MONGODB_DB_NAME: z.string().default("school_portal_test"),
    REDIS_URL: z.string().url().optional(),

    PORT: z.coerce.number().int().positive().default(5000),

    API_PREFIX: z.string().default("/api/v1"),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    CORS_ORIGINS: z.string().default("http://localhost:5173"),

    DB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),

    DB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2),

    // Authentication configuration
    JWT_ACCESS_SECRET: z.string().min(
        32,
        "JWT_ACCESS_SECRET must contain at least 32 characters"
    ),

    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce
        .number()
        .int()
        .positive()
        .max(90)
        .default(7),

    COOKIE_SECURE: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),

    COOKIE_SAME_SITE: z
        .enum(["strict", "lax", "none"])
        .default("lax"),

    COOKIE_DOMAIN: z.string().optional(),
        // Email / SMTP configuration
    SMTP_HOST: z.string().optional(),

    SMTP_PORT: z.coerce.number().int().positive().default(587),

    SMTP_SECURE: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),

    SMTP_USER: z.string().optional(),

    SMTP_PASSWORD: z.string().optional(),

    EMAIL_FROM: z.string().email().optional(),

    FRONTEND_BASE_URL: z
        .string()
        .url()
        .default("http://localhost:5173"),
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
