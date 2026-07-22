import { useState, useEffect } from "react";
import api from "../services/api";

const CLASS_OPTIONS = ["Class 1", "Class 2", "Class 3" ,"Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
            "Class 9", "Class 10", "Class 11", "Class 12"]

const CreateNoteModal = ({ onClose, onCreated }) => {
    const [title, setTitle]       = useState("");
    const [subject, setSubject]   = useState("");
    const [noteClass, setNoteClass] = useState("");   // ✅ renamed from `class`
    const [subjects, setSubjects] = useState([]);
    const [file, setFile]         = useState(null);
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        api.get("/subjects")
            .then((res) => setSubjects(res.data))
            .catch(() => setError("Could not load subjects"));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError("Please attach a file");
        setLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("subject", subject);
            formData.append("class", noteClass);   // ✅ now appended
            formData.append("file", file);

            const res = await api.post("/admin/note", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            onCreated(res.data.note);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#20160F]">Upload Note</h2>
                    <button onClick={onClose} className="text-[#20160F]/40 hover:text-[#20160F] text-xl">✕</button>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Topic</label>
                        <input
                            type="text"
                            placeholder="e.g. Integration by parts"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Subject dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors"
                        >
                            <option value="">Select a subject</option>
                            {subjects.map((s) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Class dropdown ✅ */}
                    <div>
                        <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Select Class</label>
                        <select
                            value={noteClass}
                            onChange={(e) => setNoteClass(e.target.value)}
                            required
                            className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors"
                        >
                            <option value="">Select a class</option>
                            {CLASS_OPTIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Note File</label>
                        <div className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
                            file ? "border-[#FF3E68] bg-[#FFEDE5]/40" : "border-[#FFEDE5] bg-[#FFF6F1]"
                        }`}>
                            {file ? (
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-[#20160F]">{file.name}</p>
                                        <p className="text-xs text-[#20160F]/40 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button type="button" onClick={() => setFile(null)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <p className="text-sm text-[#20160F]/50">
                                        Drop your file here or <span className="text-[#FF3E68] font-medium">browse</span>
                                    </p>
                                    <p className="text-xs text-[#20160F]/30 mt-1">PDF, JPG, PNG — max 10MB</p>
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 h-10 border-2 border-[#20160F] text-[#20160F] rounded-lg text-sm font-medium hover:bg-[#20160F] hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 h-10 bg-[#20160F] text-white rounded-lg text-sm font-medium hover:bg-[#FF3E68] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? (
                                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
                            ) : "Upload Note"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNoteModal;