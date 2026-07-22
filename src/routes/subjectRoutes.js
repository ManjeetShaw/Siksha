import express from "express";
import { createSubject, getAllSubjects, deleteSubject } from "../controllers/subjectController.js";
import { protect, admin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", protect, admin, createSubject);
router.get("/", protect, getAllSubjects);
router.delete("/:id", protect, admin, deleteSubject);

export default router;
