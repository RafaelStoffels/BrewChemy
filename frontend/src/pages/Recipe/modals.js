import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import { showErrorToast } from "../../utils/notifications";
import { searchEquipments } from '../../services/Equipments';
import { searchFermentables } from '../../services/Fermentables';
import { searchHops } from '../../services/Hops';
import { searchMiscs } from '../../services/Misc';
import { searchYeasts } from '../../services/Yeasts';

import SearchInput from '../../components/SearchInput';

export function AddFermentableModal({ isOpen, closeModal, handleAddFermentableRecipe }) {
    const [selectedFermentable, setSelectedFermentable] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [fermentableList, setFermentableList] = useState([]);

    const { user } = useContext(AuthContext);

    const searchItemsFunction = async (term) => {
        const recipeResponse = await searchFermentables(api, user.token, term);
        setFermentableList(recipeResponse);
    };

    const handleSelectFermentable = (fermentable) => {
        setSelectedFermentable(fermentable); // Armazena o fermentável selecionado
    };
    
    const handleSaveButton = () => {
        if (selectedFermentable && quantity) {
            handleAddFermentableRecipe(selectedFermentable.id, quantity); // Agora enviamos o objeto inteiro
            closeModal();
        } else {
            showErrorToast("Please fill in all fields.");
        }
    };

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
                    <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={searchItemsFunction} />

                    <div className="modal-search-container">
                        {fermentableList.length > 0 ? (
                            <ul className="modal-search-results">
                                {fermentableList.map((fermentable) => (
                                    <li 
                                        key={fermentable.id} 
                                        className={`modal-search-item ${selectedFermentable?.id === fermentable.id ? 'selected' : ''}`} 
                                        onMouseDown={() => handleSelectFermentable(fermentable)}
                                    >
                                        {fermentable.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="modal-placeholder">No results found</p>
                        )}
                    </div>

                    <div className="inputs-row">
                        <div className="input-field">
                            <label htmlFor="name">Quantity</label>
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <button type="button" onClick={handleSaveButton} className="crud-save-button">
                    Add Fermentable
                </button>
            </form>
        </Modal>
    );
}

export function AddHopModal({ isOpen, closeModal, handleAddHopRecipe }) {
    const [selectedHop, setSelectedHop] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [alphaAcid, setAlphaAcid] = useState('');
    const [boilTime, setBoilTime] = useState('');
    const [useType, setUseType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hopList, setHopList] = useState([]);

    const { user } = useContext(AuthContext);

    const searchItemsFunction = async (term) => {
        const response = await searchHops(api, user.token, term);
        setHopList(response);
    };

    const handleSelectHop = (hop) => {
        setSelectedHop(hop);
    };

    const handleSaveButton = () => {
        if (selectedHop && quantity && boilTime) {
            handleAddHopRecipe(selectedHop.id, quantity, boilTime, alphaAcid, useType);
            closeModal();
        } else {
            showErrorToast("Please fill in all fields.");
        }
    };

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
                    <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={searchItemsFunction} />

                    <div className="modal-search-container">
                        {hopList.length > 0 && (
                            <ul className="modal-search-results">
                                {hopList.map((hop) => (
                                    <li 
                                        key={hop.id} 
                                        className={`modal-search-item ${selectedHop?.id === hop.id ? 'selected' : ''}`} 
                                        onMouseDown={() => handleSelectHop(hop)}
                                    >
                                        {hop.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="inputs-row">
                        <div className="input-field">
                            <label htmlFor="name">Use Type</label>
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
                        </div>
                        <div className="input-field">
                            <label htmlFor="name">Boil Time</label>
                            <input
                                type="number"
                                value={boilTime}
                                onChange={(e) => setBoilTime(e.target.value)}
                            />
                        </div>
                        <div className="input-field">
                            <label htmlFor="name">Alpha Acid</label>
                            <input
                                type="number"
                                value={alphaAcid}
                                onChange={(e) => setAlphaAcid(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="inputs-row">
                        <div className="input-field">
                            <label htmlFor="name">Quantity</label>
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
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

export function AddMiscModal({ isOpen, closeModal, handleAddMiscRecipe }) {
    const [selectedMisc, setSelectedMisc] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMiscList, setFilteredMiscList] = useState([]);

    const { user } = useContext(AuthContext); 

    const handleChange = (miscID) => {
        setSelectedMisc(miscID);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleSaveButton = () => {
        if (selectedMisc && quantity) {
            handleAddMiscRecipe(selectedMisc.id, quantity);
            closeModal();
        } else {
            showErrorToast("Please fill in all fields.");
        }
    };

    const searchItemsFunction = async (term) => {
        console.log('Searching for:', term); 
        try {
            const response = await searchMiscs(api, user.token, term);
            setFilteredMiscList(response);
        } catch (error) {
            showErrorToast("Error fetching misc data: ", error);
            setFilteredMiscList([]); 
        }
    };

    const handleSelectMisc = (misc) => {
        setSelectedMisc(misc);
    };

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
                    <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={searchItemsFunction} />    

                    <div className="modal-search-container">
                        {filteredMiscList.length > 0 && (
                            <ul className="modal-search-results">
                                {filteredMiscList.map((misc) => (
                                    <li 
                                        key={misc.id} 
                                        className={`modal-search-item ${selectedMisc?.id === misc.id ? 'selected' : ''}`} 
                                        onMouseDown={() => handleSelectMisc(misc)}
                                    >
                                        {misc.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="inputs-row">
                        <div className="input-field">
                            <label htmlFor="name">Quantity</label>
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={quantity}
                                onChange={handleQuantityChange}
                            />
                        </div>
                    </div>
                <button type="button" onClick={handleSaveButton} className="crud-save-button">
                    Add Misc
                </button>
                </div>
        </form>
        </Modal>
    );
}

export function AddYeastModal({ isOpen, closeModal, handleAddYeastRecipe }) {
    const [selectedYeast, setSelectedYeast] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredYeastList, setFilteredYeastList] = useState([]);

    const { user } = useContext(AuthContext);

    const searchItemsFunction = async (term) => {
        try {
            const response = await searchYeasts(api, user.token, term);
            setFilteredYeastList(response); 
        } catch (error) {
            showErrorToast("Error searching yeasts:", error);
        }
    };

    const handleSelectYeast = (yeast) => {
        setSelectedYeast(yeast);
    };

    const handleSaveButton = () => {
        if (selectedYeast && quantity) {
            handleAddYeastRecipe(selectedYeast.id, quantity);
            closeModal();
        } else {
            showErrorToast("Please fill in all fields.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Yeast Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Select a Yeast</h2>
            <form onSubmit={handleSaveButton}>
                <div className="modal">
                    <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={searchItemsFunction} />   

                    <div className="modal-search-container">
                        {filteredYeastList.length > 0 && (
                            <ul className="modal-search-results">
                                {filteredYeastList.map((yeast) => (
                                    <li 
                                        key={yeast.id} 
                                        className={`modal-search-item ${selectedYeast?.id === yeast.id ? 'selected' : ''}`} 
                                        onMouseDown={() => handleSelectYeast(yeast)}
                                    >
                                        {yeast.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="inputs-row">
                        <div className="input-field">
                            <label htmlFor="name">Quantity</label>
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                    </div>
                    <button type="button" onClick={handleSaveButton} className="crud-save-button">
                    Add Yeast
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export function ChangeEquipmentModal({ isOpen, closeModal, handleChangeEquipmentRecipe }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItemList, setFilteredItemList] = useState([]);

    const { user } = useContext(AuthContext);

    const searchItemsFunction = async (term) => {
        try {
            const response = await searchEquipments(api, user.token, term);
            setFilteredItemList(response); 
        } catch (error) {
            console.error('Error searching equipments:', error);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setSearchTerm(item.name);
        setFilteredItemList([]); 
    };

    const handleSaveButton = () => {
        if (selectedItem) {
            handleChangeEquipmentRecipe(selectedItem);
            closeModal();
        } else {
            alert('Select an equipment.');
        }
    };

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
                    <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={searchItemsFunction} />   

                    {filteredItemList.length > 0 && (
                        <ul style={{ border: '1px solid #ccc', padding: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                            {filteredItemList.map((item) => (
                                <li 
                                    key={item.id} 
                                    style={{ cursor: 'pointer', padding: '5px' }}
                                    onMouseDown={() => handleSelectItem(item)}
                                >
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}

                    <button onClick={handleSaveButton} className="crud-save-button">
                        Change Equipment
                    </button>
                </div>
        </Modal>
    );
}

export function UpdateFermentableModal({ isOpen, closeModal, selectedFermentable, handleUpdateFermentableRecipe }) {
    const [localFermentableObject, setLocalFermentableObject] = useState(null);


    useEffect(() => {
        if (selectedFermentable) {
            setLocalFermentableObject(selectedFermentable);
        }
    }, [selectedFermentable]);

    const handleChange = (key, value) => {
        setLocalFermentableObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
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
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Fermentable Name"
                            value={localFermentableObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Fermentable Description"
                            value={localFermentableObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Fermentable Type</label>
                                <select
                                  value={localFermentableObject.type}
                                  onChange={(e) =>
                                    setLocalFermentableObject((prev) => ({
                                      ...prev,
                                      type: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="base">Base</option>
                                  <option value="especial">Specialty</option>
                                  <option value="adjunct">Adjunct</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Supplier</label>
                                <input 
                                    placeholder="Supplier"
                                    value={localFermentableObject.supplier || ''}
                                    onChange={(e) => handleChange('supplier', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">EBC</label>
                                <input 
                                    placeholder="EBC"
                                    type="number"
                                    value={localFermentableObject.ebc || ''}
                                    onChange={(e) => handleChange('ebc', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Potential Extract</label>
                                <input 
                                    placeholder="Potential Extract"
                                    type="number"
                                    value={localFermentableObject.potentialExtract || ''}
                                    onChange={(e) => handleChange('potentialExtract', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localFermentableObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                        <button className="crud-save-button" type="submit">
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

export function UpdateHopModal({ isOpen, closeModal, selectedHop, handleUpdateHopRecipe }) {
    const [localHopObject, setLocalHopObject] = useState(null);

    useEffect(() => {
        if (selectedHop) {
            setLocalHopObject(selectedHop);
        }
    }, [selectedHop]);

    const handleChange = (key, value) => {
        setLocalHopObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
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
                        <label htmlFor="name">Name</label>
                        <input 
                            value={localHopObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            value={localHopObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Alpha Acid</label>
                                <input 
                                    type="number"
                                    value={localHopObject.alphaAcidContent || ''}
                                    onChange={(e) => handleChange('alphaAcidContent', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Beta Acid</label>
                                <input 
                                    type="number"
                                    value={localHopObject.betaAcidContent || ''}
                                    onChange={(e) => handleChange('betaAcidContent', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Boil Time</label>
                                <input 
                                    type="number"
                                    value={localHopObject.boilTime || ''}
                                    onChange={(e) => handleChange('boilTime', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Use Type</label>
                                <select
                                  value={localHopObject.useType}
                                  onChange={(e) =>
                                    setLocalHopObject((prev) => ({
                                      ...prev,
                                      useType: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Boil">Boil</option>
                                  <option value="Dry Hop">Dry Hop</option>
                                  <option value="Aroma">Aroma</option>
                                  <option value="Mash">Mash</option>
                                  <option value="First Wort">First Wort</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    type="number"
                                    value={localHopObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="crud-save-button" type="submit">
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

export function UpdateMiscModal({ isOpen, closeModal, selectedMisc, handleUpdateMiscRecipe }) {
    const [localMiscObject, setLocalMiscObject] = useState(null);

    useEffect(() => {
        if (selectedMisc) {
            setLocalMiscObject(selectedMisc);
        }
    }, [selectedMisc]);

    const handleChange = (key, value) => {
        setLocalMiscObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
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
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Name"
                            value={localMiscObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Description"
                            value={localMiscObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Time</label>
                                <input 
                                    placeholder="Time"
                                    type="number"
                                    value={localMiscObject.time || ''}
                                    onChange={(e) => handleChange('time', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Type</label>
                                <select
                                  value={localMiscObject.type}
                                  onChange={(e) =>
                                    setLocalMiscObject((prev) => ({
                                      ...prev,
                                      type: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Flavor">Flavor</option>
                                  <option value="Fining">Fining</option>
                                  <option value="Herb">Herb</option>
                                  <option value="Spice">Spice</option>
                                  <option value="Water Agent">Water Agent</option>
                                  <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Use</label>
                                <select
                                  value={localMiscObject.use}
                                  onChange={(e) =>
                                    setLocalMiscObject((prev) => ({
                                      ...prev,
                                      use: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Boil">Boil</option>
                                  <option value="Bottling">Bottling</option>
                                  <option value="Flameout">Flameout</option>
                                  <option value="Mash">Mash</option>
                                  <option value="Primary">Primary</option>
                                  <option value="Secundary">Secundary</option>
                                  <option value="Sparge">Sparge</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localMiscObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                                </div>
                        </div>
                        <button className="crud-save-button" type="submit">
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

export function UpdateYeastModal({ isOpen, closeModal, selectedYeast, handleUpdateYeastRecipe }) {
    const [localYeastObject, setLocalYeastObject] = useState(null);

    useEffect(() => {
        if (selectedYeast) {
            setLocalYeastObject(selectedYeast);
        }
    }, [selectedYeast]);

    const handleChange = (key, value) => {
        setLocalYeastObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
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
                                <label htmlFor="name">Name</label>
                                <input 
                                    placeholder="Yeast Name"
                                    value={localYeastObject.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Manufacturer</label>
                                <input 
                                    placeholder="Manufacturer"
                                    value={localYeastObject.manufacturer || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Description"
                            value={localYeastObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />

                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Type</label>
                                <select
                                  value={localYeastObject.type}
                                  onChange={(e) =>
                                    setLocalYeastObject((prev) => ({
                                      ...prev,
                                      type: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Ale">Ale</option>
                                  <option value="Lager">Lager</option>
                                  <option value="Hybrid">Hybrid</option>
                                  <option value="Champagne">Champagne</option>
                                  <option value="Wheat">Wheat</option>
                                  <option value="Wine">Wine</option>
                                  <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Form</label>
                                <select
                                  value={localYeastObject.form}
                                  onChange={(e) =>
                                    setLocalYeastObject((prev) => ({
                                      ...prev,
                                      form: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Ale">Dry</option>
                                  <option value="Lager">Liquid</option>
                                  <option value="Hybrid">Culture</option>
                                  <option value="Champagne">Slurry</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Flocculation</label>
                                <select
                                  value={localYeastObject.flocculation}
                                  onChange={(e) =>
                                    setLocalYeastObject((prev) => ({
                                      ...prev,
                                      flocculation: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Temperature Range</label>
                                <input 
                                    placeholder="Temperature Range"
                                    value={localYeastObject.temperatureRange || ''}
                                    onChange={(e) => handleChange('temperatureRange', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Attenuation</label>
                                <input 
                                    placeholder="Attenuation"
                                    value={localYeastObject.attenuation || ''}
                                    onChange={(e) => handleChange('attenuation', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Alcohol Tolerance</label>
                                <input 
                                    placeholder="Alcohol Tolerance"
                                    value={localYeastObject.alcoholTolerance || ''}
                                    onChange={(e) => handleChange('alcoholTolerance', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localYeastObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button className="crud-save-button" type="submit">
                        Save
                    </button>
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </Modal>
    );
}