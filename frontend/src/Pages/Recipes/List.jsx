import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../Components/ItemListPage';
import useAuthRedirect from '../../hooks/useAuthRedirect';

import { fetchRecipes, deleteRecipe, searchRecipes } from '../../services/recipes';
import { showErrorToast, showInfoToast } from '../../utils/notifications';

import AuthContext from '../../context/AuthContext';

export default function RecipeList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const navigate = useNavigate();

  const onSearch = async (term) => {
    try {
      const response = await searchRecipes(user.token, term);

      if (Array.isArray(response) && response.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(response);
      }
    } catch (err) {
      showErrorToast(`Error: ${err}`);
    }
  };

  const onDetails = (id) => navigate(`/Recipes/${id}/details`);
  const onUpdate = (id) => navigate(`/Recipes/${id}/edit`);

  const onDelete = async (id) => {
    try {
      await deleteRecipe(user.token, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      showErrorToast(`Error deleting data. ${err}`);
    }
  };

  const renderItem = (item) => (
    <>
      <p>
        <strong>Author:</strong>
        {' '}
        {item?.author || 'N/A'}
      </p>
      <p>
        <strong>Style:</strong>
        {' '}
        {item.style}
      </p>
      <p>
        <strong>Description:</strong>
        {' '}
        {item?.description
          ? item.description.length > 140
            ? `${item.description.substring(0, 140)}...`
            : item.description
          : 'No description available'}
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

        const data = await fetchRecipes(user.token);
        setItemList(data);
      } catch (err) {
        showErrorToast('Error loading recipes');
      }
    };

    loadItems();
  }, [user]);

  return (
    <ItemListPage
      title="Recipe"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Recipes/new"
    />
  );
}
