import React, { useContext } from 'react';

import useAuthRedirect from '../../hooks/useAuthRedirect';

import AuthContext from '../../context/AuthContext';

import '../../Styles/crud.css';

export default function NewEquipment() {
  const { user } = useContext(AuthContext);

  useAuthRedirect(user);

  return (
    <div className="crud-container">
      <section>
        <h1>Changelog</h1>
      </section>
      <div className="content">
        <b>Aug 08, 2025 (v1.1.0)</b>
        <br />
        <br />
        ⚖️ Added configuration option to set the weight unit to ounces or grams.
        <br />
        <br />
        <b>Aug 07, 2025 (v1.0.0)</b>
        <br />
        <br />
        🎉 Official release of Brewchemy!
      </div>
    </div>
  );
}
