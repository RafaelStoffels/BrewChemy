import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';
import { searchYeasts, fetchYeasts, deleteYeast } from '../../services/yeasts';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../utils/notifications';
import SearchInput from '../../Components/SearchInput';

import AuthContext from '../../context/AuthContext';
import Sidebar from '../../Components/Sidebar';
import '../../Styles/list.css';

export default function YeastList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadYeasts = async () => {
        try {
          const yeasts = await fetchYeasts(user.token);
          setItemList(yeasts);
        } catch (err) {
          showErrorToast('Error loading yeast');
        }
      };
      loadYeasts();
    }
  }, [user, navigate]);

  const searchItemsFunction = async (term) => {
    try {
      showInfoToast('Searching data...');
      const response = await searchYeasts(user.token, term);

      if (Array.isArray(response) && response.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(response);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  async function handleDetails(recordUserId, itemListId) {
    navigate(`/Yeasts/${recordUserId}/${itemListId}/details`);
  }

  async function handleUpdate(recordUserId, itemListId) {
    navigate(`/Yeasts/${recordUserId}/${itemListId}/edit`);
  }

  async function handleDelete(recordUserId, itemListId) {
    try {
      await deleteYeast(user.token, recordUserId, itemListId);
      setItemList(itemList.filter((item) => item.id !== itemListId));
      showSuccessToast('Yeast deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  }

  return (
    <div>
      <Sidebar />
      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to="/Yeasts/new">Add new yeasts</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Yeasts</h1>
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
                  Manufacturer:
                  {item.manufacturer}
                </p>
                <p>
                  Type:
                  {item.type}
                </p>
                <p>
                  Flavor Profile:
                  {item.flavor_profile}
                </p>
                <p>
                  Attenuation:
                  {item.attenuation}
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
