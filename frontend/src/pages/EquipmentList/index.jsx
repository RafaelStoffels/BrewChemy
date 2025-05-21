import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';
import { searchEquipments, fetchEquipments, deleteEquipment } from '../../services/Equipments';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../utils/notifications';

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
          const equipments = await fetchEquipments(user.token);
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
      showInfoToast('Searching data...');
      const recipeResponse = await searchEquipments(user.token, term);

      if (Array.isArray(recipeResponse) && recipeResponse.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(recipeResponse);
      }
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  async function handleDetails(recordUserId, itemListId) {
    navigate(`/Equipments/${recordUserId}/${itemListId}/details`);
  }

  async function handleUpdate(recordUserId, itemListId) {
    navigate(`/Equipments/${recordUserId}/${itemListId}/edit`);
  }

  async function handleDelete(recordUserId, itemListId) {
    try {
      await deleteEquipment(user.token, recordUserId, itemListId);
      setItemList(itemList.filter((item) => item.id !== itemListId));
      showSuccessToast('Equipment deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  }

  return (
    <div>
      <Sidebar />
      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to="/Equipments/new">Add new equipment</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Equipments</h1>
        <ul>
          {itemList.map((item) => (
            <li key={item.id}>
              <h2 className="item-title">
                {item.name}
                {' '}
                {item.officialId && <span className="custom-label">[custom]</span>}
              </h2>
              <div className="item-details">
                <p>
                  Description:
                  {' '}
                  {item.description.length > 140
                    ? `${item.description.substring(0, 140)}...`
                    : item.description}
                </p>
              </div>
              <div className="button-group">
                <button onClick={() => handleDetails(item.userId, item.id)} type="button" className="icon-button">
                  <FiBookOpen size={20} />
                </button>
                <button onClick={() => handleUpdate(item.userId, item.id)} type="button" className="icon-button">
                  <FiEdit size={20} />
                </button>
                <button onClick={() => handleDelete(item.userId, item.id)} type="button" className="icon-button">
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
