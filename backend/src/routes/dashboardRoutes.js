const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

router.get(
  "/",
  protect,
  adminOnly,
  getDashboardStats
);

module.exports = router; 