import type { ClientSession } from "mongoose";
import { SchoolCounter } from "../models/school-counter.model";

export const generateSchoolId = async (
  session?: ClientSession
): Promise<string> => {
  const counter = await SchoolCounter.findOneAndUpdate(
    { _id: "school_id" },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      ...(session ? { session } : {}),
    }
  );

  if (!counter) {
    throw new Error("Failed to generate School ID");
  }

  const schoolId = `SCH-${String(counter.sequence).padStart(6, "0")}`;

  if (!/^SCH-\d{6}$/.test(schoolId)) {
    throw new Error("School ID sequence limit exceeded");
  }

  return schoolId;
};
