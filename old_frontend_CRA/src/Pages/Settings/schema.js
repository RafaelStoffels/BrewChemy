import * as yup from 'yup';

const schema = yup.object().shape({
  weight: yup.string()
    .oneOf(['oz', 'g'], 'Select oz or g')
    .required('Weight is required'),
});

export default schema;
