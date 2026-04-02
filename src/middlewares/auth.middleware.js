import { User } from "../models/User.model.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { AppError } from "../validations/error.js";

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

async function attachUserFromToken(req, token) {
  const decoded = verifyAccessToken(token);
  if (!decoded?.sub || !decoded?.role) {
    throw new AppError("Invalid token payload", 401, "UNAUTHORIZED");
  }

  const user = await User.findById(decoded.sub).select("_id name email role isActive isDeleted");
  if (!user || user.isDeleted) {
    throw new AppError("User does not exist", 401, "UNAUTHORIZED");
  }
  if (!user.isActive) {
    throw new AppError("User is deactivated", 403, "USER_INACTIVE");
  }
  if (decoded.role !== user.role) {
    throw new AppError("Token role is stale, please login again", 401, "STALE_TOKEN_ROLE");
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next(new AppError("Missing or invalid authorization token", 401, "UNAUTHORIZED"));
  try {
    await attachUserFromToken(req, token);
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}

export async function optionalAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next();
  try {
    await attachUserFromToken(req, token);
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}
