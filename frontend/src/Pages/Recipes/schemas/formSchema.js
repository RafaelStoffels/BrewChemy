import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Recipe Name is required'),
  author: yup.string().notRequired(),
  style: yup.string().notRequired(),
  type: yup.string()
    .oneOf(['All Grain', 'Extract', 'Partial Mash'], 'Invalid type')
    .required('Type is required'),
  creationDate: yup
    .date()
    .typeError('Creation Date must be a valid date')
    .notRequired(),

  description: yup.string().notRequired(),

  recipeEquipment: yup.object().shape({
    name: yup.string().notRequired(),
    batchVolume: yup
      .number()
      .typeError('Batch Volume must be a number')
      .positive('Batch Volume must be positive')
      .notRequired(),
    batchTime: yup
      .number()
      .typeError('Batch Time must be a number')
      .positive('Batch Time must be positive')
      .notRequired(),
    efficiency: yup
      .number()
      .typeError('Efficiency must be a number')
      .min(0, 'Efficiency cannot be less than 0')
      .max(100, 'Efficiency cannot be more than 100')
      .notRequired(),
    boilTime: yup
      .number()
      .typeError('Boil Time must be a number')
      .positive('Boil Time must be positive')
      .notRequired(),
  }),
});

export default schema;
