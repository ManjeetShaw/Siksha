
import School from "../models/School.js";

export async function validateClassForSchool(className, schoolId) {
  const school = await School.findById(schoolId);
  if (!school) throw new Error("School not found");

  const num = parseInt(className.replace("Class ", ""));
  if (isNaN(num) || num < school.classRange.from || num > school.classRange.to) {
    throw new Error(
      `Invalid class. This school only has Class ${school.classRange.from} to Class ${school.classRange.to}`
    );
  }
  return school;
}