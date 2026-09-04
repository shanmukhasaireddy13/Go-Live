const { AppError } = require("../errors/AppError");

/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.method} ${req.originalUrl}' not found.`,
    code: "NOT_FOUND",
    statusCode: 404,
  });
}

/**
 * Central Error Responder Middleware
 * Formats AppError and unexpected system errors consistently.
 */
function globalErrorHandler(err, req, res, next) {
  // Operational, trusted error: send message to client
  if (err instanceof AppError) {
    const response = {
      success: false,
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
    };

    if (err.details) {
      response.details = err.details;
    }

    if (err.cooldownActive) {
      response.cooldownActive = true;
      response.cooldownMinutes = err.cooldownMinutes;
      response.cooldownUntil = err.cooldownUntil;
    }

    return res.status(err.statusCode).json(response);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Database validation failed.",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: err.errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: "A record with this identifier already exists.",
      code: "CONFLICT",
      statusCode: 409,
    });
  }

  // Programming or unknown errors: log and don't leak stack trace in production
  console.error("[Unhandled Error]:", err);

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error." : err.message,
    code: "INTERNAL_SERVER_ERROR",
    statusCode,
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
