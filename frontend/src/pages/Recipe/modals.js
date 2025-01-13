import React from 'react';
import Modal from 'react-modal';
import api from '../../services/api';

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

export function AddMaltModal({ isOpen, closeModal, selectedMalt, handleSaveMaltRecipe }) {
    const [maltDetails, setMaltDetails] = React.useState({
        name: '',
        description: '',
        malt_type: '',
        supplier: '',
        color_degrees_lovibond: '',
        potential_extract: '',
        unit_price: ''
    });

    const handleChange = (e) => {
        setMaltDetails({
            ...maltDetails,
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
                    <form onSubmit={(e) => handleSaveMaltRecipe(e, maltDetails)}>
                        <input 
                            name="name"
                            placeholder="Malt name"
                            value={maltDetails.name}
                            onChange={handleChange}
                        />
                        <textarea 
                            name="description"
                            placeholder="Malt Description"
                            value={maltDetails.description}
                            onChange={handleChange}
                        />
                        <input 
                            name="malt_type"
                            placeholder="Malt Type"
                            value={maltDetails.malt_type}
                            onChange={handleChange}
                        />
                        <input 
                            name="supplier"
                            placeholder="Supplier"
                            value={maltDetails.supplier}
                            onChange={handleChange}
                        />
                        <input 
                            name="color_degrees_lovibond"
                            placeholder="Color Degree"
                            type="number"
                            value={maltDetails.color_degrees_lovibond}
                            onChange={handleChange}
                        />
                        <input 
                            name="potential_extract"
                            placeholder="Potential extract"
                            type="number"
                            value={maltDetails.potential_extract}
                            onChange={handleChange}
                        />
                        <input 
                            name="unit_price"
                            placeholder="Unit Price"
                            type="number"
                            value={maltDetails.unit_price}
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

export async function fetchMalts(api, userToken) {
    try {
        const response = await api.get('api/malts', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        alert('Error loading malts records.');
        return [];
    }
}

export async function fetchMaltById(api, userToken, maltId) {
    try {
        const response = await api.get(`/api/malts/${maltId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        alert('Error loading malt by id.');
    }
}
