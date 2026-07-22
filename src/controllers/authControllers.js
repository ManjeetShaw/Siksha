import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import School from "../models/School.js";
import TempOTP from "../models/TempOTP.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "../utils/validatePassword.js";

function generateOTP() {
  // crypto.randomInt is cryptographically strong, unlike Math.random.
  return crypto.randomInt(100000, 1000000).toString();
}

function generateSchoolCode(schoolName) {
  const prefix = schoolName.trim().slice(0, 3).toUpperCase().replace(/\s/g, "");
  const year = new Date().getFullYear();
  // crypto.randomInt instead of Math.random for meaningfully higher entropy.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return `${prefix}-${year}-${random}`;
}

// Short-lived token proving a specific email address just passed OTP
// verification. Required by /register so the backend can no longer be
// bypassed by simply skipping the OTP step (P0-3).
function signEmailVerificationToken(email) {
  return jwt.sign({ email, purpose: "email-verified" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function verifyEmailVerificationToken(token, email) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.purpose === "email-verified" && decoded.email === email;
  } catch {
    return false;
  }
}

// POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await TempOTP.findOneAndUpdate(
      { email },
      { otp, expiry },
      { upsert: true, new: true }
    );

    await sendVerificationEmail(email, otp);
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-email-otp
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await TempOTP.findOne({ email });
    if (!record) return res.status(400).json({ message: "No OTP sent to this email" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiry < new Date()) return res.status(400).json({ message: "OTP expired. Request a new one." });

    await TempOTP.deleteOne({ email });

    // Hand the frontend a short-lived proof-of-verification token that
    // /register must present. Without this, verification only lived in the
    // UI and the backend never actually checked it.
    const verificationToken = signEmailVerificationToken(email);

    res.status(200).json({ message: "Email verified", verificationToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      schoolName,
      classRange,
      schoolCode,
      verificationToken,
      adminCode,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    // Email verification is now enforced server-side, not just gated in the UI.
    if (!verifyEmailVerificationToken(verificationToken, email)) {
      return res.status(400).json({ message: "Email is not verified. Please verify your email first." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Self-registration can never grant "admin" for free. A real admin
    // account requires the shared ADMIN_SIGNUP_CODE (set by the school /
    // the operator out-of-band). Everyone else is forced to "student".
    const wantsAdmin = role === "admin";
    const isAllowedAdmin =
      wantsAdmin &&
      !!process.env.ADMIN_SIGNUP_CODE &&
      adminCode === process.env.ADMIN_SIGNUP_CODE;

    if (wantsAdmin && !isAllowedAdmin) {
      return res.status(403).json({
        message: "Creating an admin account requires a valid admin signup code.",
      });
    }

    const finalRole = isAllowedAdmin ? "admin" : "student";

    let schoolId = null;

    if (finalRole === "admin" && schoolName) {
      let code = generateSchoolCode(schoolName);
      let attempts = 0;
      while ((await School.findOne({ code })) && attempts++ < 5) {
        code = generateSchoolCode(schoolName);
      }

      const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
        school: null,
        isVerified: true,
      });

      const school = await School.create({
        name: schoolName,
        code,
        classRange: {
          from: parseInt(classRange?.from ?? 1),
          to: parseInt(classRange?.to ?? 12),
        },
        createdBy: user._id,
      });

      await User.updateOne({ _id: user._id }, { school: school._id });

      const token = generateToken({ _id: user._id, role: finalRole });

      return res.status(201).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: finalRole,
          school: school._id,
          isVerified: true,
        },
        schoolCode: code,
      });
    }

    if (schoolCode) {
      const school = await School.findOne({ code: schoolCode.toUpperCase() });
      if (!school) return res.status(400).json({ message: "Invalid school code. Please check and try again." });
      schoolId = school._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      school: schoolId,
      isVerified: true,
    });

    const token = generateToken({ _id: user._id, role: finalRole });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email }).populate("school");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school
          ? {
              id: user.school._id,
              name: user.school.name,
              code: user.school.code,
              classRange: user.school.classRange,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("school");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password — send a reset OTP to an existing account's email.
// Always responds 200 regardless of whether the email exists, so this
// endpoint can't be used to enumerate registered accounts.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (user) {
      const otp = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      // Reuses TempOTP, namespaced so a signup-verification OTP can never
      // be replayed to reset a password (or vice versa).
      await TempOTP.findOneAndUpdate(
        { email: `reset:${email}` },
        { otp, expiry },
        { upsert: true, new: true }
      );

      await sendPasswordResetEmail(email, otp);
    }

    res.status(200).json({ message: "If that email is registered, a reset code has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-reset-otp — check the OTP, return a short-lived
// token that reset-password must present (same pattern as email verification).
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await TempOTP.findOne({ email: `reset:${email}` });
    if (!record) return res.status(400).json({ message: "No reset code requested for this email" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid code" });
    if (record.expiry < new Date()) return res.status(400).json({ message: "Code expired. Request a new one." });

    await TempOTP.deleteOne({ email: `reset:${email}` });

    const resetToken = jwt.sign({ email, purpose: "password-reset" }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({ message: "Code verified", resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset session expired. Please start over." });
    }
    if (decoded.purpose !== "password-reset" || decoded.email !== email) {
      return res.status(400).json({ message: "Invalid reset session. Please start over." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Invalidate every existing session — see P2-3 in userController.changePassword.
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
