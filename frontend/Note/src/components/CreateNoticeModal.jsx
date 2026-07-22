import { useState } from "react";
import { createNotice } from "../services/api";
import ClassMultiSelect from "./ClassMultiSelect";

function CreateNoticeModal({ onClose, onCreated }) {
  const [title, setTitle]               = useState("");
  const [content, setContent]           = useState("");
  const [targetClasses, setTargetClasses] = useState([]); // [] = school-wide
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createNotice({ title, content, targetClasses });
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

        <h2 className="text-lg font-medium text-[#20160F] mb-6">New Notice</h2>

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
              placeholder="e.g. Parent-Teacher Meeting"
              className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
              Content
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={3}
              placeholder="Write the notice here..."
              className="w-full border border-[#FFEDE5] rounded-lg px-3.5 py-2.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30 resize-none"
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
              {loading ? "Posting..." : "Post Notice"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CreateNoticeModal;