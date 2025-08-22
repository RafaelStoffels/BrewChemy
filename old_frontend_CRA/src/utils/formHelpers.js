import { ouncesToGrams } from './unitConversion';

export default function normalizeWeightForSave(quantityInput, userWeightUnit, precision = 3) {
  const n = typeof quantityInput === 'string'
    ? parseFloat(quantityInput.replace(',', '.'))
    : quantityInput;

  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('Quantity must be a positive number.');
  }

  const grams = userWeightUnit === 'oz'
    ? Math.round((ouncesToGrams(n) + Number.EPSILON) * 1e6) / 1e6
    : n;

  const factor = 10 ** precision;
  return Math.round((grams + Number.EPSILON) * factor) / factor;
}
