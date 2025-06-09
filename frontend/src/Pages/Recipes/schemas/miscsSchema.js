import * as Yup from 'yup';

const validTypes = [
  'Flavor',
  'Fining',
  'Herb',
  'Spice',
  'Water Agent',
  'Other',
];

const validUses = [
  'Boil',
  'Bottling',
  'Flameout',
  'Mash',
  'Primary',
  'Secundary',
  'Sparge',
];

// Schema para adicionar um item misc
export const addMiscSchema = Yup.object().shape({
  selectedItem: Yup.object()
    .required('Please select an item'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
});

// Schema para atualizar um item misc
export const updateMiscSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: Yup.string()
    .nullable(),
  time: Yup.number()
    .typeError('Time must be a number')
    .min(0, 'Time must be 0 or more')
    .required('Time is required'),
  type: Yup.string()
    .oneOf(validTypes, 'Invalid type')
    .required('Type is required'),
  use: Yup.string()
    .oneOf(validUses, 'Invalid use')
    .required('Use is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
});
