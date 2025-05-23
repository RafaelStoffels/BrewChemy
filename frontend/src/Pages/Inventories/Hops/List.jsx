import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';

import { searchHops, fetchHops, deleteHop } from '../../../services/hops';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

import Sidebar from '../../../Components/Sidebar';
import SearchInput from '../../../Components/SearchInput';

import '../../../Styles/list.css';

export default function HopList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const navigate = useNavigate();

  const searchItemsFunction = async (term) => {
    try {
      showInfoToast('Searching data...');
      const recipeResponse = await searchHops(user.token, term);

      if (Array.isArray(recipeResponse) && recipeResponse.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(recipeResponse);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  async function handleDetails(recordUserId, itemListId) {
    navigate(`/Hops/${recordUserId}/${itemListId}/details`);
  }

  async function handleUpdate(recordUserId, itemListId) {
    navigate(`/Hops/${recordUserId}/${itemListId}/edit`);
  }

  async function handleDelete(recordUserId, itemListId) {
    try {
      await deleteHop(user.token, recordUserId, itemListId);
      setItemList(itemList.filter((item) => item.id !== itemListId));
      showSuccessToast('Hop deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadHops = async () => {
        try {
          const hops = await fetchHops(user.token);
          setItemList(hops);
        } catch (err) {
          showErrorToast('Error loading hops');
        }
      };
      loadHops();
    }
  }, [user, navigate]);

  return (
    <div>
      <Sidebar />

      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to="/Hops/new">Add new hops</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Hops</h1>
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
