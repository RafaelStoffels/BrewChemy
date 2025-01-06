import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPower, FiTrash2 } from 'react-icons/fi';

import logoImg from '../../assets/logo.svg';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import './styles.css';

export default function MaltList() {
  const { user, logout } = useContext(AuthContext);
  const [malts, setMalts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');  // Se não estiver logado, redireciona para a página de login
    } else {
      api.get('api/malts', {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(response => {
        setMalts(response.data);
        setLoading(false);
      }).catch(err => {
        setError('Erro ao carregar maltes');
        setLoading(false);
      });
    }
  }, [user, navigate]);

  async function handleDeleteMalt(maltId) {
    try {
      await api.delete(`api/malts/${maltId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMalts(malts.filter(malt => malt.id !== maltId));
    } catch (err) {
      alert('Erro ao deletar malte, tente novamente.');
    }
  }

  return (
    <div className='malt-container'>
      <header>
        <img src={logoImg} alt="Brewchemy" />
        <Link className="button" to="/Malts/new">Cadastrar novo malte</Link>
        <button onClick={logout}>Sair <FiPower size={20} color="#E02041" /></button>
      </header>

      <h1>Maltes</h1>
      {loading ? <p>Carregando...</p> : error ? <p>{error}</p> : (
        malts.length > 0 ? (
          <ul>
            {malts.map((malt) => (
              <li key={malt.id}>
                <h2>{malt.name}</h2>
                <p>Descrição: {malt.description}</p>
                <button onClick={() => handleDeleteMalt(malt.id)} type="button">
                  <FiTrash2 size={20} color="#a8a8b3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum malte cadastrado.</p>
        )
      )}
    </div>
  );
}
