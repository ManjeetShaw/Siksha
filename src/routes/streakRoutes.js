import express from "express";
import { getStreak, pingStreak } from "../controllers/streakController.js";
import {protect} from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/",protect, getStreak);
router.post("/ping", protect , pingStreak)

export default router;