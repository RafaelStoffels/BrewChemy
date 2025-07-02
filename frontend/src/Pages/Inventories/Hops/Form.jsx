import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../../hooks/useAuthRedirect';
import useFormMode from '../../../hooks/useFormMode';

import { fetchHopById, updateHop, addHop } from '../../../services/hops';
import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewHop() {
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
      countryOfOrigin: '',
      type: 'Pellet',
      useType: 'Boil',
      alphaAcidContent: '',
      betaAcidContent: '',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadHop = async () => {
      if (!id) return;

      try {
        const hop = await fetchHopById(user.token, recordUserId, id);
        reset({
          name: hop.name || '',
          supplier: hop.supplier || '',
          description: hop.description || '',
          countryOfOrigin: hop.countryOfOrigin || '',
          type: hop.type || 'Pellet',
          useType: hop.useType || 'Boil',
          alphaAcidContent: hop.alphaAcidContent || '',
          betaAcidContent: hop.betaAcidContent || '',
        });
      } catch {
        navigate('/HopList');
      }
    };

    loadHop();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Hop', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateHop(user.token, id, payload);
      } else {
        await addHop(user.token, payload);
      }
      navigate('/HopList');
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
                <label>
                  Name
                  <input
                    {...register('name')}
                    disabled={isView}
                    style={{ width: '430px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label>
                  Supplier
                  <input
                    {...register('supplier')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>

            <div className="inputs-row">
              <div className="input-field" style={{ width: '100%' }}>
                <label>
                  Description
                  <textarea
                    {...register('description')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>

            <div className="inputs-row">
              <div className="input-field">
                <label>
                  Country of Origin
                  <input
                    {...register('countryOfOrigin')}
                    disabled={isView}
                  />
                </label>
              </div>

              <div className="input-field">
                <label>
                  Type
                  <select
                    {...register('type')}
                    disabled={isView}
                  >
                    <option value="Pellet">Pellet</option>
                    <option value="Whole">Whole</option>
                    <option value="Cryo">Cryo</option>
                    <option value="CO2 Extract">CO2 Extract</option>
                  </select>
                </label>
              </div>

              <div className="input-field">
                <label>
                  Use Type
                  <select
                    {...register('useType')}
                    disabled={isView}
                  >
                    <option value="Boil">Boil</option>
                    <option value="Dry Hop">Dry Hop</option>
                    <option value="Aroma">Aroma</option>
                    <option value="Mash">Mash</option>
                    <option value="First Wort">First Wort</option>
                  </select>
                </label>
              </div>

              <div className="input-field">
                <label>
                  Alpha Acid
                  <input
                    type="number"
                    step="any"
                    {...register('alphaAcidContent')}
                    disabled={isView}
                  />
                </label>
              </div>

              <div className="input-field">
                <label>
                  Beta Acid
                  <input
                    type="number"
                    step="any"
                    {...register('betaAcidContent')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>

            {!isView && (
              <div className="button-container">
                <button className="crud-save-button" type="submit">
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
