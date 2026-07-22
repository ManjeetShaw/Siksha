import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Used by Login/Register to build the Google OAuth redirect without
// hardcoding "localhost:5000" (P0-6) — derives from the same base URL
// the rest of the app already uses.
export const GOOGLE_OAUTH_URL = `${API_BASE}/auth/google`;

// ── attach token to every request automatically ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── handle 401 globally ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Notes ─────────────────────────────────────────────────────────────────────
export const fetchMyNotes        = (userId)      => api.get(`/student/note/user/${userId}`);
export const fetchNotesBySubject = (subjectId)   => api.get(`/student/note/subject/${subjectId}`);
export const fetchNoteById       = (id)          => api.get(`/student/note/${id}`);
export const createNote          = (data)        => api.post("/admin/note", data);
export const updateNote          = (id, data)    => api.put(`/admin/note/${id}`, data);
export const deleteNote          = (id)          => api.delete(`/admin/note/${id}`);

// ── Saved notes ───────────────────────────────────────────────────────────────
export const toggleSaveNote  = (noteId) => api.post(`/student/note/${noteId}/save`);
export const fetchSavedNotes = ()       => api.get(`/student/note/saved`);

// ── Flashcards ────────────────────────────────────────────────────────────────
export const generateFlashcards = (noteId)  => api.post("/flashcards/generate", { noteId });
export const fetchUserDecks     = (userId)  => api.get(`/flashcards/${userId}`);
export const deleteDeck         = (deckId)  => api.delete(`/flashcards/${deckId}`);

// ── Subjects ──────────────────────────────────────────────────────────────────
export const fetchSubjects    = ()          => api.get("/subjects");
export const createSubject    = (data)      => api.post("/subjects", data);
export const deleteSubject    = (id)        => api.delete(`/subjects/${id}`);

// ── Users ─────────────────────────────────────────────────────────────────────
export const updateProfile    = (id, data)  => api.put(`/users/${id}`, data);
export const changePassword   = (id, data)  => api.put(`/users/${id}/password`, data);

// ── Notices ───────────────────────────────────────────────────────────────────
export const fetchNotice   = (cls) => api.get("/notices",   { params: cls ? { class: cls } : {} });
export const createNotice = (data)  => api.post("/notices", data);
export const deleteNotice = (id)    => api.delete(`/notices/${id}`);

// ── Deadlines ─────────────────────────────────────────────────────────────────
export const fetchDeadline = (cls) => api.get("/deadlines", { params: cls ? { class: cls } : {} });
export const createDeadline = (data)  => api.post("/deadlines", data);
export const deleteDeadline = (id)    => api.delete(`/deadlines/${id}`);

// ── Streak ────────────────────────────────────────────────────────────────────
export const getStreak  = () => api.get("/streak");
export const pingStreak = () => api.post("/streak/ping");

// ── Schools ───────────────────────────────────────────────────────────────────
// GET /schools/mine        → returns the school the logged-in user belongs to
// GET /schools/code/:code  → validate a code before submit (optional live check)
// POST /schools            → create a new school (admin only, handled in /auth/register)
export const fetchMySchoolClasses = () => api.get("/schools/mine/classes");
export const fetchMySchool        = ()     => api.get("/schools/mine");
export const validateSchoolCode   = (code) => api.get(`/schools/code/${code}`);

// ── OTP ───────────────────────────────────────────────────────────────────
export const verifyOTPCall = (otp) => api.post("/auth/verify-otp", { otp });
export const resendOTPCall = () => api.post("/auth/resend-otp");

export default api;