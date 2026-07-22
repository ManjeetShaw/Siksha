import express from "express";
import { getNotice, createNotice, deleteNotice } from "../controllers/noticeController.js";
import {protect, admin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", protect, getNotice);
router.post("/", protect, admin, createNotice);
router.delete("/:id", protect, admin, deleteNotice);

export default router;