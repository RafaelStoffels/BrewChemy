import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from '../schemas/formSchema';
import { addRecipe, updateRecipe } from '../../../services/recipes';
import { showErrorToast } from '../../../utils/notifications';

export default function useRecipeForm({ isEditing, recipeId, userToken }) {
  const navigate = useNavigate();

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
    try {
      const payload = { ...data };
      if (isEditing) {
        await updateRecipe(userToken, recipeId, payload);
      } else {
        await addRecipe(userToken, payload);
      }
      navigate('/RecipeList');
    } catch (err) {
      console.error(err);
      showErrorToast('Error saving recipe record.');
    }
  };

  const findFirstErrorMessage = (errorObj) => {
    let foundMessage = null;

    Object.values(errorObj).forEach((value) => {
      if (foundMessage) return;

      if (value?.message) {
        foundMessage = value.message;
      } else if (typeof value === 'object' && value !== null) {
        const nestedMessage = findFirstErrorMessage(value);
        if (nestedMessage) foundMessage = nestedMessage;
      }
    });

    return foundMessage;
  };

  const onError = (errors) => {
    const message = findFirstErrorMessage(errors);
    if (message) {
      showErrorToast(message);
    }
  };

  return {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    onValid,
    onError,

    watchedFields: {
      recipeEquipment: watch('recipeEquipment'),
      recipeFermentables: watch('recipeFermentables'),
      recipeHops: watch('recipeHops'),
      recipeMisc: watch('recipeMisc'),
      recipeYeasts: watch('recipeYeasts'),
      style: watch('style'),
      batchVolume: watch('recipeEquipment.batchVolume'),
      boilTime: watch('recipeEquipment.boilTime'),
      efficiency: watch('recipeEquipment.efficiency'),
    },
  };
}
