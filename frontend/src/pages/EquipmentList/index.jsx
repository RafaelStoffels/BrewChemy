import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';
import { searchEquipments, fetchEquipments, deleteEquipment } from '../../services/Equipments';
import { showInfoToast, showErrorToast } from "../../utils/notifications";

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import SearchInput from '../../components/SearchInput';
import '../../styles/list.css';

export default function EquipmentList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadEquipments = async () => {
        try {
          const equipments = await fetchEquipments(api, user.token);
          setItemList(equipments);
        } catch (err) {
          showErrorToast('Error loading equipments');
        }
      };
      loadEquipments();
    }
  }, [user, navigate]);

  const searchItemsFunction = async (term) => {
    try {
      showInfoToast("Searching data...");
      const recipeResponse = await searchEquipments(api, user.token, term);
  
      if (Array.isArray(recipeResponse) && recipeResponse.length === 0) {
        showInfoToast("Data not found");
      } else {
        setItemList(recipeResponse);
      }
    } catch (err) {
      showErrorToast("Error: " + err);
    }
  };

  async function handleDetails(itemListId) {
    navigate(`/Equipments/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Equipments/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await deleteEquipment(api, user.token, itemListId);
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
            <Link className="Addbutton" to="/Equipments/new">Add new equipment</Link>
          </div>
       
          <SearchInput onSearch={searchItemsFunction} />

          <h1>Equipments</h1>
              <ul>
                {itemList.map((item) => (
                  <li key={item.id}>
                    <h2 className="item-title">{item.name}</h2>
                    <div className="item-details">
                      <p>
                        Description: {item.description.length > 140 
                          ? item.description.substring(0, 140) + "..." 
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
