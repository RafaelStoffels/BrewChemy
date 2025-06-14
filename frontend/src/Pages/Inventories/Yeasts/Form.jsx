import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema'; // <-- Aqui devem estar as regras do Yup

import { fetchYeastById, updateYeast, addYeast } from '../../../services/yeasts';
import { showErrorToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewYeast() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const isDetail = window.location.pathname.includes('/details');
  const isEditing = !!id && !isDetail;
  const isView = !!id && isDetail;

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
      flocculation: '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (id) {
      fetchYeastById(user.token, recordUserId, id)
        .then((yeast) => {
          reset({
            name: yeast.name || '',
            manufacturer: yeast.manufacturer || '',
            description: yeast.description || '',
            flavorProfile: yeast.flavorProfile || '',
            type: yeast.type || 'Ale',
            form: yeast.form || 'Dry',
            attenuation: yeast.attenuation || '',
            temperatureRange: yeast.temperatureRange || '',
            flocculation: yeast.flocculation || '',
          });
        })
        .catch(() => {
          navigate('/YeastList');
        });
    }
  }, [id, user, navigate, recordUserId, reset]);

  const getTitle = () => {
    if (isEditing) return 'Update Yeast';
    if (isView) return 'Yeast Details';
    return 'Add New Yeast';
  };

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
          <h1>{getTitle()}</h1>
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
                  Flavor Profile
                  <input
                    {...register('flavorProfile')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>

            <div className="inputs-row">
              <div className="input-field">
                <label>
                  Type
                  <select {...register('type')} disabled={isView}>
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
                  <select {...register('form')} disabled={isView}>
                    <option value="Dry">Dry</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Culture">Culture</option>
                    <option value="Slurry">Slurry</option>
                  </select>
                </label>
              </div>

              <div className="input-field">
                <label>
                  Attenuation %
                  <input
                    type="number"
                    {...register('attenuation')}
                    disabled={isView}
                  />
                </label>
              </div>

              <div className="input-field">
                <label>
                  Temperature Range
                  <input
                    {...register('temperatureRange')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>

            <div className="inputs-row">
              <div className="input-field">
                <label>
                  Flocculation
                  <input
                    {...register('flocculation')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field" />
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
