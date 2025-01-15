import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams  } from 'react-router-dom';
import { FiPower, FiArrowLeft } from 'react-icons/fi';
import Modal from 'react-modal';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { MaltModal, AddMaltModal } from './modals';
import { fetchMalts, fetchMaltById } from '../../services/malts';

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
    const [isAddMaltModalOpen, setIsAddMaltModalOpen] = useState(false);

    /* Recipe */
    const [recipe, setRecipe] = useState({
        name: '',
        style: '',
        volumeLiters: '',
        batchTime: '',
        description: '',
        creationDate: '',
        notes: '',
        recipeMalts: [],
    });

    const [recipeMalts, setRecipeMalts] = useState([]); // Adicionando o estado para maltsRecipe

    /* Malts */
    const [maltList, setMaltList] = useState([]);
    const [selectedMalt, setSelectedMalt] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
          } else {
            if (id) {
                setIsView(window.location.pathname.includes('/details'));
                setIsEditing(!window.location.pathname.includes('/details'));
                fetchRecipeById(id);
            }
        }
    }, [id, user, navigate]);

    async function fetchRecipeById(recipeId) {
        try {
            const response = await api.get(`/api/recipes/${recipeId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const recipeData = response.data;
            setRecipe({
                name: recipeData.name || '',
                style: recipeData.style || '',
                volumeLiters: recipeData.volume_liters || '',
                batchTime: recipeData.batchTime || '',
                description: recipeData.description || '',
                creationDate: recipeData.creationDate || '',
                notes: recipeData.notes || '',
                recipeMalts: recipeData.recipeMalts || [],
            });
        } catch (err) {
            alert('Error loading recipe record.');
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prevState) => ({ ...prevState, [name]: value }));
    };

    const openModal = async () => {
        const malts = await fetchMalts(api, user.token);
        setMaltList(malts);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSelectMaltModal = async (selectedMaltId) => {
        const malt = await fetchMaltById(api, user.token, selectedMaltId);
        setSelectedMalt(malt);
        setIsAddMaltModalOpen(true);
        closeModal();
    };

    const handleSaveMaltRecipe = (maltId) => {
        setIsAddMaltModalOpen(false);
    };

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name: recipe.name,
            style: recipe.style,
            volume_liters: recipe.volumeLiters,
            batch_time: recipe.batchTime,
            description: recipe.description,
            creation_date: recipe.creationDate,
            notes: recipe.notes,
            recipe_malts: recipe.recipeMalts,
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
                            <input
                                name="name"
                                placeholder="Recipe Name"
                                value={recipe.name}
                                onChange={handleChange}
                                disabled={isView}
                            />
                            <input
                                name="style"
                                placeholder="Style"
                                value={recipe.style}
                                onChange={handleChange}
                                disabled={isView}
                            />
                            <input
                                name="volumeLiters"
                                placeholder="Volume (Liters)"
                                type="number"
                                value={recipe.volumeLiters}
                                onChange={handleChange}
                                disabled={isView}
                            />
                            <input
                                name="batchTime"
                                placeholder="Batch Time"
                                type="number"
                                value={recipe.batchTime}
                                onChange={handleChange}
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
                        {recipe.recipeMalts.length > 0 ? (
                          recipe.recipeMalts.map((malt) => (
                            <li key={malt.id}>
                              <strong>{malt.name}</strong> - {malt.weight_grams}g
                            </li>
                          ))
                        ) : (
                          <li>No malts added to this recipe yet.</li>
                        )}
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
            <MaltModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                maltList={maltList}
                handleSelectMalt={handleSelectMaltModal}
            />

            <AddMaltModal
                isOpen={isAddMaltModalOpen}
                closeModal={() => setIsAddMaltModalOpen(false)}
                selectedMalt={selectedMalt}
            />
        </div>   
    );
}