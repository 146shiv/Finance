import { Router } from "express";
import authRouter from "./auth.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import financialRecordRouter from "./financialRecord.routes.js";
import userRouter from "./user.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/financial-records", financialRecordRouter);
router.use("/dashboard", dashboardRouter);

export default router;
