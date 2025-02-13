import React, { useContext, useMemo } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from '../context/SidebarContext';
import { ChevronDown, ChevronRight } from "lucide-react";
import AuthContext from "../context/AuthContext";
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const { isInventoryOpen, setIsInventoryOpen, resetSidebarState } = useSidebar();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    resetSidebarState();
  };

  const menuItems = useMemo(() => (
    <ul>
      <li className={location.pathname.startsWith("/EquipmentList") ? "active" : ""}>
        <Link to="/EquipmentList">Equipments</Link>
      </li>

      <li className="dropdown" onClick={() => setIsInventoryOpen(!isInventoryOpen)}>
        <span className="dropdown-header">
          Inventory {isInventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </li>

      {/* Submenu */}
      <ul className={`submenu ${isInventoryOpen ? "open" : ""}`}>
        <li className={location.pathname === "/FermentableList" ? "active" : ""}>
          <Link to="/FermentableList">Fermentables</Link>
        </li>
        <li className={location.pathname === "/HopList" ? "active" : ""}>
          <Link to="/HopList">Hops</Link>
        </li>
        <li className={location.pathname === "/Misc" ? "active" : ""}>
          <Link to="/Misc">Misc</Link>
        </li>
        <li className={location.pathname === "/YeastList" ? "active" : ""}>
          <Link to="/YeastList">Yeasts</Link>
        </li>
      </ul>

      <li className={location.pathname === "/RecipeList" ? "active" : ""}>
        <Link to="/RecipeList">Recipes</Link>
      </li>

      <li>
        <Link to="#" onClick={handleLogout}>Logout</Link>
      </li>
    </ul>
  ), [location.pathname, isInventoryOpen, setIsInventoryOpen]);

  return (
    <div className="sidebar">
      <img className="Brewchemy-logo" src="/logo.svg" alt="Logo" />
      <nav className="menu">
        {menuItems}
      </nav>
    </div>
  );
};

export default Sidebar;
