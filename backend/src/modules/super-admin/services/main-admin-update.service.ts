
import mongoose from "mongoose";

import { School } from "../models/school.model";
import { PlatformUser } from "../models/plateform-user.model";
import { SchoolMembership } from "../models/school-membership.model";
import { MainAdminInvitation } from "../models/main-admin-invitation.model";

import { UpdateMainAdminInput } from "../validations/main-admin-update.validation";

export class MainAdminUpdateError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "MainAdminUpdateError";
    }
}

export const updateSchoolMainAdmin = async (
    schoolId: string,
    input: UpdateMainAdminInput
) => {
    const email = input.email.trim().toLowerCase();

    const session = await mongoose.startSession();

    let updatedSchool: unknown = null;

    try {
        await session.withTransaction(async () => {
            const school = await School.findOne({ schoolId }).session(session);

            if (!school) {
                throw new MainAdminUpdateError("School not found", 404);
            }

            if (!["onboarding", "admin_invited"].includes(school.status)) {
                throw new MainAdminUpdateError(
                    "Main Admin details cannot be changed in the current school status",
                    409
                );
            }

            // Never silently replace an accepted Main Admin.
            const activeMembership = await SchoolMembership.findOne({
                schoolId,
                status: "active",
            }).session(session);

            if (activeMembership) {
                throw new MainAdminUpdateError(
                    "An active Main Admin already exists for this school",
                    409
                );
            }

            const oldEmail = school.mainAdmin.email.trim().toLowerCase();
            const emailChanged = oldEmail !== email;

            // Check whether the new email belongs to another account.
            if (emailChanged) {
                const existingNewUser = await PlatformUser.findOne({
                    email,
                }).session(session);

                if (existingNewUser) {
                    throw new MainAdminUpdateError(
                        "The new email already belongs to an existing platform account",
                        409
                    );
                }

                // Retire the previous invited account, if it exists.
                const oldUser = await PlatformUser.findOne({
                    email: oldEmail,
                }).session(session);

                if (oldUser) {
                    if (
                        oldUser.role !== "school_main_admin" ||
                        oldUser.status !== "invited"
                    ) {
                        throw new MainAdminUpdateError(
                            "The previous Main Admin account cannot be safely replaced",
                            409
                        );
                    }

                    await PlatformUser.updateOne(
                        { _id: oldUser._id, status: "invited" },
                        { $set: { status: "disabled" } },
                        { session }
                    );
                }
            } else {
                // If the email is unchanged, update the existing invited
                // platform user's name and phone as well.
                const existingUser = await PlatformUser.findOne({
                    email: oldEmail,
                }).session(session);

                if (existingUser) {
                    if (
                        existingUser.role !== "school_main_admin" ||
                        existingUser.status !== "invited"
                    ) {
                        throw new MainAdminUpdateError(
                            "The existing Main Admin account cannot be updated",
                            409
                        );
                    }

                    await PlatformUser.updateOne(
                        { _id: existingUser._id },
                        {
                            $set: {
                                fullName: input.fullName.trim(),
                                phone: input.phone,
                            },
                        },
                        { session }
                    );
                }
            }

            // Revoke old pending invitation tokens.
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

            // Update Main Admin details on the school record.
            school.mainAdmin = {
                fullName: input.fullName.trim(),
                email,
                phone: input.phone?.trim(),
            };

            await school.save({ session });

            updatedSchool = {
                schoolId: school.schoolId,
                schoolName: school.schoolName,
                mainAdmin: school.mainAdmin,
                status: school.status,
            };
        });
    } finally {
        await session.endSession();
    }

    return updatedSchool;
};
