import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { fetchMaltById } from '../../services/malts';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function NewMalt() {
    const { user } = useContext(AuthContext);
    const { id, details } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [malt_type, setMaltType] = useState('');
    const [supplier, setSupplier] = useState('');
    const [color_degrees_lovibond, setColorDegree] = useState('');
    const [potential_extract, setPotentialExtract] = useState('');
    const [unit_price, setUnitPrice] = useState('');
    const [stock_quantity, setStockQuantity] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isView, setIsView] = useState(false);

    useEffect(() => {
        if (id) {
            if (window.location.pathname.includes('/details')) {
                setIsView(true); 
                setIsEditing(false); 
            } else {
                setIsView(false); 
                setIsEditing(true); 
            }
            fetchMalt(id); 
        }
    }, [id]); 

    async function fetchMalt(maltId) {
        try {
            const malt = await fetchMaltById(api, user.token, maltId);
            setName(malt.name);
            setDescription(malt.description);
            setMaltType(malt.malt_type);
            setSupplier(malt.supplier);
            setColorDegree(malt.color_degrees_lovibond);
            setPotentialExtract(malt.potential_extract);
            setUnitPrice(malt.unit_price);
            setStockQuantity(malt.stock_quantity);
        } catch (err) {
            alert('Error loading malt record.');
            navigate('/MaltList');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name,
            description,
            malt_type,
            supplier,
            color_degrees_lovibond,
            potential_extract,
            unit_price,
            stock_quantity,
        };

        try {
            if (isEditing) {
                await api.put(`/api/malts/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            } else {
                await api.post('/api/malts', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            }
            navigate('/MaltList');
        } catch (err) {
            alert('Error saving record. Please try again.');
        }
    }

    return (
        <div className='crud-container'>

            <Sidebar />

            <Header />

            <section>
                <h1>
                  {isEditing ? 'Update Malt' :
                   isView ? 'Malt Details' : 
                   'Add New Malt'}
                </h1>
            </section>

            <form onSubmit={handleSubmit}>
                <input 
                    placeholder='Malt name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={isView}
                />
                <textarea type='Description' 
                    placeholder='Malt Description'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isView}
                />
                <input type='Malt type' 
                    placeholder='Malt Type'
                    value={malt_type}
                    onChange={e => setMaltType(e.target.value)}
                    disabled={isView}
                />
                <input 
                    placeholder='Supplier'
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    disabled={isView}
                />
                <input 
                    placeholder='Color Degree'
                    type="number"
                    value={color_degrees_lovibond}
                    onChange={e => setColorDegree(e.target.value)}
                    disabled={isView}
                />
                <input 
                    placeholder='Potential extract'
                    type="number"
                    value={potential_extract}
                    onChange={e => setPotentialExtract(e.target.value)}
                    disabled={isView}
                />
                <input 
                    placeholder='Unit Price'
                    type="number"
                    onChange={e => setUnitPrice(e.target.value)}
                    disabled={isView}
                />
                <input 
                    placeholder='Stock Quantity'
                    type="number"
                    value={stock_quantity}
                    onChange={e => setStockQuantity(e.target.value)}
                    disabled={isView}
                />
                {!isView && (
                    <button onClick={handleSubmit} className='crud-save-button' type="submit">
                        Save
                    </button>
                )}
            </form>
        </div>
    );
}