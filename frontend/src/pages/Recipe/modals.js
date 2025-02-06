import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

export function AddFermentableModal({ isOpen, closeModal, fermentableList, handleAddFermentableRecipe }) {
    const [selectedFermentable, setSelectedFermentable] = useState(null);
    const [quantity, setQuantity] = useState('');

    const handleChange = (maltId) => {
        setSelectedFermentable(maltId);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleSaveButton = () => {
        handleAddFermentableRecipe(selectedFermentable, quantity);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Fermentables Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            <h2>Select a fermentable</h2>
            <ul>
                {fermentableList.length > 0 ? (
                    fermentableList.map((fermentable) => (
                        <li key={fermentable.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                id={`fermentable-${fermentable.id}`}
                                name="fermentable"
                                value={fermentable.id}
                                checked={selectedFermentable === fermentable.id}
                                onChange={() => handleChange(fermentable.id)}
                                style={{ marginRight: '10px' }}
                            />
                            <label htmlFor={`fermentable-${fermentable.id}`}>
                                <strong>{fermentable.name}</strong>
                            </label>
                        </li>
                    ))
                ) : (
                    <p>No fermentables available.</p>
                )}
            </ul>
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </div>
            <button onClick={handleSaveButton} className="crud-save-button">Add Fermentable</button>
        </Modal>
    );
}

export function AddHopModal({ isOpen, closeModal, hopList, handleAddHopRecipe }) {
    const [selectedHop, setSelectedHop] = useState(null);
    const [quantity, setQuantity] = useState('');

    const handleChange = (hopId) => {
        setSelectedHop(hopId);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleSaveButton = () => {
        handleAddHopRecipe(selectedHop, quantity);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Hops Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            <h2>Select a Hop</h2>
            <ul>
                {hopList.length > 0 ? (
                    hopList.map((hop) => (
                        <li key={hop.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                id={`hop-${hop.id}`}
                                name="hop"
                                value={hop.id}
                                checked={selectedHop === hop.id}
                                onChange={() => handleChange(hop.id)}
                                style={{ marginRight: '10px' }}
                            />
                            <label htmlFor={`hop-${hop.id}`}>
                                <strong>{hop.name}</strong>
                            </label>
                        </li>
                    ))
                ) : (
                    <p>No hops available.</p>
                )}
            </ul>
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </div>
            <button onClick={handleSaveButton} className="crud-save-button">Add Hop</button>
        </Modal>
    );
}

export function AddMiscModal({ isOpen, closeModal, miscList, handleAddMiscRecipe }) {
    const [selectedMisc, setSelectedMisc] = useState(null);
    const [quantity, setQuantity] = useState('');

    const handleChange = (miscID) => {
        setSelectedMisc(miscID);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleSaveButton = () => {
        handleAddMiscRecipe(selectedMisc, quantity);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Misc Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            <h2>Select a misc</h2>
            <ul>
                {miscList.length > 0 ? (
                    miscList.map((misc) => (
                        <li key={misc.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                id={`misc-${misc.id}`}
                                name="misc"
                                value={misc.id}
                                checked={selectedMisc === misc.id}
                                onChange={() => handleChange(misc.id)}
                                style={{ marginRight: '10px' }}
                            />
                            <label htmlFor={`misc-${misc.id}`}>
                                <strong>{misc.name}</strong>
                            </label>
                        </li>
                    ))
                ) : (
                    <p>No miscs available.</p>
                )}
            </ul>
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </div>
            <button onClick={handleSaveButton} className="crud-save-button">Add misc</button>
        </Modal>
    );
}

export function AddYeastModal({ isOpen, closeModal, yeastList, handleAddYeastRecipe }) {
    const [selectedYeast, setSelectedYeast] = useState(null);
    const [quantity, setQuantity] = useState('');

    const handleChange = (yeastID) => {
        setSelectedYeast(yeastID);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleSaveButton = () => {
        handleAddYeastRecipe(selectedYeast, quantity);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Yeast Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            <h2>Select a Yeast</h2>
            <ul>
                {yeastList.length > 0 ? (
                    yeastList.map((yeast) => (
                        <li key={yeast.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                id={`yeast-${yeast.id}`}
                                name="yeast"
                                value={yeast.id}
                                checked={selectedYeast === yeast.id}
                                onChange={() => handleChange(yeast.id)}
                                style={{ marginRight: '10px' }}
                            />
                            <label htmlFor={`yeast-${yeast.id}`}>
                                <strong>{yeast.name}</strong>
                            </label>
                        </li>
                    ))
                ) : (
                    <p>No yeasts available.</p>
                )}
            </ul>
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </div>
            <button onClick={handleSaveButton} className="crud-save-button">Add yeast</button>
        </Modal>
    );
}

export function UpdateFermentableModal({ isOpen, closeModal, selectedFermentable, handleUpdateFermentableRecipe }) {
    const [localFermentableObject, setLocalFermentableObject] = useState(null);

    // Atualiza o estado local sempre que o fermentable recebido como prop mudar
    useEffect(() => {
        if (selectedFermentable) {
            setLocalFermentableObject(selectedFermentable);
        }
    }, [selectedFermentable]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalFermentableObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localFermentableObject) {
            handleUpdateFermentableRecipe(localFermentableObject); // Salva alterações
        }
        closeModal();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Fermentables Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
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
                        <label htmlFor="name">Fermentable Type</label>
                        <input 
                            placeholder="Fermentable Type"
                            value={localFermentableObject.maltType || ''}
                            onChange={(e) => handleChange('maltType', e.target.value)}
                        />
                        <label htmlFor="name">Supplier</label>
                        <input 
                            placeholder="Supplier"
                            value={localFermentableObject.supplier || ''}
                            onChange={(e) => handleChange('supplier', e.target.value)}
                        />
                        
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

    // Atualiza o estado local sempre que o Hop recebido como prop mudar
    useEffect(() => {
        if (selectedHop) {
            setLocalHopObject(selectedHop);
        }
    }, [selectedHop]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalHopObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    // Manipula o botão de salvar
    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localHopObject) {
            handleUpdateHopRecipe(localHopObject); // Salva alterações
        }
        closeModal(); // Fecha a modal
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Hops Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            {localHopObject ? (
                <form onSubmit={handleSaveButton}>
                    <div className="modal">
                        <h2>Update Hop</h2>
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Hop Name"
                            value={localHopObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Hop Description"
                            value={localHopObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <label htmlFor="name">Alpha Acid</label>
                        <input 
                            placeholder="Fermentable Type"
                            value={localHopObject.alphaAcidContent || ''}
                            onChange={(e) => handleChange('alphaAcidContent', e.target.value)}
                        />
                        <label htmlFor="name">Beta Acid</label>
                        <input 
                            placeholder="Supplier"
                            value={localHopObject.betaAcidContent || ''}
                            onChange={(e) => handleChange('betaAcidContent', e.target.value)}
                        />
                        
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Boil Time</label>
                                <input 
                                    placeholder="Boil Time"
                                    type="number"
                                    value={localHopObject.boilTime || ''}
                                    onChange={(e) => handleChange('boilTime', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>

                            <div className="input-field">
                                <label htmlFor="name">Use Type</label>
                                <input 
                                    placeholder="Potential Extract"
                                    type="number"
                                    value={localHopObject.useType || ''}
                                    onChange={(e) => handleChange('useType', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                        <label htmlFor="name">Quantity</label>
                        <input 
                            placeholder="Quantity"
                            value={localHopObject.quantity || ''}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                        />
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

    // Atualiza o estado local sempre que o Yeast recebido como prop mudar
    useEffect(() => {
        if (selectedYeast) {
            setLocalYeastObject(selectedYeast);
        }
    }, [selectedYeast]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalYeastObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    // Manipula o botão de salvar
    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localYeastObject) {
            handleUpdateYeastRecipe(localYeastObject); // Salva alterações
        }
        closeModal(); // Fecha a modal
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Yeasts Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            {localYeastObject ? (
                <form onSubmit={handleSaveButton}>
                    <div className="modal">
                        <h2>Update Yeast</h2>
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Yeast Name"
                            value={localYeastObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Manufacturer</label>
                        <input 
                            placeholder="Manufacturer"
                            value={localYeastObject.manufacturer || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Description"
                            value={localYeastObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <label htmlFor="name">Attenuation Range</label>
                        <input 
                            placeholder="Attenuation Range"
                            value={localYeastObject.attenuationRange || ''}
                            onChange={(e) => handleChange('attenuationRange', e.target.value)}
                        />
                        <label htmlFor="name">Flavor Profile</label>
                        <input 
                            placeholder="Flavor Profile"
                            value={localYeastObject.flavorProfile || ''}
                            onChange={(e) => handleChange('flavorProfile', e.target.value)}
                        />
                        <label htmlFor="name">Flocculation</label>
                        <input 
                            placeholder="Flocculation"
                            value={localYeastObject.flocculation || ''}
                            onChange={(e) => handleChange('flocculation', e.target.value)}
                        />
                        <label htmlFor="name">Form</label>
                        <input 
                            placeholder="Form"
                            value={localYeastObject.form || ''}
                            onChange={(e) => handleChange('form', e.target.value)}
                        />
                        <label htmlFor="name">Temperature Range</label>
                        <input 
                            placeholder="Temperature Range"
                            value={localYeastObject.temperatureRange || ''}
                            onChange={(e) => handleChange('temperatureRange', e.target.value)}
                        />
                        <label htmlFor="name">Type</label>
                        <input 
                            placeholder="Type"
                            value={localYeastObject.type || ''}
                            onChange={(e) => handleChange('type', e.target.value)}
                        />
                        <label htmlFor="name">Alcohol Tolerance</label>
                        <input 
                            placeholder="Alcohol Tolerance"
                            value={localYeastObject.alcoholTolerance || ''}
                            onChange={(e) => handleChange('alcoholTolerance', e.target.value)}
                        />
                        <label htmlFor="name">Quantity</label>
                        <input 
                            placeholder="Quantity"
                            value={localYeastObject.quantity || ''}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                        />

                        <div className="input-group">
                            <div className="input-field">
                                <label htmlFor="name">Boil Time</label>
                                <input 
                                    placeholder="EBC"
                                    type="number"
                                    value={localYeastObject.boilTime || ''}
                                    onChange={(e) => handleChange('boilTime', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>

                            <div className="input-field">
                                <label htmlFor="name">Use Type</label>
                                <input 
                                    placeholder="Potential Extract"
                                    type="number"
                                    value={localYeastObject.useType || ''}
                                    onChange={(e) => handleChange('useType', e.target.value)}
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