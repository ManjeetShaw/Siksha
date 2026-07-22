import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminSubjects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect non-admins
    useEffect(() => {
        if (user && user.role !== "admin") navigate("/dashboard");
    }, [user]);

    // Fetch all subjects
    useEffect(() => {
        api.get("/subjects")
            .then((res) => setSubjects(res.data))
            .catch(() => setError("Could not load subjects"));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await api.post("/subjects", { name });
            setSubjects((prev) => [...prev, res.data.subject]);
            setName("");
            setSuccess("Subject created successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/subjects/${id}`);
            setSubjects((prev) => prev.filter((s) => s._id !== id));
        } catch (err) {
            setError("Could not delete subject");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FFF6F1]">
            <div className="max-w-2xl mx-auto w-full p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-[#20160F]">Manage Subjects</h1>
                    <p className="text-sm text-[#20160F]/50 mt-1">
                        Add or remove subjects available to all students
                    </p>
                </div>

                {/* Create form */}
                <div className="bg-white border border-[#FFEDE5] rounded-2xl p-6 mb-6">
                    <h2 className="text-sm font-medium text-[#20160F] mb-4">Add New Subject</h2>

                    {error && (
                        <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-600 text-sm mb-3 bg-green-50 px-3 py-2 rounded-lg">{success}</p>
                    )}

                    <form onSubmit={handleCreate} className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mathematics"
                            required
                            className="flex-1 h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 px-5 bg-[#20160F] text-white rounded-lg text-sm font-medium hover:bg-[#FF3E68] transition-colors disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "+ Add"}
                        </button>
                    </form>
                </div>

                {/* Subjects list */}
                <div className="bg-white border border-[#FFEDE5] rounded-2xl p-6">
                    <h2 className="text-sm font-medium text-[#20160F] mb-4">
                        All Subjects
                        <span className="ml-2 text-xs text-[#FF3E68] font-normal">
                            {subjects.length} total
                        </span>
                    </h2>

                    {subjects.length === 0 ? (
                        <p className="text-sm text-[#20160F]/40">No subjects yet. Add one above.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-[#FFEDE5]">
                            {subjects.map((s) => (
                                <div key={s._id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-[#FF3E68]" />
                                        <span className="text-sm text-[#20160F]">{s.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(s._id)}
                                        className="text-xs text-red-300 hover:text-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-6 text-sm text-[#20160F]/50 hover:text-[#20160F] transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AdminSubjects;