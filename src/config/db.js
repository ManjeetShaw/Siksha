import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");

    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (error) {
    // Never log the raw URI — it can contain the DB username/password.
    console.error("Database connection failed:", error.message);
    // Don't keep serving traffic against a dead DB.
    process.exit(1);
  }
};

export default connectDB;
