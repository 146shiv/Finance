export function validateRecentTransactionsQuery(query) {
  const rawLimit = Number.parseInt(query.limit || "10", 10);
  const errors = [];

  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) {
    errors.push({ field: "limit", message: "limit must be an integer between 1 and 100" });
  }

  if (errors.length) return { error: errors };
  return { value: { limit: rawLimit } };
}
