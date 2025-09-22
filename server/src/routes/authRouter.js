const express = require("express");
const { validateSignUpData } = require("../utils/validation");
require("dotenv").config();
const validator = require("validator");
const User = require("../models/user");
const otpVerification = require("../models/otpVerification");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// routes/auth.js
const crypto = require("crypto");

const PendingSignup = require("../models/pendingSignup"); // NEW model for pending accounts

const authRouter = express.Router();
const SALT_ROUNDS = 10;

/**
 * Step 1: Initiate signup - Validate input & send OTP
 */
authRouter.post("/signup/initiate", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password and generate OTP
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = crypto.randomInt(1000, 9999).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store or update pending signup
    await PendingSignup.findOneAndUpdate(
      { emailId },
      { firstName, lastName, emailId, passwordHash, otpHash, expiresAt, attempts: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send OTP email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: emailId,
      subject: "OTP Verification",
      text: `Hello ${firstName}, your OTP for verification is ${otp}. It will expire in 1 hour.`,
    });

    res.status(200).json({
      message: "OTP sent successfully. Please verify to complete signup.",
      emailId,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: `Error initiating signup: ${err.message}` });
  }
});

/**
 * Step 2: Verify OTP - If valid, create user
 */
authRouter.post("/verifyOtp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    const pending = await PendingSignup.findOne({ emailId });
    if (!pending) {
      return res.status(400).json({ message: "No pending signup found." });
    }

    if (pending.expiresAt < Date.now()) {
      await PendingSignup.deleteOne({ emailId });
      return res.status(400).json({ message: "OTP expired. Please signup again." });
    }

    const isMatch = await bcrypt.compare(otp, pending.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Create user
    const user = new User({
      firstName: pending.firstName,
      lastName: pending.lastName,
      emailId: pending.emailId,
      password: pending.passwordHash,
      isVerified: true,
    });

    await user.save();
    await PendingSignup.deleteOne({ emailId });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error verifying OTP: ${err.message}` });
  }
});

/**
 * Login
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        emailId: user.emailId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});


/**
 * Logout
 */
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("Logged out");
});

module.exports = authRouter;

