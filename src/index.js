// index.js
import dotenv from "dotenv";
if(process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env" });
}


// Dynamic imports AFTER dotenv loads
const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});