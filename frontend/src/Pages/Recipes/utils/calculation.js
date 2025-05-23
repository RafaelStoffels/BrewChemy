export const calculateOG = (recipe) => {
  if (!recipe || !recipe.recipeFermentables || recipe.recipeFermentables.length === 0) {
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
  let attenuation = 100;

  recipe.recipeYeasts.forEach((yeast) => {
    if (yeast.attenuation < attenuation) {
      attenuation = yeast.attenuation;
    }
  });

  const FG = OGResult - ((OGResult - 1) * (attenuation / 100));
  return FG.toFixed(3);
};

export const calculateEBC = (recipe) => {
  let totalEBC = 0;

  recipe.recipeFermentables.forEach((fermentable) => {
    const weightKg = fermentable.quantity / 1000;
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

  /*
  if (!recipe.recipeEquipment?.batchVolume || recipe.recipeEquipment.batchVolume <= 0) return;

  if (!recipe || !recipe.recipeHops || recipe.recipeHops.length === 0 || OG <= 0) {
    return {
      totalIBU: totalIBU.toFixed(2),
      updatedHops,
      hasChanges,
    };
  }
  */

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

    // Checks if the value has changed before updating
    if (previousIbu !== ibuFixed) {
      hasChanges = true;
      return { ...hop, ibu: ibuFixed };
    }
    return hop;
  });

  // Só atualiza o estado se houver mudanças nos valores do IBU
  // ENTENDER MELHOR ISSO AQUI, PQ PARECE QUE EU NAO POSSO
  // ATUALIZAR UM SET SE EU JA RETORNO VALOR DA FUNCAO
  return {
    totalIBU: totalIBU.toFixed(2),
    updatedHops,
    hasChanges,
  };
}

export const getPreBoilVolume = (recipe) => {
  const preBoilCalc = recipe.recipeEquipment.batchVolume
                    + recipe.recipeEquipment.deadSpace
                    + (recipe.recipeEquipment.boilOff * (recipe.recipeEquipment.boilTime / 60))
                    + recipe.recipeEquipment.trubLoss;

  return preBoilCalc.toFixed(3);
};

export const getIngredientsPorcentage = (recipe, setRecipe) => {
  let hasChanges = false;

  const totalQuantity = recipe.recipeFermentables
    .reduce((total, item) => total + (item.quantity || 0), 0);

  const updatedFermentables = recipe.recipeFermentables.map((fermentable) => {
    const { quantity, percentage: previousPercentage } = fermentable;

    if (!quantity || totalQuantity === 0) {
      return fermentable;
    }

    const percentageFixed = ((quantity / totalQuantity) * 100).toFixed(2);

    // if `previousPercentage` is undefined, compare with `fermentable.percentage`
    if (previousPercentage !== percentageFixed) {
      hasChanges = true;
      return { ...fermentable, percentage: percentageFixed };
    }

    return fermentable;
  });

  if (hasChanges) {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      recipeFermentables: updatedFermentables,
    }));
  }
};
