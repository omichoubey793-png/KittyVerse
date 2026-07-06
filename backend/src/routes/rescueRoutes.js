const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createRescueRequest,
  getAllRescueRequests,
  getMyRescueRequests,
  acceptRescueRequest,
  rejectRescueRequest,
  deleteRescueRequest,
} = require("../controllers/rescueController");

// User Routes
router.post("/", protect, createRescueRequest);

router.get("/my", protect, getMyRescueRequests);

// Admin Routes
router.get("/", protect, adminOnly, getAllRescueRequests);

router.put(
  "/:id/accept",
  protect,
  adminOnly,
  acceptRescueRequest
);

router.put(
  "/:id/reject",
  protect,
  adminOnly,
  rejectRescueRequest
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteRescueRequest
);

module.exports = router;