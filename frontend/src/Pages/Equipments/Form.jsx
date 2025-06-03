import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchEquipmentById, updateEquipment, addEquipment } from '../../services/equipments';

import { showErrorToast, showSuccessToast } from '../../utils/notifications';

import AuthContext from '../../context/AuthContext';

import '../../Styles/crud.css';

export default function NewEquipment() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const [itemUserId, setItemUserId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [batchVolume, setBatchVolume] = useState('');
  const [batchTime, setBatchTime] = useState('');
  const [boilTime, setBoilTime] = useState('');
  const [boilTemperature, setBoilTemperature] = useState('');
  const [boilOff, setBoilOff] = useState('');
  const [trubLoss, setTrubLoss] = useState('');
  const [deadSpace, setDeadSpace] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isView, setIsView] = useState(false);

  async function fetchEquipment(userId, itemID) {
    try {
      const equipment = await fetchEquipmentById(user.token, userId, itemID);
      setItemUserId(recordUserId);
      setName(equipment.name);
      setDescription(equipment.description);
      setEfficiency(equipment.efficiency);
      setBatchVolume(equipment.batchVolume);
      setBatchTime(equipment.batchTime);
      setBoilTime(equipment.boilTime);
      setBoilTemperature(equipment.boilTemperature);
      setBoilOff(equipment.boilOff);
      setTrubLoss(equipment.trubLoss);
      setDeadSpace(equipment.deadSpace);
    } catch (err) {
      showErrorToast(`Error loading equipment record. ${err}`);
      navigate('/EquipmentList');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      itemUserId,
      name,
      description,
      efficiency,
      batchVolume,
      boilTime,
      batchTime,
      boilTemperature,
      boilOff,
      trubLoss,
      deadSpace,
    };

    try {
      if (isEditing) {
        await updateEquipment(user.token, id, data);
        showSuccessToast('Equipment has been updated.');
      } else {
        await addEquipment(user.token, data);
        showSuccessToast('Added new equipment successfully.');
      }
      navigate('/EquipmentList');
    } catch (err) {
      showErrorToast(`Error saving equipment record: ${err.message}`);
    }
  }

  const renderHeader = () => {
    if (isEditing) return 'Update Equipment';
    if (isView) return 'Equipment Details';
    return 'Add New Equipment';
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (id) {
      const isDetail = window.location.pathname.includes('/details');
      setIsView(isDetail);
      setIsEditing(!isDetail);
      fetchEquipment(recordUserId, id);
    }
  }, [id, user, navigate, recordUserId]);

  return (
    <div>
      <div className="crud-container">
        <section>
          <h1>{renderHeader()}</h1>
        </section>
        <div className="content">
          <form onSubmit={handleSubmit}>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    value={batchVolume}
                    onChange={(e) => setBatchVolume(e.target.value)}
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
                    value={batchTime}
                    onChange={(e) => setBatchTime(e.target.value)}
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
                    value={boilTime}
                    onChange={(e) => setBoilTime(e.target.value)}
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
                    value={boilTemperature}
                    onChange={(e) => setBoilTemperature(e.target.value)}
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
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
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
                    value={boilOff}
                    onChange={(e) => setBoilOff(e.target.value)}
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
                    value={trubLoss}
                    onChange={(e) => setTrubLoss(e.target.value)}
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
                    value={deadSpace}
                    onChange={(e) => setDeadSpace(e.target.value)}
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
