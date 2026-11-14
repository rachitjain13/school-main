import { Request, Response, NextFunction } from "express";
import { PlatformRole } from "../../super-admin/models/plateform-user.model";
import { AuthContext, Permission } from "../types/authorization.types";
import { hasPermission } from "../config/permissions";

export const requirePermission = (
  ...requiredPermissions: Permission[]
) => {
  return (
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const auth = res.locals.auth as AuthContext | undefined;

    if (!auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const role = auth.role as PlatformRole;

    const authorized = requiredPermissions.every((permission) =>
      hasPermission(role, permission)
    );

    if (!authorized) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};