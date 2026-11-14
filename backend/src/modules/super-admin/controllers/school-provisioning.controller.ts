
import { Request, Response, NextFunction } from "express";

import {
  provisionSchoolDatabase,
  SchoolProvisioningError,
} from "../services/school-provisioning.service";

export const provisionSchoolController = async (
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

    const schoolId = Array.isArray(req.params.schoolId)
      ? req.params.schoolId[0]
      : req.params.schoolId;

    if (!schoolId) {
      res.status(400).json({
        success: false,
        message: "School ID is required",
      });
      return;
    }

    const result = await provisionSchoolDatabase(schoolId);

    res.status(200).json({
      success: true,
      message: "School database provisioned successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof SchoolProvisioningError) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};
