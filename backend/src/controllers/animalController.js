const Animal = require("../models/Animal");
const MedicalRecord = require("../models/MedicalRecord");
const Adoption = require("../models/Adoption");
const User = require("../models/User");

const uploadToCloudinary = require("../utils/uploadToCloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

// Create Animal
const createAnimal = async (req, res) => {
  try {

    const {
      name,
      species,
      breed,
      age,
      gender,
      color,
      healthStatus,
      location,
      vaccinationStatus,
      description,
    } = req.body;

    // Normalize gender
    const formattedGender =
      gender.charAt(0).toUpperCase() +
      gender.slice(1).toLowerCase();

    let imageUrl = "";
    let publicId = "";

    // Upload image if provided
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "kittyverse/animals"
      );

      imageUrl = uploadedImage.url;
      publicId = uploadedImage.public_id;
    }

    const animal = await Animal.create({
      name,
      species,
      breed,
      age,
      gender: formattedGender,
      color,
      healthStatus,
      location,
      vaccinationStatus,
      description,
      imageUrl,
      publicId,
      addedBy: req.user.id,
      createdAt: req.body.rescueDate ? new Date(req.body.rescueDate) : undefined,
    });

    res.status(201).json(animal);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get All Animals
const getAllAnimals = async (req, res) => {
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

    const animals = await Animal.find(query).populate(
      "addedBy",
      "name email"
    );

    res.status(200).json(animals);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Animal
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(
      req.params.id
    ).populate("history.updatedBy", "name role");

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    res.status(200).json(animal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Complete Animal Profile
const getAnimalProfile = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate("addedBy", "name email")
      .populate("history.updatedBy", "name role");

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    const medicalRecords = await MedicalRecord.find({
      animal: animal._id,
    })
      .populate("veterinarian", "name role")
      .sort({ visitDate: -1 });

    const adoptionRequests = await Adoption.find({
      animal: animal._id,
    })
      .populate("user", "name email");

    res.status(200).json({
      animal,
      history: animal.history,
      medicalRecords,
      adoptionRequests,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Animal
const updateAnimal = async (req, res) => {
  try {
    // Normalize gender if provided
    if (req.body.gender) {
      req.body.gender =
        req.body.gender.charAt(0).toUpperCase() +
        req.body.gender.slice(1).toLowerCase();
    }

    if (req.body.rescueDate) {
      req.body.createdAt = new Date(req.body.rescueDate);
    }

    //Update image if uploaded 
    if (req.file) {

  // Find current animal to get old Cloudinary publicId
  const existingAnimal = await Animal.findById(req.params.id);

  if (!existingAnimal) {
    return res.status(404).json({
      message: "Animal not found",
    });
  }

  // Upload new image
  const uploadedImage = await uploadToCloudinary(
    req.file.buffer,
    "kittyverse/animals"
  );

  // Delete old image if it exists
  if (existingAnimal.publicId) {
    await deleteFromCloudinary(existingAnimal.publicId);
  }

  // Save new image details
  req.body.imageUrl = uploadedImage.url;
  req.body.publicId = uploadedImage.public_id;
}

    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    res.status(200).json(animal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Animal
const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(
      req.params.id
    );

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    res.status(200).json({
      message: "Animal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Animal Status (Admin)
const updateAnimalStatus = async (req, res) => {
  try {
    const { adoptionStatus } = req.body;

    const validStatuses = [
      "Rescued",
      "Under Treatment",
      "Ready for Adoption",
      "Available",
      "Adopted",
    ];

    if (!validStatuses.includes(adoptionStatus)) {
      return res.status(400).json({
        message: "Invalid adoption status",
      });
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    animal.adoptionStatus = adoptionStatus;

    animal.history.push({
      status: adoptionStatus,
      notes: req.body.notes || "",
      updatedBy: req.user.id,
    });

    await animal.save();

    res.status(200).json({
      message: "Animal status updated successfully",
      animal,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAnimal,
  getAllAnimals,
  getAnimalById,
  getAnimalProfile,
  updateAnimal,
  deleteAnimal,
  updateAnimalStatus,
};