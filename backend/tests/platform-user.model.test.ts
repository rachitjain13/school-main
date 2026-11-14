
import { describe, it, expect } from "vitest";
import { PlatformUser } from "../src/modules/super-admin/models/plateform-user.model";

describe("PlatformUser Model", () => {
  it("should create a valid Super Admin user", () => {
    const user = new PlatformUser({
      fullName: "Platform Administrator",
      email: "admin@example.com",
      role: "super_admin"
    });

    expect(user.validateSync()).toBeUndefined();
    expect(user.status).toBe("invited");
    expect(user.failedLoginAttempts).toBe(0);
  });

  it("should normalize email to lowercase", () => {
    const user = new PlatformUser({
      fullName: "Platform Administrator",
      email: "ADMIN@EXAMPLE.COM",
      role: "super_admin"
    });

    expect(user.email).toBe("admin@example.com");
  });

  it("should reject an invalid role", () => {
    const user = new PlatformUser({
      fullName: "Test User",
      email: "test@example.com",
      role: "teacher"
    });

    expect(user.validateSync()?.errors.role).toBeDefined();
  });

  it("should reject a missing full name", () => {
    const user = new PlatformUser({
      email: "admin@example.com",
      role: "super_admin"
    });

    expect(user.validateSync()?.errors.fullName).toBeDefined();
  });

  it("should not select passwordHash by default", () => {
    expect(PlatformUser.schema.path("passwordHash")?.options.select)
      .toBe(false);
  });

  it("should define a unique email index", () => {
    const indexes = PlatformUser.schema.indexes();

    const emailIndex = indexes.find(
      ([fields]) => fields.email === 1
    );

    expect(emailIndex?.[1].unique).toBe(true);
  });
});
