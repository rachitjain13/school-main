export const PERMISSIONS = [
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
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface AuthContext {
  userId: string;
  role: "super_admin" | "school_main_admin";
}