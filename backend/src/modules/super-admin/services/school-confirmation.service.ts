
import mongoose from "mongoose";

import {
  SchoolDraft,
  type ISchoolDraft,
} from "../models/school-draft.model";

import {
  School,
  type ISchool,
} from "../models/school.model";

import { generateSchoolId } from "./school-id-generator.service";

import { enqueueSchoolProvisioning } from "../../../infrastructure/queues/school-provisioning.queue";
import { logger } from "../../../infrastructure/logger";

export class SchoolConfirmationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "SchoolConfirmationError";
  }
}

export const confirmSchoolDraft = async (
  draftId: string,
  createdBy: string
): Promise<ISchool> => {
  if (
    !mongoose.isValidObjectId(draftId) ||
    !mongoose.isValidObjectId(createdBy)
  ) {
    throw new SchoolConfirmationError("Invalid ID supplied", 400);
  }

  const session = await mongoose.startSession();

  try {
    let confirmedSchoolId: string | null = null;

    // Step 1: Confirm draft and create permanent school record.
    await session.withTransaction(async () => {
      const draft = await SchoolDraft.findOne({
        _id: new mongoose.Types.ObjectId(draftId),
        status: "draft",
      })
        .session(session)
        .lean();

      if (!draft) {
        throw new SchoolConfirmationError(
          "School draft not found or already processed",
          404
        );
      }

      const normalizedName = draft.schoolName.trim().toLowerCase();
      const normalizedEmail = draft.officialEmail.trim().toLowerCase();

      const normalizedRegistration =
        draft.registrationNumber?.trim().toUpperCase();

      // Duplicate conditions for permanent schools.
      const schoolConditions: mongoose.QueryFilter<ISchool>[] = [
        { officialEmail: normalizedEmail },
        {
          normalizedSchoolName: normalizedName,
          "address.city": draft.address.city.trim(),
          "address.state": draft.address.state.trim(),
          "address.postalCode": draft.address.postalCode.trim(),
          "address.country": draft.address.country.trim(),
        },
      ];

      // Duplicate conditions for other pending drafts.
      const draftConditions: mongoose.QueryFilter<ISchoolDraft>[] = [
        { officialEmail: normalizedEmail },
        {
          normalizedSchoolName: normalizedName,
          "address.city": draft.address.city.trim(),
          "address.state": draft.address.state.trim(),
          "address.postalCode": draft.address.postalCode.trim(),
          "address.country": draft.address.country.trim(),
        },
      ];

      if (normalizedRegistration) {
        schoolConditions.push({
          registrationNumber: normalizedRegistration,
        });

        draftConditions.push({
          registrationNumber: normalizedRegistration,
        });
      }

      // Sequential queries because both use the same transaction session.
      const registeredSchool = await School.findOne({
        status: { $ne: "archived" },
        $or: schoolConditions,
      })
        .session(session)
        .lean();

      const otherDraft = await SchoolDraft.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(draftId) },
        status: "draft",
        $or: draftConditions,
      })
        .session(session)
        .lean();

      if (registeredSchool || otherDraft) {
        throw new SchoolConfirmationError(
          "A possible duplicate school exists. Review it before confirmation.",
          409
        );
      }

      // Generate permanent School ID inside the transaction.
      const schoolId = await generateSchoolId(session);

      const school = new School({
        schoolId,
        schoolName: draft.schoolName,
        normalizedSchoolName: normalizedName,
        schoolType: draft.schoolType,
        registrationNumber: normalizedRegistration,
        officialEmail: normalizedEmail,
        phone: draft.phone,
        website: draft.website,
        address: draft.address,
        mainAdmin: draft.mainAdmin,
        subscriptionPlanId: draft.subscriptionPlanId,
        status: "provisioning",
        createdBy: new mongoose.Types.ObjectId(createdBy),
      });

      await school.save({ session });

      // Mark the original draft as confirmed.
      const updateResult = await SchoolDraft.updateOne(
        {
          _id: new mongoose.Types.ObjectId(draftId),
          status: "draft",
        },
        {
          $set: { status: "confirmed" },
        },
        { session }
      );

      if (updateResult.modifiedCount !== 1) {
        throw new SchoolConfirmationError(
          "Draft could not be confirmed. Please retry.",
          409
        );
      }

      confirmedSchoolId = schoolId;
    });

    if (!confirmedSchoolId) {
      throw new Error("School confirmation did not complete");
    }

    // Step 2: Retrieve the committed school record.
    const confirmedSchool = await School.findOne({
      schoolId: confirmedSchoolId,
    }).lean();

    if (!confirmedSchool) {
      throw new Error("Confirmed school record could not be retrieved");
    }

    // Step 3: Submit provisioning job after transaction commit.
    try {
      const job = await enqueueSchoolProvisioning(confirmedSchoolId);

      logger.info(
        {
          schoolId: confirmedSchoolId,
          jobId: job.jobId,
          jobState: job.state,
        },
        "School provisioning job submitted"
      );
    } catch (error) {
      logger.error(
        {
          schoolId: confirmedSchoolId,
          err: error,
        },
        "School confirmed but provisioning job could not be submitted"
      );

      throw new SchoolConfirmationError(
        "School was confirmed, but provisioning could not be queued. Please retry provisioning.",
        503
      );
    }

    return confirmedSchool as ISchool;
  } finally {
    await session.endSession();
  }
};
