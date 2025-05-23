import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addUser } from '../../../services/users';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../../utils/notifications';

import '../../../Styles/crud.css';

export default function NewAccount() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [brewery, setBrewery] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validatePassword = (passwordPar) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(passwordPar);
  };

  const validateEmail = (emailPar) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailPar);
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

    if (!validateEmail(email)) {
      showErrorToast('Please enter a valid email address.');
      return;
    }

    const data = {
      name,
      email,
      brewery,
      password,
    };

    try {
      await addUser(data);
    } catch (err) {
      showErrorToast(`Error creating user. ${err}`);
    }
    showSuccessToast('User created.');
    showInfoToast('An email with an activation code has been sent. Please check your inbox and activate your account.');
    navigate('/');
  }

  return (
    <div className="crud-container">
      <h1>Create Account</h1>
      <div className="content">
        <form onSubmit={handleSubmit}>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="name">
                Full Name / Nickname *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="email">
                Email Address *
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="brewery">
                Brewery
                <input
                  value={brewery}
                  onChange={(e) => setBrewery(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="password">
                Password *
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
                Confirm Password *
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
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
