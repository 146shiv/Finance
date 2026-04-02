import mongoose from "mongoose";
import { FinancialRecord } from "../models/FinancialRecord.model.js";
import { USER_ROLES } from "../models/User.model.js";
import { AppError } from "../validations/error.js";
import { successResponse } from "../validations/response.js";
import { ensureValidRecordId } from "../validations/financialRecord.validation.js";

function toPublicRecord(record) {
  return {
    id: record._id.toString(),
    userId: record.userId?.toString?.() || record.userId,
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildAccessFilter(currentUser) {
  if (currentUser.role === USER_ROLES.ADMIN || currentUser.role === USER_ROLES.ANALYST) {
    return {};
  }
  return { userId: new mongoose.Types.ObjectId(currentUser.id) };
}

export async function createFinancialRecordController(req, res) {
  const record = await FinancialRecord.create({
    userId: req.user.id,
    ...req.body,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Financial record created successfully",
    data: toPublicRecord(record),
  });
}

export async function listFinancialRecordsController(req, res) {
  const { page, limit, startDate, endDate, type, category, sortOrder } = req.query;
  const query = {
    isDeleted: false,
    ...buildAccessFilter(req.user),
  };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  if (type) query.type = type;
  if (category) query.category = category;

  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    FinancialRecord.find(query).sort({ date: sortOrder, createdAt: -1 }).skip(skip).limit(limit),
    FinancialRecord.countDocuments(query),
  ]);

  return successResponse(res, {
    statusCode: 200,
    message: "Financial records fetched successfully",
    data: records.map(toPublicRecord),
    meta: { page, limit, total },
  });
}

export async function getFinancialRecordByIdController(req, res) {
  const idValidation = ensureValidRecordId(req.params.id);
  if (idValidation.error) throw new AppError("Validation failed", 400, "VALIDATION_ERROR", idValidation.error);

  const query = { _id: req.params.id, isDeleted: false, ...buildAccessFilter(req.user) };
  const record = await FinancialRecord.findOne(query);
  if (!record) throw new AppError("Financial record not found", 404, "FINANCIAL_RECORD_NOT_FOUND");

  return successResponse(res, {
    statusCode: 200,
    message: "Financial record fetched successfully",
    data: toPublicRecord(record),
  });
}

export async function updateFinancialRecordController(req, res) {
  const idValidation = ensureValidRecordId(req.params.id);
  if (idValidation.error) throw new AppError("Validation failed", 400, "VALIDATION_ERROR", idValidation.error);

  const query = { _id: req.params.id, isDeleted: false, ...buildAccessFilter(req.user) };
  const record = await FinancialRecord.findOneAndUpdate(query, { $set: req.body }, { new: true });
  if (!record) throw new AppError("Financial record not found", 404, "FINANCIAL_RECORD_NOT_FOUND");

  return successResponse(res, {
    statusCode: 200,
    message: "Financial record updated successfully",
    data: toPublicRecord(record),
  });
}

export async function deleteFinancialRecordController(req, res) {
  const idValidation = ensureValidRecordId(req.params.id);
  if (idValidation.error) throw new AppError("Validation failed", 400, "VALIDATION_ERROR", idValidation.error);

  const query = { _id: req.params.id, isDeleted: false, ...buildAccessFilter(req.user) };
  const record = await FinancialRecord.findOneAndUpdate(
    query,
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!record) throw new AppError("Financial record not found", 404, "FINANCIAL_RECORD_NOT_FOUND");

  return successResponse(res, {
    statusCode: 200,
    message: "Financial record deleted successfully",
    data: { id: record._id.toString() },
  });
}
