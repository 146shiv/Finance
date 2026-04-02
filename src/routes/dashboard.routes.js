import { Router } from "express";
import {
  getCategoryBreakdownController,
  getDashboardSummaryController,
  getMonthlyTrendsController,
  getRecentTransactionsController,
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../models/User.model.js";
import { asyncHandler } from "../validations/error.js";
import { validateRecentTransactionsQuery } from "../validations/dashboard.validation.js";

const dashboardRouter = Router();

dashboardRouter.use(
  requireAuth,
  allowRoles(USER_ROLES.VIEWER, USER_ROLES.ANALYST, USER_ROLES.ADMIN),
);

dashboardRouter.get("/summary", asyncHandler(getDashboardSummaryController));
dashboardRouter.get("/category-breakdown", asyncHandler(getCategoryBreakdownController));
dashboardRouter.get("/monthly-trends", asyncHandler(getMonthlyTrendsController));
dashboardRouter.get(
  "/recent-transactions",
  validateQuery(validateRecentTransactionsQuery),
  asyncHandler(getRecentTransactionsController),
);

export default dashboardRouter;
