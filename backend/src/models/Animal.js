const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    species: {
      type: String,
      default: "Cat",
    },

    breed: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    color: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "Main Shelter",
    },

    vaccinationStatus: {
      type: String,
      default: "Vaccinated",
    },

    healthStatus: {
      type: String,
      default: "Healthy",
    },

    adoptionStatus: {
      type: String,
      enum: [
        "Available",
        "Pending",
        "Ready for Adoption",
        "Adopted",
        "Rescued",
        "Under Treatment",
      ],
      default: "Available",
    },

    description: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    // Cloudinary Public ID
    publicId: {
      type: String,
      default: "",
    },

    // Timeline History
    history: [
      {
        status: {
          type: String,
        },
        notes: {
          type: String,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Animal", animalSchema);