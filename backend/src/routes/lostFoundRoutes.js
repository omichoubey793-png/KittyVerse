const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createReport,
  getAllReports,
  getMyReports,
  resolveReport,
  deleteReport,
} = require("../controllers/lostFoundController");

// User
router.post("/", protect, createReport);
router.get("/", getAllReports);
router.get("/my", protect, getMyReports);

// Admin
router.put(
  "/:id/resolve",
  protect,
  adminOnly,
  resolveReport
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteReport
);

module.exports = router;