import * as yup from 'yup';

export const addFermentableSchema = yup.object().shape({
  selectedItem: yup.object().required('Please select an item'),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
});

export const updateFermentableSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: yup
    .string()
    .nullable(),
  type: yup
    .string()
    .oneOf(['base', 'especial', 'adjunct'], 'Invalid fermentable type')
    .required('Fermentable Type is required'),
  supplier: yup
    .string()
    .nullable(),
  ebc: yup
    .number()
    .typeError('EBC must be a number')
    .min(0, 'EBC cannot be negative')
    .nullable(),
  potentialExtract: yup
    .number()
    .typeError('Potential Extract must be a number')
    .min(0, 'Potential Extract cannot be negative')
    .nullable(),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
});
