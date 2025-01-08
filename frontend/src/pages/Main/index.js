import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiPower } from 'react-icons/fi';
/*
import api from '../../services/api';
*/
import './styles.css';

import logoImg from '../../assets/logo.svg';
import maltImg from '../../assets/malt.jpg';
import reciptImg from '../../assets/recipt.jpg';

import AuthContext from '../../context/AuthContext';

export default function Main() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className='main-container'>
            <header className="header-main">
                <img src={logoImg} alt="Brewchemy" className="logoImg" />
                <div className="div-logout-button">
                    <button onClick={logout}><FiPower size={20} color="#E02041" className="logoutButton"/></button>
                </div>
            </header>

            <span className="brewchemy-text">Menu</span>
            
            <div>
                <Link to="/MaltList">
                    <img src={maltImg} alt="Malts" className="maltImg" />
                </Link>
                <Link to="/MaltList">
                    <img src={reciptImg} alt="Recipts" className="reciptImg" />
                </Link>
            </div>
        </div>
    );
}