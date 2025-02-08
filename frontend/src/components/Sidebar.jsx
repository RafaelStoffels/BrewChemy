import React, {useContext} from "react";
import { Link} from 'react-router-dom';
import "./Sidebar.css";

import AuthContext from '../context/AuthContext';

const Sidebar = () => {

  const { logout } = useContext(AuthContext);
  
  return (
    <div className="sidebar">
      <object className="Brewchemy-object" type="image/svg+xml" data="/logo.svg"></object>
      <nav className="menu">
        <ul>
          <hr></hr>
          <li><Link to="/EquipmentList">Equipments</Link></li>
          <hr></hr>
          <li><Link to="/FermentableList">Fermentables</Link></li>
          <li><Link to="/HopList">Hops</Link></li>
          <li><Link to="/Misc">Misc</Link></li>
          <li><Link to="/YeastList">Yeasts</Link></li>
          <hr></hr>
          <li><Link to="/RecipeList">Recipes</Link></li>
          <hr></hr>
          <li><Link onClick={logout}>Logout</Link></li> 
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;