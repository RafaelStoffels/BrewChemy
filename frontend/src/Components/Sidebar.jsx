import React, { useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';
import AuthContext from '../context/AuthContext';

import './sidebar.css';

function Sidebar() {
  const { logout } = useContext(AuthContext);
  const { isInventoryOpen, setIsInventoryOpen, resetSidebarState } = useSidebar();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    resetSidebarState();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsInventoryOpen(!isInventoryOpen);
    }
  };

  const menuItems = useMemo(() => (
    <ul>
      <li className={location.pathname.startsWith('/EquipmentList') ? 'active' : ''}>
        <Link to="/EquipmentList">Equipments</Link>
      </li>

      <li className="dropdown">
        <span
          className="dropdown-header"
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          Inventory
          {' '}
          {isInventoryOpen ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </span>
      </li>

      {/* Submenu */}
      <ul className={`submenu ${isInventoryOpen ? 'open' : ''}`}>
        <li className={location.pathname === '/FermentableList' ? 'active' : ''}>
          <Link to="/FermentableList">Fermentables</Link>
        </li>
        <li className={location.pathname === '/HopList' ? 'active' : ''}>
          <Link to="/HopList">Hops</Link>
        </li>
        <li className={location.pathname === '/MiscList' ? 'active' : ''}>
          <Link to="/MiscList">Misc</Link>
        </li>
        <li className={location.pathname === '/YeastList' ? 'active' : ''}>
          <Link to="/YeastList">Yeasts</Link>
        </li>
      </ul>

      <li className={location.pathname === '/RecipeList' ? 'active' : ''}>
        <Link to="/RecipeList">Recipes</Link>
      </li>

      <li className={location.pathname === '/Settings' ? 'active' : ''}>
        <Link to="/Settings">Settings</Link>
      </li>

      <li className={location.pathname === '/Changelog' ? 'active' : ''}>
        <Link to="/Changelog">Changelog</Link>
      </li>

      <li>
        <button type="button" onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </li>
    </ul>
  ), [location.pathname, isInventoryOpen, setIsInventoryOpen]);

  return (
    <div className="sidebar">
      <img className="Brewchemy-logo" src="/logo.svg" alt="Logo" />
      <nav className="menu">
        {menuItems}
      </nav>
      <div className="version-info">v1.4.0-beta</div>
    </div>
  );
}

export default Sidebar;
