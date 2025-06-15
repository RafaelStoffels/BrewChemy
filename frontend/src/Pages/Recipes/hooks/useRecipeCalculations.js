import { useEffect } from 'react';
import {
  calculateOG,
  calculateFG,
  calculateIBU,
  calculateEBC,
  getPreBoilVolume,
  getIngredientsPorcentage,
} from '../utils/calculation';

import getBeerColor from '../utils/getBeerColor';

export default function useRecipeCalculations({
  watchedBatchVolume,
  watchedEfficiency,
  watchedBoilTime,
  recipeEquipment,
  recipeFermentables,
  IBU,
  OG,
  FG,
  setOG,
  setFG,
  setEBC,
  setIBU,
  setABV,
  setBUGU,
  setpreBoilVolume,
  getValues,
  setValue,
}) {
  useEffect(() => {
    const recipeData = getValues();

    // calculate OG
    const OGResult = calculateOG(recipeData);
    setOG(OGResult);

    // calculate FG
    const FGResult = calculateFG(recipeData, OGResult);
    setFG(FGResult);

    // calculate IBU
    const IBUresult = calculateIBU(recipeData, OGResult);
    if (IBUresult?.totalIBU) {
      const { totalIBU, hasChanges, updatedHops } = IBUresult;
      setIBU(parseFloat(totalIBU));

      if (hasChanges) {
        const currentHops = getValues('recipeHops');
        if (JSON.stringify(currentHops) !== JSON.stringify(updatedHops)) {
          setValue('recipeHops', updatedHops);
        }
      }
    } else {
      setIBU(0);
    }

    // calculate GU and BU:GU
    const GU = (OGResult - 1) * 1000;
    if (IBU) {
      setBUGU((IBU / GU).toFixed(2));
    }

    // calculate percentage of fermentables
    if (recipeData?.recipeFermentables?.length) {
      const newPercentages = getIngredientsPorcentage(recipeData.recipeFermentables);
      const currentPercentages = getValues('recipeFermentables');

      if (JSON.stringify(currentPercentages) !== JSON.stringify(newPercentages)) {
        setValue('recipeFermentables', newPercentages);
      }
    } else {
      setABV(0);
    }
  }, [watchedBatchVolume, watchedEfficiency, recipeFermentables, IBU]);

  useEffect(() => {
    const recipeData = getValues();

    const preBoilCalc = getPreBoilVolume(recipeData);
    if (preBoilCalc > 0) {
      setpreBoilVolume(preBoilCalc);
    }
  }, [watchedBatchVolume, watchedBoilTime, recipeEquipment]);

  useEffect(() => {
    const recipeData = getValues();

    const EBCResult = calculateEBC(recipeData);
    setEBC(EBCResult);

    if (EBCResult) {
      const color = getBeerColor(EBCResult);
      const svgObject = document.querySelector('.beer-object');

      if (svgObject?.contentDocument) {
        const svgDoc = svgObject.contentDocument;
        const gradients = svgDoc.querySelectorAll('linearGradient, radialGradient');

        gradients.forEach((gradient) => {
          gradient.querySelectorAll('stop').forEach((stop) => {
            stop.setAttribute('stop-color', color);
          });
        });
      }
    }
  }, [watchedBatchVolume, recipeFermentables]);

  useEffect(() => {
    if (OG && FG) {
      const abvValue = ((OG - FG) * 131.25).toFixed(2);
      setABV(abvValue > 0 ? abvValue : 0);
    }
  }, [OG, FG]);
}
