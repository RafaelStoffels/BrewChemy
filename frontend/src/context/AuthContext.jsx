import React, {
  createContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { me } from '../services/users';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (userData) => {
    try {
      const userInfo = await me(userData.token);
      const fullUser = { ...userInfo, token: userData.token };

      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      return true;
    } catch (err) {
      console.error('Error trying to get user info:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
