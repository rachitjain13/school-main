
import { Worker } from "bullmq";
import Redis from "ioredis";

import { env } from "../../config/env";
import { logger } from "../logger";

import { School } from "../../modules/super-admin/models/school.model";
import { provisionSchoolDatabase } from "../../modules/super-admin/services/school-provisioning.service";
import { createMainAdminInvitation } from "../../modules/super-admin/services/main-admin-invitation.service";

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
                {
                    jobId: job.id,
                    schoolId,
                    attempt: job.attemptsMade + 1,
                },
                "School provisioning job started"
            );

            const school = await School.findOne({ schoolId });

            if (!school) {
                throw new Error("School record not found");
            }

            let provisioningResult = null;

            if (
                school.status === "provisioning" ||
                school.status === "provisioning_failed"
            ) {
                provisioningResult = await provisionSchoolDatabase(schoolId);
            } else if (
                school.status === "onboarding" ||
                school.status === "admin_invited"
            ) {
                logger.info(
                    { schoolId, status: school.status },
                    "School database already provisioned; skipping provisioning"
                );
            } else if (school.status === "active") {
                logger.info(
                    { schoolId },
                    "School is already active; invitation step skipped"
                );

                return {
                    schoolId,
                    status: "active",
                    invitation: null,
                };
            } else {
                throw new Error(
                    `School cannot continue provisioning from status: ${school.status}`
                );
            }

            // Invitation failures can now be retried without provisioning
            // the tenant database again.
            const invitation = await createMainAdminInvitation(schoolId);

            logger.info(
                {
                    jobId: job.id,
                    schoolId,
                    emailSent: invitation.emailSent,
                },
                "School provisioning and invitation job completed"
            );

            return {
                ...(provisioningResult ?? {
                    schoolId,
                    status: "already_provisioned",
                }),
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
            "School provisioning worker job failed"
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
