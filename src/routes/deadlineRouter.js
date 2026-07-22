import express from "express";
import { getDeadline, createDeadline, deleteDeadline } from "../controllers/deadlineController.js";
import { protect, admin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/",protect, getDeadline);
router.post("/", protect, admin, createDeadline);
router.delete("/:id", protect, admin, deleteDeadline);

export default router;