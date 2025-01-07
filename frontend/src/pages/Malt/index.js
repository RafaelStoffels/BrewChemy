import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import './styles.css';
import logoImg from '../../assets/logo.svg'

export default function NewMalt() {
    const { user, logout } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [malt_type, setMaltType] = useState('');
    const [supplier, setSupplier] = useState('');
    const [color_degrees_lovibond, setColorDegree] = useState('');
    const [potential_extract, setPotentialExtract] = useState('');
    const [unit_price, setUnitPrice] = useState('');
    const [stock_quantity, setStockQuantity] = useState('');

    const navigate = useNavigate();

    async function handleNewMalt(e){
        e.preventDefault();

        // Validação de campo obrigatório
        if (!name) {
            alert('Name is required!');
            return;
        }

        if (!color_degrees_lovibond) {
            alert('Color degree is required!');
            return;
        }

        if (!potential_extract) {
            alert('Potential extract is required!');
            return;
        }

        const data = {
            name,
            description,
            malt_type,
            supplier,
            color_degrees_lovibond,
            potential_extract,
            unit_price,
            stock_quantity
        };

        try {
            await api.post('api/malts', data, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            })

            navigate('/MaltList');
        } catch (err) {
            alert('Error while registering malt. Please try again.')
        }
    }

    return (
        <div className='new-malt-container'>
            <div className='content'>
            <section>
                <h1>Cadastrar novo malte</h1>

                <Link className=".back-link" to="/MaltList">
                    <FiArrowLeft size={16} color="#E02041"/>
                    Voltar
                </Link>
            </section>

            <form onSubmit={handleNewMalt}>
                <input 
                    placeholder='Malt name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <textarea type='Description' 
                    placeholder='Malt Description'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <input type='Malt type' 
                    placeholder='Malt Type'
                    value={malt_type}
                    onChange={e => setMaltType(e.target.value)}
                />
                <input 
                    placeholder='Supplier'
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                />
                <input 
                    placeholder='Color Degree'
                    type="number"
                    value={color_degrees_lovibond}
                    onChange={e => setColorDegree(e.target.value)}
                />
                <input 
                    placeholder='Potential extract'
                    type="number"
                    value={potential_extract}
                    onChange={e => setPotentialExtract(e.target.value)}
                />
                <input 
                    placeholder='Unit Price'
                    type="number"
                    onChange={e => setUnitPrice(e.target.value)}
                />
                <input 
                    placeholder='Stock Quantity'
                    type="number"
                    value={stock_quantity}
                    onChange={e => setStockQuantity(e.target.value)}
                />

                <button onClick={handleNewMalt} className='new-malt-button' type="submit">Cadastrar</button>
            </form>
            </div>
        </div>
    );
}