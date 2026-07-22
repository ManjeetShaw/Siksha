import express from "express";
import upload from "../middlewares/uploadMiddleware.js"
import{
    createNote,
    deleteNote,
    updateNote,
} from "../controllers/notesController.js";

import { admin, protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", protect, admin, upload.single("file"), createNote);
router.put("/:id", protect, admin, updateNote);
router.delete("/:id", protect, admin, deleteNote);

export default router;
