import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

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
    const generateId = () => `fermentable-${Date.now()}`;

    const [isEditing, setIsEditing] = useState(false);
    const [isView, setIsView] = useState(false);
    const [isFermentableModalOpen, setIsFermentableModalOpen] = useState(false);
    const [isHopModalOpen, setIsHopModalOpen] = useState(false);
    const [isYeastModalOpen, setIsYeastModalOpen] = useState(false);

    const [fermentableList, setFermentableList] = useState([]);
    const [hopList, setHopList] = useState([]);
    const [yeastList, setYeastList] = useState([]);

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
            setFG(1.010.toFixed(3)); // Define FG
            calculateOG(); // Calcula OG
            calculateEBC(); // Calcula EBC
            calculateIBU(); // Calcula IBU
        }
    }, [recipe]);
    
    useEffect(() => {
        if (EBC) {
            const color = beerColor(EBC); // Atualiza a cor com base no novo EBC
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

    const calculateOG = () => {
        let totalGravityPoints = 0;
    
        const volumeLiters = 23;
        const efficiency = 0.75;
        const volumeGallons = volumeLiters / 3.78541;
    
        if (!recipe.recipeFermentables || recipe.recipeFermentables.length === 0) {
            console.error("recipe.recipeFermentables está vazio ou indefinido");
            setOG(1.000.toFixed(3))
            setABV(0)
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

    const calculateEBC = () => {

        const volumeLiters = 23;

        if (!volumeLiters || volumeLiters <= 0) {
            throw new Error("Volume deve ser maior que 0.");
        }

        let totalEBC = 0;

        recipe.recipeFermentables.forEach((fermentable) => {
            const weightKg = fermentable.weightGrams / 1000;
            const ebc = fermentable.ebc || 0;

            totalEBC += weightKg * ebc;
        });
    
        const EBCValue = (totalEBC / volumeLiters) * 4.23;

        setEBC(EBCValue.toFixed(1));
    };

    const beerColor = () => {

        console.log("EBC beerColor: " + EBC);   

        if (EBC >= 0 && EBC <= 2) {
            setEBCColor("#FFE699"); // Muito clara, quase transparente
        } else if (EBC <= 4) {
            setEBCColor("#FFE37A"); // Amarelo palha claro
        } else if (EBC <= 6) {
            setEBCColor("#FFD878"); // Amarelo dourado
        } else if (EBC <= 8) {
            setEBCColor("#FFCA5A"); // Dourado claro
        } else if (EBC <= 10) {
            setEBCColor("#FFBF42"); // Dourado padrão
        } else if (EBC <= 12) {
            setEBCColor("#FFB742"); // Dourado intenso
        } else if (EBC <= 14) {
            setEBCColor("#FFA846"); // Laranja claro
        } else if (EBC <= 17) {
            setEBCColor("#F49C44"); // Laranja médio
        } else if (EBC <= 20) {
            setEBCColor("#E98F36"); // Âmbar claro
        } else if (EBC <= 23) {
            setEBCColor("#D77A32"); // Âmbar médio
        } else if (EBC <= 26) {
            setEBCColor("#BF5B23"); // Âmbar escuro
        } else if (EBC <= 29) {
            setEBCColor("#A64F1E"); // Marrom claro
        } else if (EBC <= 32) {
            setEBCColor("#8E3C1A"); // Marrom médio
        } else if (EBC <= 35) {
            setEBCColor("#6F2F1A"); // Marrom avermelhado
        } else if (EBC <= 40) {
            setEBCColor("#5D2614"); // Marrom escuro
        } else if (EBC <= 45) {
            setEBCColor("#4E1F0D"); // Marrom intenso
        } else if (EBC <= 50) {
            setEBCColor("#3B1E0E"); // Preto com reflexos marrons
        } else if (EBC <= 55) {
            setEBCColor("#2E160B"); // Preto com bordas marrons
        } else if (EBC <= 60) {
            setEBCColor("#26150C"); // Preto opaco com reflexos suaves
        } else if (EBC <= 70) {
            setEBCColor("#1C1009"); // Preto profundo com bordas marrons
        } else if (EBC <= 80) {
            setEBCColor("#16100C"); // Preto intenso e opaco
        } else if (EBC <= 90) {
            setEBCColor("#0F0D08"); // Preto muito profundo
        } else if (EBC <= 100) {
            setEBCColor("#080707"); // Preto absoluto
        } else {
            setEBCColor("#000000"); // Preto total, sem reflexos
        }

        console.log("EBCColor: " + EBCColor); 
    };

    const calculateIBU = () => {
        const volumeLiters = 23;
        
        if (!recipe || !recipe.recipeHops || recipe.recipeHops.length === 0 || volumeLiters <= 0 || OG <= 0) {
            console.error("Parâmetros inválidos para o cálculo do IBU.");
        }
      
        let totalIBU = 0;

        recipe.recipeHops.forEach((hop) => {
          const { amount, alphaAcidContent, boilTime } = hop;
      
          if (!amount || !alphaAcidContent) {
            console.error("Informações de lúpulo inválidas.");
          }
      
          const utilization = (1.65 * Math.pow(0.000125, OG - 1)) *
                              ((1 - Math.exp(-0.04 * boilTime)) / 4.15);

          const ibu = ((utilization * (alphaAcidContent / 100) * amount * 1000) / volumeLiters);
      
          totalIBU += ibu;
        });
        
        setIBU(totalIBU.toFixed(2));
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
                        FG: <span>{FG}</span>
                        <p></p>
                        EBC: <span>{EBC}</span>
                        <p></p>
                        IBU: <span>{IBU}</span>
                        <p></p>
                        ABV: <span>{ABV}</span>
                    </div>
                    <div className="image-container" style={{ display: 'inline-block' }}>
                        <object className="beer-object" type="image/svg+xml" data="/beer.svg"></object>
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
