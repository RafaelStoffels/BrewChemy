import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { fetchEquipmentById } from '../../services/Equipments';
import { showErrorToast } from "../../utils/notifications";

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';

export default function NewEquipment() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [efficiency, setEfficiency] = useState('');
    const [batchVolume, setBatchVolume] = useState('');
    const [batchTime, setBatchTime] = useState('');
    const [boilTime, setBoilTime] = useState('');
    const [boilTemperature, setBoilTemperature] = useState('');
    const [boilOff, setBoilOff] = useState('');
    const [trubLoss, setTrubLoss] = useState('');
    const [deadSpace, setDeadSpace] = useState('');

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
                fetchEquipment(id); 
            }
        }
    }, [id, user, navigate]); 

    async function fetchEquipment(itemID) {
        try {
            const equipment = await fetchEquipmentById(api, user.token, itemID);
            setName(equipment.name);
            setDescription(equipment.description);
            setEfficiency(equipment.efficiency);
            setBatchVolume(equipment.batchVolume);
            setBatchTime(equipment.batchTime);
            setBoilTime(equipment.boilTime);
            setBoilTemperature(equipment.boilTemperature);
            setBoilOff(equipment.boilOff);
            setTrubLoss(equipment.trubLoss);
            setDeadSpace(equipment.deadSpace);
        } catch (err) {
            showErrorToast("Error loading equipment record." + err);
            navigate('/EquipmentList');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name,
            description,
            efficiency,
            batchVolume,
            boilTime,
            batchTime,
            boilTemperature,
            boilOff,
            trubLoss,
            deadSpace
        };

        console.log(data);

        try {
            if (isEditing) {
                await api.put(`/api/equipments/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            } else {
                await api.post('/api/equipments', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            }
            navigate('/EquipmentList');
        } catch (err) {
            showErrorToast("Error loading equipment record." + err);
        }
    }

    return (
        <div>
            <section>
                <h1>
                  {isEditing ? 'Update Equipment' :
                   isView ? 'Equipment Details' : 
                   'Add New Equipment'}
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
                                <label htmlFor="name">Batch Volume</label>
                                <input 
                                    type="number"
                                    value={batchVolume}
                                    onChange={e => setBatchVolume(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Batch Time</label>
                                <input 
                                    type="number"
                                    value={batchTime}
                                    onChange={e => setBatchTime(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Boil Time</label>
                                <input 
                                    type="number"
                                    value={boilTime}
                                    onChange={e => setBoilTime(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Boil Temperature</label>
                                <input 
                                    type="number"
                                    value={boilTemperature}
                                    onChange={e => setBoilTemperature(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                        </div>
                        <div className='inputs-row'>
                        <div className='input-field'>
                                <label htmlFor="name">Efficiency</label>
                                <input 
                                    type='number' 
                                    value={efficiency}
                                    onChange={e => setEfficiency(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Boil Off</label>
                                <input 
                                    type="number"
                                    value={boilOff}
                                    onChange={e => setBoilOff(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Trub Loss</label>
                                <input 
                                    type='number' 
                                    value={trubLoss}
                                    onChange={e => setTrubLoss(e.target.value)}
                                    disabled={isView}
                                />
                            </div>
                            <div className='input-field'>
                                <label htmlFor="name">Dead Space</label>
                                <input 
                                    type='number' 
                                    value={deadSpace}
                                    onChange={e => setDeadSpace(e.target.value)}
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