
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
    acceptMainAdminInvitation,
    InvitationAcceptanceError,
} from "../services/accept-main-admin-invitation.service";

const acceptanceSchema = z.object({
    token: z.string().min(20).max(200),
    password: z.string().min(12).max(128),
}).strict();

export const acceptMainAdminInvitationController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = acceptanceSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid invitation token and password of at least 12 characters.",
            });
            return;
        }

        const result = await acceptMainAdminInvitation(parsed.data);

        res.status(200).json({
            success: true,
            message: "Invitation accepted. Your Main Admin account is now active.",
            data: result,
        });
    } catch (error) {
        if (error instanceof InvitationAcceptanceError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
};
