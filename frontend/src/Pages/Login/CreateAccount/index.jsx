import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addUser } from '../../../services/users';
import { showErrorToast, showSuccessToast } from '../../../utils/notifications';
// Opcional (recomendado): npm i zxcvbn
// import zxcvbn from 'zxcvbn';

import '../../../Styles/crud.css';

export default function NewAccount() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [brewery, setBrewery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Política sugerida: >= 12 chars e força mínima (opcional com zxcvbn)
  const isPasswordStrongEnough = (pwd) => {
    if (!pwd || pwd.trim().length < 10) return false;
    // Se usar zxcvbn:
    // const { score } = zxcvbn(pwd);
    // return score >= 3; // 0..4
    // Sem zxcvbn: ao menos 12 não-espaços:
    return /^\S{10,}$/.test(pwd);
  };

  const normalizeEmail = (e) => e.trim().toLowerCase();

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const normalizedEmail = normalizeEmail(email);

    if (password !== confirmPassword) {
      showErrorToast('Passwords do not match!');
      return;
    }

    if (!isPasswordStrongEnough(password)) {
      showErrorToast('Use at least 10 characters and avoid common/weak passwords.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showErrorToast('Please enter a valid email address.');
      return;
    }

    const data = {
      name: name.trim(),
      email: normalizedEmail,
      brewery: brewery.trim() || undefined,
      password, // nunca logue isso!
    };

    try {
      setSubmitting(true);
      await addUser(data);
      // feedback rápido
      // showSuccessToast('Check your inbox to confirm your account.');
      navigate('/EmailSent');
    } catch (err) {
      showErrorToast('Could not create the account. Please try again.');
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="crud-container">
      <h1>Create Account</h1>
      <div className="content">
        <form onSubmit={handleSubmit} autoComplete="on" noValidate>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="name">
                Full Name / Nickname *
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  spellCheck={false}
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="email">
                Email Address *
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="brewery">
                Brewery
                <input
                  id="brewery"
                  name="organization"
                  value={brewery}
                  onChange={(e) => setBrewery(e.target.value)}
                  autoComplete="organization"
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="password">
                Password *
                <input
                  id="password"
                  name="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={12}
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="confirmPassword">
                Confirm Password *
                <input
                  id="confirmPassword"
                  name="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={12}
                />
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="crud-save-button"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
