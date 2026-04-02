import mongoose from "mongoose";
import { FINANCIAL_RECORD_TYPES } from "../models/FinancialRecord.model.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : value;
}

function parsePositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validateCreateFinancialRecord(body) {
  const amount = parsePositiveNumber(body.amount);
  const type = normalizeText(body.type);
  const category = normalizeText(body.category);
  const date = parseDate(body.date);
  const notes = normalizeText(body.notes || "");

  const errors = [];
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be greater than zero" });
  }
  if (!Object.values(FINANCIAL_RECORD_TYPES).includes(type)) {
    errors.push({ field: "type", message: "Type must be income or expense" });
  }
  if (!category) errors.push({ field: "category", message: "Category is required" });
  if (!date) errors.push({ field: "date", message: "A valid date is required" });

  if (errors.length) return { error: errors };
  return { value: { amount, type, category, date, notes } };
}

export function validateUpdateFinancialRecord(body) {
  const errors = [];
  const value = {};

  if ("amount" in body) {
    const amount = parsePositiveNumber(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ field: "amount", message: "Amount must be greater than zero" });
    } else value.amount = amount;
  }
  if ("type" in body) {
    const type = normalizeText(body.type);
    if (!Object.values(FINANCIAL_RECORD_TYPES).includes(type)) {
      errors.push({ field: "type", message: "Type must be income or expense" });
    } else value.type = type;
  }
  if ("category" in body) {
    const category = normalizeText(body.category);
    if (!category) errors.push({ field: "category", message: "Category cannot be empty" });
    else value.category = category;
  }
  if ("date" in body) {
    const date = parseDate(body.date);
    if (!date) errors.push({ field: "date", message: "A valid date is required" });
    else value.date = date;
  }
  if ("notes" in body) {
    value.notes = normalizeText(body.notes || "");
  }
  if (Object.keys(value).length === 0) {
    errors.push({ field: "body", message: "At least one updatable field is required" });
  }

  if (errors.length) return { error: errors };
  return { value };
}

export function validateFinancialRecordFilters(query) {
  const page = Number.parseInt(query.page || "1", 10);
  const limit = Number.parseInt(query.limit || "20", 10);
  const startDate = query.startDate ? parseDate(query.startDate) : null;
  const endDate = query.endDate ? parseDate(query.endDate) : null;
  const type = query.type ? normalizeText(query.type) : undefined;
  const category = query.category ? normalizeText(query.category) : undefined;
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const errors = [];
  if (!Number.isInteger(page) || page < 1) errors.push({ field: "page", message: "page must be >= 1" });
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    errors.push({ field: "limit", message: "limit must be between 1 and 100" });
  }
  if (query.startDate && !startDate) errors.push({ field: "startDate", message: "Invalid startDate" });
  if (query.endDate && !endDate) errors.push({ field: "endDate", message: "Invalid endDate" });
  if (type && !Object.values(FINANCIAL_RECORD_TYPES).includes(type)) {
    errors.push({ field: "type", message: "Type must be income or expense" });
  }
  if (startDate && endDate && startDate > endDate) {
    errors.push({ field: "dateRange", message: "startDate cannot be greater than endDate" });
  }

  if (errors.length) return { error: errors };
  return { value: { page, limit, startDate, endDate, type, category, sortOrder } };
}

export function ensureValidRecordId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: [{ field: "id", message: "Invalid financial record id" }] };
  }
  return { value: id };
}
