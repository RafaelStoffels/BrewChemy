import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';

import { searchMiscs, fetchMisc, deleteMisc } from '../../services/misc';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../utils/notifications';

import SearchInput from '../../Components/SearchInput';
import Sidebar from '../../Components/Sidebar';

import AuthContext from '../../context/AuthContext';

import '../../Styles/list.css';

export default function MiscList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const navigate = useNavigate();

  const searchItemsFunction = async (term) => {
    try {
      showInfoToast('Searching data...');
      const response = await searchMiscs(user.token, term);

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
    navigate(`/Misc/${recordUserId}/${itemListId}/details`);
  }

  async function handleUpdate(recordUserId, itemListId) {
    navigate(`/Misc/${recordUserId}/${itemListId}/edit`);
  }

  async function handleDelete(recordUserId, itemListId) {
    try {
      await deleteMisc(user.token, recordUserId, itemListId);
      setItemList(itemList.filter((item) => item.id !== itemListId));
      showSuccessToast('Misc deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadMisc = async () => {
        try {
          const misc = await fetchMisc(user.token);
          setItemList(misc);
        } catch (err) {
          showErrorToast('Error loading misc');
        }
      };
      loadMisc();
    }
  }, [user, navigate]);

  return (
    <div>
      <Sidebar />

      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to="/Misc/new">Add new misc</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Misc</h1>
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
                  Type:
                  {item.type}
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
