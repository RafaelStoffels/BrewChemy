// src/Pages/Equipments/EquipmentList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../Components/ItemListPage';
import useAuthRedirect from '../../hooks/useAuthRedirect';

import { searchEquipments, fetchEquipments, deleteEquipment } from '../../services/equipments';
import { showInfoToast, showErrorToast } from '../../utils/notifications';
import AuthContext from '../../context/AuthContext';

export default function EquipmentList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    if (!user?.token) return;
    setIsFetching(true);
    try {
      const result = await searchEquipments(user.token, term);

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

  const onDetails = (id) => navigate(`/Equipments/${id}/details`);
  const onUpdate = (id) => navigate(`/Equipments/${id}/edit`);

  const onDelete = async (id) => {
    if (!user?.token) return;
    try {
      await deleteEquipment(user.token, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      showErrorToast(`Error deleting data. ${err}`);
    }
  };

  const renderItem = (item) => (
    <>
      <p>{item?.description || 'No description'}</p>
      {item?.batchVolume != null && (
        <p><strong>Batch volume:</strong> {item.batchVolume}</p>
      )}
      {item?.efficiency != null && (
        <p><strong>Efficiency:</strong> {item.efficiency}%</p>
      )}
    </>
  );

  // =======================
  // effects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    let active = true;
    const loadItems = async () => {
      try {
        if (!user?.token) { setLoading(false); return; }
        setLoading(true);
        const result = await fetchEquipments(user.token);
        if (active) setItemList(result);
      } catch (err) {
        showErrorToast('Error loading equipments');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadItems();
    return () => { active = false; };
  }, [user?.token]);

  return (
    <ItemListPage
      title="Equipment"
      itemList={itemList}
      onSearch={onSearch}
      onDetails={onDetails}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={renderItem}
      addNewRoute="/Equipments/new"
      isLoading={loading}
      isFetching={isFetching}
      skeletonCount={8}
    />
  );
}
