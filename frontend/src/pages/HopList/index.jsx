import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';
import { searchHops, fetchHops, deleteHop } from '../../services/Hops';
import SearchInput from '../../components/SearchInput';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import '../../styles/list.css';

export default function HopList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadHops = async () => {
        try {
          const hops = await fetchHops(api, user.token);
          setItemList(hops);
        } catch (err) {
          setError('Error loading hops');
        } finally {
          setLoading(false);
        }
      };
      loadHops();
    }
  }, [user, navigate]);

  const searchItemsFunction = async (term) => {
      const recipeResponse = await searchHops(api, user.token, term);
      setItemList(recipeResponse);
  };

  async function handleDetails(itemListId) {
    navigate(`/Hops/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Hops/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await deleteHop(api, user.token, itemListId);
      setItemList(itemList.filter(item => item.id !== itemListId));
    } catch (err) {
      alert(`${err.message}`);
    }
  }

  return (
    <div>
      <Sidebar />
      
      <div className='list-container'>
        <div className="div-addButton">
          <Link className="Addbutton" to="/Hops/new">Add new hops</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Hops</h1>
        {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
          itemList.length > 0 ? (
            <ul>
              {itemList.map((item) => (
                <li key={item.id}>
                  <h2>{item.name}</h2>
                  <p>Description: {item.description}</p>
                  <div className="button-group">
                    <button onClick={() => handleDetails(item.id)} type="button">
                      <FiBookOpen size={20} color="#a8a8b3" />
                    </button>
                    <button onClick={() => handleUpdate(item.id)} type="button">
                      <FiEdit size={20} color="#a8a8b3" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} type="button">
                      <FiTrash2 size={20} color="#a8a8b3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hops found.</p>
          )
        )}
      </div>
    </div>
  );
}
