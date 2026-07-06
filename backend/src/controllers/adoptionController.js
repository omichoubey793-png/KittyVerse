const Adoption = require("../models/Adoption");
const Animal = require("../models/Animal");
const User = require("../models/User");

// Create Adoption Request
const createAdoptionRequest = async (req, res) => {
  try {
    const { animalId } = req.body;

    // Check if animal exists
    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    // Check if animal is available
    if (animal.adoptionStatus !== "Available") {
      return res.status(400).json({
        message: "Animal is not available for adoption",
      });
    }

    // Check duplicate request
    const existingRequest = await Adoption.findOne({
      animal: animalId,
      user: req.user.id,
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already requested this animal",
      });
    }

    const adoption = await Adoption.create({
      animal: animalId,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Adoption request submitted successfully",
      adoption,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Logged-in User's Adoption Requests
const getMyAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({
      user: req.user.id,
    }).populate("animal");

    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Adoption Requests (Admin)
const getAllAdoptions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const shelterUsers = await User.find({ shelterName: user.shelterName }).select("_id");
    const userIds = shelterUsers.map(u => u._id);

    let query = {};
    if (user.shelterName === "Silicon Valley Rescue") {
      query = {
        $or: [
          { addedBy: { $in: userIds } },
          { addedBy: null }
        ]
      };
    } else {
      query = { addedBy: { $in: userIds } };
    }

    // Find animals that belong to this shelter
    const animals = await Animal.find(query).select("_id");
    const animalIds = animals.map(a => a._id);

    const adoptions = await Adoption.find({ animal: { $in: animalIds } })
      .populate("animal")
      .populate("user", "name email");

    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Approve Adoption Request (Admin)
const approveAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    // Prevent approving twice
    if (adoption.status === "approved") {
      return res.status(400).json({
        message: "This adoption request is already approved",
      });
    }

    // Find animal
    const animal = await Animal.findById(adoption.animal);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    // Check if animal already adopted
    if (animal.adoptionStatus === "Adopted") {
      return res.status(400).json({
        message: "Animal has already been adopted",
      });
    }

    // Approve selected request
    adoption.status = "approved";
    await adoption.save();

    // Update animal status
    animal.adoptionStatus = "Adopted";
    await animal.save();

    // Reject every other pending request
    await Adoption.updateMany(
      {
        animal: adoption.animal,
        _id: { $ne: adoption._id },
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
        },
      }
    );

    res.status(200).json({
      message:
        "Adoption approved and all other requests rejected.",
      adoption,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reject Adoption Request (Admin)
const rejectAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(
      req.params.id
    );

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    adoption.status = "rejected";

    await adoption.save();

    res.status(200).json({
      message: "Adoption rejected",
      adoption,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAdoptionRequest,
  getMyAdoptions,
  getAllAdoptions,
  approveAdoption,
  rejectAdoption,
};