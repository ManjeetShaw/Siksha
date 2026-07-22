import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  classRange: {
    from: { type: Number, required: true, min: 1, max: 12 },
    to:   { type: Number, required: true, min: 1, max: 12 },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("School", schoolSchema);