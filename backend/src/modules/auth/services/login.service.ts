
import { PlatformUser } from "../../super-admin/models/plateform-user.model";
import { verifyPassword } from "../../../utils/password.utils";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export class AuthenticationError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "AuthenticationError";
  }
}

export const authenticateSuperAdmin = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await PlatformUser.findOne({
    email: normalizedEmail,
    role: "super_admin",
  }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    throw new AuthenticationError();
  }

  if (user.status !== "active") {
    throw new AuthenticationError();
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AuthenticationError();
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
