import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchHopById, updateHop, addHop } from '../../../services/hops';
import { showErrorToast, showSuccessToast } from '../../../utils/notifications';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';

export default function NewHop() {
  const { user } = useContext(AuthContext);
  const { recordUserId } = useParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [useType, setUseType] = useState('Boil');
  const [type, setType] = useState('Pellet');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [alphaAcidContent, setAlphaAcidContent] = useState('');
  const [betaAcidContent, setBetaAcidContent] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isView, setIsView] = useState(false);

  async function fetchHop(userId, itemID) {
    try {
      const hop = await fetchHopById(user.token, userId, itemID);
      setName(hop.name);
      setDescription(hop.description);
      setSupplier(hop.supplier);
      setCountryOfOrigin(hop.countryOfOrigin);
      setUseType(hop.useType);
      setType(hop.type);
      setAlphaAcidContent(hop.alphaAcidContent);
      setBetaAcidContent(hop.betaAcidContent);
    } catch (err) {
      showErrorToast(`Error loading hop record.${err}`);
      navigate('/HopList');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      name,
      description,
      supplier,
      useType,
      type,
      countryOfOrigin,
      alphaAcidContent,
      betaAcidContent,
    };

    try {
      if (isEditing) {
        await updateHop(user.token, recordUserId, id, data);
        showSuccessToast('Hop has been updated.');
      } else {
        await addHop(user.token, data);
        showSuccessToast('Added new hop successfully.');
      }
      navigate('/HopList');
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
      fetchHop(recordUserId, id);
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
                  Supplier
                  <input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
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
                  Country of Origin
                  <input
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Type
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Pellet">Pellet</option>
                    <option value="Whole">Whole</option>
                    <option value="Cryo">Cryo</option>
                    <option value="CO2 Extract">CO2 Extract</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Use Type
                  <select
                    value={useType}
                    onChange={(e) => setUseType(e.target.value)}
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
                <label htmlFor="name">
                  Alpha Acid
                  <input
                    type="number"
                    value={alphaAcidContent}
                    onChange={(e) => setAlphaAcidContent(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Beta Acid
                  <input
                    type="number"
                    value={betaAcidContent}
                    onChange={(e) => setBetaAcidContent(e.target.value)}
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
