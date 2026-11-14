
import { Request, Response } from "express";
import { createSchoolDraftSchema } from "../validations/school-draft.validation";
import { checkSchoolDuplicates } from "../services/school-duplicate-check.service";

export const checkSchoolDuplicatesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validation = createSchoolDraftSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Invalid school details",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const result = await checkSchoolDuplicates(validation.data);

  res.status(200).json({
    success: true,
    message: result.hasDuplicates
      ? "Potential duplicate schools found"
      : "No duplicate schools found",
    data: result,
  });
};
