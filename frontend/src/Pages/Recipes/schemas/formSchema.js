import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Recipe Name is required'),
  author: yup.string().notRequired(),
  style: yup.string().required(),
  type: yup.string()
    .oneOf(['All Grain', 'Extract', 'Partial Mash'], 'Invalid type')
    .required('Type is required'),

  description: yup.string().notRequired(),

  recipeEquipment: yup.object().shape({
    name: yup.string().notRequired(),
    batchVolume: yup
      .number()
      .typeError('Batch Volume must be a number')
      .positive('Batch Volume must be positive')
      .required(),
    batchTime: yup
      .number()
      .typeError('Batch Time must be a number')
      .positive('Batch Time must be positive')
      .required(),
    efficiency: yup
      .number()
      .typeError('Efficiency must be a number')
      .min(0, 'Efficiency cannot be less than 0')
      .max(100, 'Efficiency cannot be more than 100')
      .required(),
    boilTime: yup
      .number()
      .typeError('Boil Time must be a number')
      .positive('Boil Time must be positive')
      .required(),
  }),
});

export default schema;
