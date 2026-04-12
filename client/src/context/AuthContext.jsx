import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshInterval = useRef(null);

  const storeToken = (token) => {
    setAccessToken(token);
    window.__accessToken = token;
  };

  // Auto-refresh token 1 min before expiry (every 14 min)
  const startRefreshTimer = () => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);
    refreshInterval.current = setInterval(async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {}, { withCredentials: true });
        storeToken(res.data.accessToken);
      } catch {
        setUser(null);
        storeToken(null);
      }
    }, 14 * 60 * 1000);
  };

  // On app load — try to restore session silently
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {}, { withCredentials: true });
        storeToken(res.data.accessToken);
        const meRes = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${res.data.accessToken}` },
        });
        setUser(meRes.data.user);
        startRefreshTimer();
      } catch {
        setUser(null);
        storeToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
    return () => clearInterval(refreshInterval.current);
  }, []);

  const register = async (name, email, phone, password) => {
    const res = await api.post("/api/auth/register", { name, email, phone, password });
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    storeToken(res.data.accessToken);
    setUser(res.data.user);
    startRefreshTimer();
    return res.data;
  };

  const logout = async () => {
    try { await api.post("/api/auth/logout"); } catch {}
    setUser(null);
    storeToken(null);
    clearInterval(refreshInterval.current);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
