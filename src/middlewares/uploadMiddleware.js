import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "application/pdf"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, and PDF files allowed"));
        }
    }
});

export default upload;
