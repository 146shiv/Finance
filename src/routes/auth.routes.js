import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../validations/error.js";
import { validateCreateUser, validateLogin } from "../validations/user.validation.js";

const authRouter = Router();

authRouter.post("/login", validateBody(validateLogin), asyncHandler(login));
authRouter.post("/register", optionalAuth, validateBody(validateCreateUser), asyncHandler(register));
authRouter.get("/me", requireAuth, asyncHandler(me));

export default authRouter;
