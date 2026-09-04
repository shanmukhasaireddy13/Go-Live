const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  CooldownActiveError,
  ExternalServiceError,
} = require("../../errors/AppError");

describe("Custom Exceptions Hierarchy", () => {
  it("should create AppError with standard defaults", () => {
    const err = new AppError("Something went wrong");
    assert.equal(err.message, "Something went wrong");
    assert.equal(err.statusCode, 500);
    assert.equal(err.code, "INTERNAL_SERVER_ERROR");
    assert.equal(err.isOperational, true);
    assert.equal(err.name, "AppError");
  });

  it("should create ValidationError with 400 status and details", () => {
    const details = { field: "name", error: "Required" };
    const err = new ValidationError("Invalid domain payload", details);
    assert.equal(err.message, "Invalid domain payload");
    assert.equal(err.statusCode, 400);
    assert.equal(err.code, "VALIDATION_ERROR");
    assert.deepEqual(err.details, details);
  });

  it("should create UnauthorizedError with 401 status", () => {
    const err = new UnauthorizedError();
    assert.equal(err.statusCode, 401);
    assert.equal(err.code, "UNAUTHORIZED");
    assert.ok(err.message.includes("GitHub"));
  });

  it("should create ForbiddenError with 403 status", () => {
    const err = new ForbiddenError("Not allowed to access this resource");
    assert.equal(err.statusCode, 403);
    assert.equal(err.code, "FORBIDDEN");
  });

  it("should create NotFoundError with 404 status", () => {
    const err = new NotFoundError("Domain record not found");
    assert.equal(err.statusCode, 404);
    assert.equal(err.code, "NOT_FOUND");
  });

  it("should create ConflictError with 409 status", () => {
    const err = new ConflictError("Domain already taken");
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, "CONFLICT");
  });

  it("should create CooldownActiveError with 429 status and cooldown metadata", () => {
    const futureDate = new Date(Date.now() + 7200000).toISOString();
    const err = new CooldownActiveError("Cooldown is active", 118, futureDate);
    assert.equal(err.statusCode, 429);
    assert.equal(err.code, "COOLDOWN_ACTIVE");
    assert.equal(err.cooldownActive, true);
    assert.equal(err.cooldownMinutes, 118);
    assert.equal(err.cooldownUntil, futureDate);
    assert.deepEqual(err.details, {
      cooldownMinutes: 118,
      cooldownUntil: futureDate,
    });
  });

  it("should create ExternalServiceError with 502 status", () => {
    const err = new ExternalServiceError("Cloudflare", "API rate limit reached");
    assert.equal(err.statusCode, 502);
    assert.equal(err.code, "EXTERNAL_SERVICE_ERROR");
    assert.ok(err.message.includes("Cloudflare error"));
  });
});
