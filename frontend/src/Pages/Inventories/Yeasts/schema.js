import * as Yup from 'yup';

const schema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .max(100, 'Name must be at most 100 characters'),

  manufacturer: Yup.string()
    .nullable()
    .max(100, 'Manufacturer must be at most 100 characters'),

  description: Yup.string()
    .nullable()
    .max(1000, 'Description must be at most 1000 characters'),

  flavorProfile: Yup.string()
    .nullable()
    .max(200, 'Flavor Profile must be at most 200 characters'),

  type: Yup.string()
    .oneOf(
      ['Ale', 'Lager', 'Hybrid', 'Champagne', 'Wheat', 'Wine', 'Other'],
      'Invalid type',
    )
    .required('Type is required'),

  form: Yup.string()
    .oneOf(
      ['Dry', 'Liquid', 'Culture', 'Slurry'],
      'Invalid form',
    )
    .required('Form is required'),

  attenuation: Yup.number()
    .nullable()
    .typeError('Attenuation must be a number')
    .min(0, 'Attenuation must be at least 0%')
    .max(100, 'Attenuation must be at most 100%'),

  temperatureRange: Yup.string()
    .nullable()
    .max(100, 'Temperature range must be at most 100 characters'),

  flocculation: Yup.string()
    .oneOf(
      ['Low', 'Medium', 'Medium - High', 'High', 'Very High'],
      'Invalid form',
    )
    .max(100, 'Flocculation must be at most 100 characters'),
});

export default schema;
