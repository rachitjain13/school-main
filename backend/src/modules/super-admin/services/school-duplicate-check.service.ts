
import mongoose from "mongoose";
import {
  SchoolDraft,
  type ISchoolDraft,
} from "../models/school-draft.model";
import { School } from "../models/school.model";
import { CreateSchoolDraftInput } from "../validations/school-draft.validation";

export const checkSchoolDuplicates = async (
  input: CreateSchoolDraftInput
) => {
  const conditions: mongoose.QueryFilter<ISchoolDraft>[] = [
    {
      officialEmail: input.officialEmail.trim().toLowerCase(),
    },
    {
      normalizedSchoolName: input.schoolName.trim().toLowerCase(),
      "address.city": input.address.city.trim(),
      "address.state": input.address.state.trim(),
      "address.postalCode": input.address.postalCode.trim(),
      "address.country": input.address.country.trim(),
    },
  ];

  const registrationNumber = input.registrationNumber?.trim().toUpperCase();

  if (registrationNumber) {
    conditions.push({ registrationNumber });
  }

  const permanentConditions = conditions as mongoose.QueryFilter<{
    officialEmail: string;
    registrationNumber?: string;
    normalizedSchoolName: string;
    address: ISchoolDraft["address"];
  }>[];

  const [draftMatches, permanentMatches] = await Promise.all([
    SchoolDraft.find({
      status: { $ne: "discarded" },
      $or: conditions,
    })
      .select("_id schoolName registrationNumber officialEmail address status")
      .lean(),

    School.find({
      status: { $ne: "archived" },
      $or: permanentConditions,
    })
      .select("_id schoolId schoolName registrationNumber officialEmail address status")
      .lean(),
  ]);

  const matches = [
    ...draftMatches.map((school) => ({
      source: "draft" as const,
      school,
    })),
    ...permanentMatches.map((school) => ({
      source: "registered" as const,
      school,
    })),
  ];

  return {
    hasDuplicates: matches.length > 0,
    count: matches.length,
    matches,
  };
};
