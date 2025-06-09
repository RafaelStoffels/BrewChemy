import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import {
  fetchFermentableById,
  updateFermentable,
  addFermentable,
} from '../../../services/fermentables';

import { showErrorToast, showSuccessToast } from '../../../utils/notifications';
import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewFermentable() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const isDetail = window.location.pathname.includes('/details');
  const isEditing = id && !isDetail;
  const isView = id && isDetail;

  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      supplier: '',
      description: '',
      type: 'base',
      ebc: '',
      potentialExtract: '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (id) {
      fetchFermentableById(user.token, recordUserId, id)
        .then((fermentable) => {
          reset({
            name: fermentable.name || '',
            supplier: fermentable.supplier || '',
            description: fermentable.description || '',
            type: fermentable.type || 'base',
            ebc: fermentable.ebc || '',
            potentialExtract: fermentable.potentialExtract || '',
          });
        })
        .catch((err) => {
          showErrorToast(`Error loading fermentable record. ${err}`);
          navigate('/FermentableList');
        });
    }
  }, [id, user, navigate, recordUserId, reset]);

  const getTitle = () => {
    if (isEditing) return 'Update Fermentable';
    if (isView) return 'Fermentable Details';
    return 'Add New Fermentable';
  };

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateFermentable(user.token, id, payload);
        showSuccessToast('Fermentable has been updated.');
      } else {
        await addFermentable(user.token, payload);
        showSuccessToast('Added new fermentable successfully.');
      }
      navigate('/FermentableList');
    } catch (err) {
      showErrorToast(`Error saving fermentable record: ${err.message}`);
    }
  };

  const onError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showErrorToast(firstError.message);
    }
  };

  return (
    <div className="crud-container">
      <section>
        <h1>{getTitle()}</h1>
      </section>
      <div className="content">
        <form onSubmit={handleSubmit(onValid, onError)}>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                {...register('name')}
                disabled={isView}
                style={{ width: '430px' }}
              />
            </div>
            <div className="input-field">
              <label htmlFor="supplier">Supplier</label>
              <input
                id="supplier"
                {...register('supplier')}
                disabled={isView}
              />
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                {...register('description')}
                disabled={isView}
              />
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                {...register('type')}
                disabled={isView}
              >
                <option value="Base">Base</option>
                <option value="Specialty">Specialty</option>
                <option value="Adjunct">Adjunct</option>
              </select>
            </div>
            <div className="input-field">
              <label htmlFor="ebc">Color Degree</label>
              <input
                id="ebc"
                type="number"
                {...register('ebc')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="potentialExtract">Potential Extract</label>
              <input
                id="potentialExtract"
                type="number"
                step="any"
                {...register('potentialExtract')}
                disabled={isView}
              />
            </div>
          </div>
          {!isView && (
            <button className="crud-save-button" type="submit">
              Save
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
