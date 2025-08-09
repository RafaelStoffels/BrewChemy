import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../../hooks/useAuthRedirect';
import useFormMode from '../../../hooks/useFormMode';

import { fetchYeastById, updateYeast, addYeast } from '../../../services/yeasts';
import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewYeast() {
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
      manufacturer: '',
      description: '',
      flavorProfile: '',
      type: 'Ale',
      form: 'Dry',
      attenuation: '',
      temperatureRange: '',
      flocculation: 'Low',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadYeast = async () => {
      if (!id) return;

      try {
        const yeast = await fetchYeastById(user.token, recordUserId, id);
        reset({
          name: yeast.name || '',
          manufacturer: yeast.manufacturer || '',
          description: yeast.description || '',
          flavorProfile: yeast.flavorProfile || '',
          type: yeast.type || 'Ale',
          form: yeast.form || 'Dry',
          attenuation: yeast.attenuation || '',
          temperatureRange: yeast.temperatureRange || '',
          flocculation: yeast.flocculation || 'Low',
        });
      } catch {
        navigate('/YeastList');
      }
    };

    loadYeast();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Yeast', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateYeast(user.token, id, payload);
      } else {
        await addYeast(user.token, payload);
      }
      navigate('/YeastList');
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
          <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
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
                  Manufacturer
                  <input
                    {...register('manufacturer')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>

            <div className="inputs-row">
              <div className="input-field">
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
                  Attenuation %
                  <input
                    style={{ width: '100px' }}
                    type="number"
                    {...register('attenuation')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label>
                  Type
                  <select style={{ width: '150px' }} {...register('type')} disabled={isView}>
                    <option value="Ale">Ale</option>
                    <option value="Lager">Lager</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Champagne">Champagne</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Wine">Wine</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div className="input-field">
                <label>
                  Form
                  <select style={{ width: '170px' }} {...register('form')} disabled={isView}>
                    <option value="Dry">Dry</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Culture">Culture</option>
                    <option value="Slurry">Slurry</option>
                  </select>
                </label>
              </div>

              <div className="input-field">
                <label>
                  Flocculation
                  <select style={{ width: '200px' }} {...register('flocculation')} disabled={isView}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium - High">Medium - High</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </label>
              </div>
              <div className="input-field" />
            </div>
          </form>
        </div>
        {!isView && (
          <button form="formSubmit" className="crud-save-button" type="submit">
            Save
          </button>
        )}
      </div>
    </div>
  );
}
