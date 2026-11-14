
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

      // Separate query conditions for each model
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

      const [registeredSchool, otherDraft] = await Promise.all([
        School.findOne({
          status: { $ne: "archived" },
          $or: schoolConditions,
        })
          .session(session)
          .lean(),

        SchoolDraft.findOne({
          _id: { $ne: new mongoose.Types.ObjectId(draftId) },
          status: "draft",
          $or: draftConditions,
        })
          .session(session)
          .lean(),
      ]);

      if (registeredSchool || otherDraft) {
        throw new SchoolConfirmationError(
          "A possible duplicate school exists. Review it before confirmation.",
          409
        );
      }

      // Generate permanent School ID
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

      // Mark draft confirmed
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

    const confirmedSchool = await School.findOne({
      schoolId: confirmedSchoolId,
    }).lean();

    if (!confirmedSchool) {
      throw new Error("Confirmed school record could not be retrieved");
    }

    return confirmedSchool as ISchool;
  } finally {
    await session.endSession();
  }
};
