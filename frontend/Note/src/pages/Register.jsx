import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { GOOGLE_OAUTH_URL } from "../services/api";

function generateSchoolCode(schoolName) {
  const prefix = schoolName.trim().slice(0, 3).toUpperCase().replace(/\s/g, "");
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [remember, setRemember] = useState(false);

  // Email verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // School state
  const [adminMode, setAdminMode] = useState("create");
  const [schoolName, setSchoolName] = useState("");
  const [classFrom, setClassFrom] = useState("1");
  const [classTo, setClassTo] = useState("12");
  const [schoolCode, setSchoolCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  // Required by the backend to create an admin account (P0-1) — shared
  // out-of-band by the operator/school, not generated in the browser.
  const [adminCode, setAdminCode] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  // FIX 1: Only generate a code on blur if one hasn't been generated yet.
  // Previously, onChange cleared generatedCode on every keystroke, so onBlur
  // would regenerate a NEW code — meaning the code shown ≠ code stored.
  const handleSchoolNameBlur = () => {
    if (schoolName.trim().length >= 2 && !generatedCode) {
      setGeneratedCode(generateSchoolCode(schoolName));
    }
  };

  // FIX 2: Allow regenerating code manually if the admin wants a new one.
  const handleRegenerateCode = () => {
    if (schoolName.trim().length >= 2) {
      setGeneratedCode(generateSchoolCode(schoolName));
      setCodeCopied(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ── Step 1: Send OTP to email ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError("Enter a valid email first");
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      await api.post("/auth/send-otp", { email });
      setOtpSent(true);
      setOtpSuccess("OTP sent! Check your inbox.");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }
    setVerifyingOtp(true);
    setOtpError("");
    try {
      const res = await api.post("/auth/verify-email-otp", { email, otp });
      setEmailVerified(true);
      setVerificationToken(res.data.verificationToken);
      setOtpSuccess("Email verified ✓");
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Step 3: Submit full form ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      setOtpError("Please verify your email first");
      return;
    }

    setSubmitError("");
    let payload = { name, email, password, role, verificationToken };

    if (role === "admin") {
      payload.adminCode = adminCode;
      if (adminMode === "create") {
        // FIX 3: Send the SAME generatedCode that was shown to the user.
        // Previously only schoolName + classRange were sent, so the backend
        // would generate its own code — which never matched what the user copied.
        if (!generatedCode) {
          setSubmitError("Please enter a school name to generate your school code.");
          return;
        }
        payload.schoolName = schoolName;
        payload.schoolCode = generatedCode; // ← THE KEY FIX
        payload.classRange = { from: parseInt(classFrom), to: parseInt(classTo) };
      } else {
        payload.schoolCode = schoolCode;
      }
    } else {
      payload.schoolCode = schoolCode;
    }

    try {
      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Registration failed");
    }
  };

  const classOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const isStudent = role === "student";
  const isAdminCreate = role === "admin" && adminMode === "create";
  const isAdminJoin = role === "admin" && adminMode === "join";

  return (
    <div className="flex min-h-screen bg-[#FFF6F1]">

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white border border-[#FFEDE5] rounded-2xl p-10 w-full max-w-md">

          <div className="mb-7">
            <h2 className="text-2xl font-medium text-[#20160F] mb-1">Welcome!</h2>
            <p className="text-sm text-[#20160F]/50">Create an account to save your notes</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
            </div>

            {/* Email + OTP inline */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-medium text-[#20160F] tracking-wide">
                Email address
              </label>

              {/* Email row */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Reset verification if email changes
                    if (emailVerified || otpSent) {
                      setEmailVerified(false);
                      setOtpSent(false);
                      setOtp("");
                      setOtpSuccess("");
                      setOtpError("");
                      setVerificationToken("");
                    }
                  }}
                  placeholder="you@example.com"
                  required
                  disabled={emailVerified}
                  className={`flex-1 h-10 border rounded-lg px-3.5 text-sm text-[#20160F] outline-none transition-colors placeholder:text-[#20160F]/30 ${emailVerified
                      ? "bg-[#FFEDE5]/60 border-[#FF3E68]/40 text-[#FF3E68]"
                      : "bg-[#FFF6F1] border-[#FFEDE5] focus:border-[#FF3E68] focus:bg-white"
                    }`}
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !email}
                    className="h-10 px-3.5 rounded-lg text-xs font-medium bg-[#20160F] text-white hover:bg-[#FF3E68] transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                  </button>
                )}
                {emailVerified && (
                  <div className="h-10 px-3.5 rounded-lg text-xs font-medium bg-[#FFEDE5] text-[#FF3E68] flex items-center gap-1.5 flex-shrink-0 border border-[#FF3E68]/30">
                    ✓ Verified
                  </div>
                )}
              </div>

              {/* OTP input row — appears after OTP is sent */}
              {otpSent && !emailVerified && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="flex-1 h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors font-mono tracking-widest placeholder:text-[#20160F]/30 placeholder:font-sans placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length < 6}
                    className="h-10 px-3.5 rounded-lg text-xs font-medium bg-[#FF3E68] text-white hover:bg-[#FF3E68]/80 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {verifyingOtp ? "Checking..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {/* Feedback messages */}
              {otpError && <p className="text-[10px] text-red-400">{otpError}</p>}
              {otpSuccess && <p className="text-[10px] text-[#FF3E68]">{otpSuccess}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={8}
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
              <p className="text-[10px] text-[#20160F]/35 mt-1.5">
                At least 8 characters, with letters and numbers.
              </p>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                Select Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setSchoolCode("");
                    setSchoolName("");
                    setGeneratedCode("");
                  }}
                  className="w-full h-10 appearance-none border border-[#FFEDE5] rounded-lg px-3.5 pr-10 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#20160F]/60">▼</div>
              </div>
            </div>

            {/* Student school code */}
            {isStudent && (
              <div>
                <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                  School Code
                </label>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DPS-2025-XK9"
                  required
                  className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30 font-mono tracking-widest"
                />
                <p className="text-[10px] text-[#20160F]/35 mt-1.5">
                  Ask your school admin for this code.
                </p>
              </div>
            )}

            {/* Admin toggle */}
            {role === "admin" && (
              <div>
                <label className="block text-xs font-medium text-[#20160F] mb-2 tracking-wide">I want to…</label>
                <div className="flex gap-2 mb-4">
                  {[{ val: "create", label: "Create a new school" }, { val: "join", label: "Join existing school" }].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setAdminMode(val); setSchoolCode(""); setSchoolName(""); setGeneratedCode(""); }}
                      className={`flex-1 h-9 rounded-lg text-xs font-medium border transition-all ${adminMode === val
                          ? "bg-[#20160F] text-white border-[#20160F]"
                          : "bg-[#FFF6F1] text-[#20160F]/60 border-[#FFEDE5] hover:border-[#FF3E68]/40"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Admin accounts require a shared secret code so anyone can't
                    grant themselves admin just by picking it in this dropdown. */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Admin Signup Code</label>
                  <input
                    type="text"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Provided by your institution"
                    required
                    className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
                  />
                  <p className="text-[10px] text-[#20160F]/35 mt-1.5">
                    Ask your organization for this code — required to create an admin account.
                  </p>
                </div>

                {isAdminCreate && (
                  <div className="flex flex-col gap-4 bg-[#FFF6F1] rounded-xl p-4 border border-[#FFEDE5]">
                    <div>
                      <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">School Name</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => {
                          setSchoolName(e.target.value);
                          // FIX: Don't clear generatedCode on every keystroke.
                          // Only clear it if the user actually blanks the field,
                          // so the code shown to the user stays stable.
                          if (!e.target.value.trim()) {
                            setGeneratedCode("");
                          }
                        }}
                        onBlur={handleSchoolNameBlur}
                        placeholder="e.g. Delhi Public School"
                        required
                        className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-white outline-none focus:border-[#FF3E68] transition-colors placeholder:text-[#20160F]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Class Range</label>
                      <div className="flex items-center gap-2">
                        {[{ val: classFrom, set: setClassFrom }, { val: classTo, set: setClassTo }].map((s, i) => (
                          <div key={i} className="relative flex-1">
                            <select value={s.val} onChange={(e) => s.set(e.target.value)}
                              className="w-full h-10 appearance-none border border-[#FFEDE5] rounded-lg px-3.5 pr-8 text-sm text-[#20160F] bg-white outline-none focus:border-[#FF3E68] cursor-pointer">
                              {classOptions.map((c) => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#20160F]/40 text-[10px]">▼</div>
                            {i === 0 && <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-xs text-[#20160F]/40">to</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {generatedCode && (
                      <div>
                        <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Your School Code</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-10 border border-[#FF3E68]/40 rounded-lg px-3.5 bg-[#FFEDE5]/60 flex items-center">
                            <span className="text-sm font-mono font-medium text-[#FF3E68] tracking-widest">{generatedCode}</span>
                          </div>
                          <button type="button" onClick={handleCopyCode}
                            className={`h-10 px-3.5 rounded-lg text-xs font-medium border transition-all flex-shrink-0 ${codeCopied ? "bg-[#FF3E68] text-white border-[#FF3E68]" : "bg-white text-[#20160F]/60 border-[#FFEDE5]"
                              }`}>
                            {codeCopied ? "Copied!" : "Copy"}
                          </button>
                          {/* FIX: Explicit regenerate button so user controls when a new code is made */}
                          <button type="button" onClick={handleRegenerateCode}
                            title="Generate a new code"
                            className="h-10 px-3 rounded-lg text-xs font-medium border border-[#FFEDE5] bg-white text-[#20160F]/40 hover:text-[#20160F]/70 transition-all flex-shrink-0">
                            ↻
                          </button>
                        </div>
                        <p className="text-[10px] text-[#20160F]/35 mt-1.5">Share this with your students. Click ↻ to generate a new code.</p>
                      </div>
                    )}
                  </div>
                )}

                {isAdminJoin && (
                  <div className="bg-[#FFF6F1] rounded-xl p-4 border border-[#FFEDE5]">
                    <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">School Code</label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DPS-2025-XK9"
                      required
                      className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-white outline-none focus:border-[#FF3E68] transition-colors placeholder:text-[#20160F]/30 font-mono tracking-widest"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Remember me */}
            <label className="flex items-center gap-2 text-xs text-[#20160F]/60 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#FF3E68] w-3.5 h-3.5" />
              Remember me
            </label>

            {submitError && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-500">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!emailVerified}
              className="w-full h-11 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-soft transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create Account
            </button>

            {!emailVerified && (
              <p className="text-[10px] text-center text-[#20160F]/35">
                Verify your email above to enable account creation
              </p>
            )}
          </form>

  
          <button
            type="button"
            onClick={() => window.location.href = GOOGLE_OAUTH_URL}
            className="w-full h-10 bg-white border border-[#FFEDE5] rounded-lg text-sm font-medium text-[#20160F] flex items-center justify-center gap-2 hover:border-[#FF3E68]/40 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-center text-[#20160F]/40 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[#FF3E68] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-[#20160F] flex-col justify-between p-12">
        <h1 className="text-xl font-medium text-[#FFF6F1] tracking-[3px] uppercase">Siksha</h1>
        <div>
          <p className="text-3xl font-medium text-[#FFF6F1] leading-snug mb-3">
            Study smarter.<br />Stay organised.<br />Ace every exam.
          </p>
          <p className="text-sm text-[#FFEDE5]/60 leading-relaxed mb-8">
            Your entire academic life, beautifully organised in one place.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { title: "Calculus — Integration by parts", lines: [100, 80, 60] },
              { title: "History — World War II timeline", lines: [80, 100] },
              { title: "Biology — Cell division phases", lines: [60, 80] },
            ].map((note) => (
              <div key={note.title} className="bg-white/[0.07] rounded-lg p-3 border-l-[3px] border-[#FF3E68]">
                <p className="text-xs font-medium text-[#FFEDE5] mb-2">{note.title}</p>
                <div className="flex flex-col gap-1">
                  {note.lines.map((w, i) => (
                    <div key={i} className="h-1 rounded-full bg-white/[0.13]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-[#FF3E68]/15 border border-[#FF3E68]/30 rounded-xl p-4">
            <p className="text-xs font-medium text-[#FF3E68] mb-1">🏫 School-based access</p>
            <p className="text-xs text-[#FFEDE5]/50 leading-relaxed">
              Admins create a school code. Students join with that code. Your notes stay private to your school.
            </p>
          </div>
        </div>
        <p className="text-xs text-[#FFEDE5]/30">© 2026 Siksha. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Register;