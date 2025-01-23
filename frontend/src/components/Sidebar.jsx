import React from "react";
import { Link} from 'react-router-dom';
import "./Sidebar.css";

import logoImg from '../assets/logo.svg';

const Sidebar = () => {

  return (
    <div className="sidebar">
      <img src={logoImg} alt="Brewchemy" className="logoImg" />
      <nav className="menu">
        <ul>
          <li><Link to="/Main">Home</Link></li>
          <hr></hr>
          <li><Link to="/FermentableList">Fermentables</Link></li>
          <li><Link to="/HopList">Hops</Link></li>
          <li><Link to="/YeastList">Yeasts</Link></li>
          <hr></hr>
          <li><Link to="/RecipeList">Recipes</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;