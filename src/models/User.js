import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  avatar: {
    type: String,
    default: "",
  },

  // ── School ──────────────────────────────────────────────
  // Every user (admin or student) belongs to exactly one school
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
  },
  // Students can optionally set their class (admin sets it later via profile)
  class: {
    type: String,
    default: null,
    enum: [
      null,
      "Class 1", "Class 2", "Class 3", "Class 4",
      "Class 5", "Class 6", "Class 7", "Class 8",
      "Class 9", "Class 10", "Class 11", "Class 12",
    ],
  },

  // ── Streak ──────────────────────────────────────────────
  streakCount: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: null,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyOTP: {
    type: String,
    default: null,
  },
  verifyOTPExpiry: {
    type: Date,
    default: null,
  },
  // Bumped whenever the user changes their password. JWTs carry the
  // tokenVersion they were issued with; protect() rejects any token whose
  // version doesn't match the current one, effectively logging out every
  // other device/session (P2-3).
  tokenVersion: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});



export default mongoose.model("User", userSchema);