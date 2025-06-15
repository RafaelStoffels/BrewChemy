import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../../hooks/useAuthRedirect';
import useFormMode from '../../../hooks/useFormMode';

import { fetchMiscById, updateMisc, addMisc } from '../../../services/misc';
import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewMisc() {
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
      description: '',
      type: 'Flavor',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadMisc = async () => {
      if (!id) return;

      try {
        const misc = await fetchMiscById(user.token, recordUserId, id);
        reset({
          name: misc.name || '',
          description: misc.description || '',
          type: misc.type || 'Flavor',
        });
      } catch {
        navigate('/MiscList');
      }
    };

    loadMisc();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Equipment', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateMisc(user.token, id, payload);
      } else {
        await addMisc(user.token, payload);
      }
      navigate('/MiscList');
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
    <div>
      <div className="crud-container">
        <section>
          <h1>{title}</h1>
        </section>
        <div className="content">
          <form onSubmit={handleSubmit(onValid, onError)}>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    {...register('name')}
                    disabled={isView}
                    style={{ width: '430px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="type">
                  Type
                  <select
                    {...register('type')}
                    disabled={isView}
                  >
                    <option value="Flavor">Flavor</option>
                    <option value="Fining">Fining</option>
                    <option value="Herb">Herb</option>
                    <option value="Spice">Spice</option>
                    <option value="Water Agent">Water Agent</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="description">
                  Description
                  <textarea
                    {...register('description')}
                    disabled={isView}
                  />
                </label>
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
    </div>
  );
}
