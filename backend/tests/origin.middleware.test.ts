
import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireTrustedOrigin } from "../src/modules/auth/middleware/origin.middleware";
import { env } from "../src/config/env";

describe("Trusted Origin Middleware", () => {
  const next = vi.fn();

  const allowedOrigin = env.CORS_ORIGINS[0];

  const createMocks = (origin?: string) => {
    const req = {
      get: vi.fn().mockReturnValue(origin),
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    return { req, res };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow a trusted origin", () => {
    const { req, res } = createMocks(allowedOrigin);

    requireTrustedOrigin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should reject an untrusted origin", () => {
    const { req, res } = createMocks("https://malicious.example");

    requireTrustedOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject a missing origin", () => {
    const { req, res } = createMocks(undefined);

    requireTrustedOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
