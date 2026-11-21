import { resendMainAdminInvitationController } from "../controllers/main-admin-invitation.controller";
import { Router, Request, Response } from "express";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { requirePermission } from "../../auth/middleware/permission.middleware";
import { createSchoolDraftController } from "../controllers/school-draft.controller";
import { checkSchoolDuplicatesController } from "../controllers/school-duplicate-check.controller";
import { confirmSchoolDraftController } from "../controllers/school-confirmation.controller";
import { provisionSchoolController } from "../controllers/school-provisioning.controller";
import { listSchoolsController } from "../controllers/school-list.controller";
import { updateMainAdminController } from "../controllers/main-admin-update.controller";
const router = Router();
// List all confirmed schools
router.get(
  "/schools",
  requireAuth,
  requirePermission("platform:schools:read"),
  listSchoolsController
);
// Super Admin profile
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

// Create School Draft
router.post(
  "/schools/drafts",
  requireAuth,
  requirePermission("platform:schools:create"),
  createSchoolDraftController
);
// Check duplicate schools
router.post(
  "/schools/check-duplicates",
  requireAuth,
  requirePermission("platform:schools:create"),
  checkSchoolDuplicatesController
);
// Confirm a school draft
router.post(
  "/schools/drafts/:draftId/confirm",
  requireAuth,
  requirePermission("platform:schools:create"),
  confirmSchoolDraftController
);
// Provision or manually retry a school database
router.post(
  "/schools/:schoolId/provision",
  requireAuth,
  requirePermission("platform:schools:create"),
  provisionSchoolController
);
// Update School Main Admin details
router.put(
  "/schools/:schoolId/main-admin",
  requireAuth,
  requirePermission("platform:schools:update"),
  updateMainAdminController
);
// Manually resend Main Admin invitation
router.post(
  "/schools/:schoolId/main-admin/resend-invitation",
  requireAuth,
  requirePermission("platform:schools:create"),
  resendMainAdminInvitationController
);

export default router;
