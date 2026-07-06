const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "staff", "adopter"],
      default: "adopter",
    },

    language: {
      type: String,
      default: "en-US"
    },

    currency: {
      type: String,
      default: "USD"
    },

    timezone: {
      type: String,
      default: "Pacific Time (PT)"
    },

    shelterName: {
      type: String,
      default: "Silicon Valley Rescue"
    },

    shelterTaxId: {
      type: String,
      default: "94-1234567"
    },

    shelterAddress: {
      type: String,
      default: "123 Feline Way, San Jose, CA 95112"
    },

    emailDigest: {
      type: Boolean,
      default: true
    },

    urgentAlerts: {
      type: Boolean,
      default: true
    },

    pushNotifications: {
      type: Boolean,
      default: true
    },

    weeklySummary: {
      type: Boolean,
      default: true
    },

    appearance: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light"
    },

    apiKey: {
      type: String,
      default: "kv_prod_3f8a9e2b1c4d7e5f6a8b7a3x"
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    avatarUrl: {
      type: String,
      default: ""
    },

    coverUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);