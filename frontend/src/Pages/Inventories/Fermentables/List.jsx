import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../../Components/ItemListPage';
import useAuthRedirect from '../../../hooks/useAuthRedirect';

import { searchFermentables, fetchFermentables, deleteFermentable } from '../../../services/fermentables';
import { showInfoToast, showErrorToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

export default function FermentableList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    if (!user?.token) return;
    setIsFetching(true);
    try {
      const result = await searchFermentables(user.token, term);
      if (Array.isArray(result) && result.length === 0) {
        setItemList([]);
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`${err}`);
    } finally {
      setIsFetching(false);
    }
  };

  const onDetails = (userId, id) => navigate(`/Fermentables/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Fermentables/${userId}/${id}/edit`);

  const onDelete = async (id) => {
    if (!user?.token) return;
    try {
      await deleteFermentable(user.token, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const renderItem = (item) => (
    <>
      <p><strong>Supplier:</strong> {item.supplier}</p>
      <p><strong>Type:</strong> {item.type}</p>
      <p><strong>EBC:</strong> {item.ebc}</p>
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
    const loadItems = async () => {
      try {
        if (!user?.token) { setLoading(false); return; }
        setLoading(true);
        const result = await fetchFermentables(user.token);
        if (active) setItemList(result);
      } catch (err) {
        showErrorToast('Error loading fermentables');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadItems();
    return () => { active = false; };
  }, [user?.token]);

  return (
    <ItemListPage
      title="Fermentable"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Fermentables/new"
      isLoading={loading}
      isFetching={isFetching}
      skeletonCount={8}
    />
  );
}
