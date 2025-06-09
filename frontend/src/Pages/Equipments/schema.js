import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name must not be empty.')
    .max(50, 'Name must be at most 50 characters long.'),

  description: yup
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters long.')
    .nullable(),

  efficiency: yup
    .number()
    .typeError('Efficiency must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Efficiency must be between 0 and 1.100.')
    .max(1100, 'Efficiency must be between 0 and 1.100.')
    .required('Efficiency is required.'),

  batchVolume: yup
    .number()
    .typeError('Batch volume must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Batch volume must be greater than or equal to 0.')
    .required('Batch volume is required.'),

  batchTime: yup
    .number()
    .typeError('Batch time must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Batch time must be greater than or equal to 0.')
    .required('Batch time is required.'),

  boilTime: yup
    .number()
    .typeError('Boil time must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Boil time must be greater than or equal to 0.')
    .required('Boil time is required.'),

  boilTemperature: yup
    .number()
    .typeError('Boil temperature must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Boil temperature must be between 0 and 100°C.')
    .max(100, 'Boil temperature must be between 0 and 100°C.')
    .required('Boil temperature is required.'),

  boilOff: yup
    .number()
    .typeError('Boil-off must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Boil-off must be greater than or equal to 0.')
    .required('Boil-off is required.'),

  trubLoss: yup
    .number()
    .typeError('Trub loss must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Trub loss must be greater than or equal to 0.')
    .required('Trub loss is required.'),

  deadSpace: yup
    .number()
    .typeError('Dead space must be a number.')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Dead space must be greater than or equal to 0.')
    .required('Dead space is required.'),
});

export default schema;
