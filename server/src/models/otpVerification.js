const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  userId: String,
  emailId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const otpVerification = mongoose.model(
  "otpVerification",
  otpVerificationSchema
);
module.exports = otpVerification;