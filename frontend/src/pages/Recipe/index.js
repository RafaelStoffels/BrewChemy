import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FiTrash2, FiEdit } from 'react-icons/fi';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { FermentableModal } from './modals';
import { HopModal } from './modals';
import { YeastModal } from './modals';
import { fetchFermentables } from '../../services/Fermentables';
import { fetchHops } from '../../services/Hops';
import { fetchYeasts } from '../../services/Yeasts';
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
    const [isFermentableModalOpen, setIsFermentableModalOpen] = useState(false);
    const [isHopModalOpen, setIsHopModalOpen] = useState(false);
    const [isYeastModalOpen, setIsYeastModalOpen] = useState(false);

    const [fermentableList, setFermentableList] = useState([]);
    const [hopList, setHopList] = useState([]);
    const [yeastList, setYeastList] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [OG, setOG] = useState("");
    const [fg, setFg] = useState("");
    const [ABV, setABV] = useState(0);

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
        recipeYeasts: [],
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
    }, [id, user]);

    useEffect(() => {
        if (recipe) {
            calculateOG();
            calculateABV();
        }
    }, [recipe]);

    const fetchRecipe = async (recipeID) => {
        const recipeResponse = await fetchRecipeById(recipeID, user.token);
        setRecipe({...recipeResponse});
    };

    const handleAddFermentableRecipe = (selectedFermentable, quantity) => {
        if (selectedFermentable && quantity) {
            const selectedFermentableDetails = fermentableList.find((fermentable) => fermentable.id === selectedFermentable);

            if (selectedFermentableDetails) {
                const fermentableWithWeight = {
                    ...selectedFermentableDetails,
                    weightGrams: parseFloat(quantity),
                };

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

                closeFermentableModal();
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

                closeHopModal();
            } else {
                alert('Selected hop not found.');
            }
        } else {
            alert('Please select a hop and enter a quantity.');
        }
    };

    const handleAddYeastRecipe = (selectedYeast, amount) => {
        if (selectedYeast && amount) {
            const selectedYeastDetails = yeastList.find((yeast) => yeast.id === selectedYeast);

            if (selectedYeastDetails) {
                const yeastWithAmount = {
                    ...selectedYeastDetails,
                    amount: parseFloat(amount),
                };

                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeYeasts: [
                        ...prevRecipe.recipeYeasts,
                        {
                            ...selectedYeastDetails,
                            id: undefined,
                            amount: parseFloat(amount),
                        },
                    ],
                }));

                closeYeastModal();
            } else {
                alert('Selected yeast not found.');
            }
        } else {
            alert('Please select a yeast and enter a quantity.');
        }
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

    const handleUpdateYeast = (yeastID) => {
        const updatedYeasts = recipe.recipeYeasts.filter(
            (yeast) => yeast.id !== yeastID
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

    const handleDeleteYeast = (yeastID) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this yeast?');
        if (confirmDelete) {
            const updatedYeasts = recipe.recipeYeasts.filter(
                (yeast) => yeast.id !== yeastID
            );
        
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                recipeYeasts: updatedYeasts,
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prevState) => ({ ...prevState, [name]: value }));
    };

    const calculateOG = () => {
        let totalGravityPoints = 0;
    
        const volumeLiters = 23;
        const efficiency = 0.75;
    
        const volumeGallons = volumeLiters / 3.78541;
    
        if (!recipe.recipeFermentables || recipe.recipeFermentables.length === 0) {
            console.error("recipe.recipeFermentables está vazio ou indefinido");
            return;
        }
    
        recipe.recipeFermentables.forEach((fermentable) => {
            const weightKg = fermentable.weightGrams / 1000;
            const weightLb = weightKg * 2.20462;
            const potential = fermentable.potentialExtract || 1.036;
    
            const gravityPoints = (potential - 1) * 1000;
    
            totalGravityPoints += weightLb * gravityPoints * efficiency;
        });
    
        const OG = (totalGravityPoints / volumeGallons) / 1000 + 1;
    
        setOG(OG.toFixed(3));
    };
    
    const calculateABV = () => {

        // Estimar o FG (gravidade final) baseado no estilo, pode ser ajustado conforme necessário
        const FG = 1.010; // Valor padrão para FG (ajustável conforme estilo ou fermento)
    
        console.log(OG);
        console.log(OG - FG);

        // Calcular a ABV
        const ABV = ((OG - FG) * 131.25).toFixed(2); // Fórmula para ABV
    
        setABV(ABV);
    };

    const openFermentableModal = async () => {
        const fermentables = await fetchFermentables(api, user.token);
        setFermentableList(fermentables);
        setIsFermentableModalOpen(true);
    };

    const openHopModal = async () => {
        const hops = await fetchHops(api, user.token);
        setHopList(hops);
        setIsHopModalOpen(true);
    };

    const openYeastModal = async () => {
        const yeasts = await fetchYeasts(api, user.token);
        setYeastList(yeasts);
        setIsYeastModalOpen(true);
    };

    const closeFermentableModal = () => setIsFermentableModalOpen(false);
    const closeHopModal = () => setIsHopModalOpen(false);
    const closeYeastModal = () => setIsYeastModalOpen(false);
    
    async function handleSubmit(e) {
        e.preventDefault();

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
            recipeYeasts: recipe.recipeYeasts,
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
                    <button onClick={openYeastModal} className="modalAddYeast">Add Yeast</button>
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
                            {recipe.recipeYeasts.map((yeast) => (
                                <li key={yeast.id}>
                                    <strong>{yeast.name}</strong> - {yeast.amount}g
                                    <button onClick={() => handleUpdateYeast(yeast.id)} type="button">
                                      <FiEdit size={20} color="#a8a8b3" />
                                    </button>
                                    <button onClick={() => handleDeleteYeast(yeast.id)} type="button">
                                      <FiTrash2 size={20} color="#a8a8b3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bottom-right">
                        OG: <span>{OG}</span>
                        <p></p>
                        FG
                        <p></p>
                        EBC
                        <p></p>
                        IBU
                        <p></p>
                        ABV: <span>{ABV}</span>
                    </div>
                </div>
                {!isView && (
                    <button onClick={handleSubmit} className='crud-save-button' type="submit">
                        Save
                    </button>
                )}
            </div>
            <FermentableModal
                isOpen={isFermentableModalOpen}
                closeModal={closeFermentableModal}
                fermentableList={fermentableList}
                handleAddFermentableRecipe={handleAddFermentableRecipe}
            />
            <HopModal
                isOpen={isHopModalOpen}
                closeModal={closeHopModal}
                hopList={hopList}
                handleAddHopRecipe={handleAddHopRecipe}
            />
            <YeastModal
                isOpen={isYeastModalOpen}
                closeModal={closeYeastModal}
                yeastList={yeastList}
                handleAddYeastRecipe={handleAddYeastRecipe}
            />
        </div>
    );
}
