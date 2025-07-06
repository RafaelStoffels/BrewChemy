import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../../Components/ItemListPage';

import useAuthRedirect from '../../../hooks/useAuthRedirect';

import { searchYeasts, fetchYeasts, deleteYeast } from '../../../services/yeasts';
import { showInfoToast, showErrorToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

export default function YeastList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    try {
      const result = await searchYeasts(user.token, term);

      if (Array.isArray(result) && result.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  const onDetails = (userId, id) => navigate(`/Yeasts/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Yeasts/${userId}/${id}/edit`);

  const onDelete = async (userId, id) => {
    try {
      await deleteYeast(user.token, userId, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      //
    }
  };

  const renderItem = (item) => (
    <>
      <p>
        <strong>Manufacturer:</strong>
        {' '}
        {item.manufacturer}
      </p>
      <p>
        <strong>Type:</strong>
        {' '}
        {item.type}
      </p>
      <p>
        <strong>Description:</strong>
        {' '}
        {item.description.length > 140
          ? `${item.description.substring(0, 140)}...`
          : item.description}
      </p>
    </>
  );

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadYeasts = async () => {
      try {
        if (!user?.token) return;

        const yeasts = await fetchYeasts(user.token);
        setItemList(yeasts);
      } catch {
        showErrorToast('Error loading yeast');
      }
    };
    loadYeasts();
  }, [user]);

  return (
    <ItemListPage
      title="Yeast"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Yeasts/new"
    />
  );
}
