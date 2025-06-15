// React and libraries
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FiTrash2, FiEdit, FiRepeat } from 'react-icons/fi';
import Swal from 'sweetalert2';

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
  } = useIngredientModals(user.token);

  /* Dinamic Variables */
  const [openAI, setOpenAI] = useState('');

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
  } = useRecipeForm({ isEditing, recipeId: id, userToken: user.token });

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
      showErrorToast('Selecione um item e insira a quantidade.');
      return;
    }

    const selectedItem = list.find((item) => item.id === itemId);
    if (!selectedItem) {
      showErrorToast('Item selecionado não encontrado.');
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
      showErrorToast('Recipe data is missing or invalid.');
      return;
    }

    try {
      const openAIResponse = await getOpenAIResponse(recipe, user.token);
      setOpenAI(openAIResponse);
    } catch (err) {
      //
    }
  };

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, []);

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
    getValues,
    setValue,
  });

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
                      id="name"
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
                      id="author"
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
                      id="style"
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
                      id="creationDate"
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
                      style={{ width: '240px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label htmlFor="batchVolume">
                    Batch Volume
                    <input
                      id="batchVolume"
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
                      id="batchTime"
                      name="batchTime"
                      type="number"
                      {...register('recipeEquipment.batchTime')}
                      disabled={isView}
                      style={{ width: '90px' }}
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
                      style={{ width: '90px' }}
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
                      style={{ width: '90px' }}
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
                      style={{ width: '90px' }}
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
              onClick={() => openModal(MODALS.FERMENTABLE)}
              className="modalAddButtonFermentable"
            >
              Add Fermentable
            </button>
            <button
              type="button"
              onClick={() => openModal(MODALS.HOP)}
              className="modalAddButtonHop"
            >
              Add Hop
            </button>
            <button
              type="button"
              onClick={() => openModal(MODALS.MISC)}
              className="modalAddButtonMisc"
            >
              Add Misc
            </button>
            <button
              type="button"
              onClick={() => openModal(MODALS.YEAST)}
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
                      <td>{hop.useType}</td>
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
                      <td />
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
                      <td />
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
            <button
              type="button"
              className="ButtonMystical"
              onClick={fetchOpenAIResponse}
            >
              Mystical Brew Wisdom
            </button>
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
          handleAddHopRecipe={(onAddId, onAddQuantity, onAddBoilTime) => (
            handleAddIngredient(
              hopList,
              'recipeHops',
              MODALS.ADD_HOP,
              onAddId,
              onAddQuantity,
              { boilTime: onAddBoilTime },
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
