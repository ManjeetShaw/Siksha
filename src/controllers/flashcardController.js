import Flashcard from "../models/flashcardModel.js";
import Note from "../models/Note.js";
import { groq } from "../utils/groq.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PdfReader } = require("pdfreader");

const MAX_PDF_BYTES = 15 * 1024 * 1024; // safety cap independent of the note's own upload limit

// pdfreader is callback-based and emits (page, text) items in whatever order
// the PDF's internal content stream happens to list them — NOT necessarily
// reading order. The old code just concatenated as items arrived, which
// garbled longer/multi-column PDFs. Fix: buffer every item, then sort by
// page -> y (row) -> x (column) before joining, which reconstructs reading
// order deterministically.
const extractPdfText = (buffer) => {
  return new Promise((resolve, reject) => {
    const reader = new PdfReader();
    const items = [];
    reader.parseBuffer(buffer, (err, item) => {
      if (err) return reject(err);
      if (!item) {
        items.sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
        return resolve(items.map((i) => i.text).join(" "));
      }
      if (item.page !== undefined) return; // page marker, no text
      if (item.text) {
        items.push({ page: item.page ?? 0, y: item.y ?? 0, x: item.x ?? 0, text: item.text });
      }
    });
  });
};

export const generateFlashcards = async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ message: "noteId is required" });

    // School-scoped so a user can't generate flashcards from another
    // school's note by guessing its _id.
    const note = await Note.findOne({ _id: noteId, school: req.user.school }).populate("subject");
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (!note.fileUrl) {
      return res.status(400).json({ message: "This note has no file attached." });
    }

    const isImage = ["image/png", "image/jpeg", "image/jpg"].includes(note.fileType);
    if (isImage) {
      // The frontend upload form advertises image support (.jpg/.png) but
      // OCR isn't implemented yet — give a clear, specific message instead
      // of a generic 400 (P2-9). Real fix (OCR pipeline) is a bigger effort
      // than fits here; frontend has been updated to say "PDF only" for now.
      return res.status(400).json({ message: "Flashcard generation currently supports PDF notes only. Image OCR is coming soon." });
    }

    const fetchRes = await fetch(note.fileUrl);
    if (!fetchRes.ok) throw new Error(`Failed to download file: ${fetchRes.statusText}`);
    const buffer = Buffer.from(await fetchRes.arrayBuffer());

    if (buffer.length > MAX_PDF_BYTES) {
      return res.status(400).json({ message: "This PDF is too large to process." });
    }

    const extractedText = (await extractPdfText(buffer)).trim();
    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({ message: "Could not extract enough text from this PDF." });
    }

    const prompt = `You are a study assistant. Read the note below and generate exactly 8 flashcards.

NOTE TITLE: ${note.title}
SUBJECT: ${note.subject?.name ?? "General"}

NOTE CONTENT:
${extractedText.slice(0, 3000)}

Rules:
- Each flashcard must have a clear concise question on the front and a precise answer on the back.
- Also provide exactly 3 distractor answers per card (wrong but plausible options).
- Focus on the most important concepts, definitions, and facts.
- Questions should vary: definitions, explanations, comparisons, examples.

Respond ONLY with a valid JSON object, no extra text, no markdown fences:
{
  "title": "Flashcards: ${note.title}",
  "cards": [
    {
      "front": "question text",
      "back": "correct answer",
      "distractors": ["wrong answer 1", "wrong answer 2", "wrong answer 3"]
    }
  ]
}`;

    const raw = await groq(prompt);

    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return res.status(500).json({ message: "AI returned no valid JSON" });
    }
    const parsed = JSON.parse(clean.slice(start, end + 1));

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      return res.status(500).json({ message: "AI returned unexpected format" });
    }

    const deck = await Flashcard.create({
      user: req.user._id,
      note: noteId,
      title: parsed.title ?? `Flashcards: ${note.title}`,
      cards: parsed.cards,
    });

    res.status(201).json(deck);
  } catch (err) {
    console.error("Flashcard generation error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Uses the authenticated user's own id — NOT a URL param — so a logged-in
// user can no longer read anyone else's decks by changing :userId (P1-13/P2-6).
export const getUserDecks = async (req, res) => {
  try {
    const decks = await Flashcard.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("title cards createdAt note");
    res.json(decks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDeck = async (req, res) => {
  try {
    const deck = await Flashcard.findById(req.params.deckId);
    if (!deck) return res.status(404).json({ message: "Deck not found" });

    if (deck.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await deck.deleteOne();
    res.json({ message: "Deck deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
