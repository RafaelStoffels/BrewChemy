import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Header from '../../components/Header';
import './styles.css';

import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

export default function Main() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
          navigate('/');
        } 
      }, [user, navigate]);

    return (
        <div className='main-container'>

            <Sidebar />

            <Header />

        </div>
    );
}