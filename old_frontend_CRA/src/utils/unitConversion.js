// utils/unitConversion.js
const GRAM_PER_OUNCE = 28.3495;

export function gramsToOunces(grams) {
  return grams / GRAM_PER_OUNCE;
}

export function ouncesToGrams(ounces) {
  return ounces * GRAM_PER_OUNCE;
}

export default gramsToOunces;
