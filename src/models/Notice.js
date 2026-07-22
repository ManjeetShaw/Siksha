import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  school:   { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetClasses: { type: [String], default: [] },  // ← must be [String] not String
}, { timestamps: true });

export default mongoose.model("Notice", noticeSchema);