import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPower, FiArrowLeft, FiTrash2, FiEdit, FiBookOpen  } from 'react-icons/fi';

import logoImg from '../../assets/logo.svg';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/list.css';

export default function MaltList() {
  const { user, logout } = useContext(AuthContext);
  const [malts, setMalts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
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

  async function handleDetails(maltId) {
    navigate(`/Malts/${maltId}/details`);
  }

  async function handleUpdate(maltId) {
    navigate(`/Malts/${maltId}/edit`);
  }

  async function handleDelete(maltId) {
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
    <div className='list-container'>

    <header>
      <img src={logoImg} alt="Brewchemy" className="logoImg" />
      <Link className="Addbutton" to="/Malts/new">Add new malt</Link>
      <button onClick={logout}><FiPower size={20} color="#E02041" className="logoutButton"/></button>
    </header>

    <header className="back-header">
    <Link className="back-link" to="/Main">
      <FiArrowLeft size={16} color="#E02041" />
      Back
    </Link>
    </header>

      <h1>Malts</h1>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        malts.length > 0 ? (
          <ul>
            {malts.map((malt) => (
              <li key={malt.id}>
                <h2>{malt.name}</h2>
                <p>Description: {malt.description}</p>
                <div className="button-group">
                  <button onClick={() => handleDetails(malt.id)} type="button">
                  <FiBookOpen  size={20} color="#a8a8b3" />
                  </button>
                  <button onClick={() => handleUpdate(malt.id)} type="button">
                    <FiEdit size={20} color="#a8a8b3" />
                  </button>
                  <button onClick={() => handleDelete(malt.id)} type="button">
                    <FiTrash2 size={20} color="#a8a8b3" />
                  </button>
                </div>
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
