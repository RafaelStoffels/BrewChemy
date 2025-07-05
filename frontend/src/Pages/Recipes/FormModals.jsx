import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import { addFermentableSchema, updateFermentableSchema } from './schemas/fermentablesSchema';
import { addHopSchema, updateHopSchema } from './schemas/hopsSchema';
import { addMiscSchema, updateMiscSchema } from './schemas/miscsSchema';
import { addYeastSchema, updateYeastSchema } from './schemas/yeastsSchema';

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
    setSelectedItem(fermentable);
  };

  const inputRefs = {
    selectedItem: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async () => {
    try {
      await addFermentableSchema.validate({ selectedItem, quantity }, { abortEarly: false });

      handleAddFermentableRecipe(selectedItem.id, quantity);
      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
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
        <div className="modalAddIngredient">
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
                <input
                  ref={inputRefs.quantity}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '120px', display: 'block' }}
                />
              </label>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveButton}
          className="crud-save-button"
          style={{ marginTop: '80px' }}
        >
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
  const [useType, setUseType] = useState('Boil');
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

  const inputRefs = {
    selectedItem: React.useRef(null),
    quantity: React.useRef(null),
    boilTime: React.useRef(null),
    alphaAcid: React.useRef(null),
    useType: React.useRef(null),
  };

  const handleSaveButton = async () => {
    try {
      await addHopSchema.validate(
        {
          selectedItem, quantity, boilTime, alphaAcid, useType,
        },
        { abortEarly: false },
      );

      handleAddHopRecipe(selectedItem.id, quantity, boilTime, alphaAcid, useType);
      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
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
        <div className="modalAddIngredient">
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
              <label htmlFor="useType">
                Use Type
                <select
                  ref={inputRefs.useType}
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
              <label htmlFor="boilTime">
                Boil Time
                <input
                  ref={inputRefs.boilTime}
                  type="number"
                  value={boilTime}
                  onChange={(e) => setBoilTime(e.target.value)}
                />
              </label>
            </div>
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="alphaAcid">
                Alpha Acid
                <input
                  ref={inputRefs.alphaAcid}
                  type="number"
                  value={alphaAcid}
                  onChange={(e) => setAlphaAcid(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="inputs-row">
            <div className="input-field" style={{ marginTop: '10px' }}>
              <label htmlFor="quantity">
                Quantity (Grams)
                <input
                  ref={inputRefs.quantity}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '120px', display: 'block' }}
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

  const inputRefs = {
    selectedItem: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async () => {
    try {
      await addMiscSchema.validate({ selectedItem, quantity }, { abortEarly: false });

      handleAddMiscRecipe(selectedItem.id, quantity);
      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
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
        <div className="modalAddIngredient">
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
                  ref={inputRefs.quantity}
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  style={{ width: '120px', display: 'block' }}
                />
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveButton}
            className="crud-save-button"
            style={{ marginTop: '80px' }}
          >
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

  const inputRefs = {
    selectedItem: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async () => {
    try {
      await addYeastSchema.validate({ selectedItem, quantity }, { abortEarly: false });

      handleAddYeastRecipe(selectedItem.id, quantity);
      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
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
        <div className="modalAddIngredient">
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
                  ref={inputRefs.quantity}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '120px', display: 'block' }}
                />
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveButton}
            className="crud-save-button"
            style={{ marginTop: '80px' }}
          >
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
      <div className="modalAddIngredient">
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
        <button
          onClick={handleSaveButton}
          type="submit"
          className="crud-save-button"
          style={{ marginTop: '160px' }}
        >
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
  isOpen, closeModal, selectedFermentable, onUpdate,
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

  const inputRefs = {
    name: React.useRef(null),
    description: React.useRef(null),
    type: React.useRef(null),
    supplier: React.useRef(null),
    ebc: React.useRef(null),
    potentialExtract: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async (e) => {
    e.preventDefault();

    try {
      await updateFermentableSchema.validate(localFermentableObject, { abortEarly: false });

      onUpdate(localFermentableObject);

      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
    }
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
          <div className="modalBrewChemy">
            <h2>Update Fermentable</h2>
            <label htmlFor="name">
              Name
              <input
                style={{ width: '540px' }}
                ref={inputRefs.name}
                value={localFermentableObject.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            <label htmlFor="name">
              Description
              <textarea
                style={{ width: '540px' }}
                value={localFermentableObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="type">
                  Fermentable Type
                  <select
                    ref={inputRefs.type}
                    value={localFermentableObject.type}
                    onChange={(e) => setLocalFermentableObject((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))}
                  >
                    <option value="Base">Base</option>
                    <option value="Specialty">Specialty</option>
                    <option value="Adjunct">Adjunct</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="supplier">
                  Supplier
                  <input
                    ref={inputRefs.supplier}
                    value={localFermentableObject.supplier || ''}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="ebc">
                  EBC
                  <input
                    ref={inputRefs.ebc}
                    type="number"
                    value={localFermentableObject.ebc || ''}
                    onChange={(e) => handleChange('ebc', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="potentialExtract">
                  Potential Extract
                  <input
                    ref={inputRefs.potentialExtract}
                    type="number"
                    value={localFermentableObject.potentialExtract || ''}
                    onChange={(e) => handleChange('potentialExtract', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="quantity">
                  Quantity (Grams)
                  <input
                    ref={inputRefs.quantity}
                    type="number"
                    value={localFermentableObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <button className="crud-save-button" type="submit" style={{ marginTop: '110px' }}>
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
  onUpdate: PropTypes.func.isRequired,
};

export function UpdateHopModal({
  isOpen, closeModal, selectedHop, onUpdate,
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

  const inputRefs = {
    name: React.useRef(null),
    description: React.useRef(null),
    alphaAcidContent: React.useRef(null),
    betaAcidContent: React.useRef(null),
    boilTime: React.useRef(null),
    useType: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async (e) => {
    e.preventDefault();

    try {
      await updateHopSchema.validate(localHopObject, { abortEarly: false });

      onUpdate(localHopObject);

      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
    }
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
          <div className="modalBrewChemy">
            <h2>Update Hop</h2>
            <label htmlFor="name">
              Name
              <input
                style={{ width: '540px' }}
                ref={inputRefs.name}
                value={localHopObject.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            <label htmlFor="description">
              Description
              <textarea
                style={{ width: '540px' }}
                ref={inputRefs.description}
                value={localHopObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="alphaAcidContent">
                  Alpha Acid
                  <input
                    ref={inputRefs.alphaAcidContent}
                    type="number"
                    value={localHopObject.alphaAcidContent || ''}
                    onChange={(e) => handleChange('alphaAcidContent', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="betaAcidContent">
                  Beta Acid
                  <input
                    ref={inputRefs.betaAcidContent}
                    type="number"
                    value={localHopObject.betaAcidContent || ''}
                    onChange={(e) => handleChange('betaAcidContent', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="boilTime">
                  Boil Time
                  <input
                    ref={inputRefs.boilTime}
                    type="number"
                    value={localHopObject.boilTime || ''}
                    onChange={(e) => handleChange('boilTime', e.target.value)}
                    style={{ width: '165px' }}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="useType">
                  Use Type
                  <select
                    ref={inputRefs.useType}
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
                <label htmlFor="quantity">
                  Quantity (Grams)
                  <input
                    ref={inputRefs.quantity}
                    type="number"
                    value={localHopObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <button className="crud-save-button" type="submit" style={{ marginTop: '110px' }}>
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
  onUpdate: PropTypes.func.isRequired,
};

export function UpdateMiscModal({
  isOpen, closeModal, selectedMisc, onUpdate,
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

  const inputRefs = {
    name: React.useRef(null),
    description: React.useRef(null),
    time: React.useRef(null),
    type: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async (e) => {
    e.preventDefault();

    try {
      await updateMiscSchema.validate(localMiscObject, { abortEarly: false });

      onUpdate(localMiscObject);

      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
    }
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
          <div className="modalBrewChemy">
            <h2>Update Misc</h2>
            <label htmlFor="name">
              Name
              <input
                style={{ width: '540px' }}
                ref={inputRefs.name}
                value={localMiscObject.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            <label htmlFor="description">
              Description
              <textarea
                style={{ width: '540px' }}
                ref={inputRefs.description}
                value={localMiscObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>

            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="time">
                  Time
                  <input
                    ref={inputRefs.time}
                    type="number"
                    value={localMiscObject.time || ''}
                    onChange={(e) => handleChange('time', e.target.value)}
                    style={{ width: '120px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="type">
                  Type
                  <select
                    ref={inputRefs.type}
                    value={localMiscObject.type}
                    style={{ width: '230px' }}
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
                <label htmlFor="quantity">
                  Quantity (Grams)
                  <input
                    ref={inputRefs.quantity}
                    type="number"
                    value={localMiscObject.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <button className="crud-save-button" type="submit" style={{ marginTop: '180px' }}>
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
  onUpdate: PropTypes.func.isRequired,
};

export function UpdateYeastModal({
  isOpen, closeModal, selectedYeast, onUpdate,
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

  const inputRefs = {
    name: React.useRef(null),
    manufacturer: React.useRef(null),
    description: React.useRef(null),
    type: React.useRef(null),
    form: React.useRef(null),
    flocculation: React.useRef(null),
    attenuation: React.useRef(null),
    alcoholTolerance: React.useRef(null),
    quantity: React.useRef(null),
  };

  const handleSaveButton = async (e) => {
    e.preventDefault();

    try {
      await updateYeastSchema.validate(localYeastObject, { abortEarly: false });

      onUpdate(localYeastObject);

      closeModal();
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((validationError) => {
          showErrorToast(validationError.message);
        });
      } else {
        showErrorToast('Validation error.');
      }
    }
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
          <div className="modalBrewChemy">
            <h2>Update Yeast</h2>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    style={{ width: '260px' }}
                    ref={inputRefs.name}
                    value={localYeastObject.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="manufacturer">
                  Manufacturer
                  <input
                    style={{ width: '260px' }}
                    ref={inputRefs.manufacturer}
                    value={localYeastObject.manufacturer || ''}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <label htmlFor="description">
              Description
              <textarea
                style={{ width: '540px' }}
                ref={inputRefs.description}
                value={localYeastObject.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>

            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="type">
                  Type
                  <select
                    ref={inputRefs.type}
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
                <label htmlFor="form">
                  Form
                  <select
                    ref={inputRefs.form}
                    value={localYeastObject.form}
                    onChange={(e) => setLocalYeastObject((prev) => ({
                      ...prev,
                      form: e.target.value,
                    }))}
                  >
                    <option value="Dry">Dry</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Culture">Culture</option>
                    <option value="Slurry">Slurry</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="flocculation">
                  Flocculation
                  <select
                    ref={inputRefs.flocculation}
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
                <label htmlFor="attenuation">
                  Attenuation
                  <input
                    ref={inputRefs.attenuation}
                    value={localYeastObject.attenuation || ''}
                    onChange={(e) => handleChange('attenuation', e.target.value)}
                  />
                </label>
              </div>
              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="quantity">
                    Quantity (Grams)
                    <input
                      ref={inputRefs.quantity}
                      type="number"
                      value={localYeastObject.quantity || ''}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button className="crud-save-button" type="submit" style={{ marginTop: '110px' }}>
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
  onUpdate: PropTypes.func.isRequired,
};
