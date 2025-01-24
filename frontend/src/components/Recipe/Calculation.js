export const calculateOG = (recipe) => {
    const volumeLiters = 23;
    const efficiency = 0.75;
    const volumeGallons = volumeLiters / 3.78541;

    // Validações iniciais
    if (!recipe || !recipe.recipeFermentables || recipe.recipeFermentables.length === 0) {
        console.error("recipe.recipeFermentables está vazio ou indefinido.");
        return "1.000"; // Valores padrão em caso de erro
    }

    let totalGravityPoints = 0;

    recipe.recipeFermentables.forEach((fermentable) => {
        const weightKg = fermentable.weightGrams / 1000; // Converte gramas para quilogramas
        const weightLb = weightKg * 2.20462;             // Converte quilogramas para libras
        const potential = fermentable.potentialExtract || 1.036; // Valor padrão caso não esteja definido

        const gravityPoints = (potential - 1) * 1000; // Pontos de gravidade para o fermentável

        totalGravityPoints += weightLb * gravityPoints * efficiency;
    });

    const OG = (totalGravityPoints / volumeGallons) / 1000 + 1;

    return OG.toFixed(3); // Retorna o OG formatado e placeholder para ABV
};

export const calculateEBC = (recipe) => {

    const volumeLiters = 23;

    if (!volumeLiters || volumeLiters <= 0) {
        throw new Error("Volume deve ser maior que 0.");
    }

    let totalEBC = 0;

    recipe.recipeFermentables.forEach((fermentable) => {
        const weightKg = fermentable.weightGrams / 1000;
        const ebc = fermentable.ebc || 0;

        totalEBC += weightKg * ebc;
    });

    const EBCValue = (totalEBC / volumeLiters) * 4.23;

    return EBCValue.toFixed(1);
};

export const calculateIBU = (recipe, OG) => {
    const volumeLiters = 23;
    
    if (!recipe || !recipe.recipeHops || recipe.recipeHops.length === 0 || volumeLiters <= 0 || OG <= 0) {
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

      const ibu = ((utilization * (alphaAcidContent / 100) * amount * 1000) / volumeLiters);
  
      totalIBU += ibu;
    });

    return totalIBU.toFixed(2);
  };