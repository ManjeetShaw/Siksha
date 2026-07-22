import { useState } from "react";
import { createDeadline } from "../services/api";
import ClassMultiSelect from "./ClassMultiSelect";

function CreateDeadlineModal({ onClose, onCreated }) {
  const [title, setTitle]                 = useState("");
  const [subject, setSubject]             = useState("");
  const [dueDate, setDueDate]             = useState("");
  const [targetClasses, setTargetClasses] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createDeadline({ title, subject, dueDate, targetClasses });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-[#FFEDE5]">

        <h2 className="text-lg font-medium text-[#20160F] mb-6">New Deadline</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="e.g. Math Assignment"
              className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              placeholder="e.g. Mathematics"
              className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors"
            />
          </div>

          {/* Class selector */}
          <ClassMultiSelect value={targetClasses} onChange={setTargetClasses} />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-[#FFEDE5] text-sm text-[#20160F]/60 hover:border-[#FF3E68]/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-lg bg-[#20160F] text-white text-sm font-medium hover:bg-[#FF3E68] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Deadline"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CreateDeadlineModal;