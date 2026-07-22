// models/TempOTP.js
import mongoose from "mongoose";

const tempOTPSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true },
  otp:    { type: String, required: true },
  expiry: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model("TempOTP", tempOTPSchema);