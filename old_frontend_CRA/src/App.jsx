import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';

import Changelog from './Pages/Changelog/Form';
import ChangePassword from './Pages/Logon/ChangePassword';
import CreateAccount from './Pages/Logon/CreateAccount';
import EmailSent from './Pages/Logon/CreateAccount/EmailSent';
import ForgotPassword from './Pages/Logon/ForgotPassword/Form';
import Logon from './Pages/Logon/Form';
import Main from './Pages/Main';
import EquipmentList from './Pages/Equipments/List';
import Equipment from './Pages/Equipments/Form';
import FermentableList from './Pages/Inventories/Fermentables/List';
import Fermentable from './Pages/Inventories/Fermentables/Form';
import HopList from './Pages/Inventories/Hops/List';
import Hop from './Pages/Inventories/Hops/Form';
import MiscList from './Pages/Inventories/Miscs/List';
import Misc from './Pages/Inventories/Miscs/Form';
import RecipeList from './Pages/Recipes/List';
import Recipe from './Pages/Recipes/Form';
import YeastList from './Pages/Inventories/Yeasts/List';
import Yeast from './Pages/Inventories/Yeasts/Form';

import Layout from './Components/Layout';
import SettingsForm from './Pages/Settings/Form';

import 'react-toastify/dist/ReactToastify.css';
import './Styles/global.css';

function App() {
  useEffect(() => {
    document.title = 'Brewchemy';
  }, []);

  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <ToastContainer autoClose={3000} position="top-right" />
          <Routes>

            {/* no need layout */}
            <Route path="/" element={<Logon />} />
            <Route path="/CreateAccount" element={<CreateAccount />} />
            <Route path="/EmailSent" element={<EmailSent />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />

            {/* layout - sidebar */}
            <Route element={<Layout />}>
              <Route path="/Changelog" element={<Changelog />} />
              <Route path="/Main" element={<Main />} />
              <Route path="/EquipmentList" element={<EquipmentList />} />
              <Route path="/Equipments/:recordUserId/:id/details" element={<Equipment />} />
              <Route path="/Equipments/:recordUserId/:id/edit" element={<Equipment />} />
              <Route path="/Equipments/new" element={<Equipment />} />
              <Route path="/FermentableList" element={<FermentableList />} />
              <Route path="/Fermentables/:recordUserId/:id/details" element={<Fermentable />} />
              <Route path="/Fermentables/:recordUserId/:id/edit" element={<Fermentable />} />
              <Route path="/Fermentables/new" element={<Fermentable />} />
              <Route path="/HopList" element={<HopList />} />
              <Route path="/Hops/:recordUserId/:id/details" element={<Hop />} />
              <Route path="/Hops/:recordUserId/:id/edit" element={<Hop />} />
              <Route path="/Hops/new" element={<Hop />} />
              <Route path="/MiscList" element={<MiscList />} />
              <Route path="/Miscs/:recordUserId/:id/details" element={<Misc />} />
              <Route path="/Miscs/:recordUserId/:id/edit" element={<Misc />} />
              <Route path="/Miscs/new" element={<Misc />} />
              <Route path="/RecipeList" element={<RecipeList />} />
              <Route path="/Recipes/:id/details" element={<Recipe />} />
              <Route path="/Recipes/:id/edit" element={<Recipe />} />
              <Route path="/Recipes/new" element={<Recipe />} />
              <Route path="/YeastList" element={<YeastList />} />
              <Route path="/Yeasts/:recordUserId/:id/details" element={<Yeast />} />
              <Route path="/Yeasts/:recordUserId/:id/edit" element={<Yeast />} />
              <Route path="/Yeasts/new" element={<Yeast />} />
              <Route path="/Settings" element={<SettingsForm />} />
            </Route>

          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
