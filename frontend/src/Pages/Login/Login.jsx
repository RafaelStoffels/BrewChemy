// src/Pages/Login/Login.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import { me, loginUser } from '../../services/users';
import AuthContext from '../../context/AuthContext';
import { LoadingButton } from '../../Components/LoadingButton';

import './Login.css';

const OAUTH_FLAG = 'oauth:provider';

export default function Logon() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await loginUser(email, password, { login, navigate });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginRedirect = () => {
    sessionStorage.setItem(OAUTH_FLAG, 'google');
    setOauthLoading(true);
    window.location.href = import.meta.env.VITE_GOOGLE_LOGIN_URL ;
  };

  useEffect(() => {
    if (sessionStorage.getItem(OAUTH_FLAG)) {
      setOauthLoading(true);
    }

    const handleRedirectLogin = async () => {
      const token = searchParams.get('token');
      if (!token) return;

      try {
        setOauthLoading(true);
        const userInfo = await me(token);
        const fullUser = { ...userInfo, token };
        login(fullUser);
        sessionStorage.removeItem(OAUTH_FLAG);
        navigate('/RecipeList', { replace: true });
      } catch {
        sessionStorage.removeItem(OAUTH_FLAG);
        setOauthLoading(false);
      }
    };

    handleRedirectLogin();
  }, []);

  return (
    <div className="logon-container">
      {oauthLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            zIndex: 9999,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                border: '4px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                margin: '0 auto 12px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div>Connecting...</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

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

            <LoadingButton
              type="submit"
              loading={loading}
              className="buttonLogin"
              icon={<FiLogIn size={16} color="#fff" />}
              spinnerSize={16}
            >
              {loading ? "Logging in…" : "Log in"}
            </LoadingButton>

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
            <br></br>
          <b> ℹ️ Beta version – free hosting: sometimes the server “falls asleep” when not in use and may need
           a moment to wake up, so things can feel slower. </b>
          </form>
        </div>
      </section>
    </div>
  );
}
