import mongoose from "mongoose";

const periodSchema = new mongoose.Schema({
    timeSlot: {
        type: String,
        required: true,
    },
    monday: {
        type: String,
        default: "",
    },
    tuesday: {
        type: String,
        default: "",
    },
    wednesday: {
        type: String,
        default: "",
    },
    thursday: {
        type: String,
        default: "",
    },
    friday: {
        type: String,
        default: "",
    },
    saturday: {
        type: String,
        default: "",
    },
});

const timetableSchema = new mongoose.Schema({
    schoolCode: {
        type: String,
        required: true,
    },
    className: {
        type: String,
        required: true,
    },
    section: {
        type: String, 
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    periods: [periodSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

export const Timetable = mongoose.model("Timetable", timetableSchema);