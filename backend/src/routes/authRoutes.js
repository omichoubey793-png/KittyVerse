const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

const upload = require("../middleware/uploadMiddleware");

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "cover", maxCount: 1 }]), updateUserProfile);

module.exports = router;