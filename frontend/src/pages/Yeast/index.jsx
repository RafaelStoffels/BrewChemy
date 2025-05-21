import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchYeastById, updateYeast, addYeast } from '../../services/Yeasts';
import { showErrorToast, showSuccessToast } from '../../utils/notifications';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';

export default function NewYeast() {
  const { user } = useContext(AuthContext);
  const { recordUserId } = useParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState('Ale');
  const [form, setForm] = useState('Dry');
  const [temperatureRange, setTemperatureRange] = useState('');
  const [attenuation, setAttenuation] = useState('');
  const [alcoholTolerance, setAlcoholTolerance] = useState('');
  const [flavorProfile, setFlavorProfile] = useState('');
  const [flocculation, setFlocculation] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isView, setIsView] = useState(false);

  async function fetchYeast(userId, itemID) {
    try {
      const yeast = await fetchYeastById(api, user.token, userId, itemID);
      setName(yeast.name);
      setDescription(yeast.description);
      setManufacturer(yeast.manufacturer);
      setType(yeast.type);
      setForm(yeast.form);
      setTemperatureRange(yeast.temperatureRange);
      setAttenuation(yeast.attenuation);
      setAlcoholTolerance(yeast.alcoholTolerance);
      setFlavorProfile(yeast.flavorProfile);
      setFlocculation(yeast.flocculation);
    } catch (err) {
      showErrorToast(`Error loading yeast record.${err}`);
      navigate('/YeastList');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      name,
      description,
      manufacturer,
      type,
      form,
      temperatureRange,
      attenuation,
      alcoholTolerance,
      flavorProfile,
      flocculation,
    };

    try {
      if (isEditing) {
        await updateYeast(api, user.token, recordUserId, id, data);
        showSuccessToast('Yeast has been updated.');
      } else {
        await addYeast(api, user.token, data);
        showSuccessToast('Added new yeast successfully.');
      }
      navigate('/YeastList');
    } catch (err) {
      showErrorToast(`${err.message}`);
    }
  }

  function getTitle() {
    if (isEditing) return 'Update Fermentable';
    if (isView) return 'Fermentable Details';
    return 'Add New Fermentable';
  }

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (id) {
      if (window.location.pathname.includes('/details')) {
        setIsView(true);
        setIsEditing(false);
      } else {
        setIsView(false);
        setIsEditing(true);
      }
      fetchYeast(recordUserId, id);
    }
  }, [id, user, navigate]);

  return (
    <div>
      <div className="crud-container">
        <section>
          <h1>{getTitle()}</h1>
        </section>
        <div className="content">
          <form onSubmit={handleSubmit}>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isView}
                    style={{ width: '430px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Manufacturer
                  <input
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Description
                  <textarea
                    type="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Flavor Profile
                  <input
                    value={flavorProfile}
                    onChange={(e) => setFlavorProfile(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Type
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
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
                <label htmlFor="name">
                  Form
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                  >
                    <option value="Ale">Dry</option>
                    <option value="Lager">Liquid</option>
                    <option value="Hybrid">Culture</option>
                    <option value="Champagne">Slurry</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Attenuation %
                  <input
                    type="number"
                    value={attenuation}
                    onChange={(e) => setAttenuation(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Temperature Range
                  <input
                    value={temperatureRange}
                    onChange={(e) => setTemperatureRange(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Alcohol Tolerance
                  <input
                    type="number"
                    value={alcoholTolerance}
                    onChange={(e) => setAlcoholTolerance(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Flocculation
                  <input
                    value={flocculation}
                    onChange={(e) => setFlocculation(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
          </form>
        </div>
        {!isView && (
        <button onClick={handleSubmit} className="crud-save-button" type="submit">
          Save
        </button>
        )}
      </div>
    </div>
  );
}
