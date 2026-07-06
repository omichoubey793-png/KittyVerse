const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Adoption", adoptionSchema);