const express = require("express");
const router = express.Router();

const {
  chatWithBot,
  getChatHistory,
} = require("../controllers/chatbotController");

router.post("/chat", chatWithBot);
router.get("/history", getChatHistory);

module.exports = router;