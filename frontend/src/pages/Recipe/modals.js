import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import { searchFermentables } from '../../services/Fermentables';
import { searchHops } from '../../services/Hops';
import { searchMiscs } from '../../services/Misc';
import { searchYeasts } from '../../services/Yeasts';

export function AddFermentableModal({ isOpen, closeModal, handleAddFermentableRecipe }) {
    const [selectedFermentable, setSelectedFermentable] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [fermentableList, setFermentableList] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false); // Evita busca extra ao selecionar

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (isSelecting) return; // Se estiver selecionando, não faz nova busca
        
        const delayDebounce = setTimeout(() => {
            if (searchTerm.length > 2) {
                searchFermentablesFunction(searchTerm);
            } else {
                setFermentableList([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const searchFermentablesFunction = async (term) => {
        const recipeResponse = await searchFermentables(api, user.token, term);
        setFermentableList(recipeResponse);
    };

    const handleSelectFermentable = (fermentable) => {
        setIsSelecting(true); // Indica que estamos selecionando um item (evita nova busca)
        setSelectedFermentable(fermentable.id);
        setSearchTerm(fermentable.name); // Preenche o input com o nome
        setFermentableList([]); // Oculta a lista após a seleção

        // Reseta a flag depois de um curto período para permitir futuras buscas
        setTimeout(() => setIsSelecting(false), 100);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Fermentables Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Select a fermentable</h2>

            {/* Campo de busca */}
            <input
                type="text"
                placeholder="Search fermentables"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '15px', padding: '5px' }}
            />

            {/* Lista de fermentáveis */}
            {fermentableList.length > 0 && (
                <ul style={{ border: '1px solid #ccc', padding: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                    {fermentableList.map((fermentable) => (
                        <li 
                            key={fermentable.id} 
                            style={{ cursor: 'pointer', padding: '5px' }}
                            onMouseDown={() => handleSelectFermentable(fermentable)} // Usa onMouseDown para evitar re-render antes do clique
                        >
                            {fermentable.name}
                        </li>
                    ))}
                </ul>
            )}

            {/* Campo de quantidade */}
            <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />

            <button onClick={() => handleAddFermentableRecipe(selectedFermentable, quantity)} className="crud-save-button">
                Add Fermentable
            </button>
        </Modal>
    );
}

export function AddHopModal({ isOpen, closeModal, handleAddHopRecipe }) {
    const [selectedHop, setSelectedHop] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [boilTime, setBoilTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hopList, setHopList] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false); // Evita busca ao selecionar

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (isSelecting) return; // Não faz nova busca se estiver selecionando

        const delayDebounce = setTimeout(() => {
            if (searchTerm.length > 2) {
                searchHopsFunction(searchTerm);
            } else {
                setHopList([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const searchHopsFunction = async (term) => {
        const response = await searchHops(api, user.token, term);
        setHopList(response);
    };

    const handleSelectHop = (hop) => {
        setIsSelecting(true);
        setSelectedHop(hop.id);
        setSearchTerm(hop.name); // Mostra o nome no input
        setHopList([]); // Oculta a lista

        setTimeout(() => setIsSelecting(false), 100);
    };

    const handleSaveButton = () => {
        if (selectedHop && quantity && boilTime) {
            handleAddHopRecipe(selectedHop, quantity, boilTime);
            closeModal();
        } else {
            alert('Please fill in all fields.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Hops Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Select a Hop</h2>
            
            {/* Campo de busca */}
            <input
                type="text"
                placeholder="Search hops"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '15px', padding: '5px' }}
            />

            {/* Lista de lúpulos */}
            {hopList.length > 0 && (
                <ul style={{ border: '1px solid #ccc', padding: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                    {hopList.map((hop) => (
                        <li 
                            key={hop.id} 
                            style={{ cursor: 'pointer', padding: '5px' }}
                            onMouseDown={() => handleSelectHop(hop)} // Evita re-render antes do clique
                        >
                            {hop.name}
                        </li>
                    ))}
                </ul>
            )}

            {/* Campos de quantidade e tempo de fervura */}
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </div>
            <div>
                <input
                    type="number"
                    placeholder="Boil Time"
                    value={boilTime}
                    onChange={(e) => setBoilTime(e.target.value)}
                />
            </div>

            <button onClick={handleSaveButton} className="crud-save-button">
                Add Hop
            </button>
        </Modal>
    );
}

export function AddMiscModal({ isOpen, closeModal, handleAddMiscRecipe }) {
    const [selectedMisc, setSelectedMisc] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMiscList, setFilteredMiscList] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false); // Prevent search during selection

    const { user } = useContext(AuthContext);  // Certifique-se de que o contexto de autenticação está correto.

    const handleChange = (miscID) => {
        setSelectedMisc(miscID);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleSaveButton = () => {
        if (selectedMisc && quantity) {
            handleAddMiscRecipe(selectedMisc, quantity);
            closeModal();
        } else {
            alert('Please fill in all fields.');
        }
    };

    useEffect(() => {
        if (isSelecting) return; // Do not perform new search while selecting

        const delayDebounce = setTimeout(() => {
            if (searchTerm.length > 2) {
                filterMiscList(searchTerm);
            } else {
                setFilteredMiscList([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const filterMiscList = async (term) => {
        console.log('Searching for:', term);  // Verifique o termo da busca
        try {
            const response = await searchMiscs(api, user.token, term);
            console.log('Search result:', response);  // Verifique o que está sendo retornado
            setFilteredMiscList(response);
        } catch (error) {
            console.error('Error fetching misc data:', error);
            setFilteredMiscList([]); // Caso haja erro, não mostre nada
        }
    };

    const handleSelectMisc = (misc) => {
        setIsSelecting(true);
        setSelectedMisc(misc.id);
        setSearchTerm(misc.name); // Display name in the input field
        setFilteredMiscList([]); // Hide the list after selection

        setTimeout(() => setIsSelecting(false), 100);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Misc Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Select a Misc</h2>

            {/* Search input */}
            <input
                type="text"
                placeholder="Search misc"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '15px', padding: '5px' }}
            />

            {/* List of filtered miscs */}
            {filteredMiscList.length > 0 && (
                <ul style={{ border: '1px solid #ccc', padding: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                    {filteredMiscList.map((misc) => (
                        <li
                            key={misc.id}
                            style={{ cursor: 'pointer', padding: '5px' }}
                            onClick={() => handleSelectMisc(misc)} // Select item
                        >
                            {misc.name}
                        </li>
                    ))}
                </ul>
            )}

            {/* Quantity input */}
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </div>

            <button onClick={handleSaveButton} className="crud-save-button">
                Add Misc
            </button>
        </Modal>
    );
}

export function AddYeastModal({ isOpen, closeModal, handleAddYeastRecipe }) {
    const [selectedYeast, setSelectedYeast] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredYeastList, setFilteredYeastList] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false); // Evita busca ao selecionar

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (isSelecting) return; // Não faz nova busca se estiver selecionando

        const delayDebounce = setTimeout(() => {
            if (searchTerm.length > 2) {
                filterYeastList(searchTerm);
            } else {
                setFilteredYeastList([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const filterYeastList = async (term) => {
        // Substitua com a função de busca que acessa a API
        try {
            const response = await searchYeasts(api, user.token, term);
            setFilteredYeastList(response);  // Atualize a lista de leveduras filtradas
        } catch (error) {
            console.error('Erro ao buscar leveduras:', error);
        }
    };

    const handleSelectYeast = (yeast) => {
        setIsSelecting(true);
        setSelectedYeast(yeast.id);
        setSearchTerm(yeast.name); // Mostra o nome da levedura no campo de busca
        setFilteredYeastList([]); // Oculta a lista filtrada

        setTimeout(() => setIsSelecting(false), 100);
    };

    const handleSaveButton = () => {
        if (selectedYeast && quantity) {
            handleAddYeastRecipe(selectedYeast, quantity);
            closeModal();
        } else {
            alert('Please fill in all fields.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Yeast Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Select a Yeast</h2>

            {/* Campo de busca */}
            <input
                type="text"
                placeholder="Search yeast"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '15px', padding: '5px' }}
            />

            {/* Lista de leveduras */}
            {filteredYeastList.length > 0 && (
                <ul style={{ border: '1px solid #ccc', padding: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                    {filteredYeastList.map((yeast) => (
                        <li 
                            key={yeast.id} 
                            style={{ cursor: 'pointer', padding: '5px' }}
                            onMouseDown={() => handleSelectYeast(yeast)} // Evita re-render antes do clique
                        >
                            {yeast.name}
                        </li>
                    ))}
                </ul>
            )}

            {/* Campos de quantidade */}
            <div>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </div>

            <button onClick={handleSaveButton} className="crud-save-button">
                Add Yeast
            </button>
        </Modal>
    );
}


export function UpdateFermentableModal({ isOpen, closeModal, selectedFermentable, handleUpdateFermentableRecipe }) {
    const [localFermentableObject, setLocalFermentableObject] = useState(null);

    // Atualiza o estado local sempre que o fermentable recebido como prop mudar
    useEffect(() => {
        if (selectedFermentable) {
            setLocalFermentableObject(selectedFermentable);
        }
    }, [selectedFermentable]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalFermentableObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localFermentableObject) {
            handleUpdateFermentableRecipe(localFermentableObject); // Salva alterações
        }
        closeModal();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Fermentables Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            {localFermentableObject ? (
                <form onSubmit={handleSaveButton}>
                    <div className="modal">
                        <h2>Update Fermentable</h2>
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Fermentable Name"
                            value={localFermentableObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Fermentable Description"
                            value={localFermentableObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Fermentable Type</label>
                                <select
                                  value={localFermentableObject.maltType}
                                  onChange={(e) =>
                                    setLocalFermentableObject((prev) => ({
                                      ...prev,
                                      maltType: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="base">Base</option>
                                  <option value="especial">Specialty</option>
                                  <option value="adjunto">Adjunct</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Supplier</label>
                                <input 
                                    placeholder="Supplier"
                                    value={localFermentableObject.supplier || ''}
                                    onChange={(e) => handleChange('supplier', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">EBC</label>
                                <input 
                                    placeholder="EBC"
                                    type="number"
                                    value={localFermentableObject.ebc || ''}
                                    onChange={(e) => handleChange('ebc', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Potential Extract</label>
                                <input 
                                    placeholder="Potential Extract"
                                    type="number"
                                    value={localFermentableObject.potentialExtract || ''}
                                    onChange={(e) => handleChange('potentialExtract', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localFermentableObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                        <button className="crud-save-button" type="submit">
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </Modal>
    );
}

export function UpdateHopModal({ isOpen, closeModal, selectedHop, handleUpdateHopRecipe }) {
    const [localHopObject, setLocalHopObject] = useState(null);

    // Atualiza o estado local sempre que o Hop recebido como prop mudar
    useEffect(() => {
        if (selectedHop) {
            setLocalHopObject(selectedHop);
        }
    }, [selectedHop]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalHopObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    // Manipula o botão de salvar
    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localHopObject) {
            handleUpdateHopRecipe(localHopObject); // Salva alterações
        }
        closeModal(); // Fecha a modal
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Hops Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            {localHopObject ? (
                <form onSubmit={handleSaveButton}>
                    <div className="modal">
                        <h2>Update Hop</h2>
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Hop Name"
                            value={localHopObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Hop Description"
                            value={localHopObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Alpha Acid</label>
                                <input 
                                    type="number"
                                    placeholder="Fermentable Type"
                                    value={localHopObject.alphaAcidContent || ''}
                                    onChange={(e) => handleChange('alphaAcidContent', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Beta Acid</label>
                                <input 
                                    type="number"
                                    placeholder="Supplier"
                                    value={localHopObject.betaAcidContent || ''}
                                    onChange={(e) => handleChange('betaAcidContent', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Boil Time</label>
                                <input 
                                    placeholder="Boil Time"
                                    type="number"
                                    value={localHopObject.boilTime || ''}
                                    onChange={(e) => handleChange('boilTime', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Use Type</label>
                                <select
                                  value={localHopObject.useType}
                                  onChange={(e) =>
                                    setLocalHopObject((prev) => ({
                                      ...prev,
                                      useType: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Boil">Boil</option>
                                  <option value="Dry Hop">Dry Hop</option>
                                  <option value="Aroma">Aroma</option>
                                  <option value="Mash">Mash</option>
                                  <option value="First Wort">First Wort</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localHopObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="crud-save-button" type="submit">
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </Modal>
    );
}

export function UpdateMiscModal({ isOpen, closeModal, selectedMisc, handleUpdateMiscRecipe }) {
    const [localMiscObject, setLocalMiscObject] = useState(null);

    // Atualiza o estado local sempre que o Misc recebido como prop mudar
    useEffect(() => {
        if (selectedMisc) {
            setLocalMiscObject(selectedMisc);
        }
    }, [selectedMisc]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalMiscObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    // Manipula o botão de salvar
    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localMiscObject) {
            handleUpdateMiscRecipe(localMiscObject); // Salva alterações
        }
        closeModal(); // Fecha a modal
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Misc Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            {localMiscObject ? (
                <form onSubmit={handleSaveButton}>
                    <div className="modal">
                        <h2>Update Misc</h2>
                        <label htmlFor="name">Name</label>
                        <input 
                            placeholder="Name"
                            value={localMiscObject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Description"
                            value={localMiscObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                        
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Time</label>
                                <input 
                                    placeholder="Time"
                                    type="number"
                                    value={localMiscObject.time || ''}
                                    onChange={(e) => handleChange('time', e.target.value)}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Type</label>
                                <select
                                  value={localMiscObject.type}
                                  onChange={(e) =>
                                    setLocalMiscObject((prev) => ({
                                      ...prev,
                                      type: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Flavor">Flavor</option>
                                  <option value="Fining">Fining</option>
                                  <option value="Herb">Herb</option>
                                  <option value="Spice">Spice</option>
                                  <option value="Water Agent">Water Agent</option>
                                  <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Use</label>
                                <select
                                  value={localMiscObject.use}
                                  onChange={(e) =>
                                    setLocalMiscObject((prev) => ({
                                      ...prev,
                                      use: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Boil">Boil</option>
                                  <option value="Bottling">Bottling</option>
                                  <option value="Flameout">Flameout</option>
                                  <option value="Mash">Mash</option>
                                  <option value="Primary">Primary</option>
                                  <option value="Secundary">Secundary</option>
                                  <option value="Sparge">Sparge</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localMiscObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                                </div>
                        </div>
                        <button className="crud-save-button" type="submit">
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </Modal>
    );
}

export function UpdateYeastModal({ isOpen, closeModal, selectedYeast, handleUpdateYeastRecipe }) {
    const [localYeastObject, setLocalYeastObject] = useState(null);

    // Atualiza o estado local sempre que o Yeast recebido como prop mudar
    useEffect(() => {
        if (selectedYeast) {
            setLocalYeastObject(selectedYeast);
        }
    }, [selectedYeast]);

    // Atualiza o estado local com base nos campos do formulário
    const handleChange = (key, value) => {
        setLocalYeastObject((prev) => ({
            ...prev,
            [key]: key === "colorDegreesLovibond" || 
                  key === "potentialExtract" 
                  ? parseFloat(value) || 0 // Garante que números sejam tratados corretamente
                  : value,
        }));
    };

    // Manipula o botão de salvar
    const handleSaveButton = (e) => {
        e.preventDefault();
        if (localYeastObject) {
            handleUpdateYeastRecipe(localYeastObject); // Salva alterações
        }
        closeModal(); // Fecha a modal
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Yeasts Modal"
            className="modal-content"  // Classe CSS para o conteúdo
            overlayClassName="modal-overlay"  // Classe CSS para o overlay
        >
            {localYeastObject ? (
                <form onSubmit={handleSaveButton}>
                    <div className="modal">
                        <h2>Update Yeast</h2>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Name</label>
                                <input 
                                    placeholder="Yeast Name"
                                    value={localYeastObject.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Manufacturer</label>
                                <input 
                                    placeholder="Manufacturer"
                                    value={localYeastObject.manufacturer || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                        <label htmlFor="name">Description</label>
                        <textarea 
                            placeholder="Description"
                            value={localYeastObject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />

                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Type</label>
                                <select
                                  value={localYeastObject.type}
                                  onChange={(e) =>
                                    setLocalYeastObject((prev) => ({
                                      ...prev,
                                      type: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Ale">Ale</option>
                                  <option value="Lager">Lager</option>
                                  <option value="Hybrid">Hybrid</option>
                                  <option value="Champagne">Champagne</option>
                                  <option value="Wheat">Wheat</option>
                                  <option value="Wine">Wine</option>
                                  <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Form</label>
                                <select
                                  value={localYeastObject.form}
                                  onChange={(e) =>
                                    setLocalYeastObject((prev) => ({
                                      ...prev,
                                      form: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Ale">Dry</option>
                                  <option value="Lager">Liquid</option>
                                  <option value="Hybrid">Culture</option>
                                  <option value="Champagne">Slurry</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Flocculation</label>
                                <select
                                  value={localYeastObject.flocculation}
                                  onChange={(e) =>
                                    setLocalYeastObject((prev) => ({
                                      ...prev,
                                      flocculation: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Temperature Range</label>
                                <input 
                                    placeholder="Temperature Range"
                                    value={localYeastObject.temperatureRange || ''}
                                    onChange={(e) => handleChange('temperatureRange', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Attenuation</label>
                                <input 
                                    placeholder="Attenuation"
                                    value={localYeastObject.attenuation || ''}
                                    onChange={(e) => handleChange('attenuation', e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label htmlFor="name">Alcohol Tolerance</label>
                                <input 
                                    placeholder="Alcohol Tolerance"
                                    value={localYeastObject.alcoholTolerance || ''}
                                    onChange={(e) => handleChange('alcoholTolerance', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="inputs-row">
                            <div className="input-field">
                                <label htmlFor="name">Quantity</label>
                                <input 
                                    placeholder="Quantity"
                                    type="number"
                                    value={localYeastObject.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button className="crud-save-button" type="submit">
                        Save
                    </button>
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </Modal>
    );
}