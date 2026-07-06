const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer, folder = "kittyverse") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;