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
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    if (!user?.token) return;
    setIsFetching(true);
    try {
      const result = await searchYeasts(user.token, term);
      if (Array.isArray(result) && result.length === 0) {
        setItemList([]);
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    } finally {
      setIsFetching(false);
    }
  };

  const onDetails = (userId, id) => navigate(`/Yeasts/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Yeasts/${userId}/${id}/edit`);

  const onDelete = async (id) => {
    if (!user?.token) return;
    try {
      await deleteYeast(user.token, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  const renderItem = (item) => (
    <>
      <p><strong>Manufacturer:</strong> {item.manufacturer}</p>
      <p><strong>Type:</strong> {item.type}</p>
      <p>
        <strong>Description:</strong>{' '}
        {item?.description
          ? (item.description.length > 140 ? `${item.description.substring(0, 140)}...` : item.description)
          : 'No description available'}
      </p>
    </>
  );

  useAuthRedirect(user);

  useEffect(() => {
    let active = true;
    const loadYeasts = async () => {
      try {
        if (!user?.token) { setLoading(false); return; }
        setLoading(true);
        const yeasts = await fetchYeasts(user.token);
        if (active) setItemList(yeasts);
      } catch {
        showErrorToast('Error loading yeast');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadYeasts();
    return () => { active = false; };
  }, [user?.token]);

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
      isLoading={loading}
      isFetching={isFetching}
      skeletonCount={8}
    />
  );
}
