import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { FiTrash2, FiEdit, FiRepeat } from 'react-icons/fi';
import Swal from 'sweetalert2';

import schema from './schemas/formSchema';

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
} from './utils/calculation';

import getBeerColor from './utils/getBeerColor';
import beerStyles from './utils/getBeerStyles';
import OGBar from './Components/Indicators';

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

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
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
      recipeEquipment: {
        id: '',
        name: '',
      },
    },
  });

  const onValid = async (data) => {
    console.log('caiu:', data);
    try {
      const payload = {
        ...data,
      };

      if (isEditing) {
        await api.put(`/api/recipes/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      } else {
        await api.post('/api/recipes', payload, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }

      showSuccessToast('Recipe saved successfully.');
    } catch (err) {
      showErrorToast('Error saving recipe. Please, try again.');
    }
  };

  const onError = (errors) => {
    console.log('erro:', errors);
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showErrorToast(firstError.message);
    }
  };

  const fetchRecipe = async (recipeID) => {
    try {
      const recipeResponse = await fetchRecipeById(recipeID, user.token);
      reset(recipeResponse);
    } catch (error) {
      console.error('Erro ao buscar a receita:', error);
      showErrorToast('Erro ao carregar a receita. Tente novamente.');
    }
  };

  const fetchOpenAIResponse = async () => {
    const values = getValues();
    const openAIResponse = await getOpenAIResponse(values.recipe, user.token);
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
        const currentFermentables = getValues('recipeFermentables') || [];

        const newFermentable = {
          ...selectedFermentableDetails,
          id: generateId(),
          quantity: parseFloat(quantity),
        };

        setValue('recipeFermentables', [...currentFermentables, newFermentable]);

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
        const currentHops = getValues('recipeHops') || [];

        setValue('recipeHops', [
          ...currentHops,
          {
            ...selectedHopDetails,
            id: generateId(),
            quantity: parseFloat(quantity),
            boilTime,
          },
        ]);

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
        const currentMisc = getValues('recipeMisc') || [];

        setValue('recipeMisc', [
          ...currentMisc,
          {
            ...selectedMiscDetails,
            id: generateId(),
            quantity: parseFloat(quantity),
          },
        ]);

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
        const currentYeasts = getValues('recipeYeasts') || [];

        setValue('recipeYeasts', [
          ...currentYeasts,
          {
            ...selectedYeastDetails,
            id: generateId(),
            quantity: parseFloat(quantity),
          },
        ]);

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
      const currentEquipmentName = getValues('recipeEquipment.name');

      if (currentEquipmentName !== undefined) {
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
          setValue('recipeEquipment', { ...selectedItem });
          closeChangeEquipmentModal();
        }
      } else {
        setValue('recipeEquipment', { ...selectedItem });
        closeChangeEquipmentModal();
      }
    } else {
      showErrorToast('Please select an equipment.');
    }
  };

  const handleUpdateFermentableRecipe = (updatedFermentable) => {
    const currentFermentables = getValues('recipeFermentables') || [];
    const updatedFermentables = currentFermentables.map((fermentable) => {
      if (fermentable.id === updatedFermentable.id) {
        return updatedFermentable;
      }
      return fermentable;
    });
    setValue('recipeFermentables', updatedFermentables);
  };

  const handleUpdateHopRecipe = (updatedHop) => {
    const currentHops = getValues('recipeHops') || [];
    const updatedHops = currentHops.map((hop) => {
      if (hop.id === updatedHop.id) {
        return updatedHop;
      }
      return hop;
    });
    setValue('recipeHops', updatedHops);
  };

  const handleUpdateMiscRecipe = (updatedMisc) => {
    const currentMiscs = getValues('recipeMisc') || [];
    const updatedMiscs = currentMiscs.map((misc) => {
      if (misc.id === updatedMisc.id) {
        return updatedMisc;
      }
      return misc;
    });
    setValue('recipeMisc', updatedMiscs);
  };

  const handleUpdateYeastRecipe = (updatedYeast) => {
    const currentYeasts = getValues('recipeYeasts') || [];
    const updatedYeasts = currentYeasts.map((yeast) => {
      if (yeast.id === updatedYeast.id) {
        return updatedYeast;
      }
      return yeast;
    });
    setValue('recipeYeasts', updatedYeasts);
  };

  const handleDeleteFermentable = (fermentableId) => {
    const currentFermentables = getValues('recipeFermentables') || [];
    const updatedFermentables = currentFermentables.filter(
      (fermentable) => fermentable.id !== fermentableId,
    );
    setValue('recipeFermentables', updatedFermentables);
  };

  const handleDeleteHop = (hopID) => {
    const currentHops = getValues('recipeHops') || [];
    const updatedHops = currentHops.filter((hop) => hop.id !== hopID);
    setValue('recipeHops', updatedHops);
  };

  const handleDeleteMisc = (miscID) => {
    const currentMisc = getValues('recipeMisc') || [];
    const updatedMisc = currentMisc.filter((misc) => misc.id !== miscID);
    setValue('recipeMisc', updatedMisc);
  };

  const handleDeleteYeast = (yeastID) => {
    const currentYeasts = getValues('recipeYeasts') || [];
    const updatedYeasts = currentYeasts.filter((yeast) => yeast.id !== yeastID);
    setValue('recipeYeasts', updatedYeasts);
  };

  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    const currentEquipment = getValues('recipeEquipment') || {};
    const updatedEquipment = {
      ...currentEquipment,
      [name]: Number(value),
    };
    setValue('recipeEquipment', updatedEquipment);
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (id) {
      setIsView(window.location.pathname.includes('/details'));
      setIsEditing(!window.location.pathname.includes('/details'));
      fetchRecipe(id);
    }
  }, [id, user]);

  const recipeEquipment = watch('recipeEquipment');
  const recipeFermentables = watch('recipeFermentables');
  const recipeHops = watch('recipeHops');
  const recipeMisc = watch('recipeMisc');
  const recipeYeasts = watch('recipeYeasts');

  const watchedStyle = watch('style');
  const watchedBatchVolume = watch('recipeEquipment.batchVolume');
  const watchedBoilTime = watch('recipeEquipment.boilTime');
  const watchedEfficiency = watch('recipeEquipment.efficiency');

  useEffect(() => {
    const recipeData = getValues();

    if (recipeData.style) {
      const style = beerStyles.find((s) => s.name === recipeData.style);

      if (style) {
        setSelectedStyle(style);
      }
    } else {
      setSelectedStyle({
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
      });
    }
  }, [watchedStyle]);

  useEffect(() => {
    const recipeData = getValues();

    // calculateOG
    const OGResult = calculateOG(recipeData);
    setOG(OGResult);

    // calculateFG
    const FGResult = calculateFG(recipeData, OGResult);
    setFG(FGResult);

    if (!recipeData.recipeFermentables?.length) {
      setABV(0);
    }

    // calculateIBU
    const IBUresult = calculateIBU(recipeData, OGResult);
    if (IBUresult && IBUresult.totalIBU) {
      const { totalIBU, hasChanges, updatedHops } = IBUresult;

      setIBU(parseFloat(totalIBU));

      if (hasChanges) {
        const currentHops = getValues('recipeHops');

        if (JSON.stringify(currentHops) !== JSON.stringify(updatedHops)) {
          setValue('recipeHops', updatedHops);
        }
      }
    } else {
      setIBU(0);
    }

    // calculateGU and BU:GU
    const GU = (OGResult - 1) * 1000;
    if (IBU) {
      setBUGU((IBU / GU).toFixed(2));
    }

    if (recipeData?.recipeFermentables?.length) {
      const newPercentages = getIngredientsPorcentage(recipeData.recipeFermentables);

      const currentPercentages = getValues('recipeFermentables');

      if (JSON.stringify(currentPercentages) !== JSON.stringify(newPercentages)) {
        setValue('recipeFermentables', newPercentages);
      }
    }
  }, [watchedBatchVolume, watchedEfficiency, recipeFermentables, IBU]);

  useEffect(() => {
    const recipeData = getValues();

    // getPreBoilVolume
    const preBoilCalc = getPreBoilVolume(recipeData);
    if (preBoilCalc > 0) {
      setpreBoilVolume(preBoilCalc);
    }
  }, [watchedBatchVolume, watchedBoilTime, recipeEquipment]);

  useEffect(() => {
    const recipeData = getValues();

    // calculateEBC
    const EBCResult = calculateEBC(recipeData);
    setEBC(EBCResult);

    if (EBCResult) {
      const color = getBeerColor(EBC);

      const svgObject = document.querySelector('.beer-object');

      if (svgObject && svgObject.contentDocument) {
        const svgDoc = svgObject.contentDocument;
        const gradients = svgDoc.querySelectorAll('linearGradient, radialGradient');

        gradients.forEach((gradient) => {
          const stops = gradient.querySelectorAll('stop');

          stops.forEach((stop) => {
            stop.setAttribute('stop-color', color);
          });
        });
      }
    }
  }, [watchedBatchVolume, recipeFermentables]);

  useEffect(() => {
    if (OG && FG) {
      const abvValue = ((OG - FG) * 131.25).toFixed(2);
      setABV(abvValue > 0 ? abvValue : 0);
    }
  }, [OG, FG]);

  return (
    <div>
      <Sidebar />
      <div className="recipe-container">
        <div className="content">
          <div className="top">
            <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="name">
                    Recipe Name
                    <input
                      name="name"
                      {...register('name')}
                      disabled={isView}
                      style={{ width: '380px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="author">
                    Author
                    <input
                      name="author"
                      {...register('author')}
                      disabled={isView}
                      style={{ width: '220px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="style">
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
                  <label htmlFor="type">
                    Type
                    <select
                      id="type"
                      {...register('type')}
                      style={{ width: '100px' }}
                    >
                      <option value="All Grain">All Grain</option>
                      <option value="Extract">Extract</option>
                      <option value="Partial Mash">Partial Mash</option>
                    </select>
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="creationDate">
                    Creation Date
                    <input
                      name="creationDate"
                      {...register('creationDate')}
                      disabled={isView}
                      style={{ width: '100px' }}
                    />
                  </label>
                </div>
              </div>
              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="description">
                    Description
                    <textarea
                      className="description-textarea"
                      name="description"
                      {...register('description')}
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
                  <label htmlFor="recipeEquipment.name">
                    Equipment
                    <input
                      name="equipment"
                      {...register('recipeEquipment.name')}
                      disabled={isView}
                      style={{ width: '240px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="batchVolume">
                    Batch Volume
                    <input
                      name="batchVolume"
                      type="number"
                      {...register('recipeEquipment.batchVolume')}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="batchTime">
                    Batch Time
                    <input
                      name="batchTime"
                      type="number"
                      {...register('recipeEquipment.batchTime')}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>

                <div className="input-field">
                  <label htmlFor="efficiency">
                    Brew. Efficiency
                    <input
                      name="efficiency"
                      type="number"
                      {...register('recipeEquipment.efficiency')}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="efficiency">
                    Mash Efficiency
                    <input
                      name="efficiency"
                      type="number"
                      {...register('recipeEquipment.efficiency')}
                      disabled={isView}
                      style={{ width: '90px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="preBoilVolume">
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
                  <label htmlFor="boilTime">
                    Boil Time
                    <input
                      name="boilTime"
                      type="number"
                      {...register('recipeEquipment.boilTime')}
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
                  {(recipeFermentables || []).map((fermentable) => (
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

                  {(recipeHops || []).map((hop) => (
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

                  {(recipeMisc || []).map((misc) => (
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
                      <td />
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

                  {(recipeYeasts || []).map((yeast) => (
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
                      <td />
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
                  initialValue={1.000}
                  finalValue={1.100}
                  initialMargin={selectedStyle.initialOG}
                  finalMargin={selectedStyle.finalOG}
                  currentOG={OG}
                />
              </div>
              <div>
                <strong>FG:</strong>
                {' '}
                {FG}
              </div>
              <div className="bar-container">
                <OGBar
                  initialValue={1.000}
                  finalValue={1.025}
                  initialMargin={selectedStyle.initialFG}
                  finalMargin={selectedStyle.finalFG}
                  currentOG={FG}
                />
              </div>
              <div className="parameters-container">
                <strong>ABV:</strong>
                {' '}
                {ABV}
              </div>
              <div className="bar-container">
                <OGBar
                  initialValue={0}
                  finalValue={20}
                  initialMargin={selectedStyle.initialABV}
                  finalMargin={selectedStyle.finalABV}
                  currentOG={ABV}
                />
              </div>
              <div className="parameters-container">
                <strong>EBC:</strong>
                {' '}
                {EBC}
              </div>
              <div className="bar-container">
                <OGBar
                  initialValue={0}
                  finalValue={120}
                  initialMargin={selectedStyle.initialEBC}
                  finalMargin={selectedStyle.finalEBC}
                  currentOG={EBC}
                />
              </div>
              <div className="parameters-container">
                <strong>IBU:</strong>
                {' '}
                {IBU}
              </div>
              <div className="bar-container">
                <OGBar
                  initialValue={0}
                  finalValue={80}
                  initialMargin={selectedStyle.initialIBU}
                  finalMargin={selectedStyle.finalIBU}
                  currentOG={IBU}
                />
              </div>
              <div className="parameters-container">
                <strong>BU/GU:</strong>
                {' '}
                {BUGU}
              </div>
              <div className="bar-container">
                <OGBar
                  initialValue={0}
                  finalValue={3}
                  initialMargin={selectedStyle.initialBuGu}
                  finalMargin={selectedStyle.finalBuGu}
                  currentOG={BUGU}
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

            <button type="button" onClick={fetchOpenAIResponse} className="ButtonMystical">Mystical Brew Wisdom</button>

          </div>
          {!isView && (
            <button form="formSubmit" className="crud-save-button" type="submit">
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
