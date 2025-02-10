import React from 'react';
import './OGBar.css';

export const OGBar = ({ valorInicial, valorFinal, margemInicial, margemFinal, OGAtual }) => {
  const calculatePercentage = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };

  // Calculando os percentuais
  const initialRedPercentage = calculatePercentage(margemInicial, valorInicial, valorFinal);
  const greenPercentage = calculatePercentage(margemFinal, valorInicial, valorFinal);
  const finalRedPercentage = 100 - greenPercentage;
  const currentOGPercentage = calculatePercentage(OGAtual, valorInicial, valorFinal);

  return (
    <div className="og-bar">
      <div
        className="segment redleft"
        style={{ width: `${initialRedPercentage}%` }}
      ></div>
      <div
        className="segment green"
        style={{ width: `${greenPercentage}%` }}
      >
      </div>
      <div
        className="segment redright"
        style={{ width: `${finalRedPercentage}%` }}
      ></div>
      
      {/* Marca indicando o OG atual */}
      <div
        className="og-marker"
        style={{ left: `${currentOGPercentage}%` }}
      ></div>
    </div>
  );
};
