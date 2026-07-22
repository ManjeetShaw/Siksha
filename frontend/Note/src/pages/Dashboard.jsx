import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyNotes, deleteNote, fetchSavedNotes, toggleSaveNote, fetchDeadline, createDeadline, deleteDeadline, fetchNotice, createNotice, deleteNotice, pingStreak, getStreak, fetchMySchoolClasses, fetchNotesBySubject } from "../services/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CreateNoteModal from "../components/CreateNoteModal";
import CreateDeadlineModal from "../components/CreateDeadlineModal";
import CreateNoticeModal from "../components/CreateNoticeModal";
import SideDrawer from "../components/SideDrawer";
import { useFilter } from "../context/FilterContext";
import { getWeeklyStudyHours } from "./StudyTimer";
import {
  FaHome, FaStickyNote, FaLayerGroup, FaClock, FaBookmark, FaCalendarAlt,
  FaChalkboardTeacher, FaPlus, FaSearch, FaBars, FaBell, FaFire, FaTh,
  FaBookOpen, FaSignOutAlt,
} from "react-icons/fa";

const tagColors = {
  teal: "bg-brand-gradient-soft text-brand-coral",
  navy: "bg-brand-ink/10 text-brand-ink dark:bg-white/10 dark:text-white",
  green: "bg-green-50 text-green-700",
};

