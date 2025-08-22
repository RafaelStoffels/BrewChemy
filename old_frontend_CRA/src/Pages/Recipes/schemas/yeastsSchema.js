import * as Yup from 'yup';

const validTypes = [
  'Ale',
  'Lager',
  'Hybrid',
  'Champagne',
  'Wheat',
  'Wine',
  'Other',
];

const validForms = [
  'Dry',
  'Liquid',
  'Culture',
  'Slurry',
];

const validFlocculations = [
  'High',
  'Medium',
  'Low',
];

// Schema para adicionar um item de yeast
export const addYeastSchema = Yup.object().shape({
  selectedItem: Yup.object()
    .required('Please select an item'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
});

// Schema para atualizar um item de yeast
export const updateYeastSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  manufacturer: Yup.string()
    .required('Manufacturer is required'),
  description: Yup.string()
    .nullable(),
  type: Yup.string()
    .oneOf(validTypes, 'Invalid type')
    .required('Type is required'),
  form: Yup.string()
    .oneOf(validForms, 'Invalid form')
    .required('Form is required'),
  flocculation: Yup.string()
    .oneOf(validFlocculations, 'Invalid flocculation')
    .required('Flocculation is required'),
  attenuation: Yup.number()
    .typeError('Attenuation must be a number')
    .min(0, 'Attenuation must be 0 or more')
    .required('Attenuation is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
});
