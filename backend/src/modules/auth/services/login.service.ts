
import { PlatformUser } from "../../super-admin/models/plateform-user.model";
import { SchoolMembership } from "../../super-admin/models/school-membership.model";
import { verifyPassword } from "../../../utils/password.utils";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export class AuthenticationError extends Error {
    constructor() {
        super("Invalid email or password");
        this.name = "AuthenticationError";
    }
}

export const authenticatePlatformUser = async (
    email: string,
    password: string
) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await PlatformUser.findOne({
        email: normalizedEmail,
    }).select("+passwordHash");

    if (!user || !user.passwordHash || user.status !== "active") {
        throw new AuthenticationError();
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
        throw new AuthenticationError();
    }

    // Main Admin must have an active school membership.
    if (user.role === "school_main_admin") {
        const membership = await SchoolMembership.findOne({
            userId: user._id,
            status: "active",
        });

        if (!membership) {
            throw new AuthenticationError();
        }
    }

    const passwordIsValid = await verifyPassword(
        password,
        user.passwordHash
    );

    if (!passwordIsValid) {
        const failedAttempts = user.failedLoginAttempts + 1;

        const update: {
            failedLoginAttempts: number;
            lockUntil?: Date;
        } = {
            failedLoginAttempts: failedAttempts,
        };

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            update.lockUntil = new Date(
                Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
            );
        }

        await PlatformUser.updateOne(
            { _id: user._id },
            { $set: update }
        );

        throw new AuthenticationError();
    }

    await PlatformUser.updateOne(
        { _id: user._id },
        {
            $set: {
                failedLoginAttempts: 0,
                lastLoginAt: new Date(),
            },
            $unset: {
                lockUntil: 1,
            },
        }
    );

    return {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
};

// Backward-compatible export.
export const authenticateSuperAdmin = authenticatePlatformUser;
