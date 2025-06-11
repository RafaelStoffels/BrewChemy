import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../Components/ItemListPage';

import { searchEquipments, fetchEquipments, deleteEquipment } from '../../services/equipments';
import { showInfoToast, showErrorToast, showSuccessToast } from '../../utils/notifications';
import AuthContext from '../../context/AuthContext';

export default function EquipmentList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    try {
      showInfoToast('Searching data...');
      const result = await searchEquipments(user.token, term);

      if (Array.isArray(result) && result.length === 0) {
        showInfoToast('Data not found');
      } else {
        setItemList(result);
      }
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const onDetails = (userId, id) => navigate(`/Equipments/${userId}/${id}/details`);
  const onUpdate = (userId, id) => navigate(`/Equipments/${userId}/${id}/edit`);

  const onDelete = async (userId, id) => {
    try {
      await deleteEquipment(user.token, userId, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
      showSuccessToast('Equipment deleted.');
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const renderItem = (item) => (
    <p>{item.description}</p>
  );

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const loadItems = async () => {
        try {
          const result = await fetchEquipments(user.token);
          setItemList(result);
        } catch (err) {
          showErrorToast('Error loading equipments');
        }
      };
      loadItems();
    }
  }, [user, navigate]);

  return (
    <ItemListPage
      title="Equipments"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Equipments/new"
    />
  );
}
