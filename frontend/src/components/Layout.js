import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Layout = () => {
  return (
    <div>
      <Sidebar />
      <div className="main-container">
        <Outlet /> {/* Aqui é onde as páginas serão renderizadas */}
      </div>
    </div>
  );
};

export default Layout;
