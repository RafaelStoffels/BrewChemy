/*
function roundOG(value, precision = 3) {
    // Multiplica o valor pela potência de 10 para mover a vírgula
    const factor = Math.pow(10, precision);
    
    // Arredonda o valor
    const roundedValue = Math.round(value * factor) / factor;

    return roundedValue;
}*/

export const calculateOG = (recipe) => {
    if (!recipe.recipeEquipment || !recipe.recipeEquipment.batchVolume || recipe.recipeEquipment.batchVolume <= 0) {
        console.error("Volume deve ser maior que 0 para calcular a OG.");
    }

    if (!recipe.recipeEquipment || !recipe.recipeEquipment.efficiency || recipe.recipeEquipment.efficiency <= 0) {
        console.error("Eficiencia deve ser maior que 0 para calcular a OG.");
    }

    if (!recipe || !recipe.recipeFermentables || recipe.recipeFermentables.length === 0) {
        console.error("recipe.recipeFermentables está vazio ou indefinido.");
        return "1.000";
    }

    console.log("Calculate og- efficiency: " + recipe.recipeEquipment.efficiency);
    console.log("Calculate og- batchVolume: " + recipe.recipeEquipment.batchVolume);

    const volumeGallons = recipe.recipeEquipment.batchVolume / 3.78541;

    let totalGravityPoints = 0;

    recipe.recipeFermentables.forEach((fermentable) => {
        const weightKg = fermentable.weightGrams / 1000;
        const weightLb = weightKg * 2.20462;
        const potential = fermentable.potentialExtract || 1.036;

        const gravityPoints = (potential - 1) * 1000;

        totalGravityPoints += weightLb * gravityPoints * (recipe.recipeEquipment.efficiency / 100);
    });

    const OG = (totalGravityPoints / volumeGallons) / 1000 + 1;
    
/*
    console.log("OG: " + OG);
    
    const roundedOG = roundOG(OG, 3);

    console.log("roundedOG: " + roundedOG);
*/
    return OG.toFixed(3);
};

export const calculateEBC = (recipe) => {

    if (!recipe.recipeEquipment || !recipe.recipeEquipment.batchVolume || recipe.recipeEquipment.batchVolume <= 0) {
        console.error("Volume deve ser maior que 0 para calcular EBC.");
    }

    let totalEBC = 0;

    recipe.recipeFermentables.forEach((fermentable) => {
        const weightKg = fermentable.weightGrams / 1000;
        const ebc = fermentable.ebc || 0;

        totalEBC += weightKg * ebc;
    });

 /*   Calculo retirado no forum: https://www.jimsbeerkit.co.uk/forum/viewtopic.php?t=26000
 const EBCValue = (totalEBC * 10 * 0.75) / recipe.recipeEquipment.batchVolume;
 */

    const EBCValue = totalEBC * 10 / recipe.recipeEquipment.batchVolume;

    return EBCValue.toFixed(2);
};

export const calculateIBU = (recipe, OG) => {

    if (!recipe.recipeEquipment || !recipe.recipeEquipment.batchVolume || recipe.recipeEquipment.batchVolume <= 0) {
        console.error("Volume deve ser maior que 0 para calcular IBU.");
    }
    
    if (!recipe || !recipe.recipeHops || recipe.recipeHops.length === 0 || OG <= 0) {
        console.error("Parâmetros inválidos para o cálculo do IBU.");
    }
  
    let totalIBU = 0;

    recipe.recipeHops.forEach((hop) => {
      const { amount, alphaAcidContent, boilTime } = hop;
  
      if (!amount || !alphaAcidContent) {
        console.error("Informações de lúpulo inválidas.");
      }
  
      const utilization = (1.65 * Math.pow(0.000125, OG - 1)) *
                          ((1 - Math.exp(-0.04 * boilTime)) / 4.15);

      const ibu = ((utilization * (alphaAcidContent / 100) * amount * 1000) / recipe.recipeEquipment.batchVolume);
  
      totalIBU += ibu;
    });

    return totalIBU.toFixed(2);
  };