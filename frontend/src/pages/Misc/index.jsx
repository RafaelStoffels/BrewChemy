import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { fetchMiscById } from '../../services/Misc';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';

export default function NewMisc() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Spice');

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
                fetchMisc(id); 
            }
        }
    }, [id, user, navigate]); 

    async function fetchMisc(itemID) {
        try {
            const misc = await fetchMiscById(api, user.token, itemID);
            setName(misc.name);
            setDescription(misc.description);
            setType(misc.type);

        } catch (err) {
            alert('Error loading misc record.');
            navigate('/MiscList');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name,
            description,
            type,
        };

        console.log(data);

        try {
            if (isEditing) {
                await api.put(`/api/misc/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            } else {
                await api.post('/api/misc', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            }
            navigate('/MiscList');
        } catch (err) {
            alert('Error saving record. Please try again.');
        }
    }

    return (
        <div>
            <section>
                <h1>
                  {isEditing ? 'Update Misc' :
                   isView ? 'Misc Details' : 
                   'Add New Misc'}
                </h1>
            </section>
            <div className='crud-container'>
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
                                <label htmlFor="name">Type</label>
                                <select
                                      value={type}
                                      onChange={e => setType(e.target.value)}
                                    >
                                      <option value="Flavor">Flavor</option>
                                      <option value="Fining">Fining</option>
                                      <option value="Herb">Herb</option>
                                      <option value="Spice">Spice</option>
                                      <option value="Water Agent">Water Agent</option>
                                      <option value="Other">Other</option>
                                </select>
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