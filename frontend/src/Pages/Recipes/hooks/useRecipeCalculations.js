import { useState, useEffect } from 'react';
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
  recipeHops,
  recipeYeasts,
  getValues,
  setValue,
  svgRef,
}) {
  const [OG, setOG] = useState(0);
  const [FG, setFG] = useState(0);
  const [IBU, setIBU] = useState(0);
  const [EBC, setEBC] = useState(0);
  const [ABV, setABV] = useState(0);
  const [BUGU, setBUGU] = useState(0);
  const [preBoilVolume, setPreBoilVolume] = useState(0);

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

    // calculate GU and BU:GU (BUGU)
    const GU = (OGResult - 1) * 1000;
    if (GU > 0 && IBU) {
      setBUGU((IBU / GU).toFixed(2));
    } else {
      setBUGU(0);
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
  }, [watchedBatchVolume, watchedEfficiency, recipeFermentables, recipeHops, recipeYeasts, IBU]);

  useEffect(() => {
    const recipeData = getValues();

    const preBoilCalc = getPreBoilVolume(recipeData);
    if (preBoilCalc > 0) {
      setPreBoilVolume(preBoilCalc);
    }
  }, [watchedBatchVolume, watchedBoilTime, recipeEquipment]);

  useEffect(() => {
    const recipeData = getValues();

    const EBCResult = calculateEBC(recipeData);
    setEBC(EBCResult);

    if (EBCResult && svgRef?.current) {
      const color = getBeerColor(EBCResult);
      const svgRoot = svgRef.current;

      const gradients = svgRoot.querySelectorAll('linearGradient, radialGradient');

      gradients.forEach((gradient) => {
        gradient.querySelectorAll('stop').forEach((stop) => {
          stop.setAttribute('stop-color', color);
        });
      });
    }
  }, [watchedBatchVolume, recipeFermentables, svgRef]);

  useEffect(() => {
    if (OG && FG) {
      const abvValue = ((OG - FG) * 131.25).toFixed(2);
      setABV(abvValue > 0 ? abvValue : 0);
    }
  }, [OG, FG]);

  return {
    OG,
    FG,
    IBU,
    EBC,
    ABV,
    BUGU,
    preBoilVolume,
  };
}
