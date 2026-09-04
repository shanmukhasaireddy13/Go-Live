/**
 * Custom Exception Hierarchy for Go-Live Backend
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required: Please sign in with GitHub.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Access forbidden.") {
    super(message, 403, "FORBIDDEN");
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, "CONFLICT", details);
  }
}

class CooldownActiveError extends AppError {
  constructor(message, cooldownMinutes, cooldownUntil) {
    super(message, 429, "COOLDOWN_ACTIVE", {
      cooldownMinutes,
      cooldownUntil,
    });
    this.cooldownActive = true;
    this.cooldownMinutes = cooldownMinutes;
    this.cooldownUntil = cooldownUntil;
  }
}

class ExternalServiceError extends AppError {
  constructor(serviceName, message, details = null) {
    super(`${serviceName} error: ${message}`, 502, "EXTERNAL_SERVICE_ERROR", details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  CooldownActiveError,
  ExternalServiceError,
};
