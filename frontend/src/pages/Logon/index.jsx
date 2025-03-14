import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams  } from 'react-router-dom';
import { Link } from "react-router-dom";
import { FiLogIn } from 'react-icons/fi';
import { showErrorToast } from "../../utils/notifications";

import './styles.css';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

export default function Logon() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);


  useEffect(() => {
    const token = searchParams.get("token");

    if (token && !isRedirecting) {
      login({ token });

      setSearchParams({}, { replace: true });

      setIsRedirecting(true);

      navigate('/Main');
    } else if (isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/Main');
    }
  }, [searchParams, login, navigate, setSearchParams, isAuthenticated, isRedirecting]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    try {
      const response = await api.post('api/login', { email, password });
      const { token } = response.data;
      
      login({ token });
      navigate('/Main');
    } catch (error) {
      if (error.response) {
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

  const handleGoogleLoginRedirect = () => {
    window.location.href = process.env.REACT_APP_GOOGLE_LOGIN_URL;
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
        
          <button type="button" 
            onClick={handleGoogleLoginRedirect} 
            className="buttonGoogleLogIn">
            <img
              src="googleSignin.png"
            />
          </button>

          <Link to="/ForgotPassword">Forgot password?</Link>
          <Link to="/CreateAccount">Create account</Link>
        </form>
      </section>
    </div>
  );
}
