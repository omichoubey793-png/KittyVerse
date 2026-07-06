const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const adminOnly = require("../middleware/adminMiddleware");

const {
  createAdoptionRequest,
  getMyAdoptions,
  getAllAdoptions,
  approveAdoption,
  rejectAdoption,
} = require("../controllers/adoptionController");

router.post("/", protect, createAdoptionRequest);

router.get("/my", protect, getMyAdoptions);

router.get(
  "/",
  protect,
  adminOnly,
  getAllAdoptions
);

router.put(
  "/:id/approve",
  protect,
  adminOnly,
  approveAdoption
);

router.put(
  "/:id/reject",
  protect,
  adminOnly,
  rejectAdoption
);

module.exports = router;