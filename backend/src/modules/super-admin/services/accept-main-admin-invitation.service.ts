
import mongoose from "mongoose";

import { MainAdminInvitation } from "../models/main-admin-invitation.model";
import { PlatformUser } from "../models/plateform-user.model";
import { SchoolMembership } from "../models/school-membership.model";
import { School } from "../models/school.model";

import { hashInvitationToken } from "./invitation-token.service";
import { hashPassword } from "../../../utils/password.utils";

export class InvitationAcceptanceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "InvitationAcceptanceError";
    }
}

interface AcceptInvitationInput {
    token: string;
    password: string;
}

export const acceptMainAdminInvitation = async (
    input: AcceptInvitationInput
) => {
    if (!input.token || input.token.length > 200) {
        throw new InvitationAcceptanceError(
            "Invalid or expired invitation",
            400
        );
    }

    if (!input.password || input.password.length < 12 || input.password.length > 128) {
        throw new InvitationAcceptanceError(
            "Password must contain between 12 and 128 characters",
            400
        );
    }

    // Hash before opening the transaction to avoid holding a database
    // transaction open during an expensive password-hashing operation.
    const passwordHash = await hashPassword(input.password);
    const tokenHash = hashInvitationToken(input.token);
    const session = await mongoose.startSession();

    let acceptedUser: {
        userId: string;
        email: string;
        fullName: string;
        schoolId: string;
    } | null = null;

    try {
        await session.withTransaction(async () => {
            const now = new Date();

            const invitation = await MainAdminInvitation.findOne({
                tokenHash,
                status: "pending",
                expiresAt: { $gt: now },
            })
                .select("+tokenHash")
                .session(session);

            if (!invitation) {
                throw new InvitationAcceptanceError(
                    "Invalid, expired, or already-used invitation",
                    400
                );
            }

            const school = await School.findOne({
                schoolId: invitation.schoolId,
                status: "admin_invited",
            }).session(session);

            if (!school) {
                throw new InvitationAcceptanceError(
                    "School is not available for activation",
                    409
                );
            }

            const user = await PlatformUser.findOneAndUpdate(
                {
                    email: invitation.email,
                    role: "school_main_admin",
                    status: "invited",
                },
                {
                    $set: {
                        passwordHash,
                        status: "active",
                        emailVerifiedAt: now,
                        passwordChangedAt: now,
                        failedLoginAttempts: 0,
                    },
                    $unset: {
                        lockUntil: 1,
                    },
                },
                {
                    new: true,
                    session,
                    runValidators: true,
                }
            );

            if (!user) {
                throw new InvitationAcceptanceError(
                    "Invited account is unavailable or already activated",
                    409
                );
            }

            await SchoolMembership.create(
                [{
                    userId: user._id,
                    schoolId: invitation.schoolId,
                    role: "school_main_admin",
                    status: "active",
                }],
                { session }
            );

            const invitationUpdate = await MainAdminInvitation.updateOne(
                {
                    _id: invitation._id,
                    status: "pending",
                    expiresAt: { $gt: now },
                },
                {
                    $set: {
                        status: "accepted",
                        acceptedAt: now,
                    },
                },
                { session }
            );

            if (invitationUpdate.modifiedCount !== 1) {
                throw new InvitationAcceptanceError(
                    "Invitation has already been used",
                    409
                );
            }

            const schoolUpdate = await School.updateOne(
                {
                    schoolId: invitation.schoolId,
                    status: "admin_invited",
                },
                {
                    $set: { status: "active" },
                },
                { session }
            );

            if (schoolUpdate.modifiedCount !== 1) {
                throw new InvitationAcceptanceError(
                    "School activation could not be completed",
                    409
                );
            }

            acceptedUser = {
                userId: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                schoolId: invitation.schoolId,
            };
        });
    } finally {
        await session.endSession();
    }

    if (!acceptedUser) {
        throw new InvitationAcceptanceError(
            "Invitation acceptance could not be completed",
            500
        );
    }

    return acceptedUser;
};
