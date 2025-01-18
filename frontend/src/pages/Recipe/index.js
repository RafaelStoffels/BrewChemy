import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { FermentableModal } from './modals';
import { fetchFermentables, fetchFermentableById } from '../../services/Fermentables';

import './styles.css';
import '../Recipe/styles.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

Modal.setAppElement('#root');

export default function NewRecipe() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isView, setIsView] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [fermentableList, setFermentableList] = useState([]);

    const [recipe, setRecipe] = useState({
        name: '',
        style: '',
        volumeLiters: '',
        batchTime: '',
        description: '',
        creationDate: '',
        notes: '',
        recipeFermentables: [],
    });

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

    const handleAddFermentableRecipe = (selectedFermentable, quantity) => {
        if (selectedFermentable && quantity) {
            const selectedFermentableDetails = fermentableList.find((fermentable) => fermentable.id === selectedFermentable);

            if (selectedFermentableDetails) {
                const fermentableWithWeight = {
                    ...selectedFermentableDetails,
                    weightGrams: parseFloat(quantity),
                };

                console.log("Recipe Fermentables:", selectedFermentableDetails);

                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeFermentables: [
                        ...prevRecipe.recipeFermentables,
                        {
                            ...selectedFermentableDetails,
                            id: undefined,
                            weightGrams: parseFloat(quantity),
                        },
                    ],
                }));

                closeModal();
            } else {
                alert('Selected fermentable not found.');
            }
        } else {
            alert('Please select a fermentable and enter a quantity.');
        }
    };

    async function fetchRecipeById(recipeId) {
        try {
            const response = await api.get(`/api/recipes/${recipeId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const recipeData = response.data;
            setRecipe({
                name: recipeData.name || '',
                style: recipeData.style || '',
                volumeLiters: recipeData.volumeLiters || '',
                batchTime: recipeData.batchTime || '',
                description: recipeData.description || '',
                creationDate: recipeData.creationDate || '',
                notes: recipeData.notes || '',
                recipeFermentables: recipeData.recipeFermentables || [],
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
        const fermentables = await fetchFermentables(api, user.token);
        setFermentableList(fermentables);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    async function handleSubmit(e) {
        e.preventDefault();

        console.log("Recipe Fermentables:", recipe);

        const data = {
            name: recipe.name,
            style: recipe.style,
            volumeLiters: recipe.volumeLiters,
            batchTime: recipe.batchTime,
            description: recipe.description,
            creationDate: recipe.creationDate,
            notes: recipe.notes,
            recipeFermentables: recipe.recipeFermentables,
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
            alert('Error saving recipe. Please, try again.');
        }
    }

    return (
        <div className='recipe-container'>
            <div className='content'>

                <Sidebar />

                <Header />

                <section>
                    <h1>
                        {isEditing ? 'Update Recipe' :
                            isView ? 'Recipe Details' :
                            'Add New Recipe'}
                    </h1>
                </section>

                <div className="top">
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
                <div className="buttons-container">
                    <button onClick={openModal} className="modalAddFermentable">Add Fermentable</button>
                </div>
                <div className="bottom-container">
                    <div className="bottom-left">
                        <ul>
                            {recipe.recipeFermentables.length > 0 ? (
                                recipe.recipeFermentables.map((fermentable) => (
                                    <li key={fermentable.id}>
                                        <strong>{fermentable.name}</strong> - {fermentable.weightGrams}g
                                    </li>
                                ))
                            ) : (
                                <li>No fermentables added to this recipe yet.</li>
                            )}
                        </ul>
                    </div>

                    <div className="bottom-right">
                        olaaaa
                    </div>
                </div>
                {!isView && (
                    <button onClick={handleSubmit} className='crud-save-button' type="submit">
                        Save
                    </button>
                )}
            </div>
            <FermentableModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                fermentableList={fermentableList}
                handleAddFermentableRecipe={handleAddFermentableRecipe}
            />
        </div>
    );
}
