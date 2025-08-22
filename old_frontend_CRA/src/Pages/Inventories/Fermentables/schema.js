import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name must not be empty.')
    .max(50, 'Name must be at most 50 characters long.'),

  supplier: yup
    .string()
    .trim()
    .max(50, 'Supplier must be at most 50 characters long.')
    .nullable(),

  description: yup
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters long.')
    .nullable(),

  type: yup
    .string()
    .oneOf(['Base', 'Specialty', 'Adjunct'], 'Invalid type.')
    .required('Type is required.'),

  ebc: yup
    .number()
    .typeError('Color Degree must be a number.')
    .min(0, 'Color Degree cannot be negative.')
    .max(1000, 'Color Degree must be at most 1000.')
    .nullable(),

  potentialExtract: yup
    .number()
    .typeError('Potential Extract must be a number.')
    .min(0, 'Potential Extract must be at least 0.')
    .max(100, 'Potential Extract must be at most 100.')
    .nullable(),

});

export default schema;
