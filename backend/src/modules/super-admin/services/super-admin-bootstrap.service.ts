
import { PlatformUser } from "../models/plateform-user.model";
import { hashPassword } from "../../../utils/password.utils";

export interface BootstrapSuperAdminInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Creates the initial Super Admin.
 * This function must only be called by a trusted bootstrap script.
 */
export const bootstrapSuperAdmin = async (
  input: BootstrapSuperAdminInput
): Promise<void> => {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  if (!fullName || !email || !input.password) {
    throw new Error("Super Admin details are required");
  }

  if (input.password.length < 12) {
    throw new Error("Password must contain at least 12 characters");
  }

  // Prevent a second initial Super Admin.
  const existingAdmin = await PlatformUser.exists({
    role: "super_admin"
  });

  if (existingAdmin) {
    throw new Error(
      "A Super Admin already exists. Bootstrap cannot be repeated."
    );
  }

  // Prevent accidentally using an existing account's email.
  const existingEmail = await PlatformUser.exists({ email });

  if (existingEmail) {
    throw new Error("This email is already registered on the platform");
  }

  const passwordHash = await hashPassword(input.password);

  try {
    await PlatformUser.create({
      fullName,
      email,
      phone: input.phone?.trim() || undefined,
      passwordHash,
      role: "super_admin",
      status: "active",
      emailVerifiedAt: new Date(),
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0
    });
  } catch (error: unknown) {
    // Handle a duplicate-key race or an existing unique email.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error(
        "A conflicting platform account already exists"
      );
    }

    throw error;
  }
};
