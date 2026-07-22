import express from 'express';
import {
    getNotesById,
    getAllNotes,
    searchNotes,
    toggleSavedNotes,
    getSavedNotes,
    getNotesBySubject
} from '../controllers/notesController.js';
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Specific routes must be declared BEFORE "/:id" — Express matches routes
// in declaration order, and "/:id" matches any single path segment
// (including "search", "saved", etc). Previously "/:id" was first, which
// made "/search" and other named routes unreachable (P2-8, P2-22).
router.get("/saved", protect, getSavedNotes);
router.get("/subject/:subjectId", protect, getNotesBySubject);
router.get("/user/:userId", protect, getAllNotes);
router.get("/search", protect, searchNotes);

router.get("/:id", protect, getNotesById);
router.post("/:id/save", protect, toggleSavedNotes);

export default router;
