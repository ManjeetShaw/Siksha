import mongoose from "mongoose";
import School from "./School.js";

const deadlineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetClasses: { type: [String], default: [] },  // ← same here
}, { timestamps: true });

export default mongoose.model("Deadline", deadlineSchema);