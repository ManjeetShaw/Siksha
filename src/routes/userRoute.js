import express from "express";
import { updateProfile, changePassword } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.put("/:id",          protect, updateProfile);
router.put("/:id/password", protect, changePassword);

export default router;