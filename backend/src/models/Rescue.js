const mongoose = require("mongoose");

const rescueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Animal Information
    animalName: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    breed: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    age: {
      type: Number,
      default: 0,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Unknown"],
      default: "Unknown",
    },

    color: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    healthStatus: {
      type: String,
      default: "Needs Medical Checkup",
    },

    // Rescue Information
    location: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Rescue", rescueSchema);