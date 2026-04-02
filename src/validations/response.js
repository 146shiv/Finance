export function successResponse(res, { statusCode = 200, message = "Success", data = null, meta } = {}) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  if (res.locals?.requestId) payload.requestId = res.locals.requestId;
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
    requestId: res.locals?.requestId,
  });
}
