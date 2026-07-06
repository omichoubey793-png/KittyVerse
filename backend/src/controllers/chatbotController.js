const { generateResponse } = require("../services/geminiService");
const { checkEmergency } = require("../utils/emergencyChecker");
const Chat = require("../models/Chat");
const Animal = require("../models/Animal");

// ===============================
// Chat with AI
// ===============================
const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Emergency Check
    if (checkEmergency(message)) {
      const emergencyReply =
        "🚨 EMERGENCY ALERT\n\nYour cat may require immediate veterinary attention.\n\nPlease take your cat to the nearest veterinarian immediately.\n\n⚠️ This is educational information and not a substitute for professional veterinary advice.";

      // Save emergency chat
      await Chat.create({
        userMessage: message,
        botReply: emergencyReply,
        emergency: true,
      });

      return res.status(200).json({
        success: true,
        emergency: true,
        reply: emergencyReply,
        cats: []
      });
    }

    // Gemini Response
    const reply = await generateResponse(message);

    // Extract cats matching names in reply or user message
    const allCats = await Animal.find({});
    const matchedCats = allCats.filter(c => {
      const regex = new RegExp(`\\b${c.name}\\b`, 'i');
      return regex.test(reply) || regex.test(message);
    });

    // Save normal chat
    await Chat.create({
      userMessage: message,
      botReply: reply,
      emergency: false,
    });

    return res.status(200).json({
      success: true,
      emergency: false,
      reply,
      cats: matchedCats
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ===============================
// Get Chat History
// ===============================
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      chats,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Exports
// ===============================
module.exports = {
  chatWithBot,
  getChatHistory,
};