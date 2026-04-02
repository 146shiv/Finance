import { User } from "../models/User.model.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { AppError } from "../validations/error.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization token", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select("_id name email role isActive isDeleted");
    if (!user || user.isDeleted) {
      return next(new AppError("User does not exist", 401, "UNAUTHORIZED"));
    }
    if (!user.isActive) {
      return next(new AppError("User is deactivated", 403, "USER_INACTIVE"));
    }
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}
