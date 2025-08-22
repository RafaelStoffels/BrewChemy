import React from 'react';
import PropTypes from 'prop-types';
import './indicatorBar.css';

function OGBar({
  initialValue, finalValue, initialMargin, finalMargin, currentOG,
}) {
  const calculatePercentage = (value, min, max) => ((value - min) / (max - min)) * 100;

  const initialMarginPercent = calculatePercentage(initialMargin, initialValue, finalValue);
  const finalMarginPercent = calculatePercentage(finalMargin, initialValue, finalValue);

  const initialRedPercentage = initialMarginPercent;
  const greenPercentage = finalMarginPercent - initialMarginPercent;
  const finalRedPercentage = 100 - finalMarginPercent;

  const currentOGPercentage = calculatePercentage(currentOG, initialValue, finalValue);

  const markerColor = parseFloat(currentOG) < initialMargin || parseFloat(currentOG) > finalMargin
    ? 'rgb(187, 36, 36)'
    : 'black';

  return (
    <div className="og-bar">
      <div
        className="segment redleft"
        style={{ width: `${initialRedPercentage}%` }}
      />
      <div
        className="segment green"
        style={{ width: `${greenPercentage}%` }}
      />
      <div
        className="segment redright"
        style={{ width: `${finalRedPercentage}%` }}
      />
      <div
        className="og-marker"
        style={{ left: `${currentOGPercentage}%`, backgroundColor: markerColor }}
      />
    </div>
  );
}

OGBar.propTypes = {
  initialValue: PropTypes.number.isRequired,
  finalValue: PropTypes.number.isRequired,
  initialMargin: PropTypes.number.isRequired,
  finalMargin: PropTypes.number.isRequired,
  currentOG: PropTypes.number.isRequired,
};

export default OGBar;
