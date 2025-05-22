import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchMiscById, updateMisc, addMisc } from '../../services/misc';
import { showErrorToast, showSuccessToast } from '../../utils/notifications';

import AuthContext from '../../context/AuthContext';

import '../../Styles/crud.css';

export default function NewMisc() {
  const { user } = useContext(AuthContext);
  const { recordUserId } = useParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Spice');

  const [isEditing, setIsEditing] = useState(false);
  const [isView, setIsView] = useState(false);

  async function fetchMisc(userId, itemID) {
    try {
      const misc = await fetchMiscById(user.token, userId, itemID);
      setName(misc.name);
      setDescription(misc.description);
      setType(misc.type);
    } catch (err) {
      showErrorToast(`Error loading misc record.${err}`);
      navigate('/MiscList');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      name,
      description,
      type,
    };

    try {
      if (isEditing) {
        await updateMisc(user.token, recordUserId, id, data);
        showSuccessToast('Misc has been updated.');
      } else {
        await addMisc(user.token, data);
        showSuccessToast('Added new misc successfully.');
      }
      navigate('/MiscList');
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
      fetchMisc(recordUserId, id);
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
                  Type
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
