
import { getTenantConnection } from "../../../infrastructure/tenant-connection.manager";
import { School } from "../models/school.model";
import { TenantRegistry } from "../models/tenant-registry.model";

const SCHOOL_COLLECTIONS = [
  "students",
  "parents",
  "teachers",
  "coordinators",
  "classes",
  "sections",
  "subjects",
  "enrollments",
  "attendance",
  "examinations",
  "results",
  "fees",
  "assignments",
  "school_notifications",
  "settings",
] as const;

export class SchoolProvisioningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchoolProvisioningError";
  }
}

const createCollectionIfMissing = async (
  db: NonNullable<Awaited<ReturnType<typeof getTenantConnection>>["db"]>,
  collectionName: string
): Promise<void> => {
  const exists = await db
    .listCollections({ name: collectionName }, { nameOnly: true })
    .hasNext();

  if (exists) {
    return;
  }

  try {
    await db.createCollection(collectionName);
  } catch (error) {
    // MongoDB error code 48 means the collection already exists.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 48
    ) {
      return;
    }

    throw error;
  }
};

export const provisionSchoolDatabase = async (
  schoolId: string
) => {
  const school = await School.findOne({ schoolId });

  if (!school) {
    throw new SchoolProvisioningError("School record not found");
  }

  if (
    school.status !== "provisioning" &&
    school.status !== "provisioning_failed"
  ) {
    throw new SchoolProvisioningError(
      `School cannot be provisioned from status: ${school.status}`
    );
  }

  const databaseName = `school_${schoolId.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;

  try {
    // Create or resume the central tenant registry entry.
    const registry = await TenantRegistry.findOneAndUpdate(
      { schoolId },
      {
        $setOnInsert: { databaseName },
        $set: { status: "provisioning" },
        $inc: { provisioningAttempts: 1 },
        $unset: { lastProvisioningError: 1 },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (!registry || registry.databaseName !== databaseName) {
      throw new SchoolProvisioningError(
        "Tenant registry database mapping does not match the school"
      );
    }

    // Connect using the backend-managed tenant connection manager.
    const connection = await getTenantConnection(databaseName);

    if (!connection.db) {
      throw new SchoolProvisioningError(
        "Tenant database connection is unavailable"
      );
    }

    // Create all initial school collections idempotently.
    for (const collectionName of SCHOOL_COLLECTIONS) {
      await createCollectionIfMissing(
        connection.db,
        collectionName
      );
    }

    // Mark tenant registry active only after initialization succeeds.
    await TenantRegistry.updateOne(
      { schoolId },
      {
        $set: {
          status: "active",
          lastProvisionedAt: new Date(),
        },
        $unset: {
          lastProvisioningError: 1,
        },
      }
    );

    await School.updateOne(
  { schoolId },
  { $set: { status: "onboarding" } }
);

    return {
      schoolId,
      databaseName,
      status: "active" as const,
      collectionsCreated: SCHOOL_COLLECTIONS.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message.slice(0, 1000)
        : "Unknown provisioning error";

    await Promise.allSettled([
      TenantRegistry.updateOne(
        { schoolId },
        {
          $set: {
            databaseName,
            status: "provisioning_failed",
            lastProvisioningError: errorMessage,
          },
        }
      ),
      School.updateOne(
        { schoolId },
        { $set: { status: "provisioning_failed" } }
      ),
    ]);

    throw new SchoolProvisioningError(
      `School database provisioning failed: ${errorMessage}`
    );
  }
};
