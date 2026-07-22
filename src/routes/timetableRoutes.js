import express from "express";
const router = express.Router();
import { Timetable } from "../models/Timetable.js";
import School from "../models/School.js";
import { protect, admin } from "../middlewares/authMiddlewares.js";

//create timetable
router.post("/", protect, admin, async (req, res) => {
    try {
        const { schoolCode, className, section, label, periods } = req.body;

        if (!schoolCode || !className || !section || !label || !periods) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const timetable = await Timetable.create({
            schoolCode,
            className,
            section,
            label,
            periods,
            createdBy: req.user._id,
        })

        return res.status(201).json({
            message: "Timetable created successfully",
            timetable,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

//update timetable
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);

        if (!timetable) {
            return res.status(400).json({ message: "Timetable not found" });
        }

        const { className, label, section, periods } = req.body;
        if (className) timetable.className = className;
        if (label) timetable.label = label;
        if (section) timetable.section = section;
        if (periods) timetable.periods = periods;

        await timetable.save();
        res.json({ message: "Timetable updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(400).json({ message: "Timetable Not Found" });
        }

        await timetable.deleteOne();
        return res.json({ message: "Timetable deleted successfully " });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.get("/", protect, async (req, res) => {
    try {
        const { className, section } = req.query;

        const filter = {};
        if (className) filter.className = className;
        if (section) filter.section = section;

        // Always scope by the caller's OWN school — never trust a
        // schoolCode query param, admin or not, otherwise any admin could
        // read another school's timetable just by passing ?schoolCode=... (P2-15).
        const school = await School.findById(req.user.school);
        if (!school) return res.status(404).json({ message: "School not found" });
        filter.schoolCode = school.code;

        const timetables = await Timetable.find(filter)
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json(timetables);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id).populate("createdBy", "name");
        if (!timetable) {
            return res.status(404).json({ message: "Timetable Not Found" });
        }

        // Only allow reading a timetable that belongs to the caller's own school.
        const school = await School.findById(req.user.school);
        if (!school || timetable.schoolCode !== school.code) {
            return res.status(404).json({ message: "Timetable Not Found" });
        }

        res.json(timetable)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

export default router;
