import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { showSuccessToast, showErrorToast } from '../../../utils/notifications';
import { changePassword } from '../../../services/users';

import '../../../Styles/crud.css';

export default function NewAccount() {
  const navigate = useNavigate();
  const location = useLocation(); // used for URL access

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validatePassword = (passwordPar) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(passwordPar);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      showErrorToast('Passwords do not match!');
      return;
    }
    setConfirmPasswordError('');

    if (!validatePassword(password)) {
      showErrorToast('Password must be at least 8 characters long, with a number and a mix of uppercase and lowercase letters.');
      return;
    }
    setPasswordError('');

    const data = {
      token,
      password,
    };

    try {
      await changePassword(data);
      showSuccessToast('Password updated successfully.');
      navigate('/');
    } catch (err) {
      showErrorToast(`Error creating user. ${err} try again later.`);
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      showErrorToast('Token is required');
    }
  }, [location.search]);

  return (
    <div className="crud-container">
      <h1>Change Password</h1>
      <div className="content">
        <form onSubmit={handleSubmit}>

          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="password">
                New Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {passwordError && <p className="error-message">{passwordError}</p>}
            </div>
          </div>

          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
              {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
            </div>
          </div>

          <button type="submit" className="crud-save-button">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
