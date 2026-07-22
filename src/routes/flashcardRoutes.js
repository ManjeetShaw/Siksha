import express from "express";
import {
  generateFlashcards,
  getUserDecks,
  deleteDeck,
} from "../controllers/flashcardController.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { aiLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/generate",  protect, aiLimiter, generateFlashcards); // AI generation
// Kept as :userId for backward compatibility with the existing frontend
// call (fetchUserDecks(userId)), but the controller now ignores the param
// entirely and always returns the authenticated user's own decks (P1-13).
router.get("/:userId",    protect, getUserDecks);
router.delete("/:deckId", protect, deleteDeck);

export default router;
