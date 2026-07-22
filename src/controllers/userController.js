import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "../utils/validatePassword.js";

// Only allow http(s) image URLs (Cloudinary etc). Blocks javascript:, data:,
// and other schemes that could turn <img src={avatar}> into an XSS vector.
function isSafeAvatarUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function verifyEmailChangeToken(token, email) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.purpose === "email-verified" && decoded.email === email;
  } catch {
    return false;
  }
}

// PUT /api/users/:id — update name, email, avatar
export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar, verificationToken } = req.body;

    // Only the logged-in user can update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;

    if (email && email !== user.email) {
      // Changing email requires the same OTP-verification flow used at
      // signup (send-otp -> verify-email-otp -> pass the token here).
      // Without this a user could hijack another account's password-reset
      // flow by pointing their email at someone else's inbox (P1-11).
      if (!verifyEmailChangeToken(verificationToken, email)) {
        return res.status(400).json({ message: "New email must be verified first (send-otp / verify-email-otp)." });
      }
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    if (avatar) {
      if (!isSafeAvatarUrl(avatar)) {
        return res.status(400).json({ message: "Avatar must be a valid http(s) image URL" });
      }
      user.avatar = avatar;
    }

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      role: updated.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id/password — change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Only the logged-in user can change their own password
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Invalidate every other session/device (P2-3) — bump tokenVersion so
    // old JWTs (which carry the previous version) get rejected by protect().
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
