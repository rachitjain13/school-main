
import { Request, Response } from "express";
import { createSchoolDraft } from "../services/school-draft.service";
import { createSchoolDraftSchema } from "../validations/school-draft.validation";

export const createSchoolDraftController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const auth = res.locals.auth as
    | { userId: string; role: string }
    | undefined;

  if (!auth || auth.role !== "super_admin") {
    res.status(403).json({
      success: false,
      message: "Super Admin access required",
    });
    return;
  }

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

  const draft = await createSchoolDraft(
    validation.data,
    auth.userId
  );

  res.status(201).json({
    success: true,
    message: "School draft created successfully",
    data: {
      draft,
    },
  });
};
