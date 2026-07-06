const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uploadToCloudinary = require("../utils/uploadToCloudinary");


// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, shelterName } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "admin",
      shelterName: shelterName || "Silicon Valley Rescue",
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        language: user.language,
        currency: user.currency,
        shelterName: user.shelterName,
        shelterTaxId: user.shelterTaxId,
        shelterAddress: user.shelterAddress,
        emailDigest: user.emailDigest,
        urgentAlerts: user.urgentAlerts,
        pushNotifications: user.pushNotifications,
        weeklySummary: user.weeklySummary,
        appearance: user.appearance,
        apiKey: user.apiKey,
        twoFactorEnabled: user.twoFactorEnabled,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER PROFILE / SETTINGS
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      timezone,
      language,
      currency,
      shelterName,
      shelterTaxId,
      shelterAddress,
      emailDigest,
      urgentAlerts,
      pushNotifications,
      weeklySummary,
      appearance,
      apiKey,
      twoFactorEnabled,
      currentPassword,
      newPassword
    } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (name !== undefined) user.name = name;
    if (timezone !== undefined) user.timezone = timezone;
    if (language !== undefined) user.language = language;
    if (currency !== undefined) user.currency = currency;
    if (shelterName !== undefined) user.shelterName = shelterName;
    if (shelterTaxId !== undefined) user.shelterTaxId = shelterTaxId;
    if (shelterAddress !== undefined) user.shelterAddress = shelterAddress;
    if (emailDigest !== undefined) user.emailDigest = emailDigest;
    if (urgentAlerts !== undefined) user.urgentAlerts = urgentAlerts;
    if (pushNotifications !== undefined) user.pushNotifications = pushNotifications;
    if (weeklySummary !== undefined) user.weeklySummary = weeklySummary;
    if (appearance !== undefined) user.appearance = appearance;
    if (apiKey !== undefined) user.apiKey = apiKey;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;

    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const uploadedAvatar = await uploadToCloudinary(
        req.files.avatar[0].buffer,
        "kittyverse/avatars"
      );
      user.avatarUrl = uploadedAvatar.url;
    }

    if (req.files && req.files.cover && req.files.cover[0]) {
      const uploadedCover = await uploadToCloudinary(
        req.files.cover[0].buffer,
        "kittyverse/covers"
      );
      user.coverUrl = uploadedCover.url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        language: user.language,
        currency: user.currency,
        shelterName: user.shelterName,
        shelterTaxId: user.shelterTaxId,
        shelterAddress: user.shelterAddress,
        emailDigest: user.emailDigest,
        urgentAlerts: user.urgentAlerts,
        pushNotifications: user.pushNotifications,
        weeklySummary: user.weeklySummary,
        appearance: user.appearance,
        apiKey: user.apiKey,
        twoFactorEnabled: user.twoFactorEnabled,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};