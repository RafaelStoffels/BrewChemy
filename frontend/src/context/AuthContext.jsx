import React, {
  createContext, useState, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const updateUserLocal = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    logout,
    updateUserLocal,
  }), [user, login, logout, updateUserLocal]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
export default AuthContext;
