import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHome, FaStickyNote, FaLayerGroup, FaClock, FaBookmark, FaCalendarAlt,
  FaChalkboardTeacher, FaPlus, FaSearch, FaBars, FaBell, FaFire, FaTh,
  FaBookOpen, FaSignOutAlt,
} from "react-icons/fa";


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
      {/* <p className="px-3 pt-5 pb-2 text-[10px] font-medium text-[#FFEDE5]/35 tracking-[1.5px] uppercase">Subjects</p>
      {subjects.map((s) => (
        <div key={s} className="mx-2 px-3 py-2 rounded-lg text-sm text-[#FFEDE5]/60 cursor-pointer hover:bg-white/10 hover:text-[#FFEDE5]/90 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />{s}
        </div>
      ))} */}
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

const MODES = ["Focus", "Short Break", "Long Break"];
const DEFAULT_DURATIONS = { Focus: 25, "Short Break": 5, "Long Break": 15 };

const getWeekKey = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `studySeconds_${now.getFullYear()}_W${weekNum}`;
};

export const getWeeklyStudyHours = () => {
  const key = getWeekKey();
  const seconds = parseInt(localStorage.getItem(key) || "0", 10);
  return parseFloat((seconds / 3600).toFixed(1));
};

const addStudySeconds = (secs) => {
  const key = getWeekKey();
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(current + secs));
};

