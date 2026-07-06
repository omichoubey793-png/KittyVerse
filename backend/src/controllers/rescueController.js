const Rescue = require("../models/Rescue");
const Animal = require("../models/Animal");

// Create Rescue Request
const createRescueRequest = async (req, res) => {
  try {
    const rescue = await Rescue.create({
      ...req.body,
      reportedBy: req.user.id,
    });

    res.status(201).json({
      message: "Rescue request submitted successfully",
      rescue,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Rescue Requests (Admin)
const getAllRescueRequests = async (req, res) => {
  try {
    const rescues = await Rescue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(rescues);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Rescue Requests
const getMyRescueRequests = async (req, res) => {
  try {
    const rescues = await Rescue.find({
      reportedBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(rescues);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Accept Rescue Request (Admin)
const acceptRescueRequest = async (req, res) => {
  try {
    const rescue = await Rescue.findById(req.params.id);

    if (!rescue) {
      return res.status(404).json({
        message: "Rescue request not found",
      });
    }

    if (rescue.status === "Accepted") {
      return res.status(400).json({
        message: "This request has already been accepted",
      });
    }

    // Update rescue status
    rescue.status = "Accepted";
    await rescue.save();

    // Create animal automatically
    const animal = await Animal.create({
    name:
        rescue.animalName === "Unknown"
        ? rescue.title
        : rescue.animalName,

    species: "Cat",

    breed: rescue.breed,

    age: rescue.age,

    gender:
        rescue.gender === "Unknown"
        ? "Male"
        : rescue.gender,

    color: rescue.color,

    healthStatus: rescue.healthStatus,

    adoptionStatus: "Available",

    description: rescue.description,

    imageUrl: rescue.imageUrl,

    addedBy: req.user.id,
    });
    res.status(200).json({
      message:
        "Rescue accepted and animal added successfully.",
      rescue,
      animal,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reject Rescue Request (Admin)
const rejectRescueRequest = async (req, res) => {
  try {
    const rescue = await Rescue.findById(req.params.id);

    if (!rescue) {
      return res.status(404).json({
        message: "Rescue request not found",
      });
    }

    rescue.status = "Rejected";

    await rescue.save();

    res.status(200).json({
      message: "Rescue request rejected",
      rescue,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Rescue Request (Admin)
const deleteRescueRequest = async (req, res) => {
  try {
    const rescue = await Rescue.findByIdAndDelete(req.params.id);

    if (!rescue) {
      return res.status(404).json({
        message: "Rescue request not found",
      });
    }

    res.status(200).json({
      message: "Rescue request deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRescueRequest,
  getAllRescueRequests,
  getMyRescueRequests,
  acceptRescueRequest,
  rejectRescueRequest,
  deleteRescueRequest,
};