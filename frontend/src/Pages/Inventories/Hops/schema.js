import * as Yup from 'yup';

const schema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .max(100, 'Name must be at most 100 characters'),

  supplier: Yup.string()
    .required('Supplier is required')
    .max(100, 'Supplier must be at most 100 characters'),

  description: Yup.string()
    .nullable()
    .max(1000, 'Description must be at most 1000 characters'),

  countryOfOrigin: Yup.string()
    .nullable()
    .max(100, 'Country of Origin must be at most 100 characters'),

  type: Yup.string()
    .oneOf(['Pellet', 'Whole', 'Cryo', 'CO2 Extract'], 'Invalid hop type')
    .required('Type is required'),

  useType: Yup.string()
    .oneOf(['Boil', 'Dry Hop', 'Aroma', 'Mash', 'First Wort'], 'Invalid use type')
    .required('Use Type is required'),

  alphaAcidContent: Yup.number()
    .nullable()
    .typeError('Alpha Acid must be a number')
    .min(0, 'Alpha Acid cannot be negative')
    .max(100, 'Alpha Acid cannot exceed 100'),

  betaAcidContent: Yup.number()
    .nullable()
    .typeError('Beta Acid must be a number')
    .min(0, 'Beta Acid cannot be negative')
    .max(100, 'Beta Acid cannot exceed 100'),
});

export default schema;
