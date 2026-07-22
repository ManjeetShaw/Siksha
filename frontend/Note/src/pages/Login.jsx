import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GOOGLE_OAUTH_URL } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // P1-5: previously this only did console.error(err), so a failed
      // login (wrong password, locked account, etc.) gave the user zero
      // feedback — the form just silently sat there.
      setError(err.response?.data?.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF6F1]">

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
        </div>

        <p className="text-xs text-[#FFEDE5]/30">© 2026 Siksha. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white border border-[#FFEDE5] rounded-2xl p-10 w-full max-w-md">
          <div className="mb-7">
            <h2 className="text-2xl font-medium text-[#20160F] mb-1">Welcome back</h2>
            <p className="text-sm text-[#20160F]/50">Sign in to continue to your notes</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </p>
            )}
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs text-[#20160F]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-[#FF3E68] w-3.5 h-3.5"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs text-[#FF3E68] hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-soft transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#FFEDE5]" />
            <span className="text-xs text-[#20160F]/40">or continue with</span>
            <div className="flex-1 h-px bg-[#FFEDE5]" />
          </div>

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

          <p className="text-center mt-5 text-xs text-[#20160F]/50">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#FF3E68] hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;