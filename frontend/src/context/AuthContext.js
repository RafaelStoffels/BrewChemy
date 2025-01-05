import React, { createContext, useState, useEffect } from 'react';

// Criação do contexto
const AuthContext = createContext();

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Recupera o token do localStorage, caso exista
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

// Função de login
  const login = (userData) => {
    console.log('Login iniciado:', userData); // Mensagem para verificar o que está sendo passado como userData
    
    setUser(userData);
    
    // Verifica se o userData contém o token e exibe no console
    if (userData && userData.token) {
      console.log('Token armazenado:', userData.token);
    } else {
      console.log('Token não encontrado no userData');
    }
    
    localStorage.setItem('user', JSON.stringify(userData)); // Armazena o userData no localStorage
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
