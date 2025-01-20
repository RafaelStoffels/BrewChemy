import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FiTrash2, FiEdit } from 'react-icons/fi';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { FermentableModal } from './modals';
import { HopModal } from './modals';
import { fetchFermentables } from '../../services/Fermentables';
import { fetchHops } from '../../services/Hops';
import { fetchRecipeById } from '../../services/recipes';

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
    const [hopList, setHopList] = useState([]);

    const [recipe, setRecipe] = useState({
        name: '',
        style: '',
        volumeLiters: '',
        batchTime: '',
        description: '',
        creationDate: '',
        notes: '',
        recipeFermentables: [],
        recipeHops: [],
    });

    useEffect(() => {
        if (!user) {
            navigate('/');
        } else {
            if (id) {
                setIsView(window.location.pathname.includes('/details'));
                setIsEditing(!window.location.pathname.includes('/details'));
                fetchRecipe(id);
            }
        }
    }, [id, user, navigate]);

    const fetchRecipe = async (recipeID) => {
        const recipeResponse = await fetchRecipeById(recipeID, user.token);
        setRecipe({
            name: recipeResponse.name || '',
            style: recipeResponse.style || '',
            volumeLiters: recipeResponse.volumeLiters || '',
            batchTime: recipeResponse.batchTime || '',
            description: recipeResponse.description || '',
            creationDate: recipeResponse.creationDate || '',
            notes: recipeResponse.notes || '',
            recipeFermentables: recipeResponse.recipeFermentables || [],
            recipeHops: recipeResponse.recipeHops || [],
        })
    };

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

    const handleAddHopRecipe = (selectedHop, amount) => {
        if (selectedHop && amount) {
            const selectedHopDetails = hopList.find((hop) => hop.id === selectedHop);

            if (selectedHopDetails) {
                const hopWithAmount = {
                    ...selectedHopDetails,
                    amount: parseFloat(amount),
                };

                console.log("Recipe Fermentables:", selectedHopDetails);

                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeHops: [
                        ...prevRecipe.recipeHops,
                        {
                            ...selectedHopDetails,
                            id: undefined,
                            amount: parseFloat(amount),
                        },
                    ],
                }));

                closeModal();
            } else {
                alert('Selected hop not found.');
            }
        } else {
            alert('Please select a hop and enter a quantity.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleUpdateFermentable = (fermentableID) => {
        const updatedFermentables = recipe.recipeFermentables.filter(
            (fermentable) => fermentable.id !== fermentableID
        );
        /* abrir o novo modal */
    };

    const handleUpdateHop = (hopID) => {
        const updatedHops = recipe.recipeHops.filter(
            (hop) => hop.id !== hopID
        );
        /* abrir o novo modal */
    };

    const handleDeleteFermentable = (fermentableId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this fermentable?');
        if (confirmDelete) {
            const updatedFermentables = recipe.recipeFermentables.filter(
                (fermentable) => fermentable.id !== fermentableId
            );
        
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                recipeFermentables: updatedFermentables,
            }));
        }
    };

    const handleDeleteHop = (hopID) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this hop?');
        if (confirmDelete) {
            const updatedHops = recipe.recipeHops.filter(
                (hop) => hop.id !== hopID
            );
        
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                recipeHops: updatedHops,
            }));
        }
    };

    const openFermentableModal = async () => {
        const fermentables = await fetchFermentables(api, user.token);
        setFermentableList(fermentables);
        setIsModalOpen(true);
    };

    const openHopModal = async () => {
        const hops = await fetchHops(api, user.token);
        setHopList(hops);
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
            recipeHops: recipe.recipeHops,
        };

        try {
            if (isEditing) {
                await api.put(`/api/recipes/${id}`, data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
            } else {
                await api.post('/api/recipes', data, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
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
                    <button onClick={openFermentableModal} className="modalAddFermentable">Add Fermentable</button>
                    <button onClick={openHopModal} className="modalAddHop">Add Hop</button>
                </div>
                <div className="bottom-container">
                    <div className="bottom-left">
                        <ul>
                            {recipe.recipeFermentables.map((fermentable) => (
                                <li key={fermentable.id}>
                                    <strong>{fermentable.name}</strong> - {fermentable.weightGrams}g
                                    <button onClick={() => handleUpdateFermentable(fermentable.id)} type="button">
                                      <FiEdit size={20} color="#a8a8b3" />
                                    </button>
                                    <button onClick={() => handleDeleteFermentable(fermentable.id)} type="button">
                                      <FiTrash2 size={20} color="#a8a8b3" />
                                    </button>
                                </li>
                            ))}
                            {recipe.recipeHops.map((hop) => (
                                <li key={hop.id}>
                                    <strong>{hop.name}</strong> - {hop.amount}g
                                    <button onClick={() => handleUpdateHop(hop.id)} type="button">
                                      <FiEdit size={20} color="#a8a8b3" />
                                    </button>
                                    <button onClick={() => handleDeleteHop(hop.id)} type="button">
                                      <FiTrash2 size={20} color="#a8a8b3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bottom-right">
                        OG
                        <p></p>
                        FG
                        <p></p>
                        EBC
                        <p></p>
                        IBU
                        <p></p>
                        ABV
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
            <HopModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                hopList={hopList}
                handleAddHopRecipe={handleAddHopRecipe}
            />
        </div>
    );
}
