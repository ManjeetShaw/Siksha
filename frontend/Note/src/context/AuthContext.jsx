// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingVerification, setPendingVerification] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/auth/profile")
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
    };

    /**
     * register() now accepts a single payload object so the Register page
     * can pass any combination of fields (schoolCode, schoolName, classRange…)
     * without AuthContext needing to know the details.
     *
     * payload shape (examples):
     *   Student  → { name, email, password, role: "student", schoolCode }
     *   Admin/create → { name, email, password, role: "admin",
     *                    schoolName, classRange: { from, to }, schoolCode }
     *   Admin/join   → { name, email, password, role: "admin", schoolCode }
     */
    const register = async (payload) => {
        try {
            const res = await api.post("/auth/register", payload);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            if (res.data.requiresVerification) {
                setPendingVerification(true);
            }
            return res.data;
        } catch (err) {
            console.error("Register failed:", err.response?.data); // ← shows exact backend message
            throw err;
        }
    };
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, pendingVerification, setPendingVerification }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);