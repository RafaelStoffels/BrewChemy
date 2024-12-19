import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import api from '../../services/api';

import './styles.css';

import logoImg from '../../assets/logo.svg'
import engenhariaSolidariaImg from '../../assets/engenhariaSolidariaLogo.png'

export default function Logon() {
    const [id, setId] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const response = await api.post('sessions', { id });

            localStorage.setItem('ongId', id);
            localStorage.setItem('ongName', response.data.name);

            navigate('/profile');
        } catch {
            alert('Falha no login. Tente novamente.');
        }
    }

    return (
        <div className="logon-container">
            <section className="form">
                <img className="logo-img" src={logoImg} alt="Engenharia Solidaria" />

                <form onSubmit={handleLogin}>
                    <h1>Faça seu logon</h1>

                    <input 
                        placeholder='Sua ID'
                        value={id}
                        onChange={e => setId(e.target.value)}
                    />
                    <button className="button" type='submit'>Entrar</button>

                    <Link className=".back-link" to="/register">
                    <FiLogIn size={16} color="#E02041"/>
                    Não tenho cadastro</Link>
                </form>

            </section>

            <img src={engenhariaSolidariaImg} alt="Engenharia Solidaria" />
        </div>
    );
}