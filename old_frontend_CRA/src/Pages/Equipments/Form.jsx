import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../hooks/useAuthRedirect';
import useFormMode from '../../hooks/useFormMode';

import {
  fetchEquipmentById,
  updateEquipment,
  addEquipment,
} from '../../services/equipments';

import { showErrorToast } from '../../utils/notifications';
import getFormTitle from '../../utils/formTitle';
import AuthContext from '../../context/AuthContext';

import '../../Styles/crud.css';

export default function NewEquipment() {
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
      efficiency: '',
      batchVolume: '',
      batchTime: '',
      boilTime: '',
      boilTemperature: '',
      boilOff: '',
      trubLoss: '',
      deadSpace: '',
    },
  });

  useAuthRedirect(user);

  useEffect(() => {
    const loadEquipment = async () => {
      if (!id) return;

      try {
        const equipment = await fetchEquipmentById(user.token, recordUserId, id);
        reset({
          name: equipment.name || '',
          description: equipment.description || '',
          efficiency: equipment.efficiency || '',
          batchVolume: equipment.batchVolume || '',
          batchTime: equipment.batchTime || '',
          boilTime: equipment.boilTime || '',
          boilTemperature: equipment.boilTemperature || '',
          boilOff: equipment.boilOff || '',
          trubLoss: equipment.trubLoss || '',
          deadSpace: equipment.deadSpace || '',
        });
      } catch {
        navigate('/EquipmentList');
      }
    };

    loadEquipment();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Equipment', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateEquipment(user.token, id, payload);
      } else {
        await addEquipment(user.token, payload);
      }
      navigate('/EquipmentList');
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
        <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="efficiency">Efficiency</label>
              <input
                id="efficiency"
                type="number"
                {...register('efficiency')}
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
              <label htmlFor="batchVolume">Batch Volume (L)</label>
              <input
                id="batchVolume"
                type="number"
                {...register('batchVolume')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="batchTime">Batch Time (minutes)</label>
              <input
                id="batchTime"
                type="number"
                {...register('batchTime')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="boilTime">Boil Time (minutes)</label>
              <input
                id="boilTime"
                type="number"
                {...register('boilTime')}
                disabled={isView}
              />
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="boilTemperature">Boil Temper. (celsius)</label>
              <input
                id="boilTemperature"
                type="number"
                {...register('boilTemperature')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="boilOff">Boil Off (L)</label>
              <input
                id="boilOff"
                type="number"
                {...register('boilOff')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="trubLoss">Trub Loss (L)</label>
              <input
                id="trubLoss"
                type="number"
                {...register('trubLoss')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="deadSpace">Dead Space (L)</label>
              <input
                id="deadSpace"
                type="number"
                {...register('deadSpace')}
                disabled={isView}
              />
            </div>
          </div>
        </form>
      </div>
      {!isView && (
        <button form="formSubmit" className="crud-save-button" type="submit">
          Save
        </button>
      )}
    </div>
  );
}
