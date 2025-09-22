// backend/routes/profileRouter.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const profileRouter = express.Router();
const User = require("../models/user");

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

profileRouter.post(
  "/upload/profile-image",
  userAuth,
  upload.single("profileImage"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Save only relative path
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  }
);

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.json({
      message: `${updatedUser.firstName}, your profile updated successfully`,
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
