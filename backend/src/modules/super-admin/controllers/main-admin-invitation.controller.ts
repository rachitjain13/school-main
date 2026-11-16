
import { Request, Response, NextFunction } from "express";

import {
    createMainAdminInvitation,
    MainAdminInvitationError,
} from "../services/main-admin-invitation.service";

export const resendMainAdminInvitationController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
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

        const result = await createMainAdminInvitation(schoolId);

        res.status(200).json({
            success: true,
            message: result.emailSent
                ? "A new invitation email has been sent"
                : "Invitation created, but email delivery is pending SMTP configuration",
            data: result,
        });
    } catch (error) {
        if (error instanceof MainAdminInvitationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
};
