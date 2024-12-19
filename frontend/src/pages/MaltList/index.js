import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPower, FiTrash2 } from 'react-icons/fi';

//import api from '../../services/api';

import './styles.css';

export default function MaltList() {
    const [malts, setMalts] = useState([]); // Estado para armazenar os maltes
    const [loading, setLoading] = useState(true); // Estado para indicar carregamento
    const [error, setError] = useState(null); // Estado para erros
  
    // Função para buscar os maltes
    useEffect(() => {
      const fetchMalts = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/malts'); // Substitua pela URL da sua API
          if (!response.ok) {
            throw new Error('Erro ao buscar os maltes.');
          }
          const data = await response.json();
          setMalts(data); // Atualiza o estado com os maltes retornados
        } catch (err) {
          setError(err.message); // Define a mensagem de erro
        } finally {
          setLoading(false); // Finaliza o carregamento
        }
      };
  
      fetchMalts();
    }, []); // Executa o efeito apenas uma vez ao montar o componente
  
    // Renderização condicional com base no estado
    if (loading) {
      return <p>Carregando maltes...</p>;
    }
  
    if (error) {
      return <p>Erro: {error}</p>;
    }
  
    return (
      <div>
        <h1>Lista de Maltes</h1>
        {malts.length > 0 ? (
          <ul>
            {malts.map((malt) => (
              <li key={malt.id}>
                <h2>{malt.name}</h2>
                <p>Descrição: {malt.description}</p>
                <p>Tipo: {malt.type}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum malte cadastrado.</p>
        )}
      </div>
    );
  }