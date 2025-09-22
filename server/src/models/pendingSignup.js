const mongoose = require("mongoose");

const PendingSignupSchema = new mongoose.Schema(
  {
    emailId: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-delete after expiry
PendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Reuse model if already compiled (prevents OverwriteModelError in dev)
module.exports =
  mongoose.models.PendingSignup || mongoose.model("PendingSignup", PendingSignupSchema);
