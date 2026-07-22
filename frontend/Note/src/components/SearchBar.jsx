import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaSearch } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/student/note/search?q=${query}`);
                setResults(res.data);
                setShowDropdown(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div ref={ref} className="relative w-64">
            {/* Input */}
            <div className="flex items-center h-9 bg-[#FFF6F1] border border-[#FFEDE5] rounded-lg px-3 gap-2 focus-within:border-[#FF3E68] transition-colors">
                <span className="text-[#20160F]/30 text-sm">🔍</span>
                <input
                    id="navbar-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder="Search notes..."
                    className="flex-1 bg-transparent text-sm text-[#20160F] outline-none placeholder:text-[#20160F]/30"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
                        className="text-[#20160F]/30 hover:text-[#20160F]/60 text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Dropdown results */}
            {showDropdown && (
                <div className="absolute top-11 left-0 w-full bg-white border border-[#FFEDE5] rounded-xl shadow-lg z-50 overflow-hidden">
                    {loading ? (
                        <div className="px-4 py-3 text-xs text-[#20160F]/40">Searching...</div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-[#20160F]/40">No notes found</div>
                    ) : (
                        results.map((note) => (
                            <div
                                key={note._id}
                                onClick={() => {
                                    setShowDropdown(false);
                                    setQuery("");
                                    navigate(`/notes/${note._id}`);
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFF6F1] cursor-pointer border-b border-[#FFEDE5] last:border-0 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-md bg-[#FFEDE5] flex items-center justify-center flex-shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-[#FF3E68]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {/* Highlight matching text */}
                                    <p className="text-xs font-medium text-[#20160F] truncate">
                                        {note.title}
                                    </p>
                                    <p className="text-[10px] text-[#20160F]/40">
                                        {note.subject?.name}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;