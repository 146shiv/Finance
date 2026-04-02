import { User, USER_ROLES } from "../models/User.model.js";
import { comparePassword, hashPassword } from "../utils/hash.util.js";
import { signAccessToken } from "../utils/jwt.util.js";
import { AppError } from "../validations/error.js";
import { successResponse } from "../validations/response.js";

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new AppError("User is deactivated", 403, "USER_INACTIVE");
  }

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const data = {
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };

  return successResponse(res, {
    statusCode: 200,
    message: "Login successful",
    data,
  });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  let { role } = req.body;

  const existingUser = await User.findOne({ email, isDeleted: false }).lean();
  if (existingUser) {
    throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL");
  }

  const userCount = await User.countDocuments({ isDeleted: false });
  const isBootstrap = userCount === 0;
  if (!isBootstrap) {
    if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
      throw new AppError("Only Admin can register users", 403, "ACCESS_DENIED");
    }
  }

  if (isBootstrap) role = USER_ROLES.ADMIN;

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });

  return successResponse(res, {
    statusCode: 201,
    message: isBootstrap ? "Bootstrap admin created successfully" : "User registered successfully",
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
}

export async function me(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return successResponse(res, {
    statusCode: 200,
    message: "Current user fetched successfully",
    data: req.user,
  });
}
