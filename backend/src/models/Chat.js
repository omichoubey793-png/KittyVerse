const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userMessage: {
      type: String,
      required: true,
    },

    botReply: {
      type: String,
      required: true,
    },

    emergency: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);