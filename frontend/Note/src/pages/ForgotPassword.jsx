import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // email -> otp -> reset -> done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setInfo(res.data.message);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-reset-otp", { email, otp });
      setResetToken(res.data.resetToken);
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, newPassword, resetToken });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF6F1] p-8">
      <div className="bg-white border border-[#FFEDE5] rounded-2xl p-10 w-full max-w-md">
        <div className="mb-7">
          <h2 className="text-2xl font-medium text-[#20160F] mb-1">Reset your password</h2>
          <p className="text-sm text-[#20160F]/50">
            {step === "email" && "Enter your email and we'll send you a reset code."}
            {step === "otp" && "Enter the 6-digit code we sent to your email."}
            {step === "reset" && "Choose a new password."}
            {step === "done" && "All set."}
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {info && step === "otp" && (
          <p className="text-xs text-green-600 mb-4 bg-green-50 px-3 py-2 rounded-lg">{info}</p>
        )}

        {step === "email" && (
          <form onSubmit={handleSendCode} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-soft transition-opacity disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Reset code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-[#20160F]/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-11 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-soft transition-opacity disabled:opacity-50"
            >
              {loading ? "Checking…" : "Verify code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters, letters + numbers"
                minLength={8}
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-soft transition-opacity disabled:opacity-50"
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-[#20160F]/70">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-11 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-soft transition-opacity"
            >
              Go to login
            </button>
          </div>
        )}

        {step !== "done" && (
          <p className="text-center mt-6 text-xs text-[#20160F]/50">
            <Link to="/login" className="text-[#FF3E68] hover:underline">Back to login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
