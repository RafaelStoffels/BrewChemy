import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { AddFermentableModal, AddHopModal, AddMiscModal, AddYeastModal, UpdateFermentableModal, UpdateHopModal, UpdateMiscModal, UpdateYeastModal } from './modals';

import { getOpenAIResponse } from '../../services/OpenAI';
import { fetchFermentables } from '../../services/Fermentables';
import { fetchHops } from '../../services/Hops';
import { fetchMisc } from '../../services/misc';
import { fetchYeasts } from '../../services/Yeasts';
import { fetchRecipeById } from '../../services/recipes';
import { fetchEquipmentById } from '../../services/Equipments';

import './styles.css';
import '../Recipe/styles.css';
import Sidebar from '../../components/Sidebar';
import { calculateOG, calculateIBU, calculateEBC } from '../../components/Recipe/Calculation';
import { getBeerColor } from '../../components/Recipe/GetBeerColor';
import { beerStyles } from '../../components/Recipe/getBeerStyles';
import { OGBar } from '../../components/Recipe/Indicators';

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
    const [isMiscModalOpen, setIsMiscModalOpen] = useState(false);
    const [isYeastModalOpen, setIsYeastModalOpen] = useState(false);
    const [isUpdateFermentableModalOpen, setIsUpdateFermentableModalOpen] = useState(false);
    const [isUpdateHopModalOpen, setIsUpdateHopModalOpen] = useState(false);
    const [isUpdateMiscModalOpen, setIsUpdateMiscModalOpen] = useState(false);
    const [isUpdateYeastModalOpen, setIsUpdateYeastModalOpen] = useState(false);

    const closeFermentableModal = () => setIsFermentableModalOpen(false);
    const closeHopModal = () => setIsHopModalOpen(false);
    const closeMiscModal = () => setIsMiscModalOpen(false);
    const closeYeastModal = () => setIsYeastModalOpen(false);
    const closeUpdateFermentableModal = () => setIsUpdateFermentableModalOpen(false);
    const closeUpdateHopModal = () => setIsUpdateHopModalOpen(false);
    const closeUpdateMiscModal = () => setIsUpdateMiscModalOpen(false);
    const closeUpdateYeastModal = () => setIsUpdateYeastModalOpen(false);

    const [selectedFermentable, setSelectedFermentable] = useState(null);
    const [selectedHop, setSelectedHop] = useState(null);
    const [selectedMisc, setSelectedMisc] = useState(null);
    const [selectedYeast, setSelectedYeast] = useState(null);

    /* Lists */
    const [fermentableList, setFermentableList] = useState([]);
    const [hopList, setHopList] = useState([]);
    const [miscList, setMiscList] = useState([]);
    const [yeastList, setYeastList] = useState([]);

    const [equipment, setEquipment] = useState(0);

    /* Dinamic Variables */
    const [OG, setOG] = useState("");
    const [FG, setFG] = useState("");
    const [EBC, setEBC] = useState(0);
    const [IBU, setIBU] = useState(0);
    const [ABV, setABV] = useState(0);
    const [openAI, setOpenAI] = useState("")

    /* Components */
    const [selectedStyle, setSelectedStyle] = useState('');
    const [EBCColor, setEBCColor] = useState("");

    /* Barra */

    
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
        recipeMisc: [],
        recipeYeasts: [],
        recipeEquipment: {},
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
        if (EBC) {
            const color = getBeerColor(EBC);
            setEBCColor(color);
            console.log("assign " + EBCColor);
        }
    }, [EBC]);

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

            const IBUresult = calculateIBU(recipe, OGResult, setRecipe);
            setIBU(IBUresult);

            setSelectedStyle(recipe.style);
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

            console.log("ABV Inicio");

            const abvValue = ((OG - FG) * 131.25).toFixed(2);
            setABV(abvValue > 0 ? abvValue : 0);

            console.log("ABV Fim " + abvValue);
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

    useEffect(() => {
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            style: selectedStyle
        }));
    }, [selectedStyle, setRecipe]); // Esse useEffect será acionado toda vez que selectedStyle mudar


    const fetchRecipe = async (recipeID) => {
        const recipeResponse = await fetchRecipeById(recipeID, user.token);
        setRecipe({...recipeResponse});
    };

    const fetchOpenAIResponse = async () => {
        const openAIResponse = await getOpenAIResponse(recipe, user.token);
        setOpenAI(openAIResponse);
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

    const openMiscModal = async () => {
        const misc = await fetchMisc(api, user.token);
        setMiscList(misc);
        setIsMiscModalOpen(true);
    };

    const openYeastModal = async () => {
        const yeasts = await fetchYeasts(api, user.token);
        setYeastList(yeasts);
        setIsYeastModalOpen(true);
    };

    const handleUpdateFermentable = (fermentable) => {
        setSelectedFermentable(fermentable);
        setIsUpdateFermentableModalOpen(true);
    };

    const handleUpdateHop = (hop) => {
        setSelectedHop(hop);
        setIsUpdateHopModalOpen(true);
    };

    const handleUpdateMisc = (misc) => {
        setSelectedMisc(misc);
        setIsUpdateMiscModalOpen(true);
    };

    const handleUpdateYeast = (yeast) => {
        setSelectedYeast(yeast);
        setIsUpdateYeastModalOpen(true);
    };

    const handleAddFermentableRecipe = (selectedFermentable, quantity) => {
        if (selectedFermentable && quantity) {
            const selectedFermentableDetails = fermentableList.find((fermentable) => fermentable.id === selectedFermentable);

            if (selectedFermentableDetails) {
                const fermentableWithQuantity = {
                    ...selectedFermentableDetails,
                    quantity: parseFloat(quantity),
                };

                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeFermentables: [
                        ...(Array.isArray(prevRecipe.recipeFermentables) ? prevRecipe.recipeFermentables : []), // Garante que seja um array
                        {
                            ...selectedFermentableDetails,
                            id: generateId(),
                            quantity: parseFloat(quantity),
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

    const handleAddHopRecipe = (selectedHop, quantity, boilTime) => {
        if (selectedHop && quantity && boilTime) {
            const selectedHopDetails = hopList.find((hop) => hop.id === selectedHop);

            if (selectedHopDetails) {
                const hopWithQuantity = {
                    ...selectedHopDetails,
                    quantity: parseFloat(quantity),
                    boilTime: boilTime,
                };

                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeHops: [
                        ...(Array.isArray(prevRecipe.recipeHops) ? prevRecipe.recipeHops : []), // Garante que seja um array
                        {
                            ...selectedHopDetails,
                            id: generateId(),
                            quantity: parseFloat(quantity),
                            boilTime: boilTime
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

    const handleAddMiscRecipe = (selectedMisc, quantity) => {
        if (selectedMisc && quantity) {
            const selectedMiscDetails = miscList.find((misc) => misc.id === selectedMisc);

            if (selectedMiscDetails) {
                const miscWithQuantity = {
                    ...selectedMiscDetails,
                    quantity: parseFloat(quantity),
                };

                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeMisc: [
                        ...(Array.isArray(prevRecipe.recipeMisc) ? prevRecipe.recipeMisc : []), // Garante que seja um array
                        {
                            ...selectedMiscDetails,
                            id: generateId(),
                            quantity: parseFloat(quantity),
                        },
                    ],
                }));

                closeMiscModal();
            } else {
                alert('Selected misc not found.');
            }
        } else {
            alert('Please select a misc and enter a quantity.');
        }
    };

    const handleAddYeastRecipe = (selectedYeast, quantity) => {
        if (selectedYeast && quantity) {
            const selectedYeastDetails = yeastList.find((yeast) => yeast.id === selectedYeast);

            if (selectedYeastDetails) {
                const yeastWithQuantity = {
                    ...selectedYeastDetails,
                    quantity: parseFloat(quantity),
                };
                setRecipe((prevRecipe) => ({
                    ...prevRecipe,
                    recipeYeasts: [
                        ...(Array.isArray(prevRecipe.recipeYeasts) ? prevRecipe.recipeYeasts : []), // Garante que seja um array
                        {
                            ...selectedYeastDetails,
                            id: generateId(),
                            quantity: parseFloat(quantity),
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

    const handleUpdateHopRecipe = (updatedHop) => {

        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeHops: prevRecipe.recipeHops.map((hop) =>
                hop.id === updatedHop.id ? updatedHop : hop
            ),
        }));
    };

    const handleUpdateMiscRecipe = (updatedMisc) => {

        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeMisc: prevRecipe.recipeMisc.map((misc) =>
                misc.id === updatedMisc.id ? updatedMisc : misc
            ),
        }));
    };

    const handleUpdateYeastRecipe = (updatedYeast) => {

        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeYeasts: prevRecipe.recipeYeasts.map((yeast) =>
                yeast.id === updatedYeast.id ? updatedYeast : yeast
            ),
        }));
    };

    const handleDeleteFermentable = (fermentableId) => {
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
    };

    const handleDeleteHop = (hopID) => {
        const updatedHops = recipe.recipeHops.filter(
            (hop) => hop.id !== hopID
        );
    
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeHops: updatedHops,
        }));
    };

    const handleDeleteMisc = (miscID) => {
        const updatedMisc = recipe.recipeMisc.filter(
            (misc) => misc.id !== miscID
        );
    
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeMisc: updatedMisc,
        }));
    };

    const handleDeleteYeast = (yeastID) => {
        const updatedYeasts = recipe.recipeYeasts.filter(
            (yeast) => yeast.id !== yeastID
        );
    
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeYeasts: updatedYeasts,
        }));
    };

    const handleRecipeChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEquipmentChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prevState) => ({
            ...prevState,
            recipeEquipment: {
                ...prevState.recipeEquipment,
                [name]: value
            }
        }));
    };    

    async function handleSubmit(e) {
        e.preventDefault();

        console.log(recipe.recipeMisc);


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
            recipeMisc: recipe.recipeMisc,
            recipeYeasts: recipe.recipeYeasts,
            recipeEquipment: recipe.recipeEquipment,
        };

        try {
            if (isEditing) {
                console.log("update: ", JSON.stringify(data, null, 2));
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

                <div className="top">
                    <form onSubmit={handleSubmit}>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Recipe Name</label>
                                <input
                                    name="name"
                                    value={recipe.name}
                                    onChange={handleRecipeChange}
                                    disabled={isView}
                                    style={{ width: '610px' }}/>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Style</label>
                                <select
                                    id="beer-style"
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                    style={{ width: '300px' }}
                                >
                                    <option value="">Select a style</option>
                                    {beerStyles.map((style, index) => (
                                        <option key={index} value={style.name}>
                                            {style.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Creation Date</label>
                                <input
                                    name="creation date"
                                    value={recipe.creationDate}
                                    onChange={handleRecipeChange}
                                    disabled={isView}
                                    style={{ width: '120px' }}/>
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Description</label>
                                <textarea
                                    name="description"
                                    rows={1}
                                    value={recipe.description}
                                    onChange={handleRecipeChange}
                                    disabled={isView}
                                    style={{ width: '1070px', height: '50px' }}/>
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Equipment</label>
                                <input
                                    name="equipment"
                                    value={recipe.equipment}
                                    onChange={handleRecipeChange}
                                    disabled={isView}
                                    style={{ width: '250px' }}/>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Batch Volume</label>
                                <input
                                    name="BatchVolume"
                                    type="number"
                                    value={recipe.recipeEquipment.batchVolume}
                                    onChange={handleEquipmentChange}
                                    disabled={isView}
                                    style={{ width: '100px' }}/>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Batch Time</label>
                                <input
                                    name="batchTime"
                                    type="number"
                                    value={recipe.recipeEquipment.batchTime}
                                    onChange={handleEquipmentChange}
                                    disabled={isView}
                                    style={{ width: '100px' }}/>
                            </div>

                            <div className="input-field">
                                <label htmlFor="name">Brewhouse Efficiency</label>
                                <input
                                    name="efficiency"
                                    type="number"
                                    value={recipe.recipeEquipment.efficiency}
                                    onChange={handleEquipmentChange}
                                    disabled={isView}
                                    style={{ width: '100px' }}/>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Mash Efficiency</label>
                                <input
                                    name="efficiency"
                                    type="number"
                                    value={recipe.recipeEquipment.efficiency}
                                    onChange={handleEquipmentChange}
                                    disabled={isView}
                                    style={{ width: '100px' }}/>
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Pre Boil Volume</label>
                                <input
                                    name="preBoilVolume"
                                    type="number"
                                    value={recipe.batchTime}
                                    onChange={handleEquipmentChange}
                                    disabled={isView}
                                    style={{ width: '100px' }}/>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Boil Time</label>
                                <input
                                    name="boilTime"
                                    type="number"
                                    value={recipe.recipeEquipment.boilTime}
                                    onChange={handleEquipmentChange}
                                    disabled={isView}
                                    style={{ width: '100px' }}/>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="buttons-container">
                    <button onClick={openFermentableModal} className="modalAddButtonFermentable">Add Fermentable</button>
                    <button onClick={openHopModal} className="modalAddButtonHop">Add Hop</button>
                    <button onClick={openMiscModal} className="modalAddButtonMisc">Add Misc</button>
                    <button onClick={openYeastModal} className="modalAddButtonYeast">Add Yeast</button>
                    <button onClick={fetchOpenAIResponse} className="modalAddButtonFermentable">Mystical Brew Wisdom</button>
                </div>
                <div className="bottom-container">
                    <div className="bottom-left">
                        <ul>
                            {recipe.recipeFermentables?.map((fermentable) => (
                                <li key={fermentable.id}>
                                    <div className="quantity-div">
                                        <object className="malt-object" type="image/svg+xml" data="/malt.svg"></object> {fermentable.quantity/1000}kg
                                    </div>
                                    <div>
                                        <strong>{fermentable.name}</strong>
                                    </div>
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
                            {recipe.recipeHops?.map((hop) => (
                                <li key={hop.id}>
                                    <div className="quantity-div">
                                        <object className="hop-object" type="image/svg+xml" data="/hop.svg"></object> {hop.quantity}g
                                    </div>
                                    <div>
                                        <strong>{hop.name}</strong> (IBU: {hop.ibu})
                                    </div>
                                    <div className="ingredients-list-button-group">
                                        <button onClick={() => handleUpdateHop(hop)} type="button">
                                          <FiEdit size={20} color="#a8a8b3" />
                                        </button>
                                        <button onClick={() => handleDeleteHop(hop.id)} type="button">
                                          <FiTrash2 size={20} color="#a8a8b3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {recipe.recipeMisc?.map((misc) => (
                                <li key={misc.id}>
                                    <div className="quantity-div">
                                        <object className="misc-object" type="image/svg+xml" data="/misc.svg"></object> {misc.quantity}g
                                    </div>
                                    <div>
                                    <strong>{misc.name}</strong>
                                    </div>
                                    <div className="ingredients-list-button-group">
                                        <button onClick={() => handleUpdateMisc(misc)} type="button">
                                          <FiEdit size={20} color="#a8a8b3" />
                                        </button>
                                        <button onClick={() => handleDeleteMisc(misc.id)} type="button">
                                          <FiTrash2 size={20} color="#a8a8b3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {recipe.recipeYeasts?.map((yeast) => (
                                <li key={yeast.id}>
                                    <div className="quantity-div">
                                        <object className="yeast-object" type="image/svg+xml" data="/yeast.svg"></object> {yeast.quantity}g
                                    </div>
                                    <div>
                                        <strong>{yeast.name}</strong>
                                    </div>
                                    <div className="ingredients-list-button-group">
                                        <button onClick={() => handleUpdateYeast(yeast)} type="button">
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
                        <div className="bar-container">
                            <strong>OG:</strong> {OG} 
                            <OGBar valorInicial={1.000} valorFinal={1.100} margemInicial={1.040} margemFinal={1.060} OGAtual={OG} />
                        </div>
                        <div className="bar-container">
                            <strong>EBC:</strong> {EBC}
                            <OGBar valorInicial={0} valorFinal={60} margemInicial={3} margemFinal={12} OGAtual={EBC} />
                        </div>
                        <div className="bar-container">
                            <strong>IBU:</strong> {IBU}
                            <OGBar valorInicial={0} valorFinal={80} margemInicial={10} margemFinal={20} OGAtual={IBU} />
                        </div>
                        <div className="bar-container">
                            <strong>ABV:</strong> {ABV}
                            <OGBar valorInicial={0} valorFinal={20} margemInicial={3} margemFinal={6} OGAtual={ABV} />
                        </div>
                        <div>
                            <strong>FG:</strong> {FG}
                        </div>
                    </div>

                    <div className="bottom-right-beer">
                        <object className="beer-object" type="image/svg+xml" data="/beer.svg"></object>
                    </div>
                </div>
                <div className="top">
                    <textarea
                        name="IA"
                        placeholder="Mystical Wisdom"
                        value={openAI}
                        disabled={true}
                        style={{ width: '1070px' }}/>
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
            <AddMiscModal
                isOpen={isMiscModalOpen}
                closeModal={closeMiscModal}
                miscList={miscList}
                handleAddMiscRecipe={handleAddMiscRecipe}
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
            <UpdateHopModal
                isOpen={isUpdateHopModalOpen}
                closeModal={closeUpdateHopModal}
                selectedHop={selectedHop}
                handleUpdateHopRecipe={handleUpdateHopRecipe}
            />
            <UpdateMiscModal
                isOpen={isUpdateMiscModalOpen}
                closeModal={closeUpdateMiscModal}
                selectedMisc={selectedMisc}
                handleUpdateMiscRecipe={handleUpdateMiscRecipe}
            />
            <UpdateYeastModal
                isOpen={isUpdateYeastModalOpen}
                closeModal={closeUpdateYeastModal}
                selectedYeast={selectedYeast}
                handleUpdateYeastRecipe={handleUpdateYeastRecipe}
            />
        </div>
    );
}