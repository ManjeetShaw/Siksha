import School from "../models/School.js";

// GET /api/schools/mine
// Returns the school the logged-in user belongs to
export const getMySchool = async (req, res) => {
  try {
    if (!req.user.school) {
      return res.status(404).json({ message: "You are not linked to any school" });
    }

    const school = await School.findById(req.user.school);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/code/:code
// Validates a school code — used by the frontend for live checking
export const getSchoolByCode = async (req, res) => {
  try {
    const school = await School.findOne({
      code: req.params.code.toUpperCase(),
    }).select("name classRange code");

    if (!school) {
      return res.status(404).json({ message: "Invalid school code" });
    }

    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySchoolClasses = async (req, res) => {
  try {
    const school = await School.findById(req.user.school);
    if (!school) return res.status(404).json({ message: "School not found" });

    const classes = [];
    for (let i = school.classRange.from; i <= school.classRange.to; i++) {
      classes.push(`Class ${i}`);
    }

    res.status(200).json({ classes, school: { name: school.name, code: school.code } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};