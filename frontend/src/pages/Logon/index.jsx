import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import './styles.css';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

export default function Logon() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    api.post('api/login', { email, password })
      .then((response) => {

        const { token } = response.data;
  
        const userData = {token};
  
        login(userData);
  
        navigate('/Main');
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error);
      });
  };

  return (
    <div className="logon-container">
      <section className="form">
        <object className="Brewchemy-object" type="image/svg+xml" data="/logo.svg"></object>
        <form onSubmit={handleSubmit}>
          <h1>Faça seu login</h1>
          <input
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="buttonLogin" type="submit">
            Login
            <FiLogIn size={16} color="#fff" />
          </button>
        </form>
      </section>
    </div>
  );
}
