import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    fileUrl: {
        type: String,
        default: null,
    },
    fileType: {
        type: String,
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    savedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        }
    ],
    class: {
        type: String,
        required: true,
        trim: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);
export default Note;