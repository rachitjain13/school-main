
import { Request, Response, NextFunction } from "express";

import {
  confirmSchoolDraft,
  SchoolConfirmationError,
} from "../services/school-confirmation.service";

export const confirmSchoolDraftController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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

    const draftId = Array.isArray(req.params.draftId)
      ? req.params.draftId[0]
      : req.params.draftId;

    if (!draftId) {
      res.status(400).json({
        success: false,
        message: "School draft ID is required",
      });
      return;
    }

    const school = await confirmSchoolDraft(
      draftId,
      auth.userId
    );

    res.status(201).json({
      success: true,
      message: "School confirmed successfully. Provisioning is pending.",
      data: {
        school,
      },
    });
  } catch (error) {
    if (error instanceof SchoolConfirmationError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};
