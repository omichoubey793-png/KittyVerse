const Animal = require("../models/Animal");
const Adoption = require("../models/Adoption");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
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

    // Shelter's animal IDs
    const shelterAnimals = await Animal.find(query).select("_id");
    const animalIds = shelterAnimals.map(a => a._id);

    const totalAnimals = await Animal.countDocuments(query);

    const availableAnimals = await Animal.countDocuments({
      ...query,
      adoptionStatus: "Available",
    });

    const adoptedAnimals = await Animal.countDocuments({
      ...query,
      adoptionStatus: "Adopted",
    });

    const pendingAdoptions = await Adoption.countDocuments({
      animal: { $in: animalIds },
      status: "pending",
    });

    const approvedAdoptions = await Adoption.countDocuments({
      animal: { $in: animalIds },
      status: "approved",
    });

    const rejectedAdoptions = await Adoption.countDocuments({
      animal: { $in: animalIds },
      status: "rejected",
    });

    const totalUsers = await User.countDocuments({ shelterName: user.shelterName });

    const underTreatment = await Animal.countDocuments({
      ...query,
      healthStatus: "Under Treatment",
    });

    const vaccinated = await Animal.countDocuments({
      ...query,
      vaccinationStatus: "Vaccinated",
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRescues = await Animal.countDocuments({
      ...query,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      totalAnimals,
      availableAnimals,
      adoptedAnimals,
      pendingAdoptions,
      approvedAdoptions,
      rejectedAdoptions,
      totalUsers,
      underTreatment,
      vaccinated,
      newRescues,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
 
module.exports = {
  getDashboardStats,
};