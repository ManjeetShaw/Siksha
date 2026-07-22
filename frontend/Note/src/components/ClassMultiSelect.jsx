import { useState, useEffect, useCallback } from "react";
import { fetchMySchoolClasses } from "../services/api";

function ClassMultiSelect({ value = [], onChange }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMySchoolClasses()
            .then(res => {
                console.log("API response:", res.data); // ← check this in browser console
                setClasses(res.data.classes);
            })
            .catch((err) => {
                console.log("API error:", err.response?.data); // ← check this too
                setClasses([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggle = useCallback((e, cls) => {
        e.preventDefault();      // prevent any form interaction
        e.stopPropagation();     // stop bubbling to modal backdrop

        const updated = value.includes(cls)
            ? value.filter(c => c !== cls)
            : [...value, cls];

        onChange(updated);
    }, [value, onChange]);

    const selectAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange([...classes]);
    };

    const clearAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange([]);
    };

    if (loading) return <p className="text-xs text-[#20160F]/40">Loading classes...</p>;
    if (classes.length === 0) return <p className="text-xs text-red-400">No classes found for this school.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-[#20160F] tracking-wide">
                    Target Classes
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={selectAll}
                        className="text-[10px] text-[#FF3E68] hover:underline"
                    >
                        Select All
                    </button>
                    <span className="text-[10px] text-[#20160F]/30">|</span>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-[10px] text-[#20160F]/40 hover:underline"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {classes.map(cls => {
                    const isSelected = value.includes(cls);
                    return (
                        <button
                            key={cls}
                            type="button"
                            onClick={(e) => toggle(e, cls)}
                            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${isSelected
                                    ? "bg-[#20160F] text-white border-[#20160F]"
                                    : "bg-[#FFF6F1] text-[#20160F]/60 border-[#FFEDE5] hover:border-[#FF3E68]/40 hover:text-[#FF3E68]"
                                }`}
                        >
                            {cls}
                        </button>
                    );
                })}
            </div>

            <p className="text-[10px] text-[#20160F]/35 mt-1.5">
                {value.length === 0
                    ? "No classes selected — visible to everyone in the school."
                    : `Visible to: ${value.join(", ")}`}
            </p>
        </div>
    );
}

export default ClassMultiSelect;