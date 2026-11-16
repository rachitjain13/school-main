
import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "../../config/env";
import { logger } from "../logger";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is required for BullMQ");
}

// Dedicated Redis connection for BullMQ.
// Keep the existing application Redis connection unchanged.
const provisioningRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

provisioningRedis.on("error", (error) => {
  logger.error(
    { err: error.message },
    "School provisioning Redis connection error"
  );
});

export const schoolProvisioningQueue = new Queue(
  "school-provisioning",
  {
    connection: provisioningRedis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 7 * 24 * 60 * 60,
        count: 1000,
      },
      removeOnFail: {
        age: 30 * 24 * 60 * 60,
      },
    },
  }
);

schoolProvisioningQueue.on("error", (error: Error) => {
  logger.error(
    { err: error.message },
    "School provisioning queue error"
  );
});

export const closeSchoolProvisioningQueue = async (): Promise<void> => {
  await schoolProvisioningQueue.close();
  await provisioningRedis.quit();

  logger.info("School provisioning queue closed");
};

export const enqueueSchoolProvisioning = async (
  schoolId: string
): Promise<{ jobId: string; state: string }> => {
  const jobId = `provision-${schoolId}`;

  const existingJob = await schoolProvisioningQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();

    if (state === "failed") {
      await existingJob.remove();
    } else {
      return { jobId, state };
    }
  }

  const job = await schoolProvisioningQueue.add(
    "provision-school",
    { schoolId },
    { jobId }
  );

  return {
    jobId: String(job.id),
    state: "waiting",
  };
};
