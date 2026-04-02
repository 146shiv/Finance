import { AppError } from "../validations/error.js";

export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return next(new AppError("Missing user context", 401, "UNAUTHORIZED"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Access denied for this role", 403, "ACCESS_DENIED"));
    }
    return next();
  };
}
