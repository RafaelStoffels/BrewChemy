import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { fetchFermentableById } from '../../services/Fermentables';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';

export default function NewFermentable() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fermentable_type, setFermentableType] = useState('');
    const [supplier, setSupplier] = useState('');
    const [color_degrees_lovibond, setColorDegree] = useState('');
    const [potential_extract, setPotentialExtract] = useState('');
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
                fetchFermentable(id); 
            }
        }
    }, [id, user, navigate]); 

    async function fetchFermentable(fermentableId) {
        try {
            const fermentable = await fetchFermentableById(api, user.token, fermentableId);
            setName(fermentable.name);
            setDescription(fermentable.description);
            setFermentableType(fermentable.fermentable_type);
            setSupplier(fermentable.supplier);
            setColorDegree(fermentable.color_degrees_lovibond);
            setPotentialExtract(fermentable.potential_extract);
            setUnitPrice(fermentable.unit_price);
            setStockQuantity(fermentable.stock_quantity);
        } catch (err) {
            alert('Error loading fermentable record.');
            navigate('/FermentableList');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name,
            description,
            fermentable_type,
            supplier,
            color_degrees_lovibond,
            potential_extract,
            unit_price,
            stock_quantity,
        };

        try {
            if (isEditing) {
                await api.put(`/api/fermentables/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            } else {
                await api.post('/api/fermentables', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            }
            navigate('/FermentableList');
        } catch (err) {
            alert('Error saving record. Please try again.');
        }
    }

    return (
        <div>
            <section>
                <h1>
                  {isEditing ? 'Update Fermentable' :
                   isView ? 'Fermentable Details' : 
                   'Add New Fermentable'}
                </h1>
            </section>
            <div className='crud-container'>
                <form onSubmit={handleSubmit}>
                    <div className='inputs-row'>
                        <div className='input-field'>
                            <input 
                                placeholder='Fermentable name'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={isView}
                            />
                        </div>
                    </div>
                    <div className='inputs-row'>
                        <div className='input-field'>
                            <textarea type='Description' 
                                placeholder='Fermentable Description'
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={isView}
                            />
                        </div>
                    </div>
                    <div className='inputs-row'>
                        <div className='input-field'>
                            <input type='Fermentable type' 
                                placeholder='Fermentable Type'
                                value={fermentable_type}
                                onChange={e => setFermentableType(e.target.value)}
                                disabled={isView}
                            />
                        </div>
                        <div className='input-field'>
                            <input 
                                placeholder='Supplier'
                                value={supplier}
                                onChange={e => setSupplier(e.target.value)}
                                disabled={isView}
                            />
                        </div>
                    </div>
                    <div className='inputs-row'>
                        <div className='input-field'>
                            <input 
                                placeholder='Color Degree'
                                type="number"
                                value={color_degrees_lovibond}
                                onChange={e => setColorDegree(e.target.value)}
                                disabled={isView}
                            />
                        </div>
                        <div className='input-field'>
                            <input 
                                placeholder='Potential extract'
                                type="number"
                                value={potential_extract}
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
    );
}