
import { connectDatabase } from "../config/database";
import { env } from "../config/env";
import { logger } from "../infrastructure/logger";
import { bootstrapSuperAdmin } from "../modules/super-admin/services/super-admin-bootstrap.service";

const main = async (): Promise<void> => {
  const fullName = process.env.BOOTSTRAP_ADMIN_NAME;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const phone = process.env.BOOTSTRAP_ADMIN_PHONE;

  if (!fullName || !email || !password) {
    throw new Error("Bootstrap administrator environment variables are missing");
  }

  await connectDatabase();

  await bootstrapSuperAdmin({
    fullName,
    email,
    password,
    phone
  });

  logger.info("Initial Super Admin account created successfully");
};

main()
  .catch((error: unknown) => {
    logger.error(
      { err: error instanceof Error ? error.message : "Unknown error" },
      "Super Admin bootstrap failed"
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  });
