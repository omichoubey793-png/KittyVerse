const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require("../controllers/medicalRecordController");

// Add Medical Record
router.post(
  "/:animalId",
  protect,
  authorize("admin", "staff"),
  createMedicalRecord
);

// Get Medical History of Animal
router.get(
  "/:animalId",
  protect,
  getMedicalRecords
);

// Update Medical Record
router.put(
  "/record/:id",
  protect,
  authorize("admin", "staff"),
  updateMedicalRecord
);

// Delete Medical Record
router.delete(
  "/record/:id",
  protect,
  authorize("admin"),
  deleteMedicalRecord
);

module.exports = router;