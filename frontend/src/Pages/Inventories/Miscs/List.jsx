import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../../Components/ItemListPage';

import { searchMiscs, fetchMisc, deleteMisc } from '../../../services/misc';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

export default function MiscList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    try {
      showInfoToast('Searching data...');
      const result = await searchMiscs(user.token, term);

      if (Array.isArray(result) && result.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  const onDetails = (userId, id) => navigate(`/Miscs/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Miscs/${userId}/${id}/edit`);

  const onDelete = async (userId, id) => {
    try {
      await deleteMisc(user.token, userId, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
      showSuccessToast('Misc deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const renderItem = (item) => (
    <>
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
    </>
  );

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadMisc = async () => {
        try {
          const miscs = await fetchMisc(user.token);
          setItemList(miscs);
        } catch {
          showErrorToast('Error loading misc');
        }
      };
      loadMisc();
    }
  }, [user, navigate]);

  return (
    <ItemListPage
      title="Misc"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Miscs/new"
    />
  );
}
