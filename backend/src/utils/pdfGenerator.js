const PDFDocument = require("pdfkit");

const generateHealthReport = (res, chat) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=CatHealthReport.pdf"
  );

  doc.pipe(res);

  doc
    .fontSize(24)
    .text("🐱 KittyVerse AI", {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(18)
    .text("Cat Health Report", {
      underline: true,
    });

  doc.moveDown();

  doc.fontSize(14).text("User Question:");

  doc.fontSize(12).text(chat.userMessage);

  doc.moveDown();

  doc.fontSize(14).text("AI Response:");

  doc.fontSize(12).text(chat.botReply);

  doc.moveDown();

  doc.fontSize(12).text(
    "⚠️ This report is generated using AI and should not replace professional veterinary advice."
  );

  doc.end();
};

module.exports = {
  generateHealthReport,
};