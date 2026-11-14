
import mongoose from "mongoose";
import { SchoolDraft } from "../models/school-draft.model";
import { CreateSchoolDraftInput } from "../validations/school-draft.validation";

export const createSchoolDraft = async (
  input: CreateSchoolDraftInput,
  createdBy: string
) => {
  if (!mongoose.isValidObjectId(createdBy)) {
    throw new Error("Invalid Super Admin ID");
  }

  const draft = await SchoolDraft.create({
    ...input,
    schoolName: input.schoolName.trim(),
    normalizedSchoolName: input.schoolName.trim().toLowerCase(),
    officialEmail: input.officialEmail.trim().toLowerCase(),
    mainAdmin: {
      ...input.mainAdmin,
      email: input.mainAdmin.email.trim().toLowerCase(),
    },
    registrationNumber: input.registrationNumber?.trim().toUpperCase(),
    status: "draft",
    createdBy: new mongoose.Types.ObjectId(createdBy),
  });

  return draft;
};
