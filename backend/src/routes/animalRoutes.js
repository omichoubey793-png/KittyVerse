const express = require("express");

const authorize = require("../middleware/roleMiddleware");
const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const {
  createAnimal,
  getAllAnimals,
  getAnimalById,
  getAnimalProfile,
  updateAnimal,
  deleteAnimal,
  updateAnimalStatus,
} = require("../controllers/animalController");

// Create Animal
router.post(
  "/",
  protect,
  authorize("admin", "staff"),
  upload.single("image"),
  createAnimal
);

// Get Animals
router.get("/", protect, getAllAnimals);
router.get(
  "/:id/profile",
  protect,
  getAnimalProfile
);
router.get("/:id", getAnimalById);

// Update Animal
router.put(
  "/:id",
  protect,
  authorize("admin", "staff"),
  upload.single("image"),
  updateAnimal
);

// Update Animal Status
router.put(
  "/:id/status",
  protect,
  authorize("admin", "staff"),
  updateAnimalStatus
);

// Delete Animal
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteAnimal
);

module.exports = router;