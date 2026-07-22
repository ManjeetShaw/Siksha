import express from "express";
import { getMySchool, getSchoolByCode, getMySchoolClasses } from "../controllers/schoolController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// ✅ more specific route must come BEFORE the general /mine route
router.get("/mine/classes", protect, getMySchoolClasses);
router.get("/mine",         protect, getMySchool);
router.get("/code/:code",   protect, getSchoolByCode);

export default router;