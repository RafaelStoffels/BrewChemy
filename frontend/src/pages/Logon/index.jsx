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
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Limpa erro anterior
  
    try {
      const response = await api.post('api/login', { email, password });
      const { token } = response.data;
      
      login({ token });
      navigate('/Main');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  };

  return (
    <div className="logon-container">
      <section className="form">
        <object className="Brewchemy-object" type="image/svg+xml" data="/logo.svg"></object>
        <form onSubmit={handleSubmit}>
          <h1>Faça seu login</h1>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
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