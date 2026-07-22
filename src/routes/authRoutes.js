import express from "express";
import {
  register,
  login,
  getProfile,
  sendOTP,
  verifyEmailOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { otpLimiter, loginLimiter, registerLimiter } from "../middlewares/rateLimiters.js";
import generateToken from "../utils/generateToken.js";
import passport from "passport";

const router = express.Router();

router.post("/send-otp",         otpLimiter,      sendOTP);          // no auth
router.post("/verify-email-otp", otpLimiter,      verifyEmailOTP);   // no auth
router.post("/register",         registerLimiter, register);
router.post("/login",            loginLimiter,    login);
router.get("/profile",           protect,         getProfile);

// Forgot / reset password (P1-4)
router.post("/forgot-password",  otpLimiter,      forgotPassword);
router.post("/verify-reset-otp", otpLimiter,      verifyResetOTP);
router.post("/reset-password",   loginLimiter,    resetPassword);

//google oauth
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    // Redirect to frontend with token in query param
    res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${token}`);
  }
);

export default router;