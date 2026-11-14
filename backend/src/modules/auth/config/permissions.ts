import { PlatformRole } from "../../super-admin/models/plateform-user.model";
import { Permission } from "../types/authorization.types";

export const ROLE_PERMISSIONS: Record<
  PlatformRole,
  readonly Permission[]
> = {
  super_admin: [
    "platform:dashboard:read",
    "platform:schools:create",
    "platform:schools:read",
    "platform:schools:update",
    "platform:schools:suspend",
    "platform:schools:reactivate",
    "platform:schools:archive",
    "platform:admins:manage",
    "platform:subscriptions:manage",
    "platform:audit:read",
    "platform:reports:export",
    "platform:settings:manage",
  ],

  school_main_admin: [],
};

export const hasPermission = (
  role: PlatformRole,
  permission: Permission
): boolean => {
  return ROLE_PERMISSIONS[role].includes(permission);
};