import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';
import { searchFermentables, fetchFermentables, deleteFermentable } from '../../services/Fermentables';
import { showInfoToast, showErrorToast } from "../../utils/notifications";
import SearchInput from '../../components/SearchInput';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import '../../styles/list.css';


export default function FermentableList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loaditems = async () => {
        try {
          const items = await fetchFermentables(api, user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading fermentables');
        }
      };
      loaditems();
    }
  }, [user, navigate]);

  const searchItemsFunction = async (term) => {
    try{
      showInfoToast("Searching data...")
      const recipeResponse = await searchFermentables(api, user.token, term);
      setItemList(recipeResponse);
    } catch (err) {
      showErrorToast("No data found." + err);
    }
  };
  
  async function handleDetails(itemListId) {
    navigate(`/Fermentables/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Fermentables/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await deleteFermentable(api, user.token, itemListId);
      setItemList(itemList.filter(item => item.id !== itemListId));
    } catch (err) {
      showErrorToast("Error deleting data." + err);
    }
  }

  return (
    <div>
      <Sidebar />
      
      <div className='list-container'>
        <div className="div-addButton">
          <Link className="Addbutton" to="/Fermentables/new">Add new fermentable</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Fermentables</h1>
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
      </div>
    </div>
  );
}
