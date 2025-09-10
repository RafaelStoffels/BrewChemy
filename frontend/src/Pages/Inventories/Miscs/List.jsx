import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ItemListPage from '../../../Components/ItemListPage';

import useAuthRedirect from '../../../hooks/useAuthRedirect';

import { searchMiscs, fetchMisc, deleteMisc } from '../../../services/misc';
import { showInfoToast, showErrorToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

export default function MiscList() {
  const { user } = useContext(AuthContext);
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (term) => {
    if (!user?.token) return;
    setIsFetching(true);
    try {
      const result = await searchMiscs(user.token, term);
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

  const onDetails = (id) => navigate(`/Miscs/${id}/details`);
  const onUpdate = (id) => navigate(`/Miscs/${id}/edit`);

  const onDelete = async (id) => {
    if (!user?.token) return;
    try {
      await deleteMisc(user.token, id);
      setItemList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      showErrorToast(`${err}`);
    }
  };

  const renderItem = (item) => (
    <>
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
    const loadMisc = async () => {
      try {
        if (!user?.token) { setLoading(false); return; }
        setLoading(true);
        const miscs = await fetchMisc(user.token);
        if (active) setItemList(miscs);
      } catch {
        showErrorToast('Error loading misc');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMisc();
    return () => { active = false; };
  }, [user?.token]);

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
      isLoading={loading}
      isFetching={isFetching}
      skeletonCount={8}
    />
  );
}
