const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb://ShelterAdmin:KittyVerseAi2026@ac-8ytntiz-shard-00-00.t5x9ypq.mongodb.net:27017,ac-8ytntiz-shard-00-01.t5x9ypq.mongodb.net:27017,ac-8ytntiz-shard-00-02.t5x9ypq.mongodb.net:27017/?ssl=true&replicaSet=atlas-u2u8fi-shard-0&authSource=admin&appName=KittyVerseAI";

async function run() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const email = "admin@kittyverse.com";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update or insert the admin user
    const updated = await User.findOneAndUpdate(
      { email },
      {
        name: "Shelter Admin",
        email,
        password: hashedPassword,
        role: "admin"
      },
      { upsert: true, new: true }
    );

    console.log("Admin user seeded successfully:", updated);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("User seed error:", error);
    process.exit(1);
  }
}

run();
