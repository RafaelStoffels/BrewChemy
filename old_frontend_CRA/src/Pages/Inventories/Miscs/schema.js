import * as Yup from 'yup';

const schema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .max(100, 'Name must be at most 100 characters'),

  supplier: Yup.string()
    .nullable()
    .max(100, 'Supplier must be at most 100 characters'),

  description: Yup.string()
    .nullable()
    .max(1000, 'Description must be at most 1000 characters'),

  countryOfOrigin: Yup.string()
    .nullable()
    .max(100, 'Country of origin must be at most 100 characters'),

  type: Yup.string()
    .oneOf(
      ['Flavor', 'Fining', 'Herb', 'Spice', 'Water Agent', 'Other'],
      'Invalid type',
    )
    .required('Type is required'),

  useType: Yup.string()
    .nullable()
    .max(100, 'Use type must be at most 100 characters'),

});

export default schema;
