import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../../hooks/useAuthRedirect';
import useFormMode from '../../../hooks/useFormMode';

import {
  fetchFermentableById,
  updateFermentable,
  addFermentable,
} from '../../../services/fermentables';

import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';
import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewFermentable() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const { isEditing, isView } = useFormMode();

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
      type: 'Base',
      ebc: '',
      potentialExtract: '',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadFermentable = async () => {
      if (!id) return;

      try {
        const fermentable = await fetchFermentableById(user.token, recordUserId, id);
        reset({
          name: fermentable.name || '',
          supplier: fermentable.supplier || '',
          description: fermentable.description || '',
          type: fermentable.type || 'Base',
          ebc: fermentable.ebc || '',
          potentialExtract: fermentable.potentialExtract || '',
        });
      } catch {
        navigate('/FermentableList');
      }
    };

    loadFermentable();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Fermentable', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateFermentable(user.token, id, payload);
      } else {
        await addFermentable(user.token, payload);
      }
      navigate('/FermentableList');
    } catch (err) {
      //
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
        <h1>{title}</h1>
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
                step="any"
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
