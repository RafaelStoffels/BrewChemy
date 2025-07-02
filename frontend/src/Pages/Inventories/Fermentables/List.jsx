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
  const navigate = useNavigate();

  const onSearch = async (term) => {
    try {
      const result = await searchFermentables(user.token, term);

      if (Array.isArray(result) && result.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const onDetails = (userId, id) => navigate(`/Fermentables/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Fermentables/${userId}/${id}/edit`);

  const onDelete = async (userId, id) => {
    try {
      await deleteFermentable(user.token, userId, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      //
    }
  };

  const renderItem = (item) => (
    <>
      <p>
        Supplier:
        {' '}
        {item.supplier}
      </p>
      <p>
        Type:
        {' '}
        {item.type}
      </p>
      <p>
        EBC:
        {' '}
        {item.ebc}
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

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadItems = async () => {
      try {
        if (!user?.token) return;

        const result = await fetchFermentables(user.token);
        setItemList(result);
      } catch (err) {
        showErrorToast('Error loading fermentables');
      }
    };
    loadItems();
  }, [user]);

  return (
    <ItemListPage
      title="Fermentables"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Fermentables/new"
    />
  );
}
