// src/Pages/Login/Login.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import { me, loginUser } from '../../services/users';
import AuthContext from '../../context/AuthContext';

import './Login.css';

export default function Logon() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password, { login, navigate });
    } catch (err) {

    }
  };

  const handleGoogleLoginRedirect = () => {
    window.location.href = import.meta.env.VITE_GOOGLE_LOGIN_URL ;
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
              Login <FiLogIn size={16} color="#fff" />
            </button>

            <button
              type="button"
              onClick={handleGoogleLoginRedirect}
              className="buttonGoogleLogIn"
              aria-label="Entrar com Google"
            >
              <img src="/googleSignin.png" alt="Entrar com Google" />
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
