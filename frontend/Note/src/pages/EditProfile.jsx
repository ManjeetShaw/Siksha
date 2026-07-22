import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { updateProfile, changePassword } from "../services/api";

const subjects = ["Mathematics", "Biology", "History", "Physics"];

async function uploadToCloudinary(file) {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env vars not set");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  return (await res.json()).secure_url;
}

export default function EditProfile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.name ?? "");
  const email = user?.email ?? "";
  // avatarPreview is only for showing a local preview before saving
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // The image to show: local preview first, then saved avatar from context, then null
  const displayAvatar = avatarPreview ?? user?.avatar ?? null;
  const initials = (user?.name ?? "R").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSaveProfile = async () => {
    setSuccessMsg(""); setErrorMsg("");
    if (!name.trim()) { setErrorMsg("Name cannot be empty."); return; }
    setSaving(true);
    try {
      let avatarUrl = user?.avatar ?? "";
      if (avatarFile) {
        avatarUrl = await uploadToCloudinary(avatarFile);
        setAvatarFile(null);
        setAvatarPreview(null); // clear local preview — context now has the real URL
      }
      const userId = user._id ?? user.id;
      await updateProfile(userId, { name: name.trim(), avatar: avatarUrl });
      // Update context — this propagates to Navbar, Dashboard sidebar everywhere
      setUser((prev) => ({ ...prev, name: name.trim(), avatar: avatarUrl }));
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwSuccess(""); setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("Please fill all password fields."); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
    if (newPw.length < 8 || !/[A-Za-z]/.test(newPw) || !/\d/.test(newPw)) {
      setPwError("Password must be at least 8 characters and include both letters and numbers.");
      return;
    }
    setPwSaving(true);
    try {
      const userId = user._id ?? user.id;
      await changePassword(userId, { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess("Password changed successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwError(err?.response?.data?.message ?? "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "All notes", to: "/notes" },
    { label: "Flashcards", to: "/flashcards" },
    { label: "Study timer", to: "/timer" },
    { label: "Saved Notes", to: "/saved" },
    ...(user?.role === "admin" ? [{ label: "Manage Subjects", to: "/admin/subjects" }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-[#FFF6F1] dark:bg-[#140f0c]">

      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#20160F] dark:bg-[#1a130e] flex flex-col py-6">
        <div className="px-5 pb-6 border-b border-white/10 text-lg font-medium text-[#FFF6F1] tracking-[3px] uppercase">
          Siksha
        </div>
        <p className="px-3 pt-5 pb-2 text-[10px] font-medium text-[#FFEDE5]/35 tracking-[1.5px] uppercase">Main</p>
        {navItems.map(({ label, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={label} to={to}
              className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all ${
                isActive
                  ? "bg-[#FF3E68]/20 text-[#FF3E68] border border-[#FF3E68]/30"
                  : "text-[#FFEDE5]/60 hover:bg-white/10 hover:text-[#FFEDE5]/90"
              }`}
            >
              {label}
            </Link>
          );
        })}

        {/* Bottom user section — always reads from context so it stays in sync */}
        <div className="mt-auto pt-4 border-t border-white/10 px-2">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-[#FF3E68]/40" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FF3E68] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#FFEDE5] truncate">{user?.name ?? "Riya"}</p>
              <p className="text-[10px] text-[#FFEDE5]/40">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="text-[10px] text-[#FFEDE5]/30 hover:text-[#FFEDE5]/70 transition-colors">
              Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-x-hidden max-w-2xl">
        {/* Topbar */}
        <div className="flex items-center gap-3 mb-7">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 flex items-center justify-center text-[#20160F]/40 dark:text-white/40 hover:border-[#FF3E68]/40 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-medium text-[#20160F] dark:text-[#FFEDE5]">Profile & Settings</h1>
            <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/40 mt-0.5">Manage your account information</p>
          </div>
        </div>

        {/* Avatar + basic info */}
        <div className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-6 mb-4">
          <h2 className="text-sm font-medium text-[#20160F] dark:text-[#FFEDE5] mb-5">Profile Information</h2>

          <div className="flex items-center gap-5 mb-6">
            <div className="relative group">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Profile"
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#FFEDE5] dark:ring-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#FF3E68] flex items-center justify-center text-xl font-medium text-white">
                  {initials}
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-xl bg-[#20160F]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div>
              <p className="text-sm font-medium text-[#20160F] dark:text-[#FFEDE5]">{user?.name}</p>
              <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/40 mb-2">{user?.email}</p>
              <button onClick={() => fileRef.current?.click()} className="text-xs text-[#FF3E68] hover:underline">
                Change photo
              </button>
              {avatarFile && (
                <span className="ml-3 text-[10px] text-[#20160F]/40 dark:text-[#FFEDE5]/30">
                  {avatarFile.name} — not saved yet
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-[#20160F]/60 dark:text-[#FFEDE5]/50 mb-1.5">Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="w-full h-10 px-3 bg-[#FFF6F1] dark:bg-white/5 border border-[#FFEDE5] dark:border-white/10 rounded-lg text-sm text-[#20160F] dark:text-[#FFEDE5] placeholder:text-[#20160F]/25 dark:placeholder:text-[#FFEDE5]/20 outline-none focus:border-[#FF3E68]/60 transition-colors" />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[#20160F]/60 dark:text-[#FFEDE5]/50 mb-1.5">Email address</label>
            <input type="email" value={email} disabled readOnly placeholder="you@example.com"
              className="w-full h-10 px-3 bg-[#FFF6F1] dark:bg-white/5 border border-[#FFEDE5] dark:border-white/10 rounded-lg text-sm text-[#20160F]/50 dark:text-[#FFEDE5]/50 outline-none cursor-not-allowed" />
            <p className="text-[10px] text-[#20160F]/35 dark:text-[#FFEDE5]/30 mt-1.5">
              Email changes require re-verification and aren't supported from this page yet.
            </p>
          </div>

          {successMsg && (
            <p className="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-xs text-red-500 mb-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errorMsg}
            </p>
          )}

          <button onClick={handleSaveProfile} disabled={saving}
            className="h-9 px-5 bg-[#20160F] dark:bg-[#FF3E68] rounded-lg text-xs font-medium text-white hover:bg-[#FF3E68] dark:hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? (
              <><svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving…</>
            ) : "Save changes"}
          </button>
        </div>

        {/* Password card */}
        <div className="bg-white dark:bg-[#1a130e] border border-[#FFEDE5] dark:border-white/10 rounded-xl p-6 mb-4">
          <h2 className="text-sm font-medium text-[#20160F] dark:text-[#FFEDE5] mb-5">Change Password</h2>

          <div className="mb-3">
            <label className="block text-xs font-medium text-[#20160F]/60 dark:text-[#FFEDE5]/50 mb-1.5">Current password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-9 bg-[#FFF6F1] dark:bg-white/5 border border-[#FFEDE5] dark:border-white/10 rounded-lg text-sm text-[#20160F] dark:text-[#FFEDE5] placeholder:text-[#20160F]/25 outline-none focus:border-[#FF3E68]/60 transition-colors" />
              <button onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#20160F]/30 dark:text-white/30 hover:text-[#20160F]/60 transition-colors">
                {showPw
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-[#20160F]/60 dark:text-[#FFEDE5]/50 mb-1.5">New password</label>
            <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 bg-[#FFF6F1] dark:bg-white/5 border border-[#FFEDE5] dark:border-white/10 rounded-lg text-sm text-[#20160F] dark:text-[#FFEDE5] placeholder:text-[#20160F]/25 outline-none focus:border-[#FF3E68]/60 transition-colors" />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[#20160F]/60 dark:text-[#FFEDE5]/50 mb-1.5">Confirm new password</label>
            <input type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="••••••••"
              className={`w-full h-10 px-3 bg-[#FFF6F1] dark:bg-white/5 border rounded-lg text-sm text-[#20160F] dark:text-[#FFEDE5] placeholder:text-[#20160F]/25 outline-none transition-colors ${
                confirmPw && newPw !== confirmPw
                  ? "border-red-300 focus:border-red-400"
                  : "border-[#FFEDE5] dark:border-white/10 focus:border-[#FF3E68]/60"
              }`} />
            {confirmPw && newPw !== confirmPw && (
              <p className="text-[10px] text-red-400 mt-1">Passwords don't match</p>
            )}
          </div>

          {pwSuccess && (
            <p className="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {pwSuccess}
            </p>
          )}
          {pwError && (
            <p className="text-xs text-red-500 mb-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {pwError}
            </p>
          )}

          <button onClick={handleChangePassword} disabled={pwSaving}
            className="h-9 px-5 bg-[#20160F] dark:bg-[#FF3E68] rounded-lg text-xs font-medium text-white hover:bg-[#FF3E68] dark:hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {pwSaving ? (
              <><svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Updating…</>
            ) : "Update password"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white dark:bg-[#1a130e] border border-red-100 dark:border-red-900/30 rounded-xl p-6">
          <h2 className="text-sm font-medium text-red-500 mb-1">Danger Zone</h2>
          <p className="text-xs text-[#20160F]/40 dark:text-[#FFEDE5]/30 mb-4">
            Logging out will clear your session. Account deletion is permanent.
          </p>
          <button onClick={handleLogout}
            className="h-9 px-4 border border-[#FFEDE5] dark:border-white/10 rounded-lg text-xs text-[#20160F]/60 dark:text-[#FFEDE5]/50 hover:border-red-200 hover:text-red-400 transition-colors">
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}