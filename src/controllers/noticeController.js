import Notice from "../models/Notice.js";
import { buildScopeQuery } from "../utils/scopeQuery.js";
import { validateClassForSchool } from "../utils/validateClass.js";

export const getNotice = async (req, res) => {
    try {
        const selectedClass = req.query.class || null;
        const query = buildScopeQuery(req.user, selectedClass);
        const notices = await Notice.find(query).sort({ createdAt: -1 });
        res.status(200).json(notices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createNotice = async (req, res) => {
    try {
        const { title, content, targetClasses = [] } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }

        for (const cls of targetClasses) {
            await validateClassForSchool(cls, req.user.school);
        }

        const notice = await Notice.create({
            title,
            content,
            school: req.user.school,
            createdBy: req.user._id,
            targetClasses,
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// School-scoped delete (P0-2)
export const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findOneAndDelete({ _id: req.params.id, school: req.user.school });
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
