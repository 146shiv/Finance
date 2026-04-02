import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  listUsersController,
  updateUserRoleController,
  updateUserStatusController,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../models/User.model.js";
import { asyncHandler } from "../validations/error.js";
import {
  validateCreateUser,
  validateRoleUpdate,
  validateStatusUpdate,
} from "../validations/user.validation.js";

const userRouter = Router();

userRouter.use(requireAuth, allowRoles(USER_ROLES.ADMIN));

userRouter.get("/", asyncHandler(listUsersController));
userRouter.post("/", validateBody(validateCreateUser), asyncHandler(createUserController));
userRouter.patch("/:id/role", validateBody(validateRoleUpdate), asyncHandler(updateUserRoleController));
userRouter.patch("/:id/status", validateBody(validateStatusUpdate), asyncHandler(updateUserStatusController));
userRouter.delete("/:id", asyncHandler(deleteUserController));

export default userRouter;
