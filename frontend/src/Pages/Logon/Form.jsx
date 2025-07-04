import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import { showErrorToast } from '../../utils/notifications';
import api from '../../services/api';
import { me } from '../../services/users';

import AuthContext from '../../context/AuthContext';

import './Form.css';

export default function Logon() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await api.post('api/login', { email, password });
      const { token } = response.data;

      const userInfo = await me(token);
      const fullUser = { ...userInfo, token };

      login(fullUser);
      navigate('/RecipeList');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          showErrorToast('Endpoint not found. Please check the URL.');
        } else if (error.response.status === 401) {
          showErrorToast('Invalid credentials. Please check your email or password.');
        } else {
          showErrorToast('Login failed. Please try again later.');
        }
      } else {
        showErrorToast('Network or server error. Please check your connection and try again.');
      }
    }
  };

  const handleGoogleLoginRedirect = () => {
    window.location.href = process.env.REACT_APP_GOOGLE_LOGIN_URL;
  };

  useEffect(() => {
    const handleRedirectLogin = async () => {
      const token = searchParams.get('token');
      if (!token) return;

      const userInfo = await me(token);
      const fullUser = { ...userInfo, token };

      login(fullUser);
      navigate('/RecipeList');
    };

    handleRedirectLogin();
  }, []);

  return (
    <div className="logon-container">
      <section className="form">
        <object
          className="Brewchemy-object"
          type="image/svg+xml"
          data="/logo.svg"
          aria-label="Logo da Brewchemy"
        >
          a
        </object>
        <div className="bottom-div">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <label htmlFor="email">
              E-mail
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button className="buttonLogin" type="submit">
              Login
              {' '}
              <FiLogIn size={16} color="#fff" />
            </button>

            <button
              type="button"
              onClick={handleGoogleLoginRedirect}
              className="buttonGoogleLogIn"
              aria-label="Entrar com Google"
            >
              <img
                src="googleSignin.png"
                alt="Entrar com Google"
              />
            </button>

            <Link to="/ForgotPassword" style={{ marginTop: '30px' }}>
              Forgot password?
            </Link>
            <Link to="/CreateAccount" style={{ marginTop: '15px' }}>
              Create account
            </Link>
          </form>
        </div>
      </section>
    </div>
  );
}
