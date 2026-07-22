import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getTimetables, createTimetable, deleteTimetable } from "../services/timetableApi";
import {
  FaHome, FaStickyNote, FaLayerGroup, FaClock, FaBookmark, FaCalendarAlt,
  FaChalkboardTeacher, FaPlus, FaSearch, FaBars, FaBell, FaFire, FaTh,
  FaBookOpen, FaSignOutAlt,
} from "react-icons/fa";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyPeriod = () => ({
  timeSlot: "", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "", saturday: "",
});

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const nav = [
      { label: "Dashboard", to: "/dashboard", icon: FaHome },
      { label: "All notes", to: "/notes", icon: FaStickyNote },
      { label: "Flashcards", to: "/flashcards", icon: FaLayerGroup },
      { label: "Study timer", to: "/timer", icon: FaClock },
      { label: "Saved Notes", to: "/saved", icon: FaBookmark },
      { label: "Timetables", to: "/timetable", icon: FaCalendarAlt },
      ...(user?.role === "admin" ? [
        { label: "Manage Subjects", to: "/admin/subjects", icon: FaChalkboardTeacher },
      ] : []),
    ];
  const initials = (user?.name ?? "R").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#20160F] dark:bg-[#1a130e] flex flex-col py-6">
      <div className="px-5 pb-6 border-b border-white/10 text-lg font-medium text-[#FFF6F1] tracking-[3px] uppercase">Notes</div>
      <p className="px-3 pt-5 pb-2 text-[10px] font-medium text-[#FFEDE5]/35 tracking-[1.5px] uppercase">Main</p>
      {nav.map(({ label, to }) => {
        const active = location.pathname === to;
        return (
          <Link key={label} to={to} className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all ${
            active ? "bg-[#FF3E68]/20 text-[#FF3E68] border border-[#FF3E68]/30"
                   : "text-[#FFEDE5]/60 hover:bg-white/10 hover:text-[#FFEDE5]/90"}`}>
            {label}
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-white/10 px-2">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            : <div className="w-8 h-8 rounded-full bg-[#FF3E68] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">{initials}</div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#FFEDE5] truncate">{user?.name}</p>
            <p className="text-[10px] text-[#FFEDE5]/40">{user?.role}</p>
          </div>
          <button onClick={onLogout} className="text-[10px] text-[#FFEDE5]/30 hover:text-[#FFEDE5]/70 transition-colors">Out</button>
        </div>
      </div>
    </aside>
  );
}

export default function Timetable() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  const isAdmin = user?.role === "admin";

  const [timetables, setTimetables]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterClass, setFilterClass]   = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [formData, setFormData]         = useState({ className: "", section: "", label: "", periods: [emptyPeriod()] });
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const params = { schoolCode: user.school?.code };
      if (filterClass) params.className = filterClass;
      if (filterSection) params.section = filterSection;
      const res = await getTimetables(params);
      setTimetables(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTimetables();
  }, [filterClass, filterSection]);

  const addPeriod = () => setFormData((prev) => ({ ...prev, periods: [...prev.periods, emptyPeriod()] }));
  const removePeriod = (index) => setFormData((prev) => ({ ...prev, periods: prev.periods.filter((_, i) => i !== index) }));
  const updatePeriod = (index, field, value) => {
    const updated = [...formData.periods];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, periods: updated }));
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!formData.className || !formData.section || !formData.label) return setError("Class, section, and label are required.");
    if (formData.periods.some((p) => !p.timeSlot)) return setError("Each period must have a time slot.");
    setSubmitting(true);
    try {
      await createTimetable({ ...formData, schoolCode: user.school?.code });
      setSuccess("Timetable created successfully!");
      setFormData({ className: "", section: "", label: "", periods: [emptyPeriod()] });
      setShowForm(false);
      fetchTimetables();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create timetable.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timetable?")) return;
    try {
      await deleteTimetable(id);
      setTimetables((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Failed to delete timetable.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF6F1] dark:bg-[#140f0c]">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#20160F] dark:text-[#FFEDE5]">Class Timetables</h1>
            <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/40 mt-0.5">
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm((prev) => !prev)}
              className="h-9 px-4 bg-[#20160F] dark:bg-[#FF3E68] rounded-lg text-xs font-medium text-white hover:bg-[#FF3E68] transition-colors">
              {showForm ? "Cancel" : "+ Create Timetable"}
            </button>
          )}
        </div>

        {success && <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-xs">{success}</div>}

        {isAdmin && showForm && (
          <div className="mb-8 bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium text-[#20160F] dark:text-[#FFEDE5] mb-4">New Timetable</h2>
            {error && <div className="mb-3 p-2 rounded bg-red-100 text-red-600 text-xs">{error}</div>}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {["className", "section", "label"].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[#20160F]/60 dark:text-[#FFEDE5]/50 mb-1 capitalize">{field === "className" ? "Class" : field}</label>
                  <input type="text"
                    placeholder={field === "className" ? "e.g. Class 10" : field === "section" ? "e.g. A" : "e.g. Term 1"}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-[#FFEDE5] dark:border-white/10 bg-[#FFF6F1] dark:bg-[#140f0c] text-xs text-[#20160F] dark:text-[#FFEDE5] focus:outline-none focus:border-[#FF3E68]"
                  />
                </div>
              ))}
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#20160F] text-white">
                    <th className="px-3 py-2 text-left rounded-tl-lg">Time Slot</th>
                    {DAY_LABELS.map((d) => <th key={d} className="px-3 py-2 text-left">{d}</th>)}
                    <th className="px-3 py-2 rounded-tr-lg" />
                  </tr>
                </thead>
                <tbody>
                  {formData.periods.map((period, index) => (
                    <tr key={index} className="border-b border-[#FFEDE5] dark:border-white/10">
                      <td className="px-2 py-1">
                        <input type="text" placeholder="9:00-10:00" value={period.timeSlot}
                          onChange={(e) => updatePeriod(index, "timeSlot", e.target.value)}
                          className="w-full h-7 px-2 rounded border border-[#FFEDE5] dark:border-white/10 bg-[#FFF6F1] dark:bg-[#140f0c] text-xs text-[#20160F] dark:text-[#FFEDE5] focus:outline-none focus:border-[#FF3E68]" />
                      </td>
                      {DAYS.map((day) => (
                        <td key={day} className="px-2 py-1">
                          <input type="text" placeholder="Subject" value={period[day]}
                            onChange={(e) => updatePeriod(index, day, e.target.value)}
                            className="w-full h-7 px-2 rounded border border-[#FFEDE5] dark:border-white/10 bg-[#FFF6F1] dark:bg-[#140f0c] text-xs text-[#20160F] dark:text-[#FFEDE5] focus:outline-none focus:border-[#FF3E68]" />
                        </td>
                      ))}
                      <td className="px-2 py-1 text-center">
                        {formData.periods.length > 1 && (
                          <button onClick={() => removePeriod(index)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <button onClick={addPeriod}
                className="h-8 px-4 rounded-lg border border-[#FF3E68] text-xs text-[#FF3E68] hover:bg-[#FF3E68]/10 transition-colors">
                + Add Period
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="h-8 px-4 rounded-lg bg-[#20160F] dark:bg-[#FF3E68] text-xs font-medium text-white hover:bg-[#FF3E68] transition-colors disabled:opacity-40">
                {submitting ? "Saving..." : "Save Timetable"}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <input type="text" placeholder="Filter by class..." value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#FFEDE5] dark:border-white/10 bg-white dark:bg-[#1a130e] text-xs text-[#20160F] dark:text-[#FFEDE5] focus:outline-none focus:border-[#FF3E68]" />
          <input type="text" placeholder="Filter by section..." value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#FFEDE5] dark:border-white/10 bg-white dark:bg-[#1a130e] text-xs text-[#20160F] dark:text-[#FFEDE5] focus:outline-none focus:border-[#FF3E68]" />
        </div>

        {loading ? (
          <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 text-center py-12">Loading timetables...</p>
        ) : timetables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">No timetables found.{isAdmin && " Create one above."}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {timetables.map((tt) => (
              <div key={tt._id} className="rounded-xl border border-[#FFEDE5] dark:border-white/10 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 bg-[#20160F]">
                  <div>
                    <span className="text-white font-medium text-sm">{tt.className} — Section {tt.section}</span>
                    <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-[#FF3E68] text-white">{tt.label}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(tt._id)} className="text-xs text-red-300 hover:text-red-100">Delete</button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FFEDE5] dark:bg-[#1a130e]">
                        <th className="px-4 py-2 text-left font-medium text-[#20160F] dark:text-[#FFEDE5]">Time</th>
                        {DAY_LABELS.map((d) => <th key={d} className="px-4 py-2 text-left font-medium text-[#20160F] dark:text-[#FFEDE5]">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tt.periods.map((period, idx) => (
                        <tr key={idx} className={`border-t border-[#FFEDE5] dark:border-white/5 ${idx % 2 === 0 ? "bg-white dark:bg-[#1a130e]" : "bg-[#f9feff] dark:bg-[#0a1e35]"}`}>
                          <td className="px-4 py-2 font-medium text-[#FF3E68] whitespace-nowrap">{period.timeSlot}</td>
                          {DAYS.map((day) => (
                            <td key={day} className="px-4 py-2 text-[#20160F] dark:text-[#FFEDE5]/70">
                              {period[day] || <span className="text-[#20160F]/20 dark:text-white/20">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}