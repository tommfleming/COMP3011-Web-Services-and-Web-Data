import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("shelfed_token"));
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsBootstrapping(false);
      return;
    }

    let ignore = false;

    api
      .getMe()
      .then((me) => {
        if (!ignore) {
          setUser(me);
        }
      })
      .catch(() => {
        localStorage.removeItem("shelfed_token");
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  async function login(credentials) {
    const data = await api.login(credentials);
    localStorage.setItem("shelfed_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    localStorage.setItem("shelfed_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.logout();
    } catch (_error) {
      // ignore backend logout issues and clear local auth anyway
    } finally {
      localStorage.removeItem("shelfed_token");
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      register,
      logout,
      refreshMe: async () => {
        const me = await api.getMe();
        setUser(me);
        return me;
      },
    }),
    [token, user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
