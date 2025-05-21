import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFermentableById, updateFermentable, addFermentable } from '../../services/Fermentables';
import { showErrorToast, showSuccessToast } from '../../utils/notifications';

import AuthContext from '../../context/AuthContext';

import '../../styles/crud.css';

export default function NewFermentable() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Base');
  const [supplier, setSupplier] = useState('');
  const [ebc, setEBC] = useState('');
  const [potentialExtract, setPotentialExtract] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isView, setIsView] = useState(false);

  async function fetchFermentable(itemID) {
    try {
      const fermentable = await fetchFermentableById(user.token, recordUserId, itemID);
      setName(fermentable.name);
      setDescription(fermentable.description);
      setType(fermentable.type);
      setSupplier(fermentable.supplier);
      setEBC(fermentable.ebc);
      setPotentialExtract(fermentable.potentialExtract);
      setUnitPrice(fermentable.unit_price);
      setStockQuantity(fermentable.stock_quantity);
    } catch (err) {
      showErrorToast(`Error loading fermentable record. ${err}`);
      navigate('/FermentableList');
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (id) {
      const isDetailsPage = window.location.pathname.includes('/details');
      setIsView(isDetailsPage);
      setIsEditing(!isDetailsPage);
      fetchFermentable(id);
    }
  }, [id, user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      name,
      description,
      type,
      supplier,
      ebc,
      potentialExtract,
      unit_price: unitPrice,
      stock_quantity: stockQuantity,
    };

    try {
      if (isEditing) {
        await updateFermentable(user.token, recordUserId, id, data);
        showSuccessToast('Fermentable has been updated.');
      } else {
        await addFermentable(user.token, data);
        showSuccessToast('Added new fermentable successfully.');
      }
      navigate('/FermentableList');
    } catch (err) {
      showErrorToast(`${err.message}`);
    }
  }

  function getTitle() {
    if (isEditing) return 'Update Fermentable';
    if (isView) return 'Fermentable Details';
    return 'Add New Fermentable';
  }

  return (
    <div>
      <div className="crud-container">
        <section>
          <h1>{getTitle()}</h1>
        </section>
        <div className="content">
          <form onSubmit={handleSubmit}>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">
                  Name
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isView}
                    style={{ width: '430px' }}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="supplier">
                  Supplier
                  <input
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    disabled={isView}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="type">
                  Type
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isView}
                  >
                    <option value="base">Base</option>
                    <option value="Specialty">Specialty</option>
                    <option value="Adjunct">Adjunct</option>
                  </select>
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="ebc">
                  Color Degree
                  <input
                    id="ebc"
                    type="number"
                    value={ebc}
                    onChange={(e) => setEBC(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="potentialExtract">
                  Potential Extract
                  <input
                    id="potentialExtract"
                    type="number"
                    value={potentialExtract}
                    onChange={(e) => setPotentialExtract(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="unitPrice">
                  Unit Price
                  <input
                    id="unitPrice"
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
              <div className="input-field">
                <label htmlFor="stockQuantity">
                  Stock Quantity
                  <input
                    id="stockQuantity"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    disabled={isView}
                  />
                </label>
              </div>
            </div>
            {!isView && (
              <button className="crud-save-button" type="submit">
                Save
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
