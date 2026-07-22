import rateLimit from "express-rate-limit";

// Generic JSON handler so throttled requests get the same
// shape of response as the rest of the API (see errorMiddlewares.js)
const jsonLimitHandler = (message) => (req, res) => {
  res.status(429).json({ message });
};

// 5 OTP requests per 10 minutes per IP — stops OTP-flood / email-bomb abuse
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonLimitHandler("Too many OTP requests. Please try again in a few minutes."),
});

// 10 login attempts per 15 minutes per IP — slows credential stuffing
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonLimitHandler("Too many login attempts. Please try again later."),
});

// 10 registrations per hour per IP — slows mass account creation
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonLimitHandler("Too many accounts created from this network. Please try again later."),
});

// 30 AI calls per hour per IP — protects the Groq quota from abuse
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonLimitHandler("AI usage limit reached. Please try again later."),
});

// General safety net on every /api route — generous, just stops floods
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonLimitHandler("Too many requests. Please slow down."),
});
