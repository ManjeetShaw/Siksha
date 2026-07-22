import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { fetchMyNotes, fetchUserDecks, generateFlashcards as generateFlashcardsApi, deleteDeck as deleteDeckApi } from "../services/api";
import {
  FaHome, FaStickyNote, FaLayerGroup, FaClock, FaBookmark, FaCalendarAlt,
  FaChalkboardTeacher, FaPlus, FaSearch, FaBars, FaBell, FaFire, FaTh,
  FaBookOpen, FaSignOutAlt,
} from "react-icons/fa";

// const subjects = ["Mathematics", "Biology", "History", "Physics"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
          <Link key={label} to={to} className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all ${active ? "bg-[#FF3E68]/20 text-[#FF3E68] border border-[#FF3E68]/30"
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

function FlipCard({ card, onKnow, onDontKnow }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => setFlipped(false), [card]);
  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="w-full max-w-lg min-h-56 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="relative w-full min-h-56 transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          <div className="absolute inset-0 bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-2xl flex flex-col items-center justify-center px-8 gap-3"
            style={{ backfaceVisibility: "hidden" }}>
            <span className="text-[10px] font-medium text-[#FF3E68] tracking-widest uppercase">Question</span>
            <p className="text-base font-medium text-[#20160F] dark:text-[#FFEDE5] text-center leading-relaxed">{card.front}</p>
            <span className="text-[10px] text-[#20160F]/25 dark:text-[#FFEDE5]/20 mt-2">Click to reveal answer</span>
          </div>
          <div className="absolute inset-0 bg-[#20160F] dark:bg-[#FF3E68]/20 border border-[#FF3E68]/30 rounded-2xl flex flex-col items-center justify-center px-8 py-6 gap-3"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <span className="text-[10px] font-medium text-[#FF3E68] tracking-widest uppercase">Answer</span>
            <p className="text-base text-[#FFEDE5] text-center leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>
      <div className={`flex gap-3 transition-opacity duration-300 ${flipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button onClick={onDontKnow}
          className="h-9 px-5 rounded-xl border border-red-200 dark:border-red-900/40 text-xs font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          ✕ Still learning
        </button>
        <button onClick={onKnow}
          className="h-9 px-5 rounded-xl bg-[#FF3E68] text-xs font-medium text-white hover:bg-[#20160F] transition-colors">
          ✓ Got it
        </button>
      </div>
    </div>
  );
}

function QuizCard({ card, onAnswer }) {
  const [chosen, setChosen] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setChosen(null);
    const distractors = (card.distractors ?? []).slice(0, 3);
    const all = shuffle([card.back, ...distractors]);
    setOptions(all);
  }, [card]);

  const pick = (opt) => {
    if (chosen) return;
    setChosen(opt);
    setTimeout(() => onAnswer(opt === card.back), 900);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      <div className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-2xl px-8 py-6 text-center">
        <span className="text-[10px] font-medium text-[#FF3E68] tracking-widest uppercase">Question</span>
        <p className="text-base font-medium text-[#20160F] dark:text-[#FFEDE5] mt-3 leading-relaxed">{card.front}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt, i) => {
          const isCorrect = opt === card.back;
          const isPicked = chosen === opt;
          let cls = "border border-[#FFEDE5] dark:border-white/10 bg-white dark:bg-[#1a130e] text-[#20160F] dark:text-[#FFEDE5] hover:border-[#FF3E68]/40";
          if (chosen) {
            if (isCorrect) cls = "border-[#FF3E68] bg-[#FFEDE5] dark:bg-[#FF3E68]/20 text-[#FF3E68]";
            else if (isPicked) cls = "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-400";
            else cls = "border-[#FFEDE5] dark:border-white/10 bg-white dark:bg-[#1a130e] text-[#20160F]/30 dark:text-white/20";
          }
          return (
            <button key={i} onClick={() => pick(opt)}
              className={`rounded-xl px-4 py-3 text-xs font-medium text-left transition-all ${cls}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProgressBar({ known, total }) {
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] text-[#20160F]/40 dark:text-[#FFEDE5]/30">{known}/{total} mastered</span>
        <span className="text-[10px] font-medium text-[#FF3E68]">{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#FFEDE5] dark:bg-white/10 rounded-full">
        <div className="h-full bg-[#FF3E68] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Flashcards() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // data
  const [notes, setNotes] = useState([]);
  const [decks, setDecks] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [decksLoading, setDecksLoading] = useState(true);

  // generation
  const [selectedNote, setSelectedNote] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [activeDeck, setActiveDeck] = useState(null);

  // study mode
  const [mode, setMode] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [known, setKnown] = useState(new Set());
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── accept deck navigated from NoteDetail ──────────────────────────────────
  useEffect(() => {
    if (location.state?.activeDeck) {
      setActiveDeck(location.state.activeDeck);
      setMode(null);
      setCardIdx(0);
      setKnown(new Set());
      setScore({ correct: 0, wrong: 0 });
      setFinished(false);
    }
  }, []);

  // ── fetch user's notes ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id ?? user.id;
    setNotesLoading(true);
    fetchMyNotes(userId)
      .then((r) => setNotes(r.data))
      .catch(console.error)
      .finally(() => setNotesLoading(false));
  }, [user?._id ?? user?.id]);

  // ── fetch saved decks ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id ?? user.id;
    setDecksLoading(true);
    fetchUserDecks(userId)
      .then((r) => setDecks(r.data))
      .catch(console.error)
      .finally(() => setDecksLoading(false));
  }, [user?._id ?? user?.id]);

  // ── AI generation via backend ───────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selectedNote) return;
    setGenerating(true);
    setGenError("");
    try {
      const res = await generateFlashcardsApi(selectedNote._id);
      setActiveDeck(res.data);
      setMode(null);
      setCardIdx(0);
      setKnown(new Set());
      setScore({ correct: 0, wrong: 0 });
      setFinished(false);
    } catch (err) {
      setGenError(err?.response?.data?.message ?? "Failed to generate flashcards. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── delete a saved deck ─────────────────────────────────────────────────────
  const handleDeleteDeck = async (deckId) => {
    try {
      await deleteDeckApi(deckId);
      setDecks((prev) => prev.filter((d) => d._id !== deckId));
      if (activeDeck?.deckId === deckId) setActiveDeck(null);
    } catch (err) { console.error(err); }
  };

  // ── study helpers ───────────────────────────────────────────────────────────
  const cards = activeDeck?.cards ?? [];
  const currentCard = cards[cardIdx];

  const nextCard = () => {
    if (cardIdx + 1 >= cards.length) setFinished(true);
    else setCardIdx((i) => i + 1);
  };

  const handleKnow = () => {
    setKnown((prev) => new Set([...prev, cardIdx]));
    nextCard();
  };
  const handleDontKnow = () => nextCard();

  const handleQuizAnswer = (correct) => {
    setScore((s) => correct
      ? { ...s, correct: s.correct + 1 }
      : { ...s, wrong: s.wrong + 1 }
    );
    if (correct) setKnown((prev) => new Set([...prev, cardIdx]));
    nextCard();
  };

  const restartStudy = () => {
    setCardIdx(0);
    setKnown(new Set());
    setScore({ correct: 0, wrong: 0 });
    setFinished(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FFF6F1] dark:bg-[#140f0c]">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="flex justify-between items-center mb-7">
          <div>
            <h1 className="text-xl font-medium text-[#20160F] dark:text-[#FFEDE5]">Flashcards</h1>
            <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/40 mt-0.5">
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {activeDeck && (
            <button onClick={() => { setActiveDeck(null); setMode(null); }}
              className="h-9 px-4 bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-lg text-xs text-[#20160F]/60 dark:text-[#FFEDE5]/50 hover:border-[#FF3E68]/40 transition-colors">
              ← Back to decks
            </button>
          )}
        </div>

        {!activeDeck ? (
          <div className="grid grid-cols-[1fr_300px] gap-5">
            <div className="flex flex-col gap-5">
              <div className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-6">
                <h2 className="text-sm font-medium text-[#20160F] dark:text-[#FFEDE5] mb-1">Generate from a note</h2>
                <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 mb-5">
                  Pick one of your notes and AI will create a full flashcard deck from it automatically.
                </p>
                {notesLoading ? (
                  <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">Loading your notes…</p>
                ) : notes.length === 0 ? (
                  <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">No notes found. Create a note first.</p>
                ) : (
                  <div className="flex flex-col gap-2 mb-5 max-h-64 overflow-y-auto pr-1">
                    {notes.map((note) => (
                      <button
                        key={note._id}
                        onClick={() => setSelectedNote(note)}
                        className={`text-left px-4 py-3 rounded-xl border text-xs transition-all ${selectedNote?._id === note._id
                            ? "border-[#FF3E68] bg-[#FFEDE5] dark:bg-[#FF3E68]/20 text-[#FF3E68]"
                            : "border-[#FFEDE5] dark:border-white/10 bg-[#FFF6F1] dark:bg-white/5 text-[#20160F]/70 dark:text-[#FFEDE5]/60 hover:border-[#FF3E68]/40"
                          }`}
                      >
                        <p className="font-medium truncate">{note.title}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{note.subject?.name ?? "No subject"}</p>
                      </button>
                    ))}
                  </div>
                )}
                {genError && (
                  <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {genError}
                  </p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!selectedNote || generating}
                  className="h-9 px-5 bg-[#20160F] dark:bg-[#FF3E68] rounded-lg text-xs font-medium text-white hover:bg-[#FF3E68] transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Generating flashcards…
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3.5">
                <h2 className="text-sm font-medium text-[#20160F] dark:text-[#FFEDE5]">Saved decks</h2>
                <span className="text-[10px] text-[#20160F]/30 dark:text-[#FFEDE5]/25">{decks.length} total</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {decksLoading ? (
                  <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">Loading decks…</p>
                ) : decks.length === 0 ? (
                  <div className="bg-white dark:bg-[#1a130e] border border-dashed border-[#FFEDE5] dark:border-white/10 rounded-xl px-4 py-5 text-center">
                    <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">No saved decks yet.</p>
                    <p className="text-[10px] text-[#20160F]/20 dark:text-[#FFEDE5]/15 mt-1">Generate one from a note above.</p>
                  </div>
                ) : (
                  decks.map((deck) => (
                    <div key={deck._id}
                      className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl px-4 py-3.5 hover:border-[#FF3E68]/40 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#20160F] dark:text-[#FFEDE5] truncate">{deck.title}</p>
                          <p className="text-[10px] text-[#20160F]/40 dark:text-[#FFEDE5]/30 mt-0.5">{deck.cards?.length ?? 0} cards</p>
                        </div>
                        <button onClick={() => handleDeleteDeck(deck._id)}
                          className="text-[10px] text-[#20160F]/20 dark:text-white/20 hover:text-red-400 transition-colors flex-shrink-0">✕</button>
                      </div>
                      <button
                        onClick={() => { setActiveDeck({ ...deck, deckId: deck._id }); setMode(null); setCardIdx(0); setKnown(new Set()); setScore({ correct: 0, wrong: 0 }); setFinished(false); }}
                        className="w-full h-7 rounded-lg bg-[#FFEDE5] dark:bg-[#FF3E68]/20 text-[10px] font-medium text-[#FF3E68] hover:bg-[#FF3E68] hover:text-white transition-colors"
                      >
                        Study now
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        ) : !mode ? (
          <div className="max-w-lg mx-auto flex flex-col items-center gap-6 pt-4">
            <div className="text-center">
              <h2 className="text-lg font-medium text-[#20160F] dark:text-[#FFEDE5]">{activeDeck.title}</h2>
              <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 mt-1">{cards.length} cards · choose a study mode</p>
            </div>
            <div className="w-full bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-2xl p-5 max-h-52 overflow-y-auto flex flex-col gap-2">
              {cards.map((c, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-[#FFEDE5] dark:border-white/5 last:border-0">
                  <span className="text-[10px] text-[#FF3E68] font-medium w-4 flex-shrink-0">{i + 1}</span>
                  <p className="text-xs text-[#20160F] dark:text-[#FFEDE5] flex-1">{c.front}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={() => setMode("flip")}
                className="py-4 rounded-2xl bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 hover:border-[#FF3E68]/40 transition-all flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-[#FFEDE5] dark:bg-[#FF3E68]/20 flex items-center justify-center group-hover:bg-[#FF3E68]/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3E68" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 4v16" /></svg>
                </div>
                <p className="text-xs font-medium text-[#20160F] dark:text-[#FFEDE5]">Flip cards</p>
                <p className="text-[10px] text-[#20160F]/35 dark:text-[#FFEDE5]/30 text-center px-2">Reveal answers at your own pace</p>
              </button>
              <button onClick={() => setMode("quiz")}
                className="py-4 rounded-2xl bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 hover:border-[#FF3E68]/40 transition-all flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-[#FFEDE5] dark:bg-[#FF3E68]/20 flex items-center justify-center group-hover:bg-[#FF3E68]/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3E68" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
                <p className="text-xs font-medium text-[#20160F] dark:text-[#FFEDE5]">Quiz mode</p>
                <p className="text-[10px] text-[#20160F]/35 dark:text-[#FFEDE5]/30 text-center px-2">Multiple choice, test yourself</p>
              </button>
            </div>
          </div>

        ) : finished ? (
          <div className="max-w-lg mx-auto flex flex-col items-center gap-6 pt-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFEDE5] dark:bg-[#FF3E68]/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3E68" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-medium text-[#20160F] dark:text-[#FFEDE5]">Session complete!</h2>
              <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 mt-1">{activeDeck.title}</p>
            </div>
            <div className="w-full grid grid-cols-3 gap-3">
              {[
                { label: "Cards studied", val: cards.length },
                mode === "quiz"
                  ? { label: "Correct", val: score.correct, color: "text-[#FF3E68]" }
                  : { label: "Mastered", val: known.size, color: "text-[#FF3E68]" },
                mode === "quiz"
                  ? { label: "Wrong", val: score.wrong, color: "text-red-400" }
                  : { label: "Learning", val: cards.length - known.size, color: "text-[#20160F] dark:text-[#FFEDE5]" },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-medium ${s.color ?? "text-[#20160F] dark:text-[#FFEDE5]"}`}>{s.val}</p>
                  <p className="text-[10px] text-[#20160F]/40 dark:text-[#FFEDE5]/30 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <ProgressBar known={mode === "quiz" ? score.correct : known.size} total={cards.length} />
            <div className="flex gap-3">
              <button onClick={restartStudy}
                className="h-9 px-5 border border-[#FFEDE5] dark:border-white/10 rounded-lg text-xs text-[#20160F]/60 dark:text-[#FFEDE5]/50 hover:border-[#FF3E68]/40 transition-colors">
                Study again
              </button>
              <button onClick={() => setMode(null)}
                className="h-9 px-5 bg-[#20160F] dark:bg-[#FF3E68] rounded-lg text-xs font-medium text-white hover:bg-[#FF3E68] transition-colors">
                Change mode
              </button>
            </div>
          </div>

        ) : (
          <div className="max-w-lg mx-auto flex flex-col items-center gap-5 pt-2">
            <div className="w-full flex items-center justify-between">
              <button onClick={() => setMode(null)} className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 hover:text-[#20160F] dark:hover:text-[#FFEDE5] transition-colors">
                ← {mode === "flip" ? "Flip cards" : "Quiz mode"}
              </button>
              <span className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30">{cardIdx + 1} / {cards.length}</span>
            </div>
            <ProgressBar known={mode === "quiz" ? score.correct : known.size} total={cards.length} />
            {mode === "flip"
              ? <FlipCard card={currentCard} onKnow={handleKnow} onDontKnow={handleDontKnow} />
              : <QuizCard card={currentCard} onAnswer={handleQuizAnswer} />
            }
          </div>
        )}
      </main>
    </div>
  );
}