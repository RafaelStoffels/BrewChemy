import React, {
  createContext, useState, useContext, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedState = sessionStorage.getItem('isInventoryOpen');
    if (storedState !== null) {
      setIsInventoryOpen(JSON.parse(storedState));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem('isInventoryOpen', JSON.stringify(isInventoryOpen));
    }
  }, [isInventoryOpen, loading]);

  const resetSidebarState = () => {
    setIsInventoryOpen(false);
    localStorage.removeItem('isInventoryOpen');
  };

  const contextValue = useMemo(() => ({
    isInventoryOpen,
    setIsInventoryOpen,
    resetSidebarState,
  }), [isInventoryOpen]);

  if (loading) return null;

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
