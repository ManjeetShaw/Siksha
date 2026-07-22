import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import crypto from "crypto";

import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import adminRoute from "./routes/adminRoute.js";
import studentRoute from "./routes/studentRoute.js";
import userRoutes from "./routes/userRoute.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import deadlineRoutes from "./routes/deadlineRouter.js";
import noticeRoutes from "./routes/noticeRoute.js";
import streakRoutes from "./routes/streakRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import passport from "./config/passport.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddlewares.js";
import { apiLimiter } from "./middlewares/rateLimiters.js";

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── Response compression ────────────────────────────────────────────────────
app.use(compression());

// ── Request ID (helps correlate logs across a request's lifecycle) ─────────
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// ── CORS: locked to known frontend origins, not "*" ─────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / server-to-server requests with no Origin header
      // (curl, mobile apps, health checks) but reject unknown browser origins.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// General rate-limit safety net on every API route; specific routes
// (auth, OTP, AI) layer tighter limits on top of this.
app.use("/api", apiLimiter);

// ── Health check (Render pings "/", which used to 404) ─────────────────────
app.get("/", (req, res) => {
  res.json({ message: "✅ Siksha API is running" });
});
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/student/note", studentRoute);
app.use("/api/admin/note", adminRoute);
app.use("/api/users", userRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/ai", aiRoutes);

// ── 404 + global error handler — MUST be mounted last ───────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
