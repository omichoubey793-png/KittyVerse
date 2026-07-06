const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },

    veterinarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    weight: {
      type: Number,
    },

    temperature: {
      type: Number,
    },

    diagnosis: {
      type: String,
    },

    treatment: {
      type: String,
    },

    medication: {
      type: String,
    },

    vaccinations: [
      {
        type: String,
      },
    ],

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);