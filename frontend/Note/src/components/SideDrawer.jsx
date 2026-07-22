import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHome, FaStickyNote, FaLayerGroup, FaClock, FaBookmark, FaCalendarAlt,
  FaChalkboardTeacher, FaCog, FaSignOutAlt, FaTimes, FaMoon, FaSun, FaChevronDown,
} from "react-icons/fa";

const SideDrawer = ({ isOpen, onClose, onFilterChange = () => {} }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const handleLogout = () => { logout(); onClose(); navigate("/login"); };

  const handleFilter = (filter) => {
    const next = activeFilter === filter ? null : filter; // toggle off if same
    setActiveFilter(next);
    onFilterChange(next);
    onClose();
  };

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: FaHome },
    { label: "All notes", to: "/notes", icon: FaStickyNote },
    { label: "Flashcards", to: "/flashcards", icon: FaLayerGroup },
    { label: "Study timer", to: "/timer", icon: FaClock },
    { label: "Saved notes", to: "/saved", icon: FaBookmark },
    { label: "Timetable", to: "/timetable", icon: FaCalendarAlt },
    ...(user?.role === "admin"
      ? [{ label: "Manage subjects", to: "/admin/subjects", icon: FaChalkboardTeacher }]
      : []),
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-ink/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-[#1a130e] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with gradient */}
        <div className="bg-brand-gradient px-5 pt-6 pb-8 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute right-6 bottom-0 w-16 h-16 rounded-full bg-white/10" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <FaTimes size={13} />
          </button>

          <div className="flex items-center gap-3 relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-white/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center text-white font-semibold text-base flex-shrink-0 ring-2 ring-white/40">
                {(user?.name ?? "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name ?? "Welcome"}</p>
              <p className="text-white/70 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { onClose(); navigate("/profile"); }}
            className="mt-4 w-full bg-white/90 hover:bg-white text-brand-coral text-xs font-semibold py-2 rounded-full transition-colors"
          >
            Edit profile
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto brand-scroll">
          <p className="px-3 pb-1 text-[10px] font-semibold text-brand-ink/35 dark:text-white/30 tracking-[1.5px] uppercase">
            Menu
          </p>
          {navItems.map(({ label, to, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={label}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-gradient-soft text-brand-coral"
                    : "text-brand-ink/70 dark:text-white/60 hover:bg-brand-cream dark:hover:bg-white/5"
                }`}
              >
                <Icon size={15} className={isActive ? "text-brand-coral" : "text-brand-ink/35 dark:text-white/30"} />
                {label}
              </Link>
            );
          })}

          <div className="h-px bg-brand-ink/10 dark:bg-white/10 my-2" />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-cream dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              {theme === "light" ? <FaMoon size={14} className="text-brand-ink/35" /> : <FaSun size={14} className="text-brand-orange" />}
              <span className="text-sm font-medium text-brand-ink/70 dark:text-white/60">
                {theme === "light" ? "Dark mode" : "Light mode"}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-10 h-5 rounded-full relative transition-colors ${theme === "dark" ? "bg-brand-gradient" : "bg-brand-ink/15"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Filters */}
          <div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-cream dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaChevronDown size={12} className={`text-brand-ink/35 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                <span className="text-sm font-medium text-brand-ink/70 dark:text-white/60">Sort notes</span>
                {activeFilter && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gradient-soft text-brand-coral font-semibold">1</span>
                )}
              </div>
            </button>

            {filtersOpen && (
              <div className="ml-4 mt-1 border-l-2 border-brand-ink/10 dark:border-white/10 pl-3 flex flex-col gap-1">
                {[
                  { key: "newest", label: "Newest first" },
                  { key: "oldest", label: "Oldest first" },
                  { key: "subject", label: "By subject" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleFilter(key)}
                    className={`text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      activeFilter === key
                        ? "bg-brand-gradient-soft text-brand-coral font-semibold"
                        : "text-brand-ink/55 dark:text-white/45 hover:bg-brand-cream dark:hover:bg-white/5 hover:text-brand-ink dark:hover:text-white"
                    }`}
                  >
                    {label}
                    {activeFilter === key && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => { onClose(); navigate("/profile"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-cream dark:hover:bg-white/5 text-brand-ink/70 dark:text-white/60 transition-colors"
          >
            <FaCog size={14} className="text-brand-ink/35" />
            <span className="text-sm font-medium">Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors mt-auto"
          >
            <FaSignOutAlt size={14} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
