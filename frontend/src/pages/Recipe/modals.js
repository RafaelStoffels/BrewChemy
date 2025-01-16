import React from 'react';
import Modal from 'react-modal';

export function MaltModal({ isOpen, closeModal, maltList, handleSelectMalt }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Malts Modal"
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
            <h2>Select a malt</h2>
            <ul>
                {maltList.length > 0 ? (
                    maltList.map((malt, index) => (
                        <li 
                            key={index} 
                            onClick={() => handleSelectMalt(malt.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <strong>{malt.name}</strong>
                        </li>
                    ))
                ) : (
                    <p>No malts available.</p>
                )}
            </ul>
            <button onClick={closeModal} className="crud-save-button">Close</button>
        </Modal>
    );
}

export function UpdateMaltModal({ isOpen, closeModal, selectedMalt, handleSaveMaltRecipe }) {
    const [recipeMalts, setRecipeMalts] = React.useState({
        name: '',
        description: '',
        malt_type: '',
        supplier: '',
        color_degrees_lovibond: '',
        potential_extract: '',
        unit_price: ''
    });

    const handleChange = (e) => {
        setRecipeMalts({
            ...recipeMalts,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Adding Malt"
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
            <h2>Adding Malt</h2>
            {selectedMalt ? (
                <div>
                    <form onSubmit={(e) => handleSaveMaltRecipe(e, recipeMalts)}>
                        <input 
                            name="name"
                            placeholder="Malt name"
                            value={recipeMalts.name}
                            onChange={handleChange}
                        />
                        <textarea 
                            name="description"
                            placeholder="Malt Description"
                            value={recipeMalts.description}
                            onChange={handleChange}
                        />
                        <input 
                            name="malt_type"
                            placeholder="Malt Type"
                            value={recipeMalts.malt_type}
                            onChange={handleChange}
                        />
                        <input 
                            name="supplier"
                            placeholder="Supplier"
                            value={recipeMalts.supplier}
                            onChange={handleChange}
                        />
                        <input 
                            name="color_degrees_lovibond"
                            placeholder="Color Degree"
                            type="number"
                            value={recipeMalts.color_degrees_lovibond}
                            onChange={handleChange}
                        />
                        <input 
                            name="potential_extract"
                            placeholder="Potential extract"
                            type="number"
                            value={recipeMalts.potential_extract}
                            onChange={handleChange}
                        />
                        <input 
                            name="unit_price"
                            placeholder="Unit Price"
                            type="number"
                            value={recipeMalts.unit_price}
                            onChange={handleChange}
                        />
                        <button type="submit" className="crud-save-button">
                            Save
                        </button>
                    </form>
                </div>
            ) : (
                <p>Error loading malt details.</p>
            )}
            <button onClick={closeModal} className="crud-save-button">Close</button>
        </Modal>
    );
}