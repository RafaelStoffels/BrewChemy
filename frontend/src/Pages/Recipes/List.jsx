import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';

import Sidebar from '../../Components/Sidebar';
import SearchInput from '../../Components/SearchInput';

import { fetchRecipes, deleteRecipe, searchRecipes } from '../../services/recipes';
import api from '../../services/api';

import { showErrorToast, showInfoToast } from '../../utils/notifications';

import AuthContext from '../../context/AuthContext';

import '../../Styles/list.css';

export default function MaltList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const navigate = useNavigate();

  const searchItemsFunction = async (term) => {
    try {
      showInfoToast('Searching data...');
      const response = await searchRecipes(api, user.token, term);

      if (Array.isArray(response) && response.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(response);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  async function handleDetails(itemListId) {
    navigate(`/Recipes/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Recipes/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await deleteRecipe(itemListId, user.token);
      setItemList(itemList.filter((item) => item.id !== itemListId));
    } catch (err) {
      showErrorToast(`Error deleting data.${err}`);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/');
      } else {
        try {
          const data = await fetchRecipes(user.token);
          setItemList(data);
        } catch (err) {
          showErrorToast('Error loading recipes');
        }
      }
    };

    fetchData();
  }, [user, navigate]);

  return (
    <div>
      <Sidebar />
      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to="/Recipes/new">Add new Recipe</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Recipes</h1>
        <ul>
          {itemList.map((item) => (
            <li key={item.id}>
              <h2 className="item-title">{item.name}</h2>
              <div className="item-details">
                <p>
                  Author:
                  {item.author}
                </p>
                <p>
                  Style:
                  {item.style}
                </p>
                <p>
                  Description:
                  {' '}
                  {item.description.length > 140
                    ? `${item.description.substring(0, 140)}...`
                    : item.description}
                </p>
              </div>
              <div className="button-group">
                <button onClick={() => handleDetails(item.id)} type="button" className="icon-button">
                  <FiBookOpen size={20} />
                </button>
                <button onClick={() => handleUpdate(item.id)} type="button" className="icon-button">
                  <FiEdit size={20} />
                </button>
                <button onClick={() => handleDelete(item.id)} type="button" className="icon-button">
                  <FiTrash2 size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
