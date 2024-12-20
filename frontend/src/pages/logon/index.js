import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import api from '../../services/api';

import './styles.css';

import logoImg from '../../assets/logo.svg'

export default function Logon() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const response = await api.post('login', { email, password });

            localStorage.setItem('brewerId', response.data.id);
            localStorage.setItem('brewerName', response.data.name);

            navigate('/Main');
        } catch {
            alert('Falha no login. Tente novamente.');
        }
    }

    return (
        <div className="logon-container">
            <section className="form">
                <img className="logo-img" src={logoImg} alt="BrewChemy" />

                <form onSubmit={handleLogin}>
                    <h1>Faça seu logon</h1>

                    <input 
                        type="email"
                        placeholder='Seu e-mail'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        type="password"
                        placeholder='Sua senha'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="button" type='submit'>Entrar</button>

                    <Link className=".back-link" to="/register">
                    <FiLogIn size={16} color="#E02041"/>
                    Não tenho cadastro</Link>
                </form>

            </section>

        </div>
    );
}