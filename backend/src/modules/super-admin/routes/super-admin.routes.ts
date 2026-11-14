
import { Router, Request, Response } from "express";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { requirePermission } from "../../auth/middleware/permission.middleware";

const router = Router();

router.get(
  "/me",
  requireAuth,
  requirePermission("platform:dashboard:read"),
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
