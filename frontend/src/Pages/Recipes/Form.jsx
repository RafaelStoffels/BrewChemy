// React and libraries
import React, {
  useState, useRef, useEffect, useContext,
} from 'react';
import { useParams } from 'react-router-dom';
import { FiTrash2, FiEdit, FiRepeat } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { usePopper } from 'react-popper';
import { ReactComponent as BeerSVG } from '../../assets/beer.svg';

// Context and hooks
import AuthContext from '../../context/AuthContext';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import useFormMode from '../../hooks/useFormMode';
import useIngredientModals from './hooks/useIngredientModals';
import useRecipeForm from './hooks/useRecipeForm';
import useRecipeCalculations from './hooks/useRecipeCalculations';

// Utils and services
import { fetchRecipeById } from '../../services/recipes';
import getOpenAIResponse from '../../services/openAI';
import { showErrorToast } from '../../utils/notifications';

// Components
import Sidebar from '../../Components/Sidebar';
import {
  AddFermentableModal, AddHopModal, AddMiscModal, AddYeastModal,
  ChangeEquipmentModal,
  UpdateFermentableModal, UpdateHopModal, UpdateMiscModal, UpdateYeastModal,
} from './FormModals';
import OGBar from './Components/Indicators';

// Styles
import beerStyles from './utils/getBeerStyles';
import './Form.css';

