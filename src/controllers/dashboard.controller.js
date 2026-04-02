import mongoose from "mongoose";
import { FinancialRecord, FINANCIAL_RECORD_TYPES } from "../models/FinancialRecord.model.js";
import { USER_ROLES } from "../models/User.model.js";
import { successResponse } from "../validations/response.js";

function buildAccessMatch(currentUser) {
  const base = { isDeleted: false };
  if (currentUser.role === USER_ROLES.ADMIN || currentUser.role === USER_ROLES.ANALYST) {
    return base;
  }
  return { ...base, userId: new mongoose.Types.ObjectId(currentUser.id) };
}

export async function getDashboardSummaryController(req, res) {
  const match = buildAccessMatch(req.user);

  const [incomeAgg, expenseAgg] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: { ...match, type: FINANCIAL_RECORD_TYPES.INCOME } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinancialRecord.aggregate([
      { $match: { ...match, type: FINANCIAL_RECORD_TYPES.EXPENSE } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;
  const netBalance = totalIncome - totalExpenses;

  return successResponse(res, {
    statusCode: 200,
    message: "Dashboard summary fetched successfully",
    data: { totalIncome, totalExpenses, netBalance },
  });
}

export async function getCategoryBreakdownController(req, res) {
  const match = buildAccessMatch(req.user);
  const records = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        totalAmount: 1,
        count: 1,
      },
    },
    { $sort: { totalAmount: -1, category: 1 } },
  ]);

  return successResponse(res, {
    statusCode: 200,
    message: "Category breakdown fetched successfully",
    data: records,
  });
}

export async function getMonthlyTrendsController(req, res) {
  const match = buildAccessMatch(req.user);
  const trends = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        type: "$_id.type",
        totalAmount: 1,
      },
    },
    { $sort: { year: 1, month: 1, type: 1 } },
  ]);

  return successResponse(res, {
    statusCode: 200,
    message: "Monthly trends fetched successfully",
    data: trends,
  });
}

export async function getRecentTransactionsController(req, res) {
  const { limit } = req.query;

  const match = buildAccessMatch(req.user);
  const records = await FinancialRecord.find(match).sort({ date: -1, createdAt: -1 }).limit(limit);

  const data = records.map((record) => ({
    id: record._id.toString(),
    userId: record.userId?.toString?.() || record.userId,
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    createdAt: record.createdAt,
  }));

  return successResponse(res, {
    statusCode: 200,
    message: "Recent transactions fetched successfully",
    data,
    meta: { limit },
  });
}
