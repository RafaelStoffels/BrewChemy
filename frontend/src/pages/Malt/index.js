import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams  } from 'react-router-dom';
import { FiPower, FiArrowLeft } from 'react-icons/fi';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';
import logoImg from '../../assets/logo.svg'

export default function NewMalt() {
    const { user, logout } = useContext(AuthContext);
    const { id, details } = useParams(); // Captura o ID da URL
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
            // Verificar diretamente pela URL
            if (window.location.pathname.includes('/details')) {
                setIsView(true); 
                setIsEditing(false); 
            } else {
                setIsView(false); 
                setIsEditing(true); 
            }
            fetchMaltById(id);  // Buscar o malte para detalhes ou edição
        }
    }, [id]);  // Quando 'id' mudar, roda a lógica

    // Função para buscar os dados de um malte específico
    async function fetchMaltById(maltId) {
        try {
            const response = await api.get(`/api/malts/${maltId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const malt = response.data;
            setName(malt.name);
            setDescription(malt.description);
            setMaltType(malt.malt_type);
            setSupplier(malt.supplier);
            setColorDegree(malt.color_degrees_lovibond);
            setPotentialExtract(malt.potential_extract);
            setUnitPrice(malt.unit_price);
            setStockQuantity(malt.stock_quantity);
        } catch (err) {
            alert('Erro ao carregar os dados do malte.');
            navigate('/MaltList');
        }
    }

    // Função para salvar (criar ou atualizar)
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
                // Atualiza o malte existente
                await api.put(`/api/malts/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                alert('Malte atualizado com sucesso!');
            } else {
                // Cria um novo malte
                await api.post('/api/malts', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                alert('Malte cadastrado com sucesso!');
            }
            navigate('/MaltList');
        } catch (err) {
            alert('Erro ao salvar o malte. Por favor, tente novamente.');
        }
    }

    return (
        <div className='crud-container'>
            <div className='content'>
            <header className="header-crud">
                <img src={logoImg} alt="Brewchemy" className="logoImg" />
                <div className="div-logout-button">
                    <button onClick={logout}><FiPower size={20} color="#E02041" className="logoutButton"/></button>
                </div>
            </header>
            <section>
                <h1>
                  {isEditing ? 'Update Malt' :
                   isView ? 'Malt Details' : 
                   'Add New Malt'}
                </h1>

                <Link className=".back-link" to="/MaltList">
                    <FiArrowLeft size={16} color="#E02041"/>
                    Back
                </Link>
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
        </div>
    );
}