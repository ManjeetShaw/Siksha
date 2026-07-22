import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  school:  { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  targetClasses: [{
    type: String,
    enum: ["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6",
           "Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"],
  }],
  // empty array = visible to ALL classes in the school
}, { timestamps: true });

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;