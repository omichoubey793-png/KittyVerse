const LostFound = require("../models/LostFound");

// Create Lost/Found Report
const createReport = async (req, res) => {
  try {
    const report = await LostFound.create({
      ...req.body,
      reportedBy: req.user.id,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Reports
const getAllReports = async (req, res) => {
  try {
    const reports = await LostFound.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Reports
const getMyReports = async (req, res) => {
  try {
    const reports = await LostFound.find({
      reportedBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(reports);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Resolve Report (Admin)
const resolveReport = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = "Resolved";

    await report.save();

    res.status(200).json({
      message: "Report marked as resolved",
      report,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Report (Admin)
const deleteReport = async (req, res) => {
  try {
    const report = await LostFound.findByIdAndDelete(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  resolveReport,
  deleteReport,
};