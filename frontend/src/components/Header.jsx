import React, {useContext} from "react";
import "./Header.css";
import { FiPower } from 'react-icons/fi';

import AuthContext from '../context/AuthContext';

const Header = () => {

  const { logout } = useContext(AuthContext);

  return (
    <header>
       <div className="logo">
       </div>
       <div className="div-logout">
           <button onClick={logout}><FiPower size={20} color="#E02041" className="logoutButton"/></button>
       </div>
    </header>
  );
};

export default Header;