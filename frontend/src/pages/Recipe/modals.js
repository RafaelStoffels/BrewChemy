import React, { useState } from 'react';
import Modal from 'react-modal';

export function FermentableModal({ isOpen, closeModal, fermentableList, handleAddFermentableRecipe }) {
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
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    padding: '20px',
                },
            }}
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