export default function NewRecipe() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const generateId = () => `fermentable-${Date.now()}`;

  const { isEditing, isView } = useFormMode();

  const popoverRef = useRef(null);
  const [show, setShow] = useState(false);
  const svgRef = useRef(null);
  const [popoverContent, setPopoverContent] = useState('Loading...');

  const { styles, attributes } = usePopper(svgRef.current, popoverRef.current, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -50],
        },
      },
    ],
  });

  // Ingredients Modals
  const {
    activeModal,
    openModal,
    closeModal,
    fermentableList,
    hopList,
    miscList,
    yeastList,
    selectedFermentable,
    setSelectedFermentable,
    selectedHop,
    setSelectedHop,
    selectedMisc,
    setSelectedMisc,
    selectedYeast,
    setSelectedYeast,
    MODALS,
  } = useIngredientModals(user?.token || '');

  /* Components */
  const [selectedStyle, setSelectedStyle] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    onValid,
    onError,
    watchedFields,
  } = useRecipeForm({
    isEditing,
    recipeId: id,
    userToken: user?.token || '',
    defaultValues: {
      type: 'All Grain',
    },
  });

  const {
    recipeEquipment,
    recipeFermentables,
    recipeHops,
    recipeMisc,
    recipeYeasts,
    style: watchedStyle,
    batchVolume: watchedBatchVolume,
    boilTime: watchedBoilTime,
    efficiency: watchedEfficiency,
  } = watchedFields;

  // =======================
  // Fetch Recipe
  // =======================
  const fetchRecipe = async (recipeID) => {
    try {
      if (!user?.token) return;

      const recipeResponse = await fetchRecipeById(user.token, recipeID);
      reset(recipeResponse);
    } catch (error) {
      //
    }
  };

  // =======================
  // Add Ingredient Function
  // =======================
  const handleAddIngredient = (list, setListKey, modalType, itemId, quantity, extraFields = {}) => {
    if (!itemId || !quantity) {
      showErrorToast('Select an item and insert its quantity.');
      return;
    }

    const selectedItem = list.find((item) => item.id === itemId);
    if (!selectedItem) {
      showErrorToast('Selected item not found.');
      return;
    }

    const currentItems = getValues(setListKey) ?? [];
    const newItem = {
      ...selectedItem,
      id: generateId(),
      quantity: parseFloat(quantity),
      ...extraFields,
    };
    setValue(setListKey, [...currentItems, newItem]);
    closeModal(modalType);
  };

  // =======================
  // Equipment Change Function
  // =======================
  const handleChangeEquipmentRecipe = async (selectedItem) => {
    if (selectedItem) {
      const currentEquipmentName = getValues('recipeEquipment.name');

      if (currentEquipmentName !== undefined && currentEquipmentName.trim() !== '') {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you really want to change the equipment? Changing it will update the recipe.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim',
          cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
          setValue('recipeEquipment', { ...selectedItem });
          closeModal(MODALS.CHANGE_EQUIPMENT);
        }
      } else {
        setValue('recipeEquipment', { ...selectedItem });
        closeModal(MODALS.CHANGE_EQUIPMENT);
      }
    } else {
      showErrorToast('Please select an equipment.');
    }
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

  // =======================
  // Item Update Functions
  // =======================
  const fieldMap = {
    fermentable: 'recipeFermentables',
    hop: 'recipeHops',
    misc: 'recipeMisc',
    yeast: 'recipeYeasts',
  };

  const handleUpdateIngredient = (type, updatedItem) => {
    const fieldName = fieldMap[type];
    if (!fieldName) return;

    const currentItems = getValues(fieldName) || [];
    const updatedItems = currentItems.map((item) => (item.id === updatedItem.id ? updatedItem : item));

    setValue(fieldName, updatedItems);
  };

  // =======================
  // Item Delete Functions
  // =======================
  const handleDeleteIngredient = (type, itemId) => {
    const fieldName = fieldMap[type];
    if (!fieldName) return;

    const currentItems = getValues(fieldName) || [];
    const updatedItems = currentItems.filter((item) => item.id !== itemId);
    setValue(fieldName, updatedItems);
  };

  // =======================
  // Fetch OpenAI
  // =======================
  const fetchOpenAIResponse = async () => {
    const recipe = getValues();

    if (!recipe?.style || typeof recipe !== 'object') {
      showErrorToast('Recipe data is missing wmor invalid.');
      setPopoverContent('Recipe data is missing or invalid.');
      return;
    }

    try {
      const openAIResponse = await getOpenAIResponse(recipe, user.token);
      setPopoverContent(openAIResponse);
    } catch (err) {
      //
    }
  };

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    if (!user?.token || !id) return;

    fetchRecipe(id);
  }, [user?.token, id]);

  useEffect(() => {
    if (!isEditing) {
      setValue('type', 'All Grain');
    }
  }, [isEditing, setValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current
        && !popoverRef.current.contains(event.target)
        && svgRef.current
        && !svgRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

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

  const {
    OG,
    FG,
    IBU,
    EBC,
    ABV,
    BUGU,
    preBoilVolume,
  } = useRecipeCalculations({
    watchedBatchVolume,
    watchedEfficiency,
    watchedBoilTime,
    recipeEquipment,
    recipeFermentables,
    recipeHops,
    recipeYeasts,
    getValues,
    setValue,
    svgRef,
  });

  return (
    <div>
      <Sidebar />
      <div className="recipe-container">
        <div className="content">
          <div className="top-container">
            <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="name">
                    Recipe Name
                    <input
                      id="name"
                      name="name"
                      {...register('name')}
                      disabled={isView}
                      style={{ width: '450px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="author">
                    Author
                    <input
                      id="author"
                      name="author"
                      {...register('author')}
                      disabled={isView}
                      style={{ width: '395px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="creationDate">
                    Creation Date
                    <input
                      id="creationDate"
                      name="creationDate"
                      {...register('creationDate')}
                      disabled="TRUE"
                      style={{ width: '200px' }}
                    />
                  </label>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="description">
                    Description
                    <textarea
                      id="description"
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
                  <button
                    id=""
                    type="button"
                    className="transparent-button"
                    onClick={() => openModal(MODALS.CHANGE_EQUIPMENT)}
                  >
                    <FiRepeat size={20} />
                  </button>
                </div>
                <div className="input-field">
                  <label htmlFor="equipment">
                    Equipment
                    <input
                      id="equipment"
                      name="equipment"
                      {...register('recipeEquipment.name')}
                      disabled={isView}
                      style={{ width: '500px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="style">
                    Style
                    <select
                      id="style"
                      {...register('style')}
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
                      style={{ width: '350px' }}
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
                      style={{ width: '155px' }}
                    >
                      <option value="All Grain">All Grain</option>
                      <option value="Extract">Extract</option>
                      <option value="Partial Mash">Partial Mash</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label htmlFor="batchVolume">
                    Batch Volume
                    <input
                      id="batchVolume"
                      name="batchVolume"
                      type="number"
                      {...register('recipeEquipment.batchVolume')}
                      disabled={isView}
                      style={{ width: '150px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="batchTime">
                    Batch Time
                    <input
                      id="batchTime"
                      name="batchTime"
                      type="number"
                      {...register('recipeEquipment.batchTime')}
                      disabled={isView}
                      style={{ width: '150px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="brewEfficiency">
                    Brew. Efficiency
                    <input
                      id="brewEfficiency"
                      name="brewEfficiency"
                      type="number"
                      {...register('recipeEquipment.efficiency')}
                      disabled={isView}
                      style={{ width: '150px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="mashEfficiency">
                    Mash Efficiency
                    <input
                      id="mashEfficiency"
                      name="mashEfficiency"
                      type="number"
                      {...register('recipeEquipment.efficiency')}
                      disabled={isView}
                      style={{ width: '150px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="preBoilVolume">
                    Pre Boil Volume
                    <input
                      id="preBoilVolume"
                      name="preBoilVolume"
                      type="number"
                      value={preBoilVolume}
                      onChange={handleEquipmentChange}
                      disabled
                      style={{ width: '150px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="boilTime">
                    Boil Time
                    <input
                      id="boilTime"
                      name="boilTime"
                      type="number"
                      {...register('recipeEquipment.boilTime')}
                      disabled={isView}
                      style={{ width: '160px' }}
                    />
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div className="buttons-container">
            <button
              type="button"
              onClick={() => openModal(MODALS.FERMENTABLE)}
              className="modalAddButtonFermentable"
            >
              🌾 Add Fermentable
            </button>
            <button
              type="button"
              onClick={() => openModal(MODALS.HOP)}
              className="modalAddButtonHop"
            >
              <object
                className="hop-object"
                type="image/svg+xml"
                data="/hop.svg"
                aria-label="Hop icon"
              />
              Add Hop
            </button>
            <button
              type="button"
              onClick={() => openModal(MODALS.MISC)}
              className="modalAddButtonMisc"
            >
              🧂 Add Misc
            </button>
            <button
              type="button"
              onClick={() => openModal(MODALS.YEAST)}
              className="modalAddButtonYeast"
            >
              🧬 Add Yeast
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
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            setSelectedFermentable(fermentable);
                            openModal(MODALS.UPDATE_FERMENTABLE);
                          }}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleDeleteIngredient('fermentable', fermentable.id)}
                        >
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
                      <td>{hop.usageStage}</td>
                      <td>
                        {hop.ibu}
                        {' '}
                        IBUs
                      </td>
                      <td className="ingredients-list-button-group">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            setSelectedHop(hop);
                            openModal(MODALS.UPDATE_HOP);
                          }}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleDeleteIngredient('hop', hop.id)}
                        >
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
                      <td aria-hidden="true">&nbsp;</td>
                      <td className="ingredients-list-button-group">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            setSelectedMisc(misc);
                            openModal(MODALS.UPDATE_MISC);
                          }}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleDeleteIngredient('misc', misc.id)}
                        >
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
                      <td aria-hidden="true">&nbsp;</td>
                      <td className="ingredients-list-button-group">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            setSelectedYeast(yeast);
                            openModal(MODALS.UPDATE_YEAST);
                          }}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleDeleteIngredient('yeast', yeast.id)}
                        >
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
                <span style={{ color: '#555' }}>
                  {selectedStyle.initialOG !== 1 && selectedStyle.finalOG !== 1 && (
                    ` (${selectedStyle.initialOG} - ${selectedStyle.finalOG})`
                  )}
                </span>
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
                <span style={{ color: '#555' }}>
                  {selectedStyle.initialFG > 1 && selectedStyle.finalFG > 1 && (
                    ` (${selectedStyle.initialFG} - ${selectedStyle.finalFG})`
                  )}
                </span>
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
                <span style={{ color: '#555' }}>
                  {selectedStyle.initialABV > 0 && selectedStyle.finalABV > 0 && (
                    ` (${selectedStyle.initialABV} - ${selectedStyle.finalABV})`
                  )}
                </span>
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
                <span style={{ color: '#555' }}>
                  {selectedStyle.initialEBC > 0 && selectedStyle.finalEBC > 0 && (
                    ` (${selectedStyle.initialEBC} - ${selectedStyle.finalEBC})`
                  )}
                </span>
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
                <span style={{ color: '#555' }}>
                  {selectedStyle.initialIBU > 0 && selectedStyle.finalIBU > 0 && (
                    ` (${selectedStyle.initialIBU} - ${selectedStyle.finalIBU})`
                  )}
                </span>
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
                <span style={{ color: '#555' }}>
                  {selectedStyle.initialBuGu > 0 && selectedStyle.finalBuGu > 0 && (
                    ` (${selectedStyle.initialBuGu} - ${selectedStyle.finalBuGu})`
                  )}
                </span>
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
              <BeerSVG
                className="beer-svg-icon"
                ref={svgRef}
                onClick={async () => {
                  const newShow = !show;

                  if (newShow) {
                    setPopoverContent('Consulting mystical wisdom.');
                    setShow(true);

                    await fetchOpenAIResponse();
                  } else {
                    setShow(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    svgRef.current?.click();
                  }
                }}
                role="button"
                tabIndex="0"
                style={{ cursor: 'pointer' }}
                title="Tap here and explore the secrets of alchemist’s mystical wisdom for this recipe."
              />

              {show && (
                <div
                  className="wide-popover"
                  ref={popoverRef}
                  style={{
                    ...styles.popper,
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    padding: '12px',
                    maxWidth: 300,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                  }}
                  {...attributes.popper}
                >
                  <div
                    className="popover-header"
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 12,
                      fontSize: '1rem',
                    }}
                  >
                    Alchemist’s Mystical Wisdom
                  </div>
                  <div className="popover-body">
                    {popoverContent}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isView && (
            <button form="formSubmit" className="crud-save-button" type="submit">
              Save
            </button>
          )}
        </div>
        {activeModal === MODALS.FERMENTABLE && (
        <AddFermentableModal
          isOpen
          closeModal={closeModal}
          ingredientList={fermentableList}
          handleAddFermentableRecipe={(onAddId, onAddQuantity) => (
            handleAddIngredient(
              fermentableList,
              'recipeFermentables',
              MODALS.FERMENTABLE,
              onAddId,
              onAddQuantity,
            )
          )}
        />
        )}
        {activeModal === MODALS.HOP && (
        <AddHopModal
          isOpen
          closeModal={closeModal}
          hopList={hopList}
          handleAddHopRecipe={(onAddId, onAddQuantity, onAddBoilTime, onAddAlphaAcid, onAddUsageStage) => (
            handleAddIngredient(
              hopList,
              'recipeHops',
              MODALS.ADD_HOP,
              onAddId,
              onAddQuantity,
              {
                boilTime: onAddBoilTime,
                alphaAcid: onAddAlphaAcid,
                usageStage: onAddUsageStage,
              },
            )
          )}
        />
        )}
        {activeModal === MODALS.MISC && (
          <AddMiscModal
            isOpen
            closeModal={closeModal}
            miscList={miscList}
            handleAddMiscRecipe={(onAddId, onAddQuantity) => (
              handleAddIngredient(
                miscList,
                'recipeMisc',
                MODALS.MISC,
                onAddId,
                onAddQuantity,
              )
            )}
          />
        )}
        {activeModal === MODALS.YEAST && (
          <AddYeastModal
            isOpen
            closeModal={closeModal}
            yeastList={yeastList}
            handleAddYeastRecipe={(onAddId, onAddQuantity) => (
              handleAddIngredient(
                yeastList,
                'recipeYeasts',
                MODALS.YEAST,
                onAddId,
                onAddQuantity,
              )
            )}
          />
        )}
        {activeModal === MODALS.CHANGE_EQUIPMENT && (
          <ChangeEquipmentModal
            isOpen
            closeModal={closeModal}
            handleChangeEquipmentRecipe={handleChangeEquipmentRecipe}
          />
        )}
        {activeModal === MODALS.UPDATE_FERMENTABLE && (
          <UpdateFermentableModal
            isOpen
            closeModal={closeModal}
            selectedFermentable={selectedFermentable}
            onUpdate={(updatedFermentable) => handleUpdateIngredient('fermentable', updatedFermentable)}
          />
        )}
        {activeModal === MODALS.UPDATE_HOP && (
          <UpdateHopModal
            isOpen
            closeModal={closeModal}
            selectedHop={selectedHop}
            onUpdate={(updatedHop) => handleUpdateIngredient('hop', updatedHop)}
          />
        )}
        {activeModal === MODALS.UPDATE_MISC && (
          <UpdateMiscModal
            isOpen
            closeModal={closeModal}
            selectedMisc={selectedMisc}
            onUpdate={(updatedMisc) => handleUpdateIngredient('misc', updatedMisc)}
          />
        )}
        {activeModal === MODALS.UPDATE_YEAST && (
          <UpdateYeastModal
            isOpen
            closeModal={closeModal}
            selectedYeast={selectedYeast}
            onUpdate={(updatedYeast) => handleUpdateIngredient('yeast', updatedYeast)}
          />
        )}
      </div>
    </div>
  );
}
