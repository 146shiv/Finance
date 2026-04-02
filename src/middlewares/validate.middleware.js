import { AppError } from "../validations/error.js";

export function validateBody(validator) {
  return (req, res, next) => {
    const { error, value } = validator(req.body);
    if (error) return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", error));
    req.body = value;
    return next();
  };
}
