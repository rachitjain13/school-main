
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Request, Response, NextFunction } from "express";

const mocks = vi.hoisted(() => ({
  membershipFindOne: vi.fn(),
  membershipCount: vi.fn(),
  tenantFindOne: vi.fn(),
  getTenantConnection: vi.fn(),
}));

vi.mock("../src/modules/super-admin/models/school-membership.model", () => ({
  SchoolMembership: {
    findOne: mocks.membershipFindOne,
    countDocuments: mocks.membershipCount,
  },
}));

vi.mock("../src/modules/super-admin/models/tenant-registry.model", () => ({
  TenantRegistry: {
    findOne: mocks.tenantFindOne,
  },
}));

vi.mock("../src/infrastructure/tenant-connection.manager", () => ({
  getTenantConnection: mocks.getTenantConnection,
}));

import { requireSchoolTenant } from "../src/modules/auth/middleware/tenant-resolver.middleware";

const USER_A = "507f1f77bcf86cd799439011";
const USER_B = "507f191e810c19729de860ea";

const createMocks = (auth?: { userId: string; role: string }) => {
  const req = {} as Request;

  const res = {
    locals: { auth },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
};

const mockMembership = (schoolId: string) => {
  mocks.membershipFindOne.mockReturnValue({
    lean: vi.fn().mockResolvedValue({
      userId: USER_A,
      schoolId,
      role: "school_main_admin",
      status: "active",
    }),
  });

  mocks.membershipCount.mockResolvedValue(1);
};

const mockTenant = (schoolId: string, databaseName: string) => {
  mocks.tenantFindOne.mockReturnValue({
    lean: vi.fn().mockResolvedValue({
      schoolId,
      databaseName,
      status: "active",
    }),
  });
};

describe("School tenant resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    const { req, res, next } = createMocks();

    await requireSchoolTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects Super Admin school access", async () => {
    const { req, res, next } = createMocks({
      userId: USER_A,
      role: "super_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects invalid user IDs", async () => {
    const { req, res, next } = createMocks({
      userId: "invalid-id",
      role: "school_main_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects users without active membership", async () => {
    mocks.membershipFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    const { req, res, next } = createMocks({
      userId: USER_A,
      role: "school_main_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(mocks.tenantFindOne).not.toHaveBeenCalled();
  });

  it("rejects ambiguous multiple active memberships", async () => {
    mockMembership("SCH-000001");
    mocks.membershipCount.mockResolvedValue(2);

    const { req, res, next } = createMocks({
      userId: USER_A,
      role: "school_main_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(mocks.tenantFindOne).not.toHaveBeenCalled();
  });

  it("rejects unavailable or inactive tenants", async () => {
    mockMembership("SCH-000001");

    mocks.tenantFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    const { req, res, next } = createMocks({
      userId: USER_A,
      role: "school_main_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(mocks.getTenantConnection).not.toHaveBeenCalled();
  });

  it("resolves the authenticated user's school database", async () => {
    const connection = { name: "school_sch_000001" };

    mockMembership("SCH-000001");
    mockTenant("SCH-000001", "school_sch_000001");
    mocks.getTenantConnection.mockResolvedValue(connection);

    const { req, res, next } = createMocks({
      userId: USER_A,
      role: "school_main_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(mocks.membershipFindOne).toHaveBeenCalledWith({
      userId: expect.anything(),
      status: "active",
    });

    expect(mocks.tenantFindOne).toHaveBeenCalledWith({
      schoolId: "SCH-000001",
      status: "active",
    });

    expect(mocks.getTenantConnection).toHaveBeenCalledWith(
      "school_sch_000001"
    );

    expect(res.locals.tenant).toEqual({
      schoolId: "SCH-000001",
      databaseName: "school_sch_000001",
      connection,
    });

    expect(next).toHaveBeenCalledOnce();
  });

  it("does not resolve a different school from frontend input", async () => {
    const connection = { name: "school_sch_000001" };

    mockMembership("SCH-000001");
    mockTenant("SCH-000001", "school_sch_000001");
    mocks.getTenantConnection.mockResolvedValue(connection);

    const req = {
      body: { schoolId: "SCH-000002" },
      query: { schoolId: "SCH-000002" },
      params: { schoolId: "SCH-000002" },
    } as unknown as Request;

    const res = {
      locals: {
        auth: {
          userId: USER_A,
          role: "school_main_admin",
        },
      },
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as unknown as NextFunction;

    await requireSchoolTenant(req, res, next);

    expect(mocks.tenantFindOne).toHaveBeenCalledWith({
      schoolId: "SCH-000001",
      status: "active",
    });

    expect(mocks.getTenantConnection).toHaveBeenCalledWith(
      "school_sch_000001"
    );

    expect(next).toHaveBeenCalledOnce();
  });

  it("passes database connection errors to Express", async () => {
    const error = new Error("Database unavailable");

    mockMembership("SCH-000001");
    mockTenant("SCH-000001", "school_sch_000001");
    mocks.getTenantConnection.mockRejectedValue(error);

    const { req, res, next } = createMocks({
      userId: USER_A,
      role: "school_main_admin",
    });

    await requireSchoolTenant(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
