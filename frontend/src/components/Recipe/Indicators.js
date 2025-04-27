import React from 'react';
import './indicatorBar.css';

export const OGBar = ({ valorInicial, valorFinal, margemInicial, margemFinal, OGAtual }) => {
  const calculatePercentage = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };

  // Calculando os percentuais corretos
  const margemInicialPercent = calculatePercentage(margemInicial, valorInicial, valorFinal);
  const margemFinalPercent = calculatePercentage(margemFinal, valorInicial, valorFinal);

  const initialRedPercentage = margemInicialPercent;
  const greenPercentage = margemFinalPercent - margemInicialPercent;
  const finalRedPercentage = 100 - margemFinalPercent;

  const currentOGPercentage = calculatePercentage(OGAtual, valorInicial, valorFinal);

  const markerColor =
    parseFloat(OGAtual) < margemInicial || parseFloat(OGAtual) > margemFinal
      ? "rgb(187, 36, 36)"
      : "black";

  console.log("Parametro:", OGAtual);
  console.log("margemInicial:", margemInicial);
  console.log("margemFinal:", margemFinal);
  console.log("initialRedPercentage:", initialRedPercentage);
  console.log("greenPercentage:", greenPercentage);
  console.log("finalRedPercentage:", finalRedPercentage);
  console.log("currentOGPercentage:", currentOGPercentage);

  if (parseFloat(OGAtual) < margemInicial) {
    console.log("está abaixo da faixa");
  } else if (parseFloat(OGAtual) > margemFinal) {
    console.log("está acima da faixa");
  } else {
    console.log("está dentro da faixa");
  }

  return (
    <div className="og-bar">
      <div
        className="segment redleft"
        style={{ width: `${initialRedPercentage}%` }}
      ></div>
      <div
        className="segment green"
        style={{ width: `${greenPercentage}%` }}
      ></div>
      <div
        className="segment redright"
        style={{ width: `${finalRedPercentage}%` }}
      ></div>

      {/* Marca indicando o OG atual */}
      <div
        className="og-marker"
        style={{ left: `${currentOGPercentage}%`, backgroundColor: markerColor }}
      ></div>
    </div>
  );
};
