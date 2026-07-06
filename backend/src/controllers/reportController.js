const Chat = require("../models/Chat");
const { generateHealthReport } = require("../utils/pdfGenerator");

const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    generateHealthReport(res, chat);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  downloadReport,
};