
import { Request, Response, NextFunction } from "express";

import {
    updateSchoolMainAdmin,
    MainAdminUpdateError,
} from "../services/main-admin-update.service";

import { updateMainAdminSchema } from "../validations/main-admin-update.validation";

export const updateMainAdminController = async (
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

        const validation = updateMainAdminSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Invalid Main Admin details",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
            return;
        }

        const result = await updateSchoolMainAdmin(
            schoolId,
            validation.data
        );

        res.status(200).json({
            success: true,
            message:
                "Main Admin details updated successfully. Please resend the invitation.",
            data: result,
        });
    } catch (error) {
        if (error instanceof MainAdminUpdateError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
};
