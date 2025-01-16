import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen  } from 'react-icons/fi';
import { fetchMalts, deleteMalt } from '../../services/malts';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import '../../styles/list.css';

export default function MaltList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadMalts = async () => {
        try {
          const malts = await fetchMalts(api, user.token);
          setItemList(malts);
        } catch (err) {
          setError('Error loading malts');
        } finally {
          setLoading(false);
        }
      };
      loadMalts();
    }
  }, [user, navigate]);

  async function handleDetails(itemListId) {
    navigate(`/Malts/${itemListId}/details`);
  }

  async function handleUpdate(itemListId) {
    navigate(`/Malts/${itemListId}/edit`);
  }

  async function handleDelete(itemListId) {
    try {
      await deleteMalt(api, user.token, itemListId);
      setItemList(itemList.filter(itemList => itemList.id !== itemListId));
    } catch (err) {
      alert(`${err.message}`);
    }
  }

  return (
    <div className='list-container'>

      <Sidebar />

      <Header />

       <div className="div-addButton">
          <Link className="Addbutton" to="/Malts/new">Add new malt</Link>
       </div>

         <h1>Malts</h1>
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
             <p>No malt found.</p>
           )
         )}
    </div>
  );
}
