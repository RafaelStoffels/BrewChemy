import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import { fetchEquipmentById, updateEquipment, addEquipment } from '../../services/equipments';

import { showErrorToast, showSuccessToast } from '../../utils/notifications';

import AuthContext from '../../context/AuthContext';

import '../../Styles/crud.css';

export default function NewEquipment() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = React.useState(false);
  const [isView, setIsView] = React.useState(false);

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

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (id) {
      const isDetail = window.location.pathname.includes('/details');
      setIsView(isDetail);
      setIsEditing(!isDetail);

      fetchEquipmentById(user.token, recordUserId, id)
        .then((equipment) => {
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
        })
        .catch((err) => {
          showErrorToast(`Error loading equipment record. ${err}`);
          navigate('/EquipmentList');
        });
    }
  }, [id, user, navigate, recordUserId, reset]);

  const renderHeader = () => {
    if (isEditing) return 'Update Equipment';
    if (isView) return 'Equipment Details';
    return 'Add New Equipment';
  };

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateEquipment(user.token, id, payload);
        showSuccessToast('Equipment has been updated.');
      } else {
        await addEquipment(user.token, payload);
        showSuccessToast('Added new equipment successfully.');
      }
      navigate('/EquipmentList');
    } catch (err) {
      showErrorToast(`Error saving equipment record: ${err.message}`);
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
          <h1>{renderHeader()}</h1>
        </section>
        <div className="content">
          <form onSubmit={handleSubmit(onValid, onError)}>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="description">
                  Description
                  <textarea
                    id="description"
                    {...register('description')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="batchVolume">
                  Batch Volume
                  <input
                    id="batchVolume"
                    type="number"
                    {...register('batchVolume')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="batchTime">
                  Batch Time
                  <input
                    id="batchTime"
                    type="number"
                    {...register('batchTime')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="boilTime">
                  Boil Time
                  <input
                    id="boilTime"
                    type="number"
                    {...register('boilTime')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="boilTemperature">
                  Boil Temperature
                  <input
                    id="boilTemperature"
                    type="number"
                    {...register('boilTemperature')}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="efficiency">
                  Efficiency
                  <input
                    id="efficiency"
                    type="number"
                    {...register('efficiency')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="boilOff">
                  Boil Off
                  <input
                    id="boilOff"
                    type="number"
                    {...register('boilOff')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="trubLoss">
                  Trub Loss
                  <input
                    id="trubLoss"
                    type="number"
                    {...register('trubLoss')}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="deadSpace">
                  Dead Space
                  <input
                    id="deadSpace"
                    type="number"
                    {...register('deadSpace')}
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
