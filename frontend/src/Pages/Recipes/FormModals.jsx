import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import SearchInput from '../../Components/SearchInput';

import { showErrorToast, showInfoToast } from '../../utils/notifications';

import { searchEquipments, fetchEquipments } from '../../services/equipments';
import { searchFermentables, fetchFermentables } from '../../services/fermentables';
import { searchHops, fetchHops } from '../../services/hops';
import { searchMiscs, fetchMisc } from '../../services/misc';
import { searchYeasts, fetchYeasts } from '../../services/yeasts';

import AuthContext from '../../context/AuthContext';

export function AddFermentableModal({ isOpen, closeModal, handleAddFermentableRecipe }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);

  const { user } = useContext(AuthContext);

  const searchItemsFunction = async (term) => {
    const recipeResponse = await searchFermentables(user.token, term);
    setItemList(recipeResponse);
  };

  const handleSelectItem = (fermentable) => {
    setSelectedItem(fermentable); // Armazena o fermentável selecionado
  };

  const handleSaveButton = () => {
    if (selectedItem && quantity) {
      handleAddFermentableRecipe(selectedItem.id, quantity); // Agora enviamos o objeto inteiro
      closeModal();
    } else {
      showErrorToast('Please fill in all fields.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      const loadItems = async () => {
        try {
          const items = await fetchFermentables(user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading fermentables');
        }
      };
      loadItems();
    }
  }, [isOpen, user.token]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Fermentables Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>Select a fermentable</h2>
      <form onSubmit={handleAddFermentableRecipe}>
        <div className="modal">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={searchItemsFunction}
          />

          <div className="modal-search-container">
            {itemList.length > 0 ? (
              <ul className="modal-search-results">
                {itemList.map((item) => (
                  <li key={item.id} className="modal-search-item">
                    <button
                      type="button"
                      className={`modal-search-button ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleSelectItem(item)}
                    >
                      {item.name}
                      {' '}
                      (
                      {item.supplier}
                      )
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="modal-placeholder">No results found</p>
            )}
          </div>

          <div className="inputs-row">
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="quantity">
                Quantity (Grams)
                {' '}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ width: '150px' }}
              />

            </div>
          </div>
        </div>
        <button type="button" onClick={handleSaveButton} className="crud-save-button" style={{ marginTop: '70px' }}>
          Add Fermentable
        </button>
      </form>
    </Modal>
  );
}

AddFermentableModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleAddFermentableRecipe: PropTypes.func.isRequired,
};

export function AddHopModal({ isOpen, closeModal, handleAddHopRecipe }) {
  const [selectedItem, setSelectedHop] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [alphaAcid, setAlphaAcid] = useState('');
  const [boilTime, setBoilTime] = useState(60);
  const [useType, setUseType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);

  const { user } = useContext(AuthContext);

  const searchItemsFunction = async (term) => {
    const response = await searchHops(user.token, term);
    setItemList(response);
  };

  const handleSelectItem = (item) => {
    setSelectedHop(item);
    if (item.alphaAcidContent != null) {
      setAlphaAcid(item.alphaAcidContent);
    }
  };

  const handleSaveButton = () => {
    if (selectedItem && quantity && boilTime) {
      handleAddHopRecipe(selectedItem.id, quantity, boilTime, alphaAcid, useType);
      closeModal();
    } else {
      showErrorToast('Please fill in all fields.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      const loadItems = async () => {
        try {
          const items = await fetchHops(user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading hops');
        }
      };
      loadItems();
    }
  }, [isOpen, user.token]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Hops Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>Select a Hop</h2>
      <form onSubmit={handleSaveButton}>
        <div className="modal">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={searchItemsFunction}
          />

          <div className="modal-search-container">
            {itemList.length > 0 && (
            <ul className="modal-search-results">
              {itemList.map((item) => (
                <li key={item.id} className="modal-search-item">
                  <button
                    type="button"
                    className={`modal-search-button ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    {item.name}
                    {' '}
                    (
                    {item.supplier}
                    )
                  </button>
                </li>
              ))}
            </ul>
            )}
          </div>
          <div className="inputs-row">
            <div className="input-field" style={{ marginTop: '10px' }}>
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
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="name">
                Boil Time
                <input
                  type="number"
                  value={boilTime}
                  onChange={(e) => setBoilTime(e.target.value)}
                />
              </label>
            </div>
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="name">
                Alpha Acid
                <input
                  type="number"
                  value={alphaAcid}
                  onChange={(e) => setAlphaAcid(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="name">
                Quantity (Grams)
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '150px' }}
                />
              </label>
            </div>
          </div>
        </div>
        <button type="button" onClick={handleSaveButton} className="crud-save-button">
          Add Hop
        </button>
      </form>
    </Modal>
  );
}

AddHopModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleAddHopRecipe: PropTypes.func.isRequired,
};

export function AddMiscModal({ isOpen, closeModal, handleAddMiscRecipe }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);

  const { user } = useContext(AuthContext);

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleSaveButton = () => {
    if (selectedItem && quantity) {
      handleAddMiscRecipe(selectedItem.id, quantity);
      closeModal();
    } else {
      showErrorToast('Please fill in all fields.');
    }
  };

  const searchItemsFunction = async (term) => {
    try {
      const response = await searchMiscs(user.token, term);
      setItemList(response);
    } catch (error) {
      showErrorToast('Error fetching misc data: ', error);
      setItemList([]);
    }
  };

  const handleSelectItem = (misc) => {
    setSelectedItem(misc);
  };

  useEffect(() => {
    if (isOpen) {
      const loadItems = async () => {
        try {
          const items = await fetchMisc(user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading misc');
        }
      };
      loadItems();
    }
  }, [isOpen, user.token]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Misc Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>Select a Misc</h2>
      <form onSubmit={handleSaveButton}>
        <div className="modal">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={searchItemsFunction}
          />

          <div className="modal-search-container">
            {itemList.length > 0 ? (
              <ul className="modal-search-results">
                {itemList.map((item) => (
                  <li key={item.id} className="modal-search-item">
                    <button
                      type="button"
                      className={`modal-search-button ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleSelectItem(item)}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="modal-placeholder">No results found</p>
            )}
          </div>
          <div className="inputs-row">
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="name">
                Quantity (Grams)
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  style={{ width: '150px' }}
                />
              </label>
            </div>
          </div>
          <button type="button" onClick={handleSaveButton} className="crud-save-button" style={{ marginTop: '70px' }}>
            Add Misc
          </button>
        </div>
      </form>
    </Modal>
  );
}

AddMiscModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleAddMiscRecipe: PropTypes.func.isRequired,
};

export function AddYeastModal({ isOpen, closeModal, handleAddYeastRecipe }) {
  const [selectedItem, setSelectedYeast] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);

  const { user } = useContext(AuthContext);

  const searchItemsFunction = async (term) => {
    try {
      const response = await searchYeasts(user.token, term);
      setItemList(response);
    } catch (error) {
      showErrorToast('Error searching yeasts:', error);
    }
  };

  const handleSelectYeast = (item) => {
    setSelectedYeast(item);
  };

  const handleSaveButton = () => {
    if (selectedItem && quantity) {
      handleAddYeastRecipe(selectedItem.id, quantity);
      closeModal();
    } else {
      showErrorToast('Please fill in all fields.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      const loadItems = async () => {
        try {
          const items = await fetchYeasts(user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading yeasts');
        }
      };
      loadItems();
    }
  }, [isOpen, user.token]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Yeast Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>Select an Yeast</h2>
      <form onSubmit={handleSaveButton}>
        <div className="modal">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={searchItemsFunction}
          />

          <div className="modal-search-container">
            {itemList.length > 0 && (
            <ul className="modal-search-results">
              {itemList.map((item) => (
                <li key={item.id} className="modal-search-item">
                  <button
                    type="button"
                    className={`modal-search-button ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => handleSelectYeast(item)}
                  >
                    {item.name}
                    {' '}
                    (
                    {item.manufacturer}
                    )
                  </button>
                </li>
              ))}
            </ul>
            )}
          </div>

          <div className="inputs-row">
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="name">
                Quantity (Grams)
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '150px' }}
                />
              </label>
            </div>
          </div>
          <button type="button" onClick={handleSaveButton} className="crud-save-button" style={{ marginTop: '70px' }}>
            Add Yeast
          </button>
        </div>
      </form>
    </Modal>
  );
}

AddYeastModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleAddYeastRecipe: PropTypes.func.isRequired,
};

