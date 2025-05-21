import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendPasswordResetEmail } from '../../../services/users';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../../utils/notifications';

import '../../../Styles/crud.css';


export default function NewAccount() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const validateEmail = (emailPar) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailPar);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateEmail(email)) {
      showErrorToast('Please enter a valid email address.');
      return;
    }

    const data = {
      email,
    };

    try {
      await sendPasswordResetEmail(data);
    } catch (err) {
      showErrorToast(`Error sending email: ${err}`);
    }

    showSuccessToast('User created.');
    showInfoToast('An email has been sent to reset your password. Please check your inbox.');
    navigate('/');
  }

  return (
    <div className="crud-container">
      <h1>Reset Password</h1>
      <div className="content">
        <form onSubmit={handleSubmit}>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="email">
                Please insert your e-mail address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
          <button type="submit" className="crud-save-button">
            Send link
          </button>
        </form>
      </div>
    </div>
  );
}
