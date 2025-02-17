import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import { showErrorToast } from "../../utils/notifications";



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
      if (error.response) {
        // Quando a resposta da API contém um status de erro
        if (error.response.status === 404) {
          showErrorToast("Endpoint não encontrado. Verifique a URL.");
        } else if (error.response.status === 401) {
          showErrorToast("Credenciais inválidas. Verifique seu e-mail ou senha.");
        } else {
          showErrorToast("Erro ao fazer login. Tente novamente mais tarde.");
        }
      } else {
        showErrorToast("Erro de rede ou servidor. Verifique sua conexão e tente novamente.");
      }
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