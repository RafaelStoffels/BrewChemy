import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { AddFermentableModal, AddHopModal, AddYeastModal, UpdateFermentableModal } from './modals';
import { fetchFermentables } from '../../services/Fermentables';
import { fetchHops } from '../../services/Hops';
import { fetchYeasts } from '../../services/Yeasts';
import { fetchRecipeById } from '../../services/recipes';

import './styles.css';
import '../Recipe/styles.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { calculateOG, calculateIBU, calculateEBC } from '../../components/Recipe/Calculation';
import { getBeerColor } from '../../components/Recipe/GetBeerColor';

Modal.setAppElement('#root');

export default function NewRecipe() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const generateId = () => `fermentable-${Date.now()}`;

    const [isEditing, setIsEditing] = useState(false);
    const [isView, setIsView] = useState(false);
    
    /* Modals */
    const [isFermentableModalOpen, setIsFermentableModalOpen] = useState(false);
    const [isHopModalOpen, setIsHopModalOpen] = useState(false);
    const [isYeastModalOpen, setIsYeastModalOpen] = useState(false);
    const [isUpdateFermentableModalOpen, setIsUpdateFermentableModalOpen] = useState(false);
    const [isUpdateHopModalOpen, setIsUpdateHopModalOpen] = useState(false);
    const [isUpdateYeastModalOpen, setIsUpdateYeastModalOpen] = useState(false);

    const closeFermentableModal = () => setIsFermentableModalOpen(false);
    const closeHopModal = () => setIsHopModalOpen(false);
    const closeYeastModal = () => setIsYeastModalOpen(false);
    const closeUpdateFermentableModal = () => setIsUpdateFermentableModalOpen(false);
    const closeUpdateHopModal = () => setIsUpdateHopModalOpen(false);
    const closeUpdateYeastModal = () => setIsUpdateYeastModalOpen(false);

    const [selectedFermentable, setSelectedFermentable] = useState(null);

    /* Lists */
    const [fermentableList, setFermentableList] = useState([]);
    const [hopList, setHopList] = useState([]);
    const [yeastList, setYeastList] = useState([]);

    /* Dinamic Variables */
    const [OG, setOG] = useState("");
    const [FG, setFG] = useState("");
    const [EBC, setEBC] = useState(0);
    const [IBU, setIBU] = useState(0);
    const [ABV, setABV] = useState(0);

    const [EBCColor, setEBCColor] = useState("");

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
            console.log("useEffect Recipe")

            setFG(1.010.toFixed(3));

            const OGResult = calculateOG(recipe);
            setOG(OGResult);

            if (recipe.recipeFermentables.length === 0) {
                setABV(0);
            }

            const EBCResult = calculateEBC(recipe);
            console.log("EBCResult: " + EBCResult);
            setEBC(EBCResult);

            const IBUresult = calculateIBU(recipe, OGResult);
            setIBU(IBUresult);
        }
    }, [recipe]);
    
    useEffect(() => {
        if (EBC) {
            const color = getBeerColor(EBC);
            setEBCColor(color);
            console.log("assign " + EBCColor);
        }
    }, [EBC]);
    
    useEffect(() => {
        if (OG && FG) {
            if (OG === "1.000") {
                setABV(0);
            } else {
                const abvValue = ((OG - FG) * 131.25).toFixed(2);
                setABV(abvValue > 0 ? abvValue : 0);
            }
        }
    }, [OG, FG]);
    
    useEffect(() => {
        console.log("aqui " + EBCColor);

        const svgObject = document.querySelector('.beer-object');
        
        if (svgObject && svgObject.contentDocument) {
            const svgDoc = svgObject.contentDocument;
            const gradients = svgDoc.querySelectorAll('linearGradient, radialGradient');
    
            gradients.forEach(gradient => {
                const stops = gradient.querySelectorAll('stop');
        
                stops.forEach(stop => {
                    stop.setAttribute('stop-color', EBCColor); // Atualiza a cor com a variável EBCColor
                });
            });
        }
    }, [EBCColor]);

    const fetchRecipe = async (recipeID) => {
        const recipeResponse = await fetchRecipeById(recipeID, user.token);
        setRecipe({...recipeResponse});
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

    const handleUpdateFermentable = (fermentable) => {
        setSelectedFermentable(fermentable); // Define o fermentável selecionado
        setIsUpdateFermentableModalOpen(true); // Abre a modal
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
                            id: generateId(),
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
                            id: generateId(),
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
                            id: generateId(),
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

    const handleUpdateFermentableRecipe = (updatedFermentable) => {

        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeFermentables: prevRecipe.recipeFermentables.map((fermentable) =>
                fermentable.id === updatedFermentable.id ? updatedFermentable : fermentable
            ),
        }));
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
          setRecipe((prevRecipe) => {

            if (!prevRecipe || !prevRecipe.recipeFermentables) {
              console.error("prevRecipe ou recipeFermentables estão indefinidos!");
              return prevRecipe || {};
            }
      
            // Atualiza o estado com os fermentables filtrados
            const updatedRecipe = {
              ...prevRecipe,
              recipeFermentables: prevRecipe.recipeFermentables.filter(
                (fermentable) => fermentable.id !== fermentableId
              ),
            };
        
            return updatedRecipe;
          });
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
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Recipe Name</label>
                                <input
                                    name="name"
                                    placeholder="Recipe Name"
                                    value={recipe.name}
                                    onChange={handleChange}
                                    disabled={isView}
                                    style={{ width: '520px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Type</label>
                                <input
                                    name="style"
                                    placeholder="Style"
                                    value={recipe.style}
                                    onChange={handleChange}
                                    disabled={isView}
                                    style={{ width: '400px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Volume</label>
                                <input
                                    name="volumeLiters"
                                    placeholder="Volume (Liters)"
                                    type="number"
                                    value={recipe.volumeLiters}
                                    onChange={handleChange}
                                    disabled={isView}
                                    style={{ width: '120px' }}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Batch Time</label>
                                <input
                                    name="batchTime"
                                    placeholder="Batch Time"
                                    type="number"
                                    value={recipe.batchTime}
                                    onChange={handleChange}
                                    disabled={isView}
                                    style={{ width: '130px' }}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="buttons-container">
                    <button onClick={openFermentableModal} className="modalAddButtonFermentable">Add Fermentable</button>
                    <button onClick={openHopModal} className="modalAddButtonHop">Add Hop</button>
                    <button onClick={openYeastModal} className="modalAddButtonYeast">Add Yeast</button>
                </div>
                <div className="bottom-container">
                    <div className="bottom-left">
                        <ul>
                            {recipe.recipeFermentables.map((fermentable) => (
                                <li key={fermentable.id}>
                                    <object className="malt-object" type="image/svg+xml" data="/malt.svg"></object>
                                    {fermentable.weightGrams}g - <strong>{fermentable.name}</strong>
                                    <div className="ingredients-list-button-group">
                                        <button onClick={() => handleUpdateFermentable(fermentable)} type="button">
                                          <FiEdit size={20} color="#a8a8b3" />
                                        </button>
                                        <button onClick={() => handleDeleteFermentable(fermentable.id)} type="button">
                                          <FiTrash2 size={20} color="#a8a8b3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {recipe.recipeHops.map((hop) => (
                                <li key={hop.id}>
                                    <object className="hop-object" type="image/svg+xml" data="/hop.svg"></object>
                                    {hop.amount}g - <strong>{hop.name}</strong>
                                    <div className="ingredients-list-button-group">
                                        <button onClick={() => handleUpdateHop(hop.id)} type="button">
                                          <FiEdit size={20} color="#a8a8b3" />
                                        </button>
                                        <button onClick={() => handleDeleteHop(hop.id)} type="button">
                                          <FiTrash2 size={20} color="#a8a8b3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {recipe.recipeYeasts.map((yeast) => (
                                <li key={yeast.id}>
                                    <object className="yeast-object" type="image/svg+xml" data="/yeast.svg"></object>
                                    {yeast.amount}g - <strong>{yeast.name}</strong>
                                    <div className="ingredients-list-button-group">
                                        <button onClick={() => handleUpdateYeast(yeast.id)} type="button">
                                          <FiEdit size={20} color="#a8a8b3" />
                                        </button>
                                        <button onClick={() => handleDeleteYeast(yeast.id)} type="button">
                                          <FiTrash2 size={20} color="#a8a8b3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bottom-right">
                        OG: <span>{OG}</span>
                        <p></p>
                        FG: <span>{FG}</span>
                        <p></p>
                        EBC: <span>{EBC}</span>
                        <p></p>
                        IBU: <span>{IBU}</span>
                        <p></p>
                        ABV: <span>{ABV}</span>
                    </div>
                    <div className="bottom-right-beer">
                        <object className="beer-object" type="image/svg+xml" data="/beer.svg"></object>
                    </div>
                </div>
                {!isView && (
                    <button onClick={handleSubmit} className='crud-save-button' type="submit">
                        Save
                    </button>
                )}
            </div>
            <AddFermentableModal
                isOpen={isFermentableModalOpen}
                closeModal={closeFermentableModal}
                fermentableList={fermentableList}
                handleAddFermentableRecipe={handleAddFermentableRecipe}
            />
            <AddHopModal
                isOpen={isHopModalOpen}
                closeModal={closeHopModal}
                hopList={hopList}
                handleAddHopRecipe={handleAddHopRecipe}
            />
            <AddYeastModal
                isOpen={isYeastModalOpen}
                closeModal={closeYeastModal}
                yeastList={yeastList}
                handleAddYeastRecipe={handleAddYeastRecipe}
            />
            <UpdateFermentableModal
                isOpen={isUpdateFermentableModalOpen}
                closeModal={closeUpdateFermentableModal}
                selectedFermentable={selectedFermentable}
                handleUpdateFermentableRecipe={handleUpdateFermentableRecipe}
            />
        </div>
    );
}
