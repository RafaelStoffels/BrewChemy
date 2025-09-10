export const calculateOG = (recipe) => {
  if (
    !recipe
    || !Array.isArray(recipe.recipeFermentables)
    || recipe.recipeFermentables.length === 0
    || !recipe.recipeEquipment
    || !recipe.recipeEquipment.batchVolume
    || !recipe.recipeEquipment.efficiency
  ) {
    return '1.000';
  }

  const volumeGallons = recipe.recipeEquipment.batchVolume / 3.78541;

  let totalGravityPoints = 0;

  recipe.recipeFermentables.forEach((fermentable) => {
    const weightKg = fermentable.quantity / 1000;
    const weightLb = weightKg * 2.20462;
    const potential = fermentable.potentialExtract || 1.036;

    const gravityPoints = (potential - 1) * 1000;

    totalGravityPoints += weightLb * gravityPoints * (recipe.recipeEquipment.efficiency / 100);
  });

  const OG = (totalGravityPoints / volumeGallons) / 1000 + 1;

  return OG.toFixed(3);
};

export const calculateFG = (recipe, OGResult) => {
  let attenuation = 75;

  if (recipe.recipeYeasts && recipe.recipeYeasts.length > 0) {
    attenuation = Math.max(
      ...recipe.recipeYeasts
        .filter((yeast) => yeast.attenuation)
        .map((yeast) => yeast.attenuation)
    );
  }

  const FG = OGResult - ((OGResult - 1) * (attenuation / 100));
  return FG.toFixed(3);
};

export const calculateEBC = (recipe) => {
  if (
    !recipe
    || !Array.isArray(recipe.recipeFermentables)
    || recipe.recipeFermentables.length === 0
    || !recipe.recipeEquipment
    || !recipe.recipeEquipment.batchVolume
  ) {
    return '0.00';
  }

  let totalEBC = 0;

  recipe.recipeFermentables.forEach((fermentable) => {
    const weightKg = fermentable.quantity ? fermentable.quantity / 1000 : 0;
    const ebc = fermentable.ebc || 0;

    totalEBC += (weightKg * ebc) / recipe.recipeEquipment.batchVolume;
  });

  /* Calculation taken from the forum: https://www.jimsbeerkit.co.uk/forum/viewtopic.php?t=26000
  const efficiencyFactor = recipe.recipeEquipment.efficiency / 100;
  const numerator = totalEBC * 10 * efficiencyFactor;
  const EBCValue = numerator / recipe.recipeEquipment.batchVolume; */

  //  Same as above but without considering efficiency
  const EBCValue = totalEBC * 10;

  return EBCValue.toFixed(2);
};

export function calculateIBU(recipe, OG) {
  let totalIBU = 0;
  let hasChanges = false;

  // Validações iniciais para evitar erros
  if (
    !recipe
    || !Array.isArray(recipe.recipeHops)
    || recipe.recipeHops.length === 0
    || !recipe.recipeEquipment
    || !recipe.recipeEquipment.batchVolume
    || recipe.recipeEquipment.batchVolume <= 0
    || OG <= 0
  ) {
    return {
      totalIBU: totalIBU.toFixed(2),
      updatedHops: [],
      hasChanges,
    };
  }

  const updatedHops = recipe.recipeHops.map((hop) => {
    const {
      quantity, alphaAcidContent, boilTime, ibu: previousIbu,
    } = hop;

    if (!quantity || !alphaAcidContent) {
      return hop;
    }

    const utilization = (1.65 * 0.000125 ** (OG - 1))
                        * ((1 - Math.exp(-0.04 * boilTime)) / 4.15);

    const { batchVolume } = recipe.recipeEquipment;
    const ibu = (utilization * (alphaAcidContent / 100) * quantity * 1000) / batchVolume;

    const ibuFixed = ibu.toFixed(2);

    totalIBU += ibu;

    if (previousIbu !== ibuFixed) {
      hasChanges = true;
      return { ...hop, ibu: ibuFixed };
    }
    return hop;
  });

  return {
    totalIBU: totalIBU.toFixed(2),
    updatedHops,
    hasChanges,
  };
}

export const getPreBoilVolume = (recipe) => {
  const equipment = recipe.recipeEquipment || {};

  const batchVolume = Number(equipment.batchVolume) || 0;
  const deadSpace = Number(equipment.deadSpace) || 0;
  const boilOff = Number(equipment.boilOff) || 0;
  const boilTime = Number(equipment.boilTime) || 0;
  const trubLoss = Number(equipment.trubLoss) || 0;
  const preBoilCalc = batchVolume
                    + deadSpace
                    + (boilOff * (boilTime / 60))
                    + trubLoss;

  return preBoilCalc.toFixed(3);
};

export const getIngredientsPorcentage = (recipeFermentables) => {
  if (!Array.isArray(recipeFermentables)) return [];

  const totalQuantity = recipeFermentables.reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );

  return recipeFermentables.map((fermentable) => {
    const { quantity } = fermentable;

    if (!quantity || totalQuantity === 0) {
      return { ...fermentable, percentage: '0.00' };
    }

    const percentageFixed = ((quantity / totalQuantity) * 100).toFixed(2);
    return { ...fermentable, percentage: percentageFixed };
  });
};
