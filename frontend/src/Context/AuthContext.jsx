import {
  createContext, useState, useMemo, useCallback, useEffect, useContext,
} from "react";

const STORAGE_KEY = "user";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  updateUserLocal: () => {},
});

export function AuthProvider({ children }) {
  // Lazy init: carrega do localStorage na montagem
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Sincroniza storage sempre que user mudar (cobre uso de setUser externo)
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUserLocal = useCallback((partial) => {
    setUser((prev) => ({ ...(prev || {}), ...partial }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token: user?.token ?? null,
      isAuthenticated: !!user?.token,
      login,
      logout,
      updateUserLocal,
      setUser, // mantenha se o app já usa diretamente
    }),
    [user, login, logout, updateUserLocal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

// Helper opcional
export const useAuth = () => useContext(AuthContext);
