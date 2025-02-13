import React, { createContext, useState, useContext, useEffect } from 'react';

// Criando o contexto
const SidebarContext = createContext();

// Hook para acessar o contexto
export const useSidebar = () => useContext(SidebarContext);

// Provedor do contexto
export const SidebarProvider = ({ children }) => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const storedState = sessionStorage.getItem('isInventoryOpen');
    if (storedState !== null) {
      setIsInventoryOpen(JSON.parse(storedState));
    }
    setLoading(false);
  }, []);

  const resetSidebarState = () => {
    setIsInventoryOpen(false); // Resetando o estado do submenu
    localStorage.removeItem('isInventoryOpen'); // Limpando o localStorage, se necessário
  };

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem('isInventoryOpen', JSON.stringify(isInventoryOpen));
    }
  }, [isInventoryOpen, loading]);

  if (loading) return null; // Evita renderizar qualquer coisa antes do carregamento

  return (
    <SidebarContext.Provider value={{ isInventoryOpen, setIsInventoryOpen, resetSidebarState }}>
      {children}
    </SidebarContext.Provider>
  );
};