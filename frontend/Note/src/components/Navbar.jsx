import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import SearchBar from "./SearchBar";
import SideDrawer from "./SideDrawer";
import { useFilter } from "../context/FilterContext";

// Routes that render their own app-shell (sidebar / bottom nav) — the
// public marketing navbar shouldn't stack on top of those. Previously this
// only listed /dashboard and /saved, so every other authenticated page
// (timer, timetable, flashcards, notes/:id, admin/subjects, profile) showed
// both the marketing navbar AND the page's own sidebar (P1-3).
const APP_SHELL_PREFIXES = [
    "/dashboard",
    "/saved",
    "/notes",
    "/timer",
    "/timetable",
    "/flashcards",
    "/admin",
    "/profile",
];

function isAppShellRoute(pathname) {
    return APP_SHELL_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { setActiveFilter } = useFilter();

    const authPages = ["/login", "/register"];
    const hideAuthButtons = authPages.includes(location.pathname);
    const isAppShell = isAppShellRoute(location.pathname);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinkClass = ({ isActive }) =>
        `transition-colors duration-200 hover:text-brand-coral ${isActive ? "font-semibold text-brand-coral" : "text-brand-ink/70"}`;

    if (isAppShell) return null;

    return (
        <>
            <SideDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onFilterChange={setActiveFilter}
            />
            <div className="h-20 w-full flex items-center justify-between text-brand-ink px-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-brand-ink/5">

                {/* Left — Logo + Hamburger */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-brand-cream transition-colors"
                    >
                        <FaBars className="text-lg text-brand-ink/70" />
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">S</span>
                        <h3 className="font-display text-xl font-extrabold tracking-tight">siksha</h3>
                    </Link>
                </div>

                {/* Center — Search */}
                <SearchBar />

                {/* Nav Links */}
                <nav className="hidden md:flex gap-8 text-sm font-medium">
                    <NavLink to="/features" className={navLinkClass}>Features</NavLink>
                    <NavLink to="/about" className={navLinkClass}>About</NavLink>
                    <NavLink to="/pricing" className={navLinkClass}>Pricing</NavLink>
                    <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
                </nav>

                {/* Right — Auth Buttons */}
                <div className="flex items-center gap-3">
                    {loading ? null : user ? (
                        <>
                            <Link to="/profile" className="flex items-center gap-2 rounded-full hover:bg-brand-cream transition-colors p-1">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="avatar"
                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-brand-orange/30" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                                        {user?.name?.[0] ?? "R"}
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="h-9 px-4 font-semibold text-brand-ink border border-brand-ink/15 rounded-full text-sm hover:bg-brand-ink hover:text-white hover:border-brand-ink transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        !hideAuthButtons && (
                            <>
                                <Link
                                    to="/login"
                                    className="h-9 px-5 flex items-center justify-center font-semibold text-brand-ink/80 text-sm hover:text-brand-coral transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="h-9 px-5 flex items-center justify-center font-semibold text-white text-sm rounded-full bg-brand-gradient hover:opacity-90 transition-opacity shadow-soft"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )
                    )}
                </div>

                {/* Mobile Dropdown Menu */}
                {menuOpen && (
                    <div className="absolute top-20 left-0 w-full bg-white shadow-lg flex flex-col gap-4 px-6 py-4 md:hidden z-50">
                        <NavLink to="/features" className={navLinkClass} onClick={() => setMenuOpen(false)}>Features</NavLink>
                        <NavLink to="/about" className={navLinkClass} onClick={() => setMenuOpen(false)}>About</NavLink>
                        <NavLink to="/pricing" className={navLinkClass} onClick={() => setMenuOpen(false)}>Pricing</NavLink>
                        <NavLink to="/contact" className={navLinkClass} onClick={() => setMenuOpen(false)}>Contact Us</NavLink>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;
