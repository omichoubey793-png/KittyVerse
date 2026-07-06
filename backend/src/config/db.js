const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URL;
    console.log("Connecting to MongoDB...");
    console.log("URI:", connUri);

    await mongoose.connect(connUri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);

    process.exit(1);
  }
};

module.exports = connectDB;