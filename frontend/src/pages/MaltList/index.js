import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPower, FiTrash2 } from 'react-icons/fi';

import logoImg from '../../assets/logo.svg';

import api from '../../services/api';

import './styles.css';

export default function MaltList() {
    const [malts, setMalts] = useState([]); // Estado para armazenar os maltes
    const [loading, setLoading] = useState(true); // Estado para indicar carregamento
    const [error, setError] = useState(null); // Estado para erros
  
    const brewerId = localStorage.getItem('brewerId');

    useEffect(() => {
      api.get('MaltList', {
          headers: {
              Authorization: brewerId,
          }
      }).then(response => {
          setIncidents(response.data);
      })
  }, [brewerId]);

    async function handleDeleteMalt(brewerId) {
      try {
          await api.delete(`malts/${brewerId}`, {
              headers: {
                  Authorization: brewerId,
              }
          });

          setMalts(malts.filter(malt => malt.id !== id));
      } catch (err) {
          alert('Erro ao deletar malte, tente novamente.');
      }
  }
  
    return (
      <div className='malt-container'>
          <header>
              <img src={logoImg} alt="Brewchemy" />

              <Link className="button" to="/malts/new">Cadastrar novo malte</Link>

          </header>
          <h1>Maltes</h1>
          {malts.length > 0 ? (
            <ul>
              {malts.map((malt) => (
                <li key={malt.id}>
                  <h2>{malt.name}</h2>
                  <p>Descrição: {malt.description}</p>
                  <button onClick={() => handleDeleteMalt(malt.id)} type="button">
                            <FiTrash2 size={20} color="#a8a8b3"/>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum malte cadastrado.</p>
          )}
      </div>
    );
  }