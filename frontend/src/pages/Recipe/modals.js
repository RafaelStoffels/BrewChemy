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
    const [amount, setAmount] = useState('');

    const handleChange = (hopId) => {
        setSelectedHop(hopId);
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleSaveButton = () => {
        handleAddHopRecipe(selectedHop, amount);
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
                    placeholder="Amount"
                    value={amount}
                    onChange={handleAmountChange}
                />
            </div>
            <button onClick={handleSaveButton} className="crud-save-button">Add Hop</button>
        </Modal>
    );
}

export function AddYeastModal({ isOpen, closeModal, yeastList, handleAddYeastRecipe }) {
    const [selectedYeast, setSelectedYeast] = useState(null);
    const [amount, setAmount] = useState('');

    const handleChange = (yeastID) => {
        setSelectedYeast(yeastID);
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleSaveButton = () => {
        handleAddYeastRecipe(selectedYeast, amount);
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
                    placeholder="Amount"
                    value={amount}
                    onChange={handleAmountChange}
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
                  key === "potentialExtract" || 
                  key === "unitPrice" || 
                  key === "stockQuantity" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    // Manipula o botão de salvar
    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localFermentableObject) {
            handleUpdateFermentableRecipe(localFermentableObject); // Salva alterações
        }
        closeModal(); // Fecha a modal
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
                        
                        <div className="input-group">
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
