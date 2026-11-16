import { loginRateLimiter } from "../middleware/login-rate-limit.middleware";
import { Router } from "express";
import { platformLogin } from "../controllers/login.controller";
import { acceptMainAdminInvitationController } from "../../super-admin/controllers/main-admin-acceptance.controller";
import {
    refreshAccessToken,
    logout,
} from "../controllers/session.controller";
import { requireTrustedOrigin } from "../middleware/origin.middleware";

const router = Router();

// Super Admin login (existing endpoint preserved)
router.post(
    "/super-admin/login",
    requireTrustedOrigin,
    loginRateLimiter,
    platformLogin
);

// General platform login for Super Admin and School Main Admin
router.post(
    "/login",
    requireTrustedOrigin,
    loginRateLimiter,
    platformLogin
);

router.post(
    "/refresh",
    requireTrustedOrigin,
    refreshAccessToken
);

router.post(
    "/logout",
    requireTrustedOrigin,
    logout
);
router.post(
    "/accept-main-admin-invitation",
    requireTrustedOrigin,
    acceptMainAdminInvitationController
);
export default router;
