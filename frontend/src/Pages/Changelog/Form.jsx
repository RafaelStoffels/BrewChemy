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
        <b>Sep 06, 2025 (v1.6.0)</b>
        <br />
        <br />
        ❓ New: added help icons (❓) next to technical fields.
        <br />
        <br />
        <b>Sep 04, 2025 (v1.5.0)</b>
        <br />
        <br />
        💧 Added configuration option to set the volume unit to liters or gallons.
        <br />
        👆 When choosing equipment, double-click to automatically assign it to the recipe.
        <br />
        <br />
        <b>Sep 01, 2025 (v1.4.0)</b>
        <br />
        <br />
        ⏳ Buttons now show a loading indicator while the action is processing. You can see it’s saving and avoid repeated clicks.
        <br />
        <br />
        <b>Aug 23, 2025 (v1.3.0)</b>
        <br />
        <br />
        ⚡ We’ve upgraded our front-end engine to a modern build system, making pages load faster and feel more responsive.
        <br />
        <br />
        <b>Aug 16, 2025 (v1.2.0)</b>
        <br />
        <br />
        🚀 We’ve upgraded to a modern data communication layer, making the app faster and more responsive.
        <br />
        🔒 Authentication now follows the latest best-practice standards, ensuring stronger protection for your account.
        <br />
        <br />
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
