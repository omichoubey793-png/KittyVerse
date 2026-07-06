const cloudinary = require("../config/cloudinary");

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
  }
};

module.exports = deleteFromCloudinary;