import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    front: { type: String, required: true },
    back: { type: String, required: true },
    distractors: { type: [String], default: [] },
});

const flashcardSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        note: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
        title: { type: String, required: true },
        cards: { type: [cardSchema], default: [] },
    },
    { timestamps: true }
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);
export default Flashcard;
