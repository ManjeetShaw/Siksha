import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to cloudinary
export const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === "application/pdf" ? "raw" : "image";
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "notes",
        ...(mimetype === "application/pdf" && { flags: "attachment:false" }), // ✅ serve PDFs inline
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Delete file from cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export default cloudinary;