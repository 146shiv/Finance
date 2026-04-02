import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/softDelete.plugin.js";

export const FINANCIAL_RECORD_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

const financialRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: {
      type: String,
      enum: Object.values(FINANCIAL_RECORD_TYPES),
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String, trim: true, default: "", maxlength: 500 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

financialRecordSchema.plugin(softDeletePlugin);
financialRecordSchema.index({ userId: 1, date: -1 });
financialRecordSchema.index({ type: 1, category: 1 });

export const FinancialRecord = mongoose.model("FinancialRecord", financialRecordSchema);
