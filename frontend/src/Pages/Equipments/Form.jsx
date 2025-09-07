import React, { useEffect, useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../hooks/useAuthRedirect';
import useFormMode from '../../hooks/useFormMode';

// Components
import { LoadingButton } from '@/Components/LoadingButton';
import HelpHint from "@/Components/HelpHint";

import {
  fetchEquipmentById,
  updateEquipment,
  addEquipment,
} from '../../services/equipments';

import { showErrorToast } from '../../utils/notifications';
import getFormTitle from '../../utils/formTitle';
import AuthContext from '../../context/AuthContext';

import { toDisplayVolume, toLiters } from '../../utils/displayUnits';

import '../../Styles/crud.css';

export default function NewEquipment() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const { isEditing, isView } = useFormMode();

  const volumeUnit = useMemo(
    () => (user?.volumeUnit === 'gal' ? 'gal' : 'L'),
    [user?.volumeUnit]
  );
  const volumeLabel = volumeUnit === 'gal' ? 'gal' : 'L';
  const volDecimals = { gal: 3, l: 2, ml: 0 };

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
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
        const equipment = await fetchEquipmentById(user.token, id);

        const mapV = (v) => toDisplayVolume(Number(v ?? 0), volumeUnit, volDecimals);

      try {
        reset({
          name: equipment.name || '',
          description: equipment.description || '',
          efficiency: equipment.efficiency ?? '',
          batchVolume: equipment.batchVolume != null ? mapV(equipment.batchVolume) : '',
          batchTime: equipment.batchTime ?? '',
          boilTime: equipment.boilTime ?? '',
          boilTemperature: equipment.boilTemperature ?? '',
          boilOff: equipment.boilOff != null ? mapV(equipment.boilOff) : '',
          trubLoss: equipment.trubLoss != null ? mapV(equipment.trubLoss) : '',
          deadSpace: equipment.deadSpace != null ? mapV(equipment.deadSpace) : '',
        });
      } catch {
        navigate('/EquipmentList');
      }
    };

    loadEquipment();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Equipment', isEditing, isView);

  const onValid = async (data) => {
    const toL = (v) => (v === '' || v == null ? null : toLiters(v, volumeUnit));

    const payload = {
      ...data,
      batchVolume: toL(data.batchVolume),
      boilOff: toL(data.boilOff),
      trubLoss: toL(data.trubLoss),
      deadSpace: toL(data.deadSpace),
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
              <label htmlFor="batchVolume">Batch Volume ({volumeLabel})</label>
              <input
                id="batchVolume"
                type="number"
                step="any"
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
              <label htmlFor="boilOff">
                Boil Off ({volumeLabel})
                <HelpHint text="Boil off is the portion of wort that evaporates during the boil." />
              </label> 
              <input
                id="boilOff"
                type="number"
                step="any"
                {...register('boilOff')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="trubLoss">
                Trub Loss ({volumeLabel})
                <HelpHint text="Trub loss is the wort volume lost to the sediment (hops, proteins, 
                                and other particles) that settles at the bottom of the kettle" />
              </label>
              <input
                id="trubLoss"
                type="number"
                step="any"
                {...register('trubLoss')}
                disabled={isView}
              />
            </div>
            <div className="input-field">
              <label htmlFor="deadSpace">
                Dead Space ({volumeLabel})
                <HelpHint text="Dead space is the wort volume that remains trapped in the equipment 
                               (valves, pipes, or bottom of the kettle) and cannot be drained." />
              </label>
              <input
                id="deadSpace"
                type="number"
                step="any"
                {...register('deadSpace')}
                disabled={isView}
              />
            </div>
          </div>
        </form>
      </div>
      {!isView && (
        <LoadingButton
          form="formSubmit"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="crud-save-button"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </LoadingButton>
      )}
    </div>
  );
}
