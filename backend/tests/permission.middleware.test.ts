
import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { requirePermission } from "../src/modules/auth/middleware/permission.middleware";

const createMocks = (auth?: {
  userId: string;
  role: "super_admin" | "school_main_admin";
}) => {
  const req = {} as Request;

  const res = {
    locals: { auth },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
};

describe("RBAC permission middleware", () => {
  it("allows Super Admin with valid permission", () => {
    const { req, res, next } = createMocks({
      userId: "admin123",
      role: "super_admin",
    });

    const middleware = requirePermission(
      "platform:schools:create"
    );

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("denies School Main Admin platform permissions", () => {
    const { req, res, next } = createMocks({
      userId: "schooladmin123",
      role: "school_main_admin",
    });

    const middleware = requirePermission(
      "platform:schools:create"
    );

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects requests without authentication", () => {
    const { req, res, next } = createMocks();

    const middleware = requirePermission(
      "platform:schools:read"
    );

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("requires every requested permission", () => {
    const { req, res, next } = createMocks({
      userId: "admin123",
      role: "super_admin",
    });

    const middleware = requirePermission(
      "platform:schools:read",
      "platform:schools:update"
    );

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
