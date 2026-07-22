import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) { navigate("/login"); return; }

    localStorage.setItem("token", token);

    api.get("/auth/profile")
      .then(res => {
        setUser(res.data);
        // Google users may not have a school yet — send to register to pick one
        if (!res.data.school) {
          navigate("/register?google=true");
        } else {
          navigate("/dashboard");
        }
      })
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF6F1] flex items-center justify-center">
      <p className="text-sm text-[#20160F]/50">Signing you in...</p>
    </div>
  );
}