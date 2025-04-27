import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { fetchFermentableById, updateFermentable, addFermentable } from '../../services/Fermentables';
import { showErrorToast, showSuccessToast } from "../../utils/notifications";

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';

export default function NewFermentable() {
    const { user } = useContext(AuthContext);
    const { recordUserId } = useParams();
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Base');
    const [supplier, setSupplier] = useState('');
    const [ebc, setEBC] = useState('');
    const [potentialExtract, setPotentialExtract] = useState('');
    const [unit_price, setUnitPrice] = useState('');
    const [stock_quantity, setStockQuantity] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isView, setIsView] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/');
        } else {
            if (id) {
                if (window.location.pathname.includes('/details')) {
                    setIsView(true); 
                    setIsEditing(false); 
                } else {
                    setIsView(false); 
                    setIsEditing(true); 
                }
                fetchFermentable(recordUserId, id); 
            }
        }
    }, [id, user, navigate]); 

    async function fetchFermentable(recordUserId, itemID) {
        try {
            const fermentable = await fetchFermentableById(api, user.token, recordUserId, itemID);
            setName(fermentable.name);
            setDescription(fermentable.description);
            setType(fermentable.type);
            setSupplier(fermentable.supplier);
            setEBC(fermentable.ebc);
            setPotentialExtract(fermentable.potentialExtract);
            setUnitPrice(fermentable.unit_price);
            setStockQuantity(fermentable.stock_quantity);
        } catch (err) {
            showErrorToast("Error loading fermentable record." + err);
            navigate('/FermentableList');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name,
            description,
            type,
            supplier,
            ebc,
            potentialExtract,
            unit_price,
            stock_quantity,
        };

        console.log(data);

        try {
            if (isEditing) {
                await updateFermentable(api, user.token, recordUserId, id, data);
                showSuccessToast("Fermentable has been updated.");
            } else {
                await addFermentable(api, user.token, data);
                showSuccessToast("Added new fermentable successfully.");
            }
            navigate('/FermentableList');
        } catch (err) {
            showErrorToast("" + err.message);
        }
    }

    return (
        <div>
            <div className='crud-container'>
                <section>
                    <h1>
                      {isEditing ? 'Update Fermentable' :
                       isView ? 'Fermentable Details' : 
                       'Add New Fermentable'}
                    </h1>
                </section>
                <div className='content'>
                    <form onSubmit={handleSubmit}>
                        <div className='inputs-row'>
                            <div className='input-field'>
                                <label htmlFor="name">Name</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    disabled={isView}
                                    style={{ width: '430px' }}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Supplier</label>
                                <input 
                                    value={supplier}
                                    onChange={e => setSupplier(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                        </div>
                        <div className='inputs-row'>
                            <div className='input-field'>
                                <label htmlFor="name">Description</label>
                                <textarea type='Description' 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                        </div>
                        <div className='inputs-row'>
                            <div className='input-field'>
                                <label htmlFor="name">Type</label>
                                <select
                                      value={type}
                                      onChange={e => setType(e.target.value)}
                                    >
                                      <option value="base">Base</option>
                                      <option value="Specialty">Specialty</option>
                                      <option value="Adjunct">Adjunct</option>
                                </select>
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Color Degree</label>
                                <input 
                                    type="number"
                                    value={ebc}
                                    onChange={e => setEBC(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Potencial Extract</label>
                                <input 
                                    type="number"
                                    value={potentialExtract}
                                    onChange={e => setPotentialExtract(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                        </div>
                    </form>
                    </div>
                {!isView && (
                    <button onClick={handleSubmit} className='crud-save-button' type="submit">
                        Save
                    </button>
                )}
            </div>
        </div>
    );
}