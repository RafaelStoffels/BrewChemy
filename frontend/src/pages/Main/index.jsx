import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './styles.css';

import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

export default function Main() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
          navigate('/');
        } 
      }, [user, navigate]);

    return (
      <div>
        <Sidebar />
        <div className='main-container'>
            Brewchemy
        </div>
      </div>
    );
}