import { Router } from "express";
import {
  createFinancialRecordController,
  deleteFinancialRecordController,
  getFinancialRecordByIdController,
  listFinancialRecordsController,
  updateFinancialRecordController,
} from "../controllers/financialRecord.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../models/User.model.js";
import { asyncHandler } from "../validations/error.js";
import {
  validateCreateFinancialRecord,
  validateUpdateFinancialRecord,
} from "../validations/financialRecord.validation.js";

const financialRecordRouter = Router();

financialRecordRouter.use(requireAuth);

financialRecordRouter.get(
  "/",
  allowRoles(USER_ROLES.VIEWER, USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  asyncHandler(listFinancialRecordsController),
);
financialRecordRouter.get(
  "/:id",
  allowRoles(USER_ROLES.VIEWER, USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  asyncHandler(getFinancialRecordByIdController),
);
financialRecordRouter.post(
  "/",
  allowRoles(USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  validateBody(validateCreateFinancialRecord),
  asyncHandler(createFinancialRecordController),
);
financialRecordRouter.patch(
  "/:id",
  allowRoles(USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  validateBody(validateUpdateFinancialRecord),
  asyncHandler(updateFinancialRecordController),
);
financialRecordRouter.delete(
  "/:id",
  allowRoles(USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  asyncHandler(deleteFinancialRecordController),
);

export default financialRecordRouter;
