import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTrash2, FiEdit, FiRepeat } from 'react-icons/fi';
import Swal from 'sweetalert2';

import { showSuccessToast, showErrorToast } from '../../utils/notifications';

import api from '../../services/api';
import { fetchFermentables } from '../../services/fermentables';
import { fetchHops } from '../../services/hops';
import { fetchMisc } from '../../services/misc';
import { fetchYeasts } from '../../services/yeasts';
import { fetchRecipeById } from '../../services/recipes';

import getOpenAIResponse from '../../services/openAI';

import AuthContext from '../../context/AuthContext';

import Sidebar from '../../Components/Sidebar';

import {
  AddFermentableModal, AddHopModal, AddMiscModal, AddYeastModal,
  ChangeEquipmentModal,
  UpdateFermentableModal, UpdateHopModal, UpdateMiscModal, UpdateYeastModal,
} from './FormModals';

import {
  calculateOG, calculateFG, calculateIBU, calculateEBC, getPreBoilVolume, getIngredientsPorcentage,
} from '../../Components/Recipe/calculation';

import getBeerColor from '../../Components/Recipe/getBeerColor';
import beerStyles from '../../Components/Recipe/getBeerStyles';
import OGBar from '../../Components/Recipe/Indicators';

import './Form.css';

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
  const [isChangeEquipmentModalOpen, setIsChangeEquipmentModalOpen] = useState(false);
  const [isUpdateFermentableModalOpen, setIsUpdateFermentableModalOpen] = useState(false);
  const [isUpdateHopModalOpen, setIsUpdateHopModalOpen] = useState(false);
  const [isUpdateMiscModalOpen, setIsUpdateMiscModalOpen] = useState(false);
  const [isUpdateYeastModalOpen, setIsUpdateYeastModalOpen] = useState(false);

  const closeFermentableModal = () => setIsFermentableModalOpen(false);
  const closeHopModal = () => setIsHopModalOpen(false);
  const closeMiscModal = () => setIsMiscModalOpen(false);
  const closeYeastModal = () => setIsYeastModalOpen(false);
  const closeChangeEquipmentModal = () => setIsChangeEquipmentModalOpen(false);
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

  /* Dinamic Variables */
  const [OG, setOG] = useState('');
  const [FG, setFG] = useState('');
  const [EBC, setEBC] = useState(0);
  const [IBU, setIBU] = useState(0);
  const [ABV, setABV] = useState(0);
  const [BUGU, setBUGU] = useState(0);
  const [openAI, setOpenAI] = useState('');
  const [preBoilVolume, setpreBoilVolume] = useState(0);

  /* Components */
  const [selectedStyle, setSelectedStyle] = useState('');
  const [EBCColor, setEBCColor] = useState('');

  const [recipe, setRecipe] = useState({
    name: '',
    author: '',
    type: '',
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
    } else if (id) {
      setIsView(window.location.pathname.includes('/details'));
      setIsEditing(!window.location.pathname.includes('/details'));
      fetchRecipe(id);
    }
  }, [id, user]);

  useEffect(() => {
    if (EBC) {
      const color = getBeerColor(EBC);
      setEBCColor(color);
    }
  }, [EBC]);

  useEffect(() => {
    if (recipe) {
      // getIngredientsPorcentage
      getIngredientsPorcentage(recipe, setRecipe);

      // getPreBoilVolume
      const preBoilCalc = getPreBoilVolume(recipe);

      if (preBoilCalc > 0) {
        setpreBoilVolume(preBoilCalc);
      }

      // calculateOG
      const OGResult = calculateOG(recipe);
      setOG(OGResult);

      // calculateFG
      const FGResult = calculateFG(recipe, OGResult);

      setFG(FGResult);

      if (recipe.recipeFermentables.length === 0) {
        setABV(0);
      }

      // calculateEBC
      const EBCResult = calculateEBC(recipe);

      setEBC(EBCResult);

      // calculateIBU
      const IBUresult = calculateIBU(recipe, OGResult);

      if (IBUresult && IBUresult.totalIBU) {
        setIBU(parseFloat(IBUresult.totalIBU));

        if (IBUresult.hasChanges) {
          setRecipe((prev) => ({
            ...prev,
            recipeHops: IBUresult.updatedHops,
          }));
        }
      } else {
        setIBU(0);
      }

      // calculateGU
      const GU = (OGResult - 1) * 1000;

      if (IBU) {
        setBUGU((IBU / GU).toFixed(2));
      }

      if (recipe.style) {
        const loadStyle = beerStyles.find((style) => style.name === recipe.style);

        if (loadStyle) {
          setSelectedStyle(loadStyle);
        }
      } else {
        setSelectedStyle((prev) => ({
          ...prev,
          initialOG: 1,
          finalOG: 1,
          initialFG: 1,
          finalFG: 1,
          initialABV: 0,
          finalABV: 0,
          initialEBC: 0,
          finalEBC: 0,
          initialIBU: 0,
          finalIBU: 0,
          initialBuGu: 0,
          finalBuGu: 0,
        }));
      }
    }
  }, [recipe]);

  useEffect(() => {
    if (EBC) {
      const color = getBeerColor(EBC);
      setEBCColor(color);
    }
  }, [EBC]);

  useEffect(() => {
    if (OG && FG) {
      const abvValue = ((OG - FG) * 131.25).toFixed(2);
      setABV(abvValue > 0 ? abvValue : 0);
    }
  }, [OG, FG]);

  useEffect(() => {
    const svgObject = document.querySelector('.beer-object');

    if (svgObject && svgObject.contentDocument) {
      const svgDoc = svgObject.contentDocument;
      const gradients = svgDoc.querySelectorAll('linearGradient, radialGradient');

      gradients.forEach((gradient) => {
        const stops = gradient.querySelectorAll('stop');

        stops.forEach((stop) => {
          stop.setAttribute('stop-color', EBCColor);
        });
      });
    }
  }, [EBCColor]);

  useEffect(() => {
    setRecipe((prevRecipe) => {
      if (prevRecipe.style !== selectedStyle.name) {
        return { ...prevRecipe, style: selectedStyle.name };
      }
      return prevRecipe;
    });
  }, [selectedStyle]);

  const fetchRecipe = async (recipeID) => {
    const recipeResponse = await fetchRecipeById(recipeID, user.token);
    setRecipe({ ...recipeResponse });
  };

  const fetchOpenAIResponse = async () => {
    const openAIResponse = await getOpenAIResponse(recipe, user.token);
    setOpenAI(openAIResponse);
  };

  const openFermentableModal = async () => {
    const fermentables = await fetchFermentables(user.token);
    setFermentableList(fermentables);
    setIsFermentableModalOpen(true);
  };

  const openHopModal = async () => {
    const hops = await fetchHops(user.token);
    setHopList(hops);
    setIsHopModalOpen(true);
  };

  const openMiscModal = async () => {
    const misc = await fetchMisc(user.token);
    setMiscList(misc);
    setIsMiscModalOpen(true);
  };

  const openYeastModal = async () => {
    const yeasts = await fetchYeasts(user.token);
    setYeastList(yeasts);
    setIsYeastModalOpen(true);
  };

  const openChangeEquipmentModal = async () => {
    setIsChangeEquipmentModalOpen(true);
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

  const handleAddFermentableRecipe = (selectedModalFermentable, quantity) => {
    if (selectedModalFermentable && quantity) {
      const selectedFermentableDetails = fermentableList.find(
        (fermentable) => fermentable.id === selectedModalFermentable,
      );

      if (selectedFermentableDetails) {
        setRecipe((prevRecipe) => ({
          ...prevRecipe,
          recipeFermentables: [
            ...(
              Array.isArray(prevRecipe.recipeFermentables)
                ? prevRecipe.recipeFermentables
                : []
            ), // Ensure it is an array
            {
              ...selectedFermentableDetails,
              id: generateId(),
              quantity: parseFloat(quantity),
            },
          ],
        }));
        closeFermentableModal();
      } else {
        showErrorToast('Selected fermentable not found.');
      }
    } else {
      showErrorToast('Please select a fermentable and enter a quantity.');
    }
  };

  const handleAddHopRecipe = (hopId, quantity, boilTime) => {
    if (hopId && quantity && boilTime) {
      const selectedHopDetails = hopList.find((hop) => hop.id === hopId);

      if (selectedHopDetails) {
        setRecipe((prevRecipe) => ({
          ...prevRecipe,
          recipeHops: [
            ...(
              Array.isArray(prevRecipe.recipeHops)
                ? prevRecipe.recipeHops
                : []
            ),
            {
              ...selectedHopDetails,
              id: generateId(),
              quantity: parseFloat(quantity),
              boilTime,
            },
          ],
        }));

        closeHopModal();
      } else {
        showErrorToast('Selected hop not found.');
      }
    } else {
      showErrorToast('Please select a hop and enter a quantity.');
    }
  };

  const handleAddMiscRecipe = (miscId, quantity) => {
    if (miscId && quantity) {
      const selectedMiscDetails = miscList.find((misc) => misc.id === miscId);

      if (selectedMiscDetails) {
        setRecipe((prevRecipe) => ({
          ...prevRecipe,
          recipeMisc: [
            ...(Array.isArray(prevRecipe.recipeMisc) ? prevRecipe.recipeMisc : []),
            {
              ...selectedMiscDetails,
              id: generateId(),
              quantity: parseFloat(quantity),
            },
          ],
        }));

        closeMiscModal();
      } else {
        showErrorToast('Selected misc not found.');
      }
    } else {
      showErrorToast('Please select a misc and enter a quantity.');
    }
  };

  const handleAddYeastRecipe = (yeastId, quantity) => {
    if (yeastId && quantity) {
      const selectedYeastDetails = yeastList.find((yeast) => yeast.id === yeastId);

      if (selectedYeastDetails) {
        setRecipe((prevRecipe) => ({
          ...prevRecipe,
          recipeYeasts: [
            ...(Array.isArray(prevRecipe.recipeYeasts) ? prevRecipe.recipeYeasts : []),
            {
              ...selectedYeastDetails,
              id: generateId(),
              quantity: parseFloat(quantity),
            },
          ],
        }));

        closeYeastModal();
      } else {
        showErrorToast('Selected yeast not found.');
      }
    } else {
      showErrorToast('Please select a yeast and enter a quantity.');
    }
  };

  const handleChangeEquipmentRecipe = async (selectedItem) => {
    if (selectedItem) {
      if (recipe.recipeEquipment?.name !== undefined) {
        const result = await Swal.fire({
          title: 'Tem certeza?',
          text: 'Deseja mesmo trocar o equipamento? A troca irá atualizar a receita.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim',
          cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
          setRecipe((prevRecipe) => ({
            ...prevRecipe,
            recipeEquipment: {
              ...selectedItem,
            },
          }));
          closeChangeEquipmentModal();
        }
      } else {
        setRecipe((prevRecipe) => ({
          ...prevRecipe,
          recipeEquipment: {
            ...selectedItem,
          },
        }));
        closeChangeEquipmentModal();
      }
    } else {
      showErrorToast('Please select an equipment.');
    }
  };

  const handleUpdateFermentableRecipe = (updatedFermentable) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeFermentables: prevRecipe.recipeFermentables.map(
        (fermentable) => (
          fermentable.id === updatedFermentable.id
            ? updatedFermentable
            : fermentable
        ),
      ),
    }));
  };

  const handleUpdateHopRecipe = (updatedHop) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeHops: prevRecipe.recipeHops.map((hop) => (hop.id === updatedHop.id ? updatedHop : hop)),
    }));
  };

  const handleUpdateMiscRecipe = (updatedMisc) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeMisc: prevRecipe.recipeMisc.map(
        (misc) => (
          misc.id === updatedMisc.id
            ? updatedMisc
            : misc
        ),
      ),
    }));
  };

  const handleUpdateYeastRecipe = (updatedYeast) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeYeasts: prevRecipe.recipeYeasts.map(
        (yeast) => (
          yeast.id === updatedYeast.id
            ? updatedYeast
            : yeast
        ),
      ),
    }));
  };

  const handleDeleteFermentable = (fermentableId) => {
    setRecipe((prevRecipe) => {
      if (!prevRecipe || !prevRecipe.recipeFermentables) {
        return prevRecipe || {};
      }

      // Updates the state with the filtered fermentables
      const updatedRecipe = {
        ...prevRecipe,
        recipeFermentables: prevRecipe.recipeFermentables.filter(
          (fermentable) => fermentable.id !== fermentableId,
        ),
      };
      return updatedRecipe;
    });
  };

  const handleDeleteHop = (hopID) => {
    const updatedHops = recipe.recipeHops.filter(
      (hop) => hop.id !== hopID,
    );

    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeHops: updatedHops,
    }));
  };

  const handleDeleteMisc = (miscID) => {
    const updatedMisc = recipe.recipeMisc.filter(
      (misc) => misc.id !== miscID,
    );

    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeMisc: updatedMisc,
    }));
  };

  const handleDeleteYeast = (yeastID) => {
    const updatedYeasts = recipe.recipeYeasts.filter(
      (yeast) => yeast.id !== yeastID,
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
      [name]: value,
    }));
  };

  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prevState) => ({
      ...prevState,
      recipeEquipment: {
        ...prevState.recipeEquipment,
        [name]: Number(value),
      },
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!recipe.name) {
      showErrorToast('Recipe name is required.');
    }

    if (!recipe.style) {
      showErrorToast('Beer Style is required.');
    }

    if (!recipe.recipeEquipment) {
      showErrorToast('Equipment is required.');
    }

    if (!recipe.recipeEquipment.boilTime) {
      showErrorToast('Boil Time is required.');
    }

    const data = {
      name: recipe.name,
      style: recipe.style,
      author: recipe.author,
      type: recipe.type,
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
      showSuccessToast('Recipe saved successfully.');
    } catch (err) {
      showErrorToast('Error saving recipe. Please, try again.');
    }
  }

  return (
    <div>
      <Sidebar />
      <div className="recipe-container">
        <div className="content">
          <div className="top">
            <form onSubmit={handleSubmit}>
              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="name">
                    Recipe Name
                    <input
                      name="name"
                      value={recipe.name}
                      onChange={handleRecipeChange}
                      disabled={isView}
                      style={{ width: '380px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Author
                    <input
                      name="author"
                      value={recipe.author}
                      onChange={handleRecipeChange}
                      disabled={isView}
                      style={{ width: '220px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Style
                    <select
                      id="beer-style"
                      value={selectedStyle.name || ''}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const matchedStyle = beerStyles.find((s) => s.name === selectedName);
                        if (matchedStyle) {
                          setSelectedStyle(matchedStyle);
                        } else {
                          setSelectedStyle({ name: '' }); // fallback
                        }
                      }}
                      style={{ width: '200px' }}
                    >
                      <option value="">Select a style</option>
                      {beerStyles.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Type
                    <select
                      id="beer-type"
                      value={recipe.type || ''}
                      onChange={(e) => {
                        setRecipe({
                          ...recipe,
                          type: e.target.value,
                        });
                      }}
                      style={{ width: '100px' }}
                    >
                      <option value="All Grain">All Grain</option>
                      <option value="Extract">Extract</option>
                      <option value="Partial Mash">Partial Mash</option>
                    </select>
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Creation Date
                    <input
                      name="creation date"
                      value={recipe.creationDate}
                      onChange={handleRecipeChange}
                      disabled={isView}
                      style={{ width: '100px' }}
                    />
                  </label>
                </div>
              </div>
              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="name">
                    Description
                    <textarea
                      className="description-textarea"
                      name="description"
                      value={recipe.description}
                      onChange={handleRecipeChange}
                      disabled={isView}
                    />
                  </label>
                </div>
              </div>
              <div className="inputs-row">
                <div className="input-field no-flex">
                  <button type="button" onClick={openChangeEquipmentModal} className="transparent-button">
                    <FiRepeat size={20} />
                  </button>
                </div>

                <div className="input-field">
                  <label htmlFor="name">
                    Equipment
                    <input
                      name="equipment"
                      value={recipe.recipeEquipment.name}
                      onChange={handleRecipeChange}
                      disabled={isView}
                      style={{ width: '240px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Batch Volume
                    <input
                      name="batchVolume"
                      type="number"
                      value={recipe.recipeEquipment.batchVolume}
                      onChange={handleEquipmentChange}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Batch Time
                    <input
                      name="batchTime"
                      type="number"
                      value={recipe.recipeEquipment.batchTime}
                      onChange={handleEquipmentChange}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>

                <div className="input-field">
                  <label htmlFor="name">
                    Brew. Efficiency
                    <input
                      name="efficiency"
                      type="number"
                      value={recipe.recipeEquipment.efficiency}
                      onChange={handleEquipmentChange}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Mash Efficiency
                    <input
                      name="efficiency"
                      type="number"
                      value={recipe.recipeEquipment.efficiency}
                      onChange={handleEquipmentChange}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Pre Boil Volume
                    <input
                      name="preBoilVolume"
                      type="number"
                      value={preBoilVolume}
                      onChange={handleEquipmentChange}
                      disabled
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="name">
                    Boil Time
                    <input
                      name="boilTime"
                      type="number"
                      value={recipe.recipeEquipment.boilTime}
                      onChange={handleEquipmentChange}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div className="buttons-container">
            <button
              type="button"
              onClick={openFermentableModal}
              className="modalAddButtonFermentable"
            >
              Add Fermentable
            </button>
            <button
              type="button"
              onClick={openHopModal}
              className="modalAddButtonHop"
            >
              Add Hop
            </button>
            <button
              type="button"
              onClick={openMiscModal}
              className="modalAddButtonMisc"
            >
              Add Misc
            </button>
            <button
              type="button"
              onClick={openYeastModal}
              className="modalAddButtonYeast"
            >
              Add Yeast
            </button>
          </div>
          <div className="bottom-container">
            <div className="bottom-left">
              <table>
                <tbody>
                  {recipe.recipeFermentables?.map((fermentable) => (
                    <tr key={fermentable.id}>
                      <td>
                        <object
                          className="malt-object"
                          type="image/svg+xml"
                          data="/malt.svg"
                          aria-label="Malt icon"
                        />
                        {fermentable.quantity / 1000}
                        {' '}
                        kg
                      </td>
                      <td><strong>{fermentable.name}</strong></td>
                      <td>{fermentable.type}</td>
                      <td>
                        {fermentable.percentage}
                        %
                      </td>
                      <td className="ingredients-list-button-group">
                        <button onClick={() => handleUpdateFermentable(fermentable)} type="button" className="icon-button">
                          <FiEdit size={20} />
                        </button>
                        <button onClick={() => handleDeleteFermentable(fermentable.id)} type="button" className="icon-button">
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {recipe.recipeHops?.map((hop) => (
                    <tr key={hop.id}>
                      <td>
                        <object
                          className="hop-object"
                          type="image/svg+xml"
                          data="/hop.svg"
                          aria-label="Hop icon"
                        />
                        {hop.quantity}
                        {' '}
                        g
                      </td>
                      <td><strong>{hop.name}</strong></td>
                      <td>{hop.useType}</td>
                      <td>
                        {hop.ibu}
                        {' '}
                        IBUs
                      </td>
                      <td className="ingredients-list-button-group">
                        <button onClick={() => handleUpdateHop(hop)} type="button" className="icon-button">
                          <FiEdit size={20} />
                        </button>
                        <button onClick={() => handleDeleteHop(hop.id)} type="button" className="icon-button">
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {recipe.recipeMisc?.map((misc) => (
                    <tr key={misc.id}>
                      <td>
                        <object
                          className="misc-object"
                          type="image/svg+xml"
                          data="/misc.svg"
                          aria-label="Misc icon"
                        />
                        {misc.quantity}
                        {' '}
                        g
                      </td>
                      <td><strong>{misc.name}</strong></td>
                      <td>{misc.type}</td>
                      <td className="ingredients-list-button-group">
                        <button onClick={() => handleUpdateMisc(misc)} type="button" className="icon-button">
                          <FiEdit size={20} />
                        </button>
                        <button onClick={() => handleDeleteMisc(misc.id)} type="button" className="icon-button">
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {recipe.recipeYeasts?.map((yeast) => (
                    <tr key={yeast.id}>
                      <td>
                        <object
                          className="yeast-object"
                          type="image/svg+xml"
                          data="/yeast.svg"
                          aria-label="Yeast icon"
                        />
                        {yeast.quantity}
                        {' '}
                        g
                      </td>
                      <td><strong>{yeast.name}</strong></td>
                      <td>{yeast.type}</td>
                      <td className="ingredients-list-button-group">
                        <button onClick={() => handleUpdateYeast(yeast)} type="button" className="icon-button">
                          <FiEdit size={20} />
                        </button>
                        <button onClick={() => handleDeleteYeast(yeast.id)} type="button" className="icon-button">
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bottom-right">
              <div className="parameters-container">
                <strong>OG:</strong>
                {' '}
                {OG}
              </div>
              <div className="bar-container">
                <OGBar
                  valorInicial={1.000}
                  valorFinal={1.100}
                  margemInicial={selectedStyle.initialOG}
                  margemFinal={selectedStyle.finalOG}
                  OGAtual={OG}
                />
              </div>
              <div>
                <strong>FG:</strong>
                {' '}
                {FG}
              </div>
              <div className="bar-container">
                <OGBar
                  valorInicial={1.000}
                  valorFinal={1.025}
                  margemInicial={selectedStyle.initialFG}
                  margemFinal={selectedStyle.finalFG}
                  OGAtual={FG}
                />
              </div>
              <div className="parameters-container">
                <strong>ABV:</strong>
                {' '}
                {ABV}
              </div>
              <div className="bar-container">
                <OGBar
                  valorInicial={0}
                  valorFinal={20}
                  margemInicial={selectedStyle.initialABV}
                  margemFinal={selectedStyle.finalABV}
                  OGAtual={ABV}
                />
              </div>
              <div className="parameters-container">
                <strong>EBC:</strong>
                {' '}
                {EBC}
              </div>
              <div className="bar-container">
                <OGBar
                  valorInicial={0}
                  valorFinal={120}
                  margemInicial={selectedStyle.initialEBC}
                  margemFinal={selectedStyle.finalEBC}
                  OGAtual={EBC}
                />
              </div>
              <div className="parameters-container">
                <strong>IBU:</strong>
                {' '}
                {IBU}
              </div>
              <div className="bar-container">
                <OGBar
                  valorInicial={0}
                  valorFinal={80}
                  margemInicial={selectedStyle.initialIBU}
                  margemFinal={selectedStyle.finalIBU}
                  OGAtual={IBU}
                />
              </div>
              <div className="parameters-container">
                <strong>BU/GU:</strong>
                {' '}
                {BUGU}
              </div>
              <div className="bar-container">
                <OGBar
                  valorInicial={0}
                  valorFinal={3}
                  margemInicial={selectedStyle.initialBuGu}
                  margemFinal={selectedStyle.finalBuGu}
                  OGAtual={BUGU}
                />
              </div>
            </div>
            <div className="bottom-right-beer">
              <object
                className="beer-object"
                type="image/svg+xml"
                data="/beer.svg"
                aria-label="Beer icon"
              />
            </div>
          </div>
          <div className="IA">
            <textarea
              name="IA"
              placeholder="Mystical Wisdom"
              value={openAI}
              disabled
              style={{
                width: '880px',
                height: '85px',
                overflow: 'hidden',
              }}
            />

            <button type="button" onClick={fetchOpenAIResponse} className="modalAddButtonMystical">Mystical Brew Wisdom</button>

          </div>
          {!isView && (
            <button onClick={handleSubmit} className="crud-save-button" type="submit">
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
        <ChangeEquipmentModal
          isOpen={isChangeEquipmentModalOpen}
          closeModal={closeChangeEquipmentModal}
          handleChangeEquipmentRecipe={handleChangeEquipmentRecipe}
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
    </div>
  );
}
