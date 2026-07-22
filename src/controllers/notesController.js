import Note from "../models/Note.js";
import Subject from "../models/Subject.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { validateClassForSchool } from "../utils/validateClass.js";

// Escape user input before it goes into a RegExp so it can't be used to
// build a catastrophic-backtracking pattern (ReDoS) or a wildcard-everything
// query.
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// CREATE NOTE
export const createNote = async (req, res) => {
    try {
        const { title, subject, class: noteClass } = req.body;

        if (!title || !subject) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // The subject must actually belong to the admin's own school —
        // otherwise a note can be filed under a subject from a school
        // that isn't this one, silently breaking school-scoped queries.
        const subjectDoc = await Subject.findOne({ _id: subject, school: req.user.school });
        if (!subjectDoc) {
            return res.status(400).json({ message: "Subject not found in your school" });
        }

        let fileUrl = null;
        let fileType = null;

        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }

        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        fileUrl = result.secure_url;
        fileType = req.file.mimetype;

        if (noteClass) {
            await validateClassForSchool(noteClass, req.user.school);
        }

        const note = await Note.create({
            title,
            subject,
            class: noteClass,
            fileUrl,
            fileType,
            user: req.user._id,
            school: req.user.school,
        });
        res.status(201).json({
            message: "Note created successfully",
            note
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL NOTES FOR USER (school + class scoped)
export const getAllNotes = async (req, res) => {
    try {
        const query = { school: req.user.school };

        // Students only see notes targeted at their own class (or notes
        // with no class restriction). Admins see everything in the school.
        if (req.user.role === "student" && req.user.class) {
            query.class = req.user.class;
        }

        const notes = await Note.find(query).populate("subject", "name");
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET SINGLE NOTE — school-scoped (P0-2)
export const getNotesById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, school: req.user.school })
            .populate("subject", "name");

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE NOTE — school + owner scoped (P0-2)
export const updateNote = async (req, res) => {
    try {
        const { title, subject } = req.body;

        const note = await Note.findOne({ _id: req.params.id, school: req.user.school });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Only the uploader or a school admin may edit the note.
        if (req.user.role !== "admin" && note.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this note" });
        }

        if (subject) {
            const subjectDoc = await Subject.findOne({ _id: subject, school: req.user.school });
            if (!subjectDoc) {
                return res.status(400).json({ message: "Subject not found in your school" });
            }
        }

        if (title) note.title = title;
        if (subject) note.subject = subject;
        await note.save();

        res.status(200).json({
            message: "Note updated successfully",
            note
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE NOTE — school + owner scoped (P0-2)
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, school: req.user.school });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (req.user.role !== "admin" && note.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this note" });
        }

        await note.deleteOne();

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SEARCH NOTES — school-scoped, min length enforced, regex-escaped (P0-5 root cause, P2-10)
export const searchNotes = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();

        if (q.length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }
        if (q.length > 100) {
            return res.status(400).json({ message: "Search query is too long" });
        }

        const safe = escapeRegex(q);

        const notes = await Note.find({
            school: req.user.school,
            title: { $regex: safe, $options: "i" },
        }).populate("subject", "name");

        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// save a note
export const toggleSavedNotes = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, school: req.user.school });
        if (!note) return res.status(404).json({ message: "note not found" });

        const userId = req.user._id.toString();
        const alreadySaved = note.savedBy.map(id => id.toString()).includes(userId);

        if (alreadySaved) {
            note.savedBy = note.savedBy.filter(id => id.toString() !== userId);
        } else {
            note.savedBy.push(req.user._id);
        }

        await note.save({ validateBeforeSave: false });
        res.status(200).json({ saved: !alreadySaved });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get saved notes for user
export const getSavedNotes = async (req, res) => {
    try {
        const notes = await Note.find({ savedBy: req.user._id, school: req.user.school })
            .populate("subject", "name");
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET NOTES BY SUBJECT — school-scoped
export const getNotesBySubject = async (req, res) => {
    try {
        const selectedClass = req.query.class || null;
        const query = {
            subject: req.params.subjectId,
            school: req.user.school,
        };
        if (selectedClass) {
            query.class = selectedClass;
        }
        const notes = await Note.find(query).populate("subject", "name");

        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