export default function StudyTimer() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [editingDurations, setEditingDurations] = useState(false);
  const [draftDurations, setDraftDurations] = useState(DEFAULT_DURATIONS);

  const [mode, setMode] = useState("Focus");
  const [secondsLeft, setSecondsLeft] = useState(durations["Focus"] * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const intervalRef = useRef(null);
  const tickAccumRef = useRef(0);

  const clearTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const flushAccum = useCallback(() => {
    if (tickAccumRef.current > 0) {
      addStudySeconds(tickAccumRef.current);
      tickAccumRef.current = 0;
    }
  }, []);

  const tick = useCallback(() => {
    setSecondsLeft(prev => {
      if (prev <= 1) {
        clearTimer();
        setIsRunning(false);
        setSessionsCompleted(s => s + 1);
        if (mode === "Focus") { tickAccumRef.current += 1; flushAccum(); }
        return 0;
      }
      if (mode === "Focus") {
        tickAccumRef.current += 1;
        if (tickAccumRef.current % 60 === 0) flushAccum();
      }
      return prev - 1;
    });
  }, [clearTimer, flushAccum, mode]);

  useEffect(() => {
    if (isRunning) intervalRef.current = setInterval(tick, 1000);
    else { clearTimer(); if (mode === "Focus") flushAccum(); }
    return () => { clearTimer(); if (mode === "Focus") flushAccum(); };
  }, [isRunning, tick, clearTimer, flushAccum, mode]);

  useEffect(() => {
    const handleUnload = () => flushAccum();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [flushAccum]);

  const handleModeChange = (m) => {
    if (mode === "Focus") flushAccum();
    clearTimer(); setIsRunning(false); setMode(m);
    setSecondsLeft(durations[m] * 60);
  };

  const handleReset = () => {
    if (mode === "Focus") flushAccum();
    clearTimer(); setIsRunning(false);
    setSecondsLeft(durations[mode] * 60);
  };

  const saveDurations = () => {
    const validated = {
      Focus:        Math.max(1, Math.min(120, Number(draftDurations.Focus)        || 25)),
      "Short Break": Math.max(1, Math.min(60,  Number(draftDurations["Short Break"]) || 5)),
      "Long Break":  Math.max(1, Math.min(60,  Number(draftDurations["Long Break"])  || 15)),
    };
    setDurations(validated);
    setDraftDurations(validated);
    setEditingDurations(false);
    clearTimer(); setIsRunning(false);
    setSecondsLeft(validated[mode] * 60);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const totalDuration = durations[mode] * 60;
  const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;

  return (
    <div className="flex min-h-screen bg-[#FFF6F1] dark:bg-[#140f0c]">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col items-center justify-center p-8">

        <p className="text-[10px] tracking-[2.5px] uppercase text-[#20160F]/40 dark:text-[#FFEDE5]/30 mb-6">
          Study Timer
        </p>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-8 bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-1">
          {MODES.map(m => (
            <button key={m} onClick={() => handleModeChange(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m
                  ? "bg-[#FF3E68] text-white"
                  : "text-[#20160F]/50 dark:text-[#FFEDE5]/40 hover:text-[#20160F] dark:hover:text-[#FFEDE5]"
              }`}>
              {m}
            </button>
          ))}
        </div>

        {/* Circle timer */}
        <div className="relative w-48 h-48 mb-8">
          <svg width="192" height="192" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="96" cy="96" r="84" fill="none" stroke="#FFEDE5" strokeWidth="8" className="dark:stroke-white/10" />
            <circle cx="96" cy="96" r="84" fill="none" stroke="#FF3E68" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 84}`}
              strokeDashoffset={`${2 * Math.PI * 84 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-light text-[#20160F] dark:text-[#FFEDE5] tracking-tight">{minutes}:{seconds}</span>
            <span className="text-[10px] text-[#20160F]/40 dark:text-[#FFEDE5]/30 mt-1 tracking-widest uppercase">{mode}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={handleReset}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 text-[#20160F]/40 dark:text-[#FFEDE5]/30 hover:border-[#FF3E68]/40 transition-colors flex items-center justify-center text-base">
            ↺
          </button>
          <button onClick={() => setIsRunning(p => !p)}
            className="w-14 h-14 rounded-full bg-[#FF3E68] text-white font-semibold text-sm hover:bg-[#20160F] transition-colors flex items-center justify-center"
            style={{ boxShadow: "0 4px 14px rgba(44,144,155,0.4)" }}>
            {isRunning ? "II" : "▶"}
          </button>
          <div className="w-10" />
        </div>

        {/* Stats */}
        <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">
          {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""} completed today
        </p>
        <p className="text-[11px] text-[#20160F]/30 dark:text-[#FFEDE5]/20 mt-1">
          {getWeeklyStudyHours()} hrs studied this week
        </p>

        {/* Custom durations */}
        <div className="mt-8 w-full max-w-sm">
          {!editingDurations ? (
            <button onClick={() => { setDraftDurations(durations); setEditingDurations(true); }}
              className="w-full py-2 rounded-xl border border-dashed border-[#FFEDE5] dark:border-white/10 text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 hover:border-[#FF3E68]/40 hover:text-[#FF3E68] transition-all">
              ⏱ Customize durations
            </button>
          ) : (
            <div className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-medium text-[#20160F] dark:text-[#FFEDE5]">Set durations (minutes)</p>
              {MODES.map(m => (
                <div key={m} className="flex items-center justify-between">
                  <span className="text-xs text-[#20160F]/60 dark:text-[#FFEDE5]/50 w-24">{m}</span>
                  <input
                    type="number" min="1" max="120"
                    value={draftDurations[m]}
                    onChange={e => setDraftDurations(prev => ({ ...prev, [m]: e.target.value }))}
                    className="w-20 h-8 px-3 rounded-lg border border-[#FFEDE5] dark:border-white/10 bg-[#FFF6F1] dark:bg-[#140f0c] text-xs text-[#20160F] dark:text-[#FFEDE5] text-center focus:outline-none focus:border-[#FF3E68]"
                  />
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEditingDurations(false)}
                  className="flex-1 h-8 rounded-lg border border-[#FFEDE5] dark:border-white/10 text-xs text-[#20160F]/50 dark:text-[#FFEDE5]/40 hover:border-[#FF3E68]/40 transition-colors">
                  Cancel
                </button>
                <button onClick={saveDurations}
                  className="flex-1 h-8 rounded-lg bg-[#FF3E68] text-xs font-medium text-white hover:bg-[#20160F] transition-colors">
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}