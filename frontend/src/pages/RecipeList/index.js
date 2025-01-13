import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPower, FiArrowLeft, FiTrash2, FiEdit, FiBookOpen  } from 'react-icons/fi';

import logoImg from '../../assets/logo.svg';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/list.css';

export default function MaltList() {
  const { user, logout } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      api.get('api/recipes', {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(response => {
        setItemList(response.data);
        setLoading(false);
      }).catch(err => {
        setError('Error loading recipes');
        setLoading(false);
      });
    }
  }, [user, navigate]);

  async function handleDetails(itemListId) {
    navigate(`/Recipes/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Recipes/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await api.delete(`api/recipes/${itemListId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setItemList(itemList.filter(itemList => itemList.id !== itemListId));
    } catch (err) {
      alert('Error recipe cannot be deleted, try again.');
    }
  }

  return (
    <div className='list-container'>

    <header>
      <img src={logoImg} alt="Brewchemy" className="logoImg" />
      <Link className="Addbutton" to="/Recipes/new">Add new recipe</Link>
      <button onClick={logout}><FiPower size={20} color="#E02041" className="logoutButton"/></button>
    </header>

    <header className="back-header">
    <Link className="back-link" to="/Main">
      <FiArrowLeft size={16} color="#E02041" />
      Back
    </Link>
    </header>

      <h1>Recipes</h1>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        itemList.length > 0 ? (
          <ul>
            {itemList.map((itemList) => (
              <li key={itemList.id}>
                <h2>{itemList.name}</h2>
                <p>Description: {itemList.description}</p>
                <div className="button-group">
                  <button onClick={() => handleDetails(itemList.id)} type="button">
                  <FiBookOpen  size={20} color="#a8a8b3" />
                  </button>
                  <button onClick={() => handleUpdate(itemList.id)} type="button">
                    <FiEdit size={20} color="#a8a8b3" />
                  </button>
                  <button onClick={() => handleDelete(itemList.id)} type="button">
                    <FiTrash2 size={20} color="#a8a8b3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recipes found.</p>
        )
      )}
    </div>
  );
}
