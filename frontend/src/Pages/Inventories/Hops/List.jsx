import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../../Components/ItemListPage';

import { searchHops, fetchHops, deleteHop } from '../../../services/hops';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

export default function HopList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    try {
      showInfoToast('Searching data...');
      const result = await searchHops(user.token, term);

      if (Array.isArray(result) && result.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  const onDetails = (userId, id) => navigate(`/Hops/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Hops/${userId}/${id}/edit`);

  const onDelete = async (userId, id) => {
    try {
      await deleteHop(user.token, userId, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
      showSuccessToast('Hop deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const renderItem = (item) => (
    <>
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
    </>
  );

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadHops = async () => {
        try {
          const hops = await fetchHops(user.token);
          setItemList(hops);
        } catch {
          showErrorToast('Error loading hops');
        }
      };
      loadHops();
    }
  }, [user, navigate]);

  return (
    <ItemListPage
      title="Hops"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Hops/new"
    />
  );
}
