export function successResponse(res, { statusCode = 200, message = "Success", data = null, meta } = {}) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

export function errorResponse(
  res,
  { statusCode = 500, message = "Something went wrong", code = "INTERNAL_ERROR", details = null } = {},
) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: { code, details },
  });
}
