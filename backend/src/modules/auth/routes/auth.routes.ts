import { loginRateLimiter } from "../middleware/login-rate-limit.middleware";
import { Router } from "express";
import { superAdminLogin } from "../controllers/login.controller";
import {
  refreshAccessToken,
  logout,
} from "../controllers/session.controller";
import { requireTrustedOrigin } from "../middleware/origin.middleware";

const router = Router();

router.post(
  "/super-admin/login",
  requireTrustedOrigin,
   loginRateLimiter,
  superAdminLogin
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

export default router;
