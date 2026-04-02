import mongoose from "mongoose";
import { USER_ROLES } from "../models/User.model.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function validateCreateUser(body) {
  const name = normalizeText(body.name);
  const email = normalizeText(body.email)?.toLowerCase();
  const password = body.password;
  const role = body.role || USER_ROLES.VIEWER;

  const errors = [];
  if (!name || name.length < 2) errors.push({ field: "name", message: "Name must be at least 2 characters" });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push({ field: "email", message: "Valid email is required" });
  if (!password || String(password).length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  }
  if (!Object.values(USER_ROLES).includes(role)) {
    errors.push({ field: "role", message: `Role must be one of: ${Object.values(USER_ROLES).join(", ")}` });
  }

  if (errors.length > 0) return { error: errors };
  return { value: { name, email, password, role } };
}

export function validateLogin(body) {
  const email = normalizeText(body.email)?.toLowerCase();
  const password = body.password;
  const errors = [];
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push({ field: "email", message: "Valid email is required" });
  if (!password) errors.push({ field: "password", message: "Password is required" });
  if (errors.length > 0) return { error: errors };
  return { value: { email, password } };
}

export function validateRoleUpdate(body) {
  const role = body.role;
  const errors = [];
  if (!Object.values(USER_ROLES).includes(role)) {
    errors.push({ field: "role", message: `Role must be one of: ${Object.values(USER_ROLES).join(", ")}` });
  }
  if (errors.length > 0) return { error: errors };
  return { value: { role } };
}

export function validateStatusUpdate(body) {
  const errors = [];
  if (typeof body.isActive !== "boolean") {
    errors.push({ field: "isActive", message: "isActive must be a boolean" });
  }
  if (errors.length > 0) return { error: errors };
  return { value: { isActive: body.isActive } };
}

export function ensureValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: [{ field: "id", message: "Invalid user id" }] };
  }
  return { value: id };
}
