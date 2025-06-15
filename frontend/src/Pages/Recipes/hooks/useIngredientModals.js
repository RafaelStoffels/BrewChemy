import { useState } from 'react';
import { fetchFermentables } from '../../../services/fermentables';
import { fetchHops } from '../../../services/hops';
import { fetchMisc } from '../../../services/misc';
import { fetchYeasts } from '../../../services/yeasts';
import { showErrorToast } from '../../../utils/notifications';

const MODALS = {
  FERMENTABLE: 'fermentable',
  HOP: 'hop',
  MISC: 'misc',
  YEAST: 'yeast',
  UPDATE_FERMENTABLE: 'update_fermentable',
  UPDATE_HOP: 'update_hop',
  UPDATE_MISC: 'update_misc',
  UPDATE_YEAST: 'update_yeast',
  CHANGE_EQUIPMENT: 'change_equipment',
};

export default function useIngredientModals(token) {
  const [activeModal, setActiveModal] = useState(null);
  const [fermentableList, setFermentableList] = useState([]);
  const [hopList, setHopList] = useState([]);
  const [miscList, setMiscList] = useState([]);
  const [yeastList, setYeastList] = useState([]);

  const [selectedFermentable, setSelectedFermentable] = useState(null);
  const [selectedHop, setSelectedHop] = useState(null);
  const [selectedMisc, setSelectedMisc] = useState(null);
  const [selectedYeast, setSelectedYeast] = useState(null);

  const openModal = async (type) => {
    setActiveModal(type);

    const loaders = {
      [MODALS.FERMENTABLE]: async () => setFermentableList(await fetchFermentables(token)),
      [MODALS.HOP]: async () => setHopList(await fetchHops(token)),
      [MODALS.MISC]: async () => setMiscList(await fetchMisc(token)),
      [MODALS.YEAST]: async () => setYeastList(await fetchYeasts(token)),
    };

    if (loaders[type]) {
      try {
        await loaders[type]();
      } catch (err) {
        showErrorToast('Erro ao carregar dados do modal.');
      }
    }
  };

  const closeModal = () => setActiveModal(null);

  return {
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
    MODALS, // exporta para reutilizar na tela
  };
}
