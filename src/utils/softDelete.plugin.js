export function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
  });

  function excludeDeleted(next) {
    const options = this.getOptions?.() || {};
    if (!options.withDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  }

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);

  schema.query.withDeleted = function withDeleted() {
    return this.setOptions({ withDeleted: true });
  };

  schema.statics.softDeleteById = function softDeleteById(id, deletedBy = null) {
    return this.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy } },
      { new: true },
    );
  };
}
