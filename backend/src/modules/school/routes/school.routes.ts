import { Router, Request, Response } from "express";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { requireSchoolTenant } from "../../auth/middleware/tenant-resolver.middleware";

const router = Router();

router.get(
  "/dashboard",
  requireAuth,
  requireSchoolTenant,
  (_req: Request, res: Response) => {
    const tenant = res.locals.tenant;

    res.status(200).json({
      success: true,
      message: "School dashboard access successful",
      data: {
        schoolId: tenant.schoolId,
      },
    });
  }
);

export default router;