import React, {useContext} from "react";
import "./Header.css";
import { FiPower } from 'react-icons/fi';

import AuthContext from '../context/AuthContext';

import logoImg from '../assets/logo.svg';

const Sidebar = () => {

  const { logout } = useContext(AuthContext);

  return (
    <header>
       <div className="logo">
           <img src={logoImg} alt="Brewchemy" className="logoImg" />
       </div>
       <div className="logout">
           <button onClick={logout}><FiPower size={20} color="#E02041" className="logoutButton"/></button>
       </div>
    </header>
  );
};

export default Sidebar;