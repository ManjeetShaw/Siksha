import Subject from "../models/Subject.js";

export const createSubject = async (req, res) => {
    try {
        const { name, targetClasses = [] } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Subject name is required" });
        }

        const exists = await Subject.findOne({ name: name.trim(), school: req.user.school });
        if (exists) {
            return res.status(400).json({ message: "Subject already exists" });
        }
        const subject = await Subject.create({
            name: name.trim(),
            school: req.user.school,
            targetClasses,
        });
        res.status(201).json({ message: "Subject created successfully", subject });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// School-scoped (P0-4) — every user only sees subjects from their own school.
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.user.school }).sort({ name: 1 });
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findOneAndDelete({ _id: req.params.id, school: req.user.school });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
