import { User } from "../models/User.model.js";
import { hashPassword } from "../utils/hash.util.js";
import { AppError } from "../validations/error.js";
import { successResponse } from "../validations/response.js";
import { ensureValidObjectId } from "../validations/user.validation.js";

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function createUserController(req, res) {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email, isDeleted: false }).lean();
  if (existingUser) {
    throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });
  return successResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data: toPublicUser(user),
  });
}

export async function listUsersController(req, res) {
  const users = await User.find({ isDeleted: false })
    .select("_id name email role isActive createdAt updatedAt")
    .sort({ createdAt: -1 });
  return successResponse(res, {
    statusCode: 200,
    message: "Users fetched successfully",
    data: users.map(toPublicUser),
  });
}

export async function updateUserRoleController(req, res) {
  const idValidation = ensureValidObjectId(req.params.id);
  if (idValidation.error) throw new AppError("Validation failed", 400, "VALIDATION_ERROR", idValidation.error);

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $set: { role: req.body.role } },
    { new: true },
  );
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  return successResponse(res, {
    statusCode: 200,
    message: "User role updated successfully",
    data: toPublicUser(user),
  });
}

export async function updateUserStatusController(req, res) {
  const idValidation = ensureValidObjectId(req.params.id);
  if (idValidation.error) throw new AppError("Validation failed", 400, "VALIDATION_ERROR", idValidation.error);

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $set: { isActive: req.body.isActive } },
    { new: true },
  );
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  return successResponse(res, {
    statusCode: 200,
    message: "User status updated successfully",
    data: toPublicUser(user),
  });
}

export async function deleteUserController(req, res) {
  const idValidation = ensureValidObjectId(req.params.id);
  if (idValidation.error) throw new AppError("Validation failed", 400, "VALIDATION_ERROR", idValidation.error);

  const user = await User.softDeleteById(req.params.id, req.user.id);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  return successResponse(res, {
    statusCode: 200,
    message: "User deleted successfully",
    data: { id: user._id.toString() },
  });
}
