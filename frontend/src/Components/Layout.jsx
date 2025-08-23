import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

function Layout() {
  return (
    <div>
      <Sidebar />
      <div className="main-container">
        <Outlet />
        {' '}
        {/* Render pages */}
      </div>
    </div>
  );
}

export default Layout;
