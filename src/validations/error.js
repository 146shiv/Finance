import { env } from "../config/env.js";
import { errorResponse } from "./response.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function notFoundHandler(req, res) {
  return errorResponse(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
  });
}

export function globalErrorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return errorResponse(res, {
      statusCode: 400,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
    });
  }

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || "resource";
    return errorResponse(res, {
      statusCode: 409,
      message: `${duplicateField} already exists`,
      code: "DUPLICATE_RESOURCE",
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const code = error.code || "INTERNAL_ERROR";
  const details = env.nodeEnv === "production" ? null : error.details;

  return errorResponse(res, { statusCode, message, code, details });
}
