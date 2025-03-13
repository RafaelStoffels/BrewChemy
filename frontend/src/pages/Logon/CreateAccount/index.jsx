import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/crud.css';
import { addUser } from '../../../services/Users';
import { showSuccessToast, showErrorToast, showInfoToast } from "../../../utils/notifications";

export default function NewAccount() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [brewery, setBrewery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');


    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            showErrorToast('Passwords do not match!');
            return;
        } else {
            setConfirmPasswordError('');
        }

        if (!validatePassword(password)) {
            showErrorToast('Password must be at least 8 characters long, with a number and a mix of uppercase and lowercase letters.');
            return;
        } else {
            setPasswordError('');
        }

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
            showErrorToast("Error creating user: " + err);
        }
        showSuccessToast("User created.");
        showInfoToast("An email with an activation code has been sent. Please check your inbox and activate your account.");
        navigate('/');
    }

    return (
        <div className='crud-container'>
            <h1>Create Account</h1>
            <div className='content'>
                <form onSubmit={handleSubmit}>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className='inputs-row'>
                        <div className='input-field'>
                            <label htmlFor="name">Full Name / Nickname *</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className='inputs-row'>
                        <div className='input-field'>
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className='inputs-row'>
                        <div className='input-field'>
                            <label htmlFor="brewery">Brewery</label>
                            <input
                                value={brewery}
                                onChange={e => setBrewery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='inputs-row'>
                        <div className='input-field'>
                            <label htmlFor="password">Password *</label>
                            <input
                                type='password'
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                    </div>

                    <div className='inputs-row'>
                        <div className='input-field'>
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type='password'
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
                        </div>
                    </div>

                    <button type="submit" className='crud-save-button'>
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
