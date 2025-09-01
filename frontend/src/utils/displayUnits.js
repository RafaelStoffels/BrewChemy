// src/utils/displayUnits.js
export const GRAMS_PER_OUNCE = 28.349523125;

const round = (n, d) => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

export function toDisplayWeight(grams, unit, decimalsMap = { oz: 2, g: 0, kg: 3 }) {
  if (grams == null) return '';
  if (unit === 'oz') return round(grams / GRAMS_PER_OUNCE, decimalsMap.oz);
  if (unit === 'kg') {
    const n = round(grams / 1000, decimalsMap.kg);
    return n.toFixed(3);
  }
  // default g
  return round(grams, decimalsMap.g);
}

export function formatWeight(grams, unit, decimalsMap) {
  const val = toDisplayWeight(grams, unit, decimalsMap);
  return `${val} ${unit}`;
}
