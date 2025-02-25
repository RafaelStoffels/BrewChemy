import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';
import { searchMiscs, fetchMisc, deleteMisc } from '../../services/Misc';
import { showErrorToast } from "../../utils/notifications";
import SearchInput from '../../components/SearchInput';


import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import '../../styles/list.css';

export default function MiscList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadMisc = async () => {
        try {
          const misc = await fetchMisc(api, user.token);
          setItemList(misc);
        } catch (err) {
          setError('Error loading misc');
        } finally {
          setLoading(false);
        }
      };
      loadMisc();
    }
  }, [user, navigate]);

  const searchItemsFunction = async (term) => {
    try{
      const response = await searchMiscs(api, user.token, term);
      setItemList(response);
    } catch (err) {
      showErrorToast("No data found." + err);
    }
  };

  async function handleDetails(itemListId) {
    navigate(`/Misc/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Misc/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await deleteMisc(api, user.token, itemListId);
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
          <Link className="Addbutton" to="/Misc/new">Add new misc</Link>
        </div>

        <SearchInput onSearch={searchItemsFunction} />

        <h1>Misc</h1>
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
