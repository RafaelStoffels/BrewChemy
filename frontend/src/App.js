import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Importa o AuthProvider
import { SidebarProvider } from './context/SidebarContext'; // Importando o SidebarProvider
import { ToastContainer } from "react-toastify"; // Importa o ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importa os estilos do Toastify

import './styles/global.css';

import CreateAccount from "./pages/Logon/CreateAccount";
import ChangePassword from "./pages/Logon/ChangePassword";
import ForgotPassword from "./pages/Logon/ForgotPassword";
import Logon from "./pages/Logon";
import Main from "./pages/Main";
import EquipmentList from "./pages/EquipmentList";
import Equipment from "./pages/Equipment";
import FermentableList from "./pages/FermentableList";
import Fermentable from "./pages/Fermentable";
import HopList from "./pages/HopList";
import Hop from "./pages/Hop";
import MiscList from "./pages/MiscList";
import Misc from "./pages/Misc";
import RecipeList from "./pages/RecipeList";
import Recipe from "./pages/Recipes";
import YeastList from "./pages/YeastList";
import Yeast from "./pages/Yeast";

import Layout from './components/Layout'; // Importando o Layout

const App = () => {
  return (
    <AuthProvider>  {/* Envolvendo a aplicação com o AuthProvider */}
      <SidebarProvider>
        <Router>
          <ToastContainer autoClose={3000} position="top-right" /> {/* Adicionando o ToastContainer */}
          <Routes>

            {/* Página de Logon não precisa de layout */}
            <Route path="/" element={<Logon />} />
            <Route path="/CreateAccount" element={<CreateAccount />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />

            {/* Aqui estamos utilizando o Layout para envolver as páginas que precisam do Sidebar */}
            <Route element={<Layout />}>
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
              <Route path="/Misc/:recordUserId/:id/details" element={<Misc />} />
              <Route path="/Misc/:recordUserId/:id/edit" element={<Misc />} />
              <Route path="/Misc/new" element={<Misc />} />
              <Route path="/RecipeList" element={<RecipeList />} />
              <Route path="/Recipes/:id/details" element={<Recipe />} />
              <Route path="/Recipes/:id/edit" element={<Recipe />} />
              <Route path="/Recipes/new" element={<Recipe />} />
              <Route path="/YeastList" element={<YeastList />} />
              <Route path="/Yeasts/:recordUserId/:id/details" element={<Yeast />} />
              <Route path="/Yeasts/:recordUserId/:id/edit" element={<Yeast />} />
              <Route path="/Yeasts/new" element={<Yeast />} />
            </Route>

          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default App;
