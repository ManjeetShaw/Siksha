import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyNotes, deleteNote, toggleSaveNote, fetchSavedNotes, fetchSubjects } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import CreateNoteModal from "../components/CreateNoteModal";
import SideDrawer from "../components/SideDrawer";
import {
  FaHome, FaStickyNote, FaLayerGroup, FaClock, FaBookmark, FaCalendarAlt,
  FaChalkboardTeacher, FaPlus, FaBars, FaSearch,
} from "react-icons/fa";

// Resolves P1-2 — every sidebar had an "All notes" / "Your Notes" link
// pointing to /notes, but no <Route path="/notes"> existed, so it 404'd.
const NotesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?._id ?? user?.id;

  const [notes, setNotes] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([fetchMyNotes(userId), fetchSavedNotes(), fetchSubjects()])
      .then(([notesRes, savedRes, subjectsRes]) => {
        setNotes(notesRes.data);
        setSavedIds(new Set(savedRes.data.map((n) => n._id)));
        setSubjects(subjectsRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = async (id) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const handleToggleSave = async (noteId) => {
    setSavingId(noteId);
    try {
      const res = await toggleSaveNote(noteId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.data.saved) next.add(noteId);
        else next.delete(noteId);
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredNotes = notes
    .filter((n) => !subjectFilter || n.subject?._id === subjectFilter)
    .filter((n) => !query.trim() || n.title.toLowerCase().includes(query.trim().toLowerCase()));

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: FaHome },
    { label: "All notes", to: "/notes", icon: FaStickyNote },
    { label: "Flashcards", to: "/flashcards", icon: FaLayerGroup },
    { label: "Study timer", to: "/timer", icon: FaClock },
    { label: "Saved Notes", to: "/saved", icon: FaBookmark },
    { label: "Timetables", to: "/timetable", icon: FaCalendarAlt },
    ...(user?.role === "admin" ? [{ label: "Manage Subjects", to: "/admin/subjects", icon: FaChalkboardTeacher }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-brand-cream dark:bg-[#140f0c] font-display">
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <aside className="hidden lg:flex w-[236px] flex-shrink-0 bg-white dark:bg-[#1a130e] flex-col py-6 border-r border-brand-ink/5 dark:border-white/5">
        <div className="px-5 pb-6 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-sm font-bold shadow-soft">S</span>
          <h3 className="text-lg font-extrabold text-brand-ink dark:text-white tracking-tight">Siksha</h3>
        </div>
        <div className="flex flex-col gap-1 px-3">
          {navItems.map(({ label, to, icon: Icon }) => {
            const isActive = to === "/notes";
            return (
              <Link
                key={label}
                to={to}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${isActive
                  ? "bg-brand-gradient text-white shadow-soft"
                  : "text-brand-ink/60 dark:text-white/55 hover:bg-brand-cream dark:hover:bg-white/5 hover:text-brand-ink dark:hover:text-white"
                  }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-brand-ink/30 dark:text-white/25"} />
                {label}
              </Link>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden pb-24 lg:pb-8">
        <div className="flex lg:hidden items-center justify-between px-5 pt-5 pb-2">
          <button onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1a130e] shadow-card flex items-center justify-center text-brand-ink dark:text-white">
            <FaBars size={15} />
          </button>
          <h3 className="text-base font-extrabold text-brand-ink dark:text-white tracking-tight">All notes</h3>
          <div className="w-10" />
        </div>

        <div className="px-5 lg:px-8 pt-4 lg:pt-7">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-brand-ink dark:text-white">All notes</h1>
              <p className="text-xs text-brand-ink/45 dark:text-white/40 mt-1">
                {notes.length} note{notes.length === 1 ? "" : "s"} total
              </p>
            </div>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowModal(true)}
                className="h-10 px-4 bg-brand-gradient rounded-full text-xs font-semibold text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-soft"
              >
                <FaPlus size={11} /> New note
              </button>
            )}
          </div>

          {/* Search + subject filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/25 dark:text-white/25" size={12} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your notes…"
                className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-brand-ink/10 dark:border-white/10 bg-white dark:bg-[#1a130e] text-sm text-brand-ink dark:text-white outline-none focus:border-brand-coral/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setSubjectFilter(null)}
              className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border ${subjectFilter === null
                ? "bg-brand-gradient text-white border-transparent shadow-soft"
                : "bg-white dark:bg-[#1a130e] text-brand-ink/55 dark:text-white/45 border-brand-ink/10 dark:border-white/10 hover:border-brand-coral/40 hover:text-brand-coral"
                }`}
            >
              All subjects
            </button>
            {subjects.map((s) => (
              <button
                key={s._id}
                onClick={() => setSubjectFilter(s._id)}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border ${subjectFilter === s._id
                  ? "bg-brand-gradient text-white border-transparent shadow-soft"
                  : "bg-white dark:bg-[#1a130e] text-brand-ink/55 dark:text-white/45 border-brand-ink/10 dark:border-white/10 hover:border-brand-coral/40 hover:text-brand-coral"
                  }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              <p className="text-xs text-brand-ink/40 dark:text-white/35 col-span-full">Loading notes...</p>
            ) : filteredNotes.length === 0 ? (
              <div className="bg-white dark:bg-[#1a130e] border border-dashed border-brand-ink/10 dark:border-white/10 rounded-2xl px-4 py-8 text-center col-span-full">
                <p className="text-xs text-brand-ink/40 dark:text-white/35">
                  {notes.length === 0 ? "No notes yet." : "No notes match your search."}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const saved = savedIds.has(note._id);
                return (
                  <div
                    key={note._id}
                    className="bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 rounded-2xl px-4 py-3.5 flex flex-col gap-2.5 hover:border-brand-coral/30 hover:shadow-card transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/notes/${note._id}`)}>
                        <p className="text-sm font-semibold text-brand-ink dark:text-white truncate">{note.title}</p>
                        <p className="text-xs text-brand-ink/45 dark:text-white/40 mt-0.5">
                          {note.subject?.name ?? "No subject"} · {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleSave(note._id)}
                        disabled={savingId === note._id}
                        title={saved ? "Remove bookmark" : "Bookmark note"}
                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all ${saved
                          ? "text-brand-coral bg-brand-gradient-soft"
                          : "text-brand-ink/20 dark:text-white/20 hover:text-brand-coral hover:bg-brand-gradient-soft"
                          } ${savingId === note._id ? "opacity-50" : ""}`}
                      >
                        <svg width="13" height="14" viewBox="0 0 13 14" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 1h9a1 1 0 0 1 1 1v10.5l-5-3-5 3V2a1 1 0 0 1 1-1z" />
                        </svg>
                      </button>
                    </div>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="self-end text-[10px] text-red-300 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <CreateNoteModal
          onClose={() => setShowModal(false)}
          onCreated={(newNote) => { setNotes((prev) => [newNote, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
};

export default NotesPage;
