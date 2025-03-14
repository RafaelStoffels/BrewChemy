import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/crud.css';
import { showSuccessToast, showErrorToast, showInfoToast } from "../../../utils/notifications";
import { changePassword } from '../../../services/Users';

export default function NewAccount() {
    const navigate = useNavigate();
    const location = useLocation(); // Usado para acessar a URL

    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');


    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            showErrorToast('Token is required');
        }
    }, [location.search]);

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
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

        const data = {
            token,
            password
        };

        try {
            await changePassword(data);
            showSuccessToast("Password updated successfully.");
            navigate('/');
        } catch (err) {
            showErrorToast("Error creating user. " + err + " try again later.");
        }
    }

    return (
        <div className='crud-container'>
            <h1>Change Password</h1>
            <div className='content'>
                <form onSubmit={handleSubmit}>

                    <div className='inputs-row'>
                        <div className='input-field'>
                            <label htmlFor="password">New Password</label>
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
                            <label htmlFor="confirmPassword">Confirm Password</label>
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
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}
