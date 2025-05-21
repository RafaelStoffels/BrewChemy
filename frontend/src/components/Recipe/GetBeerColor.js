const getBeerColor = (EBC) => {
  if (EBC >= 0 && EBC <= 2) return '#FFE699'; // Very pale, almost transparent
  if (EBC <= 4) return '#FFE37A'; // Light straw yellow
  if (EBC <= 6) return '#FFD878'; // Golden yellow
  if (EBC <= 8) return '#FFCA5A'; // Light gold
  if (EBC <= 10) return '#FFBF42'; // Standard gold
  if (EBC <= 12) return '#FFB742'; // Deep gold
  if (EBC <= 14) return '#FFA846'; // Light orange
  if (EBC <= 17) return '#F49C44'; // Medium orange
  if (EBC <= 20) return '#E98F36'; // Light amber
  if (EBC <= 23) return '#D77A32'; // Medium amber
  if (EBC <= 26) return '#BF5B23'; // Dark amber
  if (EBC <= 29) return '#A64F1E'; // Light brown
  if (EBC <= 32) return '#8E3C1A'; // Medium brown
  if (EBC <= 35) return '#6F2F1A'; // Reddish brown
  if (EBC <= 40) return '#5D2614'; // Dark brown
  if (EBC <= 45) return '#4E1F0D'; // Intense brown
  if (EBC <= 50) return '#3B1E0E'; // Black with brown highlights
  if (EBC <= 55) return '#2E160B'; // Black with brown edges
  if (EBC <= 60) return '#26150C'; // Opaque black with soft highlights
  if (EBC <= 70) return '#1C1009'; // Deep black with brown edges
  if (EBC <= 80) return '#16100C'; // Intense opaque black
  if (EBC <= 90) return '#0F0D08'; // Very deep black
  if (EBC <= 100) return '#080707'; // Absolute black
  return '#000000'; // Total black, no highlights
};

export default getBeerColor;
