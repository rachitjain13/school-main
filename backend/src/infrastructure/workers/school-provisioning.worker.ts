
import { Worker } from "bullmq";
import Redis from "ioredis";
import { createMainAdminInvitation } from "../../modules/super-admin/services/main-admin-invitation.service";
import { env } from "../../config/env";
import { logger } from "../logger";
import { provisionSchoolDatabase } from "../../modules/super-admin/services/school-provisioning.service";

let worker: Worker | null = null;
let workerRedis: Redis | null = null;

export const startSchoolProvisioningWorker = (): void => {
  if (worker) {
    logger.warn("School provisioning worker is already running");
    return;
  }

  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is required for provisioning worker");
  }

  workerRedis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  workerRedis.on("error", (error) => {
    logger.error(
      { err: error.message },
      "Provisioning worker Redis connection error"
    );
  });

  worker = new Worker(
    "school-provisioning",
    async (job) => {
      const { schoolId } = job.data as { schoolId: string };

      logger.info(
        { jobId: job.id, schoolId, attempt: job.attemptsMade + 1 },
        "School provisioning job started"
      );

      const result = await provisionSchoolDatabase(schoolId);

      const invitation = await createMainAdminInvitation(schoolId);

      logger.info(
        { jobId: job.id, schoolId },
        "School provisioning job completed"
      );

      return {
        ...result,
        invitation,
      };
    },
    {
      connection: workerRedis,
      concurrency: 2,
    }
  );

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        schoolId: job?.data?.schoolId,
        attemptsMade: job?.attemptsMade,
        err: error.message,
      },
      "School provisioning job failed"
    );
  });

  worker.on("error", (error) => {
    logger.error(
      { err: error.message },
      "School provisioning worker error"
    );
  });

  logger.info("School provisioning worker started");
};

export const closeSchoolProvisioningWorker = async (): Promise<void> => {
  if (worker) {
    await worker.close();
    worker = null;
  }

  if (workerRedis) {
    await workerRedis.quit();
    workerRedis = null;
  }

  logger.info("School provisioning worker closed");
};
