import React from "react";
import { Link} from 'react-router-dom';
import "./Sidebar.css";

const Sidebar = () => {

  return (
    <div className="sidebar">
      <nav className="menu">
        <ul>
          <li><Link to="/Main">Home</Link></li>
          <li><Link to="/MaltList">Malts</Link></li>
          <li><Link to="/RecipeList">Recipes</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;