// src/utils/displayUnits.js
export const GRAMS_PER_OUNCE = 28.349523125;
export const LITERS_PER_GALLON = 3.78541;

const round = (n, d) => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

// -------- WEIGHT --------
export function toDisplayWeight(grams, unit, decimalsMap = { oz: 2, g: 0, kg: 3 }) {
  if (grams == null) return '';
  if (unit === 'oz') return round(grams / GRAMS_PER_OUNCE, decimalsMap.oz);
  if (unit === 'kg') {
    const n = round(grams / 1000, decimalsMap.kg);
    return n.toFixed(3);
  }
  return round(grams, decimalsMap.g);
}

export function formatWeight(grams, unit, decimalsMap) {
  const val = toDisplayWeight(grams, unit, decimalsMap);
  return `${val} ${unit}`;
}

// -------- VOLUME --------
export function toDisplayVolume(liters, unit, decimalsMap = { gal: 2, l: 2, ml: 0 }) {
  if (liters == null) return '';
  if (unit === 'gal') return round(liters / LITERS_PER_GALLON, decimalsMap.gal);
  if (unit === 'ml') return round(liters * 1000, decimalsMap.ml);
  if (unit === 'l') return liters;
  return round(liters, decimalsMap.l); // 'l'
}

export function formatVolume(liters, unit, decimalsMap) {
  const val = toDisplayVolume(liters, unit, decimalsMap);
  return `${val} ${unit}`;
}

export function toLiters(value, unit) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  if (unit === 'gal') return n * LITERS_PER_GALLON;
  if (unit === 'ml') return n / 1000;
  return n; // 'l'
}

export function toDisplaySRM(ebc) {
  if (!ebc || isNaN(ebc)) return null;
  return (ebc / 1.97).toFixed(1);
}

export const fromDisplayVolume = toLiters;
