import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/softDelete.plugin.js";

export const USER_ROLES = {
  VIEWER: "Viewer",
  ANALYST: "Analyst",
  ADMIN: "Admin",
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.VIEWER,
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.plugin(softDeletePlugin);
userSchema.index({ role: 1, isActive: 1 });

export const User = mongoose.model("User", userSchema);
