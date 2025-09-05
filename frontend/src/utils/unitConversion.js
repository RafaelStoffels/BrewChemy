// utils/unitConversion.js
const GRAM_PER_OUNCE = 28.3495;
const LITER_PER_GALLON = 3.78541;

export function gramsToOunces(grams) {
  return grams / GRAM_PER_OUNCE;
}

export function ouncesToGrams(ounces) {
  return ounces * GRAM_PER_OUNCE;
}

export function litersToGallons(liters) {
  return liters / LITER_PER_GALLON;
}

export function gallonsToLiters(gallons) {
  return gallons * LITER_PER_GALLON;
}

export default gramsToOunces;