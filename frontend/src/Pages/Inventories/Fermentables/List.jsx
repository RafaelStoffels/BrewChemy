import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';

import { searchFermentables, fetchFermentables, deleteFermentable } from '../../../services/fermentables';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

import Sidebar from '../../../Components/Sidebar';
import SearchInput from '../../../Components/SearchInput';

import '../../../Styles/list.css';

export default function FermentableList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const navigate = useNavigate();

  const searchItemsFunction = async (term) => {
    try {
      showInfoToast('Searching data...');
      const recipeResponse = await searchFermentables(user.token, term);

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
    navigate(`/Fermentables/${recordUserId}/${itemListId}/details`);
  }

  async function handleUpdate(recordUserId, itemListId) {
    navigate(`/Fermentables/${recordUserId}/${itemListId}/edit`);
  }

  async function handleDelete(recordUserId, itemListId) {
    try {
      await deleteFermentable(user.token, recordUserId, itemListId);
      setItemList(itemList.filter((item) => item.id !== itemListId));
      showSuccessToast('Fermentable deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loaditems = async () => {
        try {
          const items = await fetchFermentables(user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading fermentables');
        }
      };
      loaditems();
    }
  }, [user, navigate]);

  return (
    <div>
      <Sidebar />

      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to="/Fermentables/new">Add new fermentable</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Fermentables</h1>
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
                  Supplier:
                  {item.supplier}
                </p>
                <p>
                  Type:
                  {item.type}
                </p>
                <p>
                  EBC:
                  {item.ebc}
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
