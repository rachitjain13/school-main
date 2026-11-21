
import mongoose from "mongoose";

import { School } from "../models/school.model";
import { TenantRegistry } from "../models/tenant-registry.model";
import { PlatformUser } from "../models/plateform-user.model";
import { MainAdminInvitation } from "../models/main-admin-invitation.model";

import {
    generateInvitationToken,
    hashInvitationToken,
    getInvitationExpiry,
} from "./invitation-token.service";

import { sendMainAdminInvitationEmail } from "../../../infrastructure/email.service";
import { logger } from "../../../infrastructure/logger";

import { env } from "../../../config/env";

export class MainAdminInvitationError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "MainAdminInvitationError";
    }
}

interface InvitationResult {
    schoolId: string;
    email: string;
    invitationCreated: boolean;
    emailSent: boolean;
}

export const createMainAdminInvitation = async (
    schoolId: string
): Promise<InvitationResult> => {
    // 1. Find the school.
    const school = await School.findOne({ schoolId });

    if (!school) {
        throw new MainAdminInvitationError("School not found", 404);
    }

    // 2. Verify that the school is ready for invitation.
    if (!["onboarding", "admin_invited"].includes(school.status)) {
        throw new MainAdminInvitationError(
            "School is not ready for Main Admin invitation",
            409
        );
    }

    // 3. Verify tenant database provisioning.
    const registry = await TenantRegistry.findOne({ schoolId });

    if (!registry || registry.status !== "active") {
        throw new MainAdminInvitationError(
            "School database provisioning is not complete",
            409
        );
    }

    const email = school.mainAdmin.email.trim().toLowerCase();

    // Generate a secure, one-time invitation token.
    const rawToken = generateInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);

    // Calculate expiry once so DB and email have identical expiry.
    const expiresAt = getInvitationExpiry();

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // 4. Check whether this email already has a platform account.
            let user = await PlatformUser.findOne({ email }).session(session);

            if (
                user &&
                (
                    user.role !== "school_main_admin" ||
                    user.status !== "invited"
                )
            ) {
                throw new MainAdminInvitationError(
                    "This email already belongs to an existing platform account",
                    409
                );
            }

            // 5. Create the invited platform user if it does not exist.
            if (!user) {
                const createdUsers = await PlatformUser.create(
                    [
                        {
                            fullName: school.mainAdmin.fullName,
                            email,
                            phone: school.mainAdmin.phone,
                            role: "school_main_admin",
                            status: "invited",
                            createdBy: school.createdBy,
                        },
                    ],
                    { session }
                );

                user = createdUsers[0];
            }

            // 6. Revoke previous pending invitations.
            await MainAdminInvitation.updateMany(
                {
                    schoolId,
                    status: "pending",
                },
                {
                    $set: {
                        status: "revoked",
                        revokedAt: new Date(),
                    },
                },
                { session }
            );

            // 7. Create the new invitation.
            await MainAdminInvitation.create(
                [
                    {
                        schoolId,
                        email,
                        fullName: school.mainAdmin.fullName,
                        tokenHash,
                        status: "pending",
                        expiresAt,
                        invitedBy: school.createdBy,
                    },
                ],
                { session }
            );

            // 8. Update school status.
            await School.updateOne(
                { schoolId },
                {
                    $set: {
                        status: "admin_invited",
                    },
                },
                { session }
            );
        });
    } finally {
        await session.endSession();
    }

    // 9. Send email after the transaction successfully commits.
    let emailSent = false;

    if (env.SMTP_HOST && env.EMAIL_FROM) {
        const invitationUrl =
            `${env.FRONTEND_BASE_URL}/accept-invitation?token=${encodeURIComponent(rawToken)}`;

        try {
            await sendMainAdminInvitationEmail({
                email,
                fullName: school.mainAdmin.fullName,
                schoolName: school.schoolName,
                invitationUrl,
                expiresAt,
            });

            emailSent = true;

            logger.info(
                { schoolId },
                "Main Admin invitation email sent successfully"
            );
        } catch (error) {
            emailSent = false;

            logger.error(
                {
                    schoolId,
                    err: error instanceof Error
                        ? error.message
                        : "Unknown email delivery error",
                },
                "Main Admin invitation created, but email delivery failed"
            );
        }
    } else {
        logger.warn(
            { schoolId },
            "Main Admin invitation created, but SMTP is not configured"
        );
    }

    // 10. Return safe result. Never return the raw invitation token.
    return {
        schoolId,
        email,
        invitationCreated: true,
        emailSent,
    };
};