export function ChangeEquipmentModal({ isOpen, closeModal, handleChangeEquipmentRecipe }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);

  const { user } = useContext(AuthContext);

  const searchItemsFunction = async (term) => {
    try {
      const response = await searchEquipments(user.token, term);
      setItemList(response);
    } catch (error) {
      showErrorToast('Error searching equipments', error);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleSaveButton = () => {
    if (selectedItem) {
      handleChangeEquipmentRecipe(selectedItem);
      closeModal();
    } else {
      showInfoToast('Select an equipment');
    }
  };

  useEffect(() => {
    if (isOpen) {
      const loadItems = async () => {
        try {
          const items = await fetchEquipments(user.token);
          setItemList(items);
        } catch (err) {
          showErrorToast('Error loading equipments');
        }
      };
      loadItems();
    }
  }, [isOpen, user.token]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Equipment Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>Select an Equipment</h2>
      <div className="modal">
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={searchItemsFunction}
        />

        <div className="modal-search-container">
          {itemList.length > 0 && (
          <ul className="modal-search-results">
            {itemList.map((item) => (
              <li key={item.id} className="modal-search-item">
                <button
                  type="button"
                  className={`modal-search-button ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
          )}
        </div>

        <button onClick={handleSaveButton} type="submit" className="crud-save-button" style={{ marginTop: '150px' }}>
          Change Equipment
        </button>
      </div>
    </Modal>
  );
}

ChangeEquipmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChangeEquipmentRecipe: PropTypes.func.isRequired,
};

export function UpdateFermentableModal({
  isOpen, closeModal, selectedFermentable, handleUpdateFermentableRecipe,
}) {
  const [localFermentableObject, setLocalFermentableObject] = useState(null);

  const handleChange = (key, value) => {
    setLocalFermentableObject((prev) => ({
      ...prev,
      [key]: key === 'colorDegreesLovibond'
                  || key === 'potentialExtract'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    if (localFermentableObject) {
      handleUpdateFermentableRecipe(localFermentableObject);
    }
    closeModal();
  };

  useEffect(() => {
    if (selectedFermentable) {
      setLocalFermentableObject(selectedFermentable);
    }
  }, [selectedFermentable]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Fermentables Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      {localFermentableObject ? (
        <form onSubmit={handleSaveButton}>
          <div className="modal">
            <h2>Update Fermentable</h2>
            <label htmlFor="name">
              Name
              <input
                value={localFermentableObject.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            <label htmlFor="name">
              Description
              <textarea
                value={localFermentableObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Fermentable Type
                  <select
                    value={localFermentableObject.type}
                    onChange={(e) => setLocalFermentableObject((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))}
                  >
                    <option value="base">Base</option>
                    <option value="especial">Specialty</option>
                    <option value="adjunct">Adjunct</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Supplier
                  <input
                    value={localFermentableObject.supplier || ''}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  EBC
                  <input
                    type="number"
                    value={localFermentableObject.ebc || ''}
                    onChange={(e) => handleChange('ebc', e.target.value)}
                    style={{ width: '100px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Potential Extract
                  <input
                    type="number"
                    value={localFermentableObject.potentialExtract || ''}
                    onChange={(e) => handleChange('potentialExtract', e.target.value)}
                    style={{ width: '100px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Quantity (Grams)
                  <input
                    type="number"
                    value={localFermentableObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    style={{ width: '100px' }}
                  />
                </label>
              </div>
            </div>
            <button className="crud-save-button" type="submit" style={{ marginTop: '140px' }}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </Modal>
  );
}

UpdateFermentableModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedFermentable: PropTypes.func.isRequired,
  handleUpdateFermentableRecipe: PropTypes.func.isRequired,
};

export function UpdateHopModal({
  isOpen, closeModal, selectedHop, handleUpdateHopRecipe,
}) {
  const [localHopObject, setLocalHopObject] = useState(null);

  const handleChange = (key, value) => {
    setLocalHopObject((prev) => ({
      ...prev,
      [key]: key === 'colorDegreesLovibond'
                  || key === 'potentialExtract'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    if (localHopObject) {
      handleUpdateHopRecipe(localHopObject);
    }
    closeModal();
  };

  useEffect(() => {
    if (selectedHop) {
      setLocalHopObject(selectedHop);
    }
  }, [selectedHop]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Hops Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      {localHopObject ? (
        <form onSubmit={handleSaveButton}>
          <div className="modal">
            <h2>Update Hop</h2>
            <label htmlFor="name">
              Name
              <input
                value={localHopObject.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            <label htmlFor="name">
              Description
              <textarea
                value={localHopObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Alpha Acid
                  <input
                    type="number"
                    value={localHopObject.alphaAcidContent || ''}
                    onChange={(e) => handleChange('alphaAcidContent', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Beta Acid
                  <input
                    type="number"
                    value={localHopObject.betaAcidContent || ''}
                    onChange={(e) => handleChange('betaAcidContent', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Boil Time
                  <input
                    type="number"
                    value={localHopObject.boilTime || ''}
                    onChange={(e) => handleChange('boilTime', e.target.value)}
                    style={{ width: '100px' }}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Use Type
                  <select
                    value={localHopObject.useType}
                    onChange={(e) => setLocalHopObject((prev) => ({
                      ...prev,
                      useType: e.target.value,
                    }))}
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
                  Quantity (Grams)
                  <input
                    type="number"
                    value={localHopObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <button className="crud-save-button" type="submit" style={{ marginTop: '140px' }}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </Modal>
  );
}

UpdateHopModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedHop: PropTypes.func.isRequired,
  handleUpdateHopRecipe: PropTypes.func.isRequired,
};

export function UpdateMiscModal({
  isOpen, closeModal, selectedMisc, handleUpdateMiscRecipe,
}) {
  const [localMiscObject, setLocalMiscObject] = useState(null);

  const handleChange = (key, value) => {
    setLocalMiscObject((prev) => ({
      ...prev,
      [key]: key === 'colorDegreesLovibond'
                  || key === 'potentialExtract'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    if (localMiscObject) {
      handleUpdateMiscRecipe(localMiscObject);
    }
    closeModal();
  };

  useEffect(() => {
    if (selectedMisc) {
      setLocalMiscObject(selectedMisc);
    }
  }, [selectedMisc]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Misc Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      {localMiscObject ? (
        <form onSubmit={handleSaveButton}>
          <div className="modal">
            <h2>Update Misc</h2>
            <label htmlFor="name">
              Name
              <input
                value={localMiscObject.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            <label htmlFor="name">
              Description
              <textarea
                value={localMiscObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>

            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Time
                  <input
                    type="number"
                    value={localMiscObject.time || ''}
                    onChange={(e) => handleChange('time', e.target.value)}
                    style={{ width: '100px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Type
                  <select
                    value={localMiscObject.type}
                    onChange={(e) => setLocalMiscObject((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))}
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
              <div className="input-field">
                <label htmlFor="name">
                  Use
                  <select
                    value={localMiscObject.use}
                    onChange={(e) => setLocalMiscObject((prev) => ({
                      ...prev,
                      use: e.target.value,
                    }))}
                  >
                    <option value="Boil">Boil</option>
                    <option value="Bottling">Bottling</option>
                    <option value="Flameout">Flameout</option>
                    <option value="Mash">Mash</option>
                    <option value="Primary">Primary</option>
                    <option value="Secundary">Secundary</option>
                    <option value="Sparge">Sparge</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Quantity (Grams)
                  <input
                    type="number"
                    value={localMiscObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <button className="crud-save-button" type="submit" style={{ marginTop: '210px' }}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </Modal>
  );
}

UpdateMiscModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedMisc: PropTypes.func.isRequired,
  handleUpdateMiscRecipe: PropTypes.func.isRequired,
};

export function UpdateYeastModal({
  isOpen, closeModal, selectedYeast, handleUpdateYeastRecipe,
}) {
  const [localYeastObject, setLocalYeastObject] = useState(null);

  const handleChange = (key, value) => {
    setLocalYeastObject((prev) => ({
      ...prev,
      [key]: key === 'colorDegreesLovibond'
                  || key === 'potentialExtract'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    if (localYeastObject) {
      handleUpdateYeastRecipe(localYeastObject);
    }
    closeModal();
  };

  useEffect(() => {
    if (selectedYeast) {
      setLocalYeastObject(selectedYeast);
    }
  }, [selectedYeast]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Yeasts Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      {localYeastObject ? (
        <form onSubmit={handleSaveButton}>
          <div className="modal">
            <h2>Update Yeast</h2>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    value={localYeastObject.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Manufacturer
                  <input
                    value={localYeastObject.manufacturer || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <label htmlFor="name">
              Description
              <textarea
                value={localYeastObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>

            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Type
                  <select
                    value={localYeastObject.type}
                    onChange={(e) => setLocalYeastObject((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))}
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
                    value={localYeastObject.form}
                    onChange={(e) => setLocalYeastObject((prev) => ({
                      ...prev,
                      form: e.target.value,
                    }))}
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
                  Flocculation
                  <select
                    value={localYeastObject.flocculation}
                    onChange={(e) => setLocalYeastObject((prev) => ({
                      ...prev,
                      flocculation: e.target.value,
                    }))}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Temperature Range
                  <input
                    value={localYeastObject.temperatureRange || ''}
                    onChange={(e) => handleChange('temperatureRange', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Attenuation
                  <input
                    value={localYeastObject.attenuation || ''}
                    onChange={(e) => handleChange('attenuation', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  Alcohol Tolerance
                  <input
                    value={localYeastObject.alcoholTolerance || ''}
                    onChange={(e) => handleChange('alcoholTolerance', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Quantity (Grams)
                  <input
                    type="number"
                    value={localYeastObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>

          <button className="crud-save-button" type="submit" style={{ marginTop: '70px' }}>
            Save
          </button>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </Modal>
  );
}

UpdateYeastModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedYeast: PropTypes.func.isRequired,
  handleUpdateYeastRecipe: PropTypes.func.isRequired,
};
