require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const testRoutes = require("./routes/testRoutes");

const animalRoutes = require("./routes/animalRoutes");

const adoptionRoutes = require("./routes/adoptionRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const lostFoundRoutes = require("./routes/lostFoundRoutes");

const rescueRoutes = require("./routes/rescueRoutes");

const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Connect Database
connectDB();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/rescue", rescueRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/report", reportRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Shelter Management API Running",
  });
});

module.exports = app;