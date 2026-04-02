import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../validations/error.js";
import { validateLogin } from "../validations/user.validation.js";

const authRouter = Router();

authRouter.post("/login", validateBody(validateLogin), asyncHandler(login));

export default authRouter;
