import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams  } from 'react-router-dom';
import { FiPower, FiArrowLeft } from 'react-icons/fi';
import Modal from 'react-modal';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

import './styles.css';
import '../Recipe/styles.css';
import logoImg from '../../assets/logo.svg'

Modal.setAppElement('#root');

export default function NewRecipe() {
    const { user, logout } = useContext(AuthContext);
    const { id, details } = useParams();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isView, setIsView] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [recipeName, setRecipeName] = useState('');
    const [recipeStyle, setRecipeStyle] = useState('');
    const [recipeVolumeLiters, setRecipeVolumeLiters] = useState('');
    const [batchTime, setRecipeBatchTime] = useState('');
    const [description, setDescription] = useState('');
    const [creationDate, setCreationDate] = useState('');
    const [notes, setNotes] = useState('');



    const [recipeMaltName, setMaltName] = useState('');
    const [recipeMaltsupplier, setSupplier] = useState('');
    const [recipeMaltColor_degrees_lovibond, setColorDegree] = useState('');
    const [recipeMaltPotential_extract, setPotentialExtract] = useState('');
    const [recipeMaltUnit_price, setUnitPrice] = useState('');


    const [recipeMalts, setRecipeMalts] = useState([]); // Adicionando o estado para maltsRecipe

    const [malts, setMalts] = useState([]); // Adicionando o estado para malts

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
                fetchRecipeById(id);  
            }
        }
    }, [id]);

    async function fetchRecipeById(recipeId) {
        try {
            const response = await api.get(`/api/recipes/${recipeId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const recipe = response.data;
            setRecipeName(recipe.name);
            setRecipeStyle(recipe.style);
            setRecipeVolumeLiters(recipe.volume_liters);
            setRecipeMalts(recipe.recipeMalts || []); // Definindo os maltsRecipe

        } catch (err) {
            alert('Error loading recipe record.');
            navigate('/RecipeList');
        }
    }

    async function fetchMalts() {
        try {
            const response = await api.get(`/api/malts/`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const malts = response.data;
            setMaltName(malts.name);

        } catch (err) {
            alert('Error loading malts records.');
            navigate('/RecipeList');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            recipeName,
            recipeStyle,
        };

        try {
            if (isEditing) {
                await api.put(`/api/recipes/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                alert('Recipe updated!');
            } else {
                await api.post('/api/recipes', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                alert('Recipe saved!');
            }
            navigate('/RecipeList');
        } catch (err) {
            alert('Error salving recipe. Please, try again.');
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
                      {isEditing ? 'Update Recipe' :
                       isView ? 'Recipe Details' : 
                       'Add New Recipe'}
                    </h1>

                    <Link className=".back-link" to="/RecipeList">
                        <FiArrowLeft size={16} color="#E02041"/>
                        Back
                    </Link>
                </section>

                <div class="top">
                    <form onSubmit={handleSubmit}>
                        <div className="form-fields">
                            <input classname="input-name"
                                placeholder='Recipe name'
                                value={recipeName}
                                onChange={e => setRecipeName(e.target.value)}
                                disabled={isView}
                            />
                            <input classname="input-style" 
                                type='Style' 
                                placeholder='Style'
                                value={recipeStyle}
                                onChange={e => setRecipeStyle(e.target.value)}
                                disabled={isView}
                            />
                            <input classname="input-volume"
                            placeholder="Volume"
                            type="Number"
                            value={recipeVolumeLiters}
                            onChange={e => setRecipeVolumeLiters(e.target.value)}
                            disabled={isView}
                            />
                            <input classname="input-batch-time"
                            placeholder="Batch time"
                            type="Number"
                            value={batchTime}
                            onChange={e => setRecipeBatchTime(e.target.value)}
                            disabled={isView}
                            />
                        </div>
                    </form>
                </div>
                <div classname="buttons-container">
                    <button onClick={openModal} className="modalAddMalt">Add Malt</button>
                </div>
                <div class="bottom-container">
                    <div class="bottom-left">
                        <ul>
                          {recipeMalts.map(malt => (
                            <li key={malt.id}>
                                <strong>{malt.weight_grams}g - {malt.name}</strong>
                            </li>
                          ))}
                        </ul>
                    </div>
                        
                    <div class="bottom-right">
                        olaaaa
                    </div>
                </div>
                {!isView && (
                <button onClick={handleSubmit} className='crud-save-button' type="submit">
                    Save
                </button>
                )}
            </div>
            <Modal
                isOpen={isModalOpen}
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
                <h2>Add Malt</h2>
                <ul>
                    {malts.map((malt, index) => (
                        <li key={index}>
                            <strong>{malt.name}</strong> - {malt.weight_grams}g
                        </li>
                    ))}
                </ul>
                <button onClick={closeModal} className="crud-save-button">Close</button>
            </Modal>
        </div>
        
    );
}