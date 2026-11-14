
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import { PlatformUser } from "../../super-admin/models/plateform-user.model";
import { PlatformRole } from "../../super-admin/models/plateform-user.model";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const payload = await verifyAccessToken(token);

    // Check the current database account status and role.
    const user = await PlatformUser.findById(payload.userId);

    if (
      !user ||
      user.status !== "active" ||
      user.role !== payload.role
    ) {
      res.status(401).json({
        success: false,
        message: "Account is inactive or access is no longer valid",
      });
      return;
    }

    res.locals.auth = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const requireRole = (...allowedRoles: PlatformRole[]) => {
  return (
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const auth = res.locals.auth as
      | { userId: string; role: PlatformRole }
      | undefined;

    if (!auth || !allowedRoles.includes(auth.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};
