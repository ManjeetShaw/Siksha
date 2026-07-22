import Deadline from "../models/Deadline.js";
import { buildScopeQuery } from "../utils/scopeQuery.js";
import { validateClassForSchool } from "../utils/validateClass.js";

export const getDeadline = async (req, res) => {
  try {
    const selectedClass = req.query.class || null;
    const query = buildScopeQuery(req.user, selectedClass);
    const deadlines = await Deadline.find(query).sort({ dueDate: 1 });
    res.status(200).json(deadlines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDeadline = async (req, res) => {
  try {
    const { title, subject, dueDate, targetClasses = [] } = req.body;

    if (!title || !subject || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    for (const cls of targetClasses) {
      await validateClassForSchool(cls, req.user.school);
    }

    const deadline = await Deadline.create({
      title,
      subject,
      dueDate,
      school: req.user.school,
      createdBy: req.user._id,
      targetClasses,
    });

    res.status(201).json(deadline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// School-scoped delete (P0-2) — an admin from one school could otherwise
// delete another school's deadline just by guessing/enumerating _ids.
export const deleteDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndDelete({ _id: req.params.id, school: req.user.school });
    if (!deadline) {
      return res.status(404).json({ message: "Deadline not found" });
    }
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
