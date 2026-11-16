
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
    const school = await School.findOne({ schoolId });

    if (!school) {
        throw new MainAdminInvitationError(
            "School not found",
            404
        );
    }

    if (!["onboarding", "admin_invited"].includes(school.status)) {
        throw new MainAdminInvitationError(
            "School is not ready for Main Admin invitation",
            409
        );
    }

    const registry = await TenantRegistry.findOne({ schoolId });

    if (!registry || registry.status !== "active") {
        throw new MainAdminInvitationError(
            "School database provisioning is not complete",
            409
        );
    }

    const email = school.mainAdmin.email.trim().toLowerCase();

    const rawToken = generateInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            let user = await PlatformUser.findOne({ email }).session(session);

            if (user && (
                user.role !== "school_main_admin" ||
                user.status !== "invited"
            )) {
                throw new MainAdminInvitationError(
                    "This email already belongs to an existing platform account",
                    409
                );
            }

            if (!user) {
                const createdUsers = await PlatformUser.create(
                    [{
                        fullName: school.mainAdmin.fullName,
                        email,
                        phone: school.mainAdmin.phone,
                        role: "school_main_admin",
                        status: "invited",
                        createdBy: school.createdBy,
                    }],
                    { session }
                );

                user = createdUsers[0];
            }

            // Invalidate previous pending invitations for this school.
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

            await MainAdminInvitation.create(
                [{
                    schoolId,
                    email,
                    fullName: school.mainAdmin.fullName,
                    tokenHash,
                    status: "pending",
                    expiresAt: getInvitationExpiry(),
                    invitedBy: school.createdBy,
                }],
                { session }
            );

            await School.updateOne(
                { schoolId },
                { $set: { status: "admin_invited" } },
                { session }
            );
        });

    } finally {
        await session.endSession();
    }

    // Email is deliberately outside the database transaction.
    // An email failure must not undo successful provisioning or invitation creation.
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
                expiresAt: getInvitationExpiry(),
            });

            emailSent = true;
        } catch {
            // The pending invitation remains stored.
            // A Super Admin can resend it after SMTP is configured.
            emailSent = false;
        }
    }

    return {
        schoolId,
        email,
        invitationCreated: true,
        emailSent,
    };
};
