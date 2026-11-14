
import { Router, Request, Response } from "express";
import {
  requireAuth,
  requireRole,
} from "../../auth/middleware/auth.middleware";

const router = Router();

router.get(
  "/me",
  requireAuth,
  requireRole("super_admin"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Super Admin authenticated successfully",
      data: {
        user: res.locals.auth,
      },
    });
  }
);

export default router;
