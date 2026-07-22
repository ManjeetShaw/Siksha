import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // ✅ Wait for auth fetch to finish before making any decision
  if (loading) return null;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → go back to dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}