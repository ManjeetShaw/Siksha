import express from "express";
const router = express.Router();
import { protect } from "../middlewares/authMiddlewares.js";
import { aiLimiter } from "../middlewares/rateLimiters.js";
import { groq } from "../utils/groq.js";

router.post("/summary", protect, aiLimiter, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });
  try {
    const summary = await groq(
      `Please provide a clear, concise summary of the following notes. Focus on the key concepts and main points:\n\n${text}`
    );
    res.json({ summary });
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ message: "Failed to generate summary: " + err.message });
  }
});

router.post("/flashcards", protect, aiLimiter, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });
  try {
    const raw = await groq(
      `Generate exactly 8 flashcards from the following notes. Return ONLY a valid JSON array with no extra text, backticks, or explanation. Each object must have "front" and "back" keys. Format: [{"front":"...","back":"..."}]\n\nNotes:\n${text}`
    );
    const match = raw.replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in response");
    const flashcards = JSON.parse(match[0]);
    res.json({ flashcards });
  } catch (err) {
    console.error("Flashcard error:", err.message);
    res.status(500).json({ message: "Failed to generate flashcards: " + err.message });
  }
});

export default router;