const colorKeys = ["teal", "navy", "green"];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeFilter, setActiveFilter } = useFilter();

  const isSavedPage = location.pathname === "/saved";

  const [notes, setNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [notices, setNotices] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(true);
  const [streakLoading, setStreakLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [streak, setStreak] = useState({ streakCount: 0, longestStreak: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userId = user?._id ?? user?.id;

  useEffect(() => {
    if (!user?._id && !user?.id) return;

    setNotesLoading(true);
    setSavedLoading(true);
    setStreakLoading(true);
    setWeeklyHours(getWeeklyStudyHours());

    fetchMyNotes(userId)
      .then((res) => setNotes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setNotesLoading(false));

    fetchSavedNotes()
      .then((res) => setSavedNotes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setSavedLoading(false));

    // P2-11: pingStreak is a write and was firing on every single Dashboard
    // mount/tab-visit. The backend already no-ops server-side once a day,
    // but that still cost a round trip every time. Only actually ping once
    // per calendar day client-side; otherwise just read the current streak.
    const today = new Date().toDateString();
    const lastPing = localStorage.getItem("streakPingedOn");
    const streakCall = lastPing === today ? getStreak() : pingStreak();
    streakCall
      .then((res) => {
        setStreak(res.data);
        localStorage.setItem("streakPingedOn", today);
      })
      .catch(err => console.error(err))
      .finally(() => setStreakLoading(false));

    fetchMySchoolClasses()
      .then(res => {
        setClasses(res.data.classes);
        setSelectedClass(user.class || res.data.classes[0]);
      })
      .catch((err) => console.error(err));


  }, [userId]);

  useEffect(() => {
    if (selectedClass === undefined) return; // wait until initialized

    const params = selectedClass || undefined;

    fetchNotice(params)
      .then(res => setNotices(res.data))
      .catch(err => console.error("notices error:", err));

    fetchDeadline(params)
      .then(res => setDeadlines(res.data))
      .catch(err => console.error("deadlines error:", err));

  }, [selectedClass]);

  const [weeklyHours, setWeeklyHours] = useState(() => getWeeklyStudyHours());


  const handleNoteCreated = (newNote) => {
    setNotes((prev) => [newNote, ...prev]);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const handleToggleSave = async (noteId) => {
    setSavingId(noteId);
    try {
      const res = await toggleSaveNote(noteId);
      const { saved } = res.data;
      if (saved) {
        const noteToAdd = notes.find((n) => n._id === noteId);  // ← looks in `notes` only
        if (noteToAdd) setSavedNotes((prev) => [noteToAdd, ...prev]);
      } else {
        setSavedNotes((prev) => prev.filter((n) => n._id !== noteId));
      }
    } catch (err) {
      console.error(err);  // ← silent, you never see the error
    } finally {
      setSavingId(null);
    }
  };


  const handleDeadlineCreated = (d) => {
    setDeadlines(prev => [...prev, d].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
    setShowDeadlineModal(false);
  };

  const handleNoticeCreated = (n) => {
    setNotices(prev => [n, ...prev]);
    setShowNoticeModal(false);
  };

  const handleDeleteDeadline = async (id) => {
    await deleteDeadline(id);
    setDeadlines(prev => prev.filter(d => d._id !== id));
  };

  const handleDeleteNotice = async (id) => {
    await deleteNotice(id);
    setNotices(prev => prev.filter(n => n._id !== id));
  };

  const isNoteSaved = (noteId) => savedNotes.some((n) => n._id === noteId);
  const handleLogout = () => { logout(); navigate("/login"); };

  const isLoading = isSavedPage ? savedLoading : notesLoading;
  const sectionTitle = isSavedPage ? "Saved notes" : "Recent notes";
  const emptyMessage = isSavedPage ? "No bookmarked notes yet." : "No notes yet.";
  const emptySubMessage = isSavedPage ? "Click the bookmark icon on any note to save it here." : null;

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: FaHome },
    { label: "All notes", to: "/notes", icon: FaStickyNote },
    { label: "Flashcards", to: "/flashcards", icon: FaLayerGroup },
    { label: "Study timer", to: "/timer", icon: FaClock },
    { label: "Saved Notes", to: "/saved", icon: FaBookmark },
    { label: "Timetables", to: "/timetable", icon: FaCalendarAlt },
    ...(user?.role === "admin" ? [
      { label: "Manage Subjects", to: "/admin/subjects", icon: FaChalkboardTeacher },
      { label: "Add Deadline", to: "#", icon: FaBell, onClick: () => setShowDeadlineModal(true) },
      { label: "Add Notice", to: "#", icon: FaBell, onClick: () => setShowNoticeModal(true) },
    ] : []),
  ];

  // compact set used for the mobile bottom tab bar
  const bottomTabs = [
    { label: "Home", to: "/dashboard", icon: FaHome },
    { label: "Notes", to: "/notes", icon: FaStickyNote },
    { label: "Saved", to: "/saved", icon: FaBookmark },
  ];

  const studyStreakValue = streakLoading ? "..." : String(streak?.streakCount ?? 0);

  const filteredNotes = [...notes]
    .filter((n) => !selectedClass || n.class === selectedClass)  // ← add this line
    .sort((a, b) => {
      if (activeFilter === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (activeFilter === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (activeFilter === "subject") return (a.subject?.name ?? "").localeCompare(b.subject?.name ?? "");
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const recentNotes = showAllNotes ? filteredNotes : filteredNotes.slice(0, 4);
  const displayNotes = isSavedPage ? savedNotes : recentNotes;

  return (
    <div className="flex min-h-screen bg-brand-cream dark:bg-[#140f0c] font-display">

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onFilterChange={setActiveFilter}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[236px] flex-shrink-0 bg-white dark:bg-[#1a130e] flex-col py-6 border-r border-brand-ink/5 dark:border-white/5">
        <div className="px-5 pb-6 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-sm font-bold shadow-soft">S</span>
          <h3 className="text-lg font-extrabold text-brand-ink dark:text-white tracking-tight">Siksha</h3>
        </div>

        <p className="px-5 pt-3 pb-2 text-[10px] font-semibold text-brand-ink/35 dark:text-white/30 tracking-[1.5px] uppercase">Main</p>

        <div className="flex flex-col gap-1 px-3">
          {navItems.map(({ label, to, icon: Icon, onClick }) => {
            const isActive = location.pathname === to;
            return onClick ? (
              <button
                key={label}
                onClick={onClick}
                className="px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 text-brand-ink/60 dark:text-white/55 hover:bg-brand-cream dark:hover:bg-white/5 hover:text-brand-ink dark:hover:text-white transition-all w-full text-left"
              >
                <Icon size={14} className="text-brand-ink/30 dark:text-white/25" />
                {label}
              </button>
            ) : (
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

        <div className="mt-auto pt-4 border-t border-brand-ink/5 dark:border-white/5 px-3">
          <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-brand-cream dark:hover:bg-white/5 transition-colors">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-brand-orange/30" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {user?.name?.[0] ?? "R"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-ink dark:text-white truncate">{user?.name ?? "Riya"}</p>
              <p className="text-[10px] text-brand-ink/40 dark:text-white/35 capitalize">{user?.role}</p>
            </div>
            <button onClick={(e) => { e.preventDefault(); handleLogout(); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-ink/30 hover:text-red-500 hover:bg-red-50 dark:text-white/25 dark:hover:bg-red-900/20 transition-colors">
              <FaSignOutAlt size={12} />
            </button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden pb-24 lg:pb-8">

        {/* Mobile top bar */}
        <div className="flex lg:hidden items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1a130e] shadow-card flex items-center justify-center text-brand-ink dark:text-white"
          >
            <FaBars size={15} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">S</span>
            <h3 className="text-base font-extrabold text-brand-ink dark:text-white tracking-tight">Siksha</h3>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-[#1a130e] shadow-card">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-brand-ink dark:text-white">{user?.name?.[0] ?? "R"}</span>
            )}
          </Link>
        </div>

        <div className="px-5 lg:px-8 pt-4 lg:pt-7">

          {/* Hero / greeting gradient card */}
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-6 lg:py-7 mb-6 shadow-soft">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute right-16 -bottom-10 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="text-white/75 text-xs font-medium mb-1">Welcome back</p>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {user?.name?.split(" ")[0] ?? "there"} 👋
                </h1>
                <p className="text-white/70 text-xs mt-1.5">
                  {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const input = document.getElementById("navbar-search");
                    if (input) {
                      input.focus();
                      input.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else {
                      navigate("/notes");
                    }
                  }}
                  className="h-10 px-4 bg-white/15 hover:bg-white/25 backdrop-blur rounded-full text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <FaSearch size={11} /> Search notes
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="h-10 px-4 bg-white rounded-full text-xs font-semibold text-brand-coral flex items-center gap-1.5 hover:bg-white/90 transition-colors shadow-soft"
                  >
                    <FaPlus size={11} /> New note
                  </button>
                )}
              </div>
            </div>

            {/* mini stat chip like "claims in progress" */}
            <div className="relative mt-5 bg-white/95 rounded-2xl px-4 py-3 flex items-center gap-3 max-w-xs shadow-soft">
              <div className="w-9 h-9 rounded-full bg-brand-gradient-soft flex items-center justify-center flex-shrink-0">
                <FaFire size={14} className="text-brand-coral" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-ink truncate">
                  {streak.streakCount > 0
                    ? `${streak.streakCount} day study streak`
                    : "Start your streak today"}
                </p>
                <p className="text-[10px] text-brand-ink/45">Keep the momentum going</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total notes", val: notesLoading ? "..." : String(notes.length), sub: "+6 this week", icon: FaStickyNote },
              { label: "Saved notes", val: savedLoading ? "..." : String(savedNotes.length), sub: "Bookmarked", icon: FaBookmark },
              { label: "Study streak", val: studyStreakValue, sub: "Keep it up!", icon: FaFire },
              { label: "Hours this week", val: String(weeklyHours), sub: weeklyHours > 0 ? "from study timer" : "Start the timer!", icon: FaClock },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 rounded-2xl p-4 shadow-card">
                <div className="w-8 h-8 rounded-lg bg-brand-gradient-soft flex items-center justify-center mb-2.5">
                  <s.icon size={12} className="text-brand-coral" />
                </div>
                <p className="text-xl font-extrabold text-brand-ink dark:text-white leading-none">{s.val}</p>
                <p className="text-[11px] text-brand-ink/45 dark:text-white/40 mt-1.5">{s.label}</p>
                <p className="text-[10px] text-brand-coral font-medium mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick actions ("Services") */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-brand-ink dark:text-white mb-3">Quick access</h2>
            <div className="flex gap-4 overflow-x-auto brand-scroll pb-1">
              {[
                { label: "Flashcards", icon: FaLayerGroup, to: "/flashcards" },
                { label: "Study timer", icon: FaClock, to: "/timer" },
                { label: "Timetable", icon: FaCalendarAlt, to: "/timetable" },
                { label: "All notes", icon: FaBookOpen, to: "/notes" },
                { label: "Saved", icon: FaBookmark, to: "/saved" },
              ].map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <span className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 shadow-card flex items-center justify-center text-brand-coral hover:bg-brand-gradient-soft transition-colors">
                    <Icon size={16} />
                  </span>
                  <span className="text-[10px] font-medium text-brand-ink/60 dark:text-white/50 whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

            {/* Left col */}
            <div>

              {/* Class filter */}
              {!isSavedPage && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSelectedClass(null)}
                    className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border ${selectedClass === null
                      ? "bg-brand-gradient text-white border-transparent shadow-soft"
                      : "bg-white dark:bg-[#1a130e] text-brand-ink/55 dark:text-white/45 border-brand-ink/10 dark:border-white/10 hover:border-brand-coral/40 hover:text-brand-coral"
                      }`}
                  >
                    All classes
                  </button>

                  {classes.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border ${selectedClass === c
                        ? "bg-brand-gradient text-white border-transparent shadow-soft"
                        : "bg-white dark:bg-[#1a130e] text-brand-ink/55 dark:text-white/45 border-brand-ink/10 dark:border-white/10 hover:border-brand-coral/40 hover:text-brand-coral"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Notes section */}
              <div className="flex justify-between items-center mb-3.5">
                <h2 className="text-sm font-semibold text-brand-ink dark:text-white flex items-center gap-2">
                  {isSavedPage && <FaBookmark size={12} className="text-brand-coral" />}
                  {sectionTitle}
                  {activeFilter && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gradient-soft text-brand-coral font-semibold capitalize">
                      {activeFilter === "subject" ? "by subject" : activeFilter}
                    </span>
                  )}
                </h2>
                {!isSavedPage && (
                  <button
                    onClick={() => setShowAllNotes((prev) => !prev)}
                    className="text-xs text-brand-coral font-semibold hover:underline"
                  >
                    {showAllNotes ? "Show less" : "View all"}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {isLoading ? (
                  <p className="text-xs text-brand-ink/40 dark:text-white/35">
                    Loading {isSavedPage ? "saved" : ""} notes...
                  </p>
                ) : displayNotes.length === 0 ? (
                  <div className="bg-white dark:bg-[#1a130e] border border-dashed border-brand-ink/10 dark:border-white/10 rounded-2xl px-4 py-6 text-center">
                    <p className="text-xs text-brand-ink/40 dark:text-white/35">{emptyMessage}</p>
                    {emptySubMessage && (
                      <p className="text-[10px] text-brand-ink/25 dark:text-white/25 mt-1">{emptySubMessage}</p>
                    )}
                  </div>
                ) : (
                  displayNotes.map((note, i) => {
                    const colorKey = colorKeys[i % colorKeys.length];
                    const saved = isNoteSaved(note._id);
                    return (
                      <div
                        key={note._id}
                        className="bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 hover:border-brand-coral/30 hover:shadow-card transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${colorKey === "navy" ? "bg-brand-ink/10 dark:bg-white/10"
                          : colorKey === "green" ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-brand-gradient-soft"
                          }`}>
                          <FaStickyNote size={14} className={colorKey === "navy" ? "text-brand-ink/50 dark:text-white/40" : colorKey === "green" ? "text-green-500" : "text-brand-coral"} />
                        </div>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/notes/${note._id}`)}>
                          <p className="text-sm font-semibold text-brand-ink dark:text-white truncate">{note.title}</p>
                          <p className="text-xs text-brand-ink/45 dark:text-white/40">
                            {note.subject?.name ?? "No subject"} · {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${tagColors[colorKey]}`}>
                          {note.subject?.name?.split(" ")[0] ?? "Note"}
                        </span>

                        <button
                          onClick={() => handleToggleSave(note._id)}
                          disabled={savingId === note._id}
                          title={saved ? "Remove bookmark" : "Bookmark note"}
                          className={`ml-1 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${saved || isSavedPage
                            ? "text-brand-coral bg-brand-gradient-soft hover:bg-red-50 hover:text-red-400"
                            : "text-brand-ink/20 dark:text-white/20 hover:text-brand-coral hover:bg-brand-gradient-soft"
                            } ${savingId === note._id ? "opacity-50" : ""}`}
                        >
                          {saved || isSavedPage ? (
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor">
                              <path d="M2 1h9a1 1 0 0 1 1 1v10.5l-5-3-5 3V2a1 1 0 0 1 1-1z" />
                            </svg>
                          ) : (
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M2 1h9a1 1 0 0 1 1 1v10.5l-5-3-5 3V2a1 1 0 0 1 1-1z" />
                            </svg>
                          )}
                        </button>

                        {user?.role === "admin" && !isSavedPage && (
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="text-[10px] text-red-300 hover:text-red-500 transition-colors ml-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notice Board */}
              <div className="flex justify-between items-center mt-7 mb-3.5">
                <h2 className="text-sm font-semibold text-brand-ink dark:text-white">Notice board</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {notices.length === 0 ? (
                  <div className="bg-white dark:bg-[#1a130e] border border-dashed border-brand-ink/10 dark:border-white/10 rounded-2xl px-4 py-6 text-center">
                    <p className="text-xs text-brand-ink/40 dark:text-white/35">No notices posted yet.</p>
                  </div>
                ) : notices.map((n) => (
                  <div key={n._id} className="bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 rounded-2xl px-4 py-3.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-coral flex-shrink-0" />
                          <p className="text-sm font-semibold text-brand-ink dark:text-white">{n.title}</p>
                        </div>
                        <p className="text-xs text-brand-ink/55 dark:text-white/45 leading-relaxed pl-3.5">{n.content}</p>
                        <p className="text-[10px] text-brand-ink/30 dark:text-white/25 mt-2 pl-3.5">
                          {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteNotice(n._id)}
                          className="text-[10px] text-red-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right col */}
            <div>
              <div>
                <div className="flex justify-between items-center mb-3.5">
                  <h2 className="text-sm font-semibold text-brand-ink dark:text-white">Study streak</h2>
                </div>
                <div className="bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 rounded-2xl p-4 mb-5 shadow-card">
                  <div className="flex items-center gap-2 mb-1">
                    <FaFire className="text-brand-coral" size={18} />
                    <p className="text-3xl font-extrabold text-brand-ink dark:text-white leading-none">
                      {streak.streakCount}
                    </p>
                  </div>
                  <p className="text-xs text-brand-ink/45 dark:text-white/40 mt-1 mb-4">
                    {streak.streakCount === 0
                      ? "No streak yet — start today!"
                      : streak.streakCount === 1
                        ? "day streak — great start!"
                        : "day streak — keep going!"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 21 }).map((_, i) => {
                      const daysAgo = 20 - i;
                      const isToday = daysAgo === 0;
                      const isActive = daysAgo < streak.streakCount;

                      return (
                        <div
                          key={i}
                          title={isToday ? "Today" : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`}
                          className={`w-6 h-6 rounded-md transition-colors ${isToday && isActive
                            ? "bg-brand-ink dark:bg-white"
                            : isActive
                              ? "bg-brand-gradient"
                              : "bg-brand-ink/8 dark:bg-white/10"
                            }`}
                        />
                      );
                    })}
                  </div>
                  {streak.longestStreak > 0 && (
                    <p className="text-xs text-brand-ink/45 dark:text-white/40 mt-3">
                      Best streak: {streak.longestStreak} days
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Deadlines */}
              <div className="flex justify-between items-center mb-3.5">
                <h2 className="text-sm font-semibold text-brand-ink dark:text-white">Upcoming deadlines</h2>
              </div>
              <div className="bg-white dark:bg-[#1a130e] border border-brand-ink/5 dark:border-white/5 rounded-2xl p-4 flex flex-col shadow-card">
                {deadlines.length === 0 ? (
                  <p className="text-xs text-brand-ink/40 dark:text-white/35 text-center py-2">No deadlines yet.</p>
                ) : deadlines.map((d, i) => {
                  const date = new Date(d.dueDate);
                  const daysLeft = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={d._id}
                      className={`flex gap-3 py-3 items-start ${i < deadlines.length - 1 ? "border-b border-brand-ink/5 dark:border-white/5" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-gradient-soft flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-brand-coral leading-none">{date.getDate()}</span>
                        <span className="text-[9px] text-brand-coral/70 uppercase">
                          {date.toLocaleString("default", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-brand-ink dark:text-white">{d.title}</p>
                        <p className="text-xs text-brand-ink/45 dark:text-white/40 mt-0.5">
                          {d.subject} · {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Due today" : "Overdue"}
                        </p>
                      </div>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteDeadline(d._id)}
                          className="text-[10px] text-red-300 hover:text-red-500 transition-colors mt-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#1a130e] border-t border-brand-ink/5 dark:border-white/5 px-6 py-2.5 flex items-center justify-between shadow-[0_-4px_20px_-4px_rgba(32,22,15,0.08)]">
        {bottomTabs.map(({ label, to, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon size={18} className={isActive ? "text-brand-coral" : "text-brand-ink/35 dark:text-white/35"} />
              <span className={`text-[10px] font-medium ${isActive ? "text-brand-coral" : "text-brand-ink/35 dark:text-white/35"}`}>{label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1"
        >
          <FaTh size={16} className="text-brand-ink/35 dark:text-white/35" />
          <span className="text-[10px] font-medium text-brand-ink/35 dark:text-white/35">More</span>
        </button>
      </nav>

      {showModal && (
        <CreateNoteModal
          onClose={() => setShowModal(false)}
          onCreated={handleNoteCreated}
        />
      )}
      {showDeadlineModal && (
        <CreateDeadlineModal
          onClose={() => setShowDeadlineModal(false)}
          onCreated={handleDeadlineCreated}
        />
      )}
      {showNoticeModal && (
        <CreateNoticeModal
          onClose={() => setShowNoticeModal(false)}
          onCreated={handleNoticeCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;