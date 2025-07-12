import * as Yup from 'yup';

const validUseTypes = [
  'Boil',
  'Dry Hop',
  'Whirlpool',
  'Mash',
  'First Wort',
];

export const addHopSchema = Yup.object().shape({
  selectedItem: Yup.object()
    .required('Please select a hop.'),
  boilTime: Yup.number()
    .typeError('Boil time must be a number.')
    .min(0, 'Boil time must be 0 or more.')
    .required('Boil time is required.'),
  alphaAcid: Yup.number()
    .typeError('Alpha acid must be a number.')
    .min(0, 'Alpha acid must be 0 or more.')
    .required('Alpha acid is required.'),
  quantity: Yup.number()
    .typeError('Quantity must be a number.')
    .positive('Quantity must be greater than zero.')
    .required('Quantity is required.'),
});

export const updateHopSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: Yup.string()
    .nullable(),
  alphaAcidContent: Yup.number()
    .typeError('Alpha Acid must be a number.')
    .min(0, 'Alpha Acid must be 0 or more.')
    .notRequired('Alpha Acid is required.'),
  betaAcidContent: Yup.number()
    .typeError('Beta Acid must be a number.')
    .min(0, 'Beta Acid must be 0 or more.')
    .nullable(),
  boilTime: Yup.number()
    .typeError('Boil time must be a number.')
    .min(0, 'Boil time must be 0 or more.')
    .notRequired('Boil time is required.'),
  useType: Yup.string()
    .oneOf(validUseTypes, 'Invalid use type.')
    .required('Use type is required.'),
  quantity: Yup.number()
    .typeError('Quantity must be a number.')
    .positive('Quantity must be greater than zero.')
    .required('Quantity is required.'),
});
