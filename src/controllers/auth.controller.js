import { User } from "../models/User.model.js";
import { comparePassword } from "../utils/hash.util.js";
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
