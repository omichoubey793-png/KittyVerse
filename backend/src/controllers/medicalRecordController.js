const MedicalRecord = require("../models/MedicalRecord");
const Animal = require("../models/Animal");

// Add Medical Record
const createMedicalRecord = async (req, res) => {
  try {
    const { animalId } = req.params;

    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    const medicalRecord = await MedicalRecord.create({
      animal: animalId,
      veterinarian: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      message: "Medical record added successfully",
      medicalRecord,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Medical Records of One Animal
const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      animal: req.params.animalId,
    })
      .populate("veterinarian", "name role")
      .sort({ visitDate: -1 });

    res.status(200).json(records);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Medical Record
const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!record) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    res.status(200).json({
      message: "Medical record updated successfully",
      record,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Medical Record
const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(
      req.params.id
    );

    if (!record) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    res.status(200).json({
      message: "Medical record deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
};