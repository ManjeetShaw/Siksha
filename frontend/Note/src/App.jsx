import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import CreateNoteModal from "./components/CreateNoteModal";
import AdminSubjects from "./pages/AdminSubjects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NoteDetail from "./pages/NoteDetail.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import StudyTimer from "./pages/StudyTimer.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import GoogleCallback from "./pages/GoogleCallback.jsx";
import Timetable from "./pages/Timetable.jsx";

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about"          element={<About />} />
        <Route path="/contact"        element={<Contact />} />
        <Route path="/notes/new"      element={<CreateNoteModal />} />

        <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/saved"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/notes"          element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        <Route path="/notes/:id"      element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute><AdminSubjects /></ProtectedRoute>} />
        <Route path="/timer"          element={<ProtectedRoute><StudyTimer /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/flashcards"     element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/features"       element={<ProtectedRoute><Features /></ProtectedRoute>} />
        <Route path="/pricing"        element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/timetable"  element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
        <Route path="/auth/google" element={<GoogleCallback />} />
        <Route path="*"               element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ AuthProvider outermost — its loading spinner no longer
           remounts ThemeProvider, so theme state survives */}
      <AuthProvider>
        <ThemeProvider>
          <FilterProvider>
            <AppRoutes />
          </FilterProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}