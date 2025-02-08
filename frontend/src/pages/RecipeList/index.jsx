import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen  } from 'react-icons/fi';


import AuthContext from '../../context/AuthContext';
import { fetchRecipes, deleteRecipe } from '../../services/recipes';
import '../../styles/list.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

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
      fetchRecipes(user.token)
        .then((data) => {
          setItemList(data);
          setLoading(false);
        })
        .catch((err) => {
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
      await deleteRecipe(itemListId, user.token);
      setItemList(itemList.filter(itemList => itemList.id !== itemListId));
    } catch (err) {
      alert('Error: recipe cannot be deleted, try again.');
    }
  }

  return (
    <div className='list-container'>

      <Sidebar />

      <div className="div-addButton">
         <Link className="Addbutton" to="/Recipe/new">Add new Recipe</Link>
      </div>

      <div className="content">

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
    </div>
  );
}
