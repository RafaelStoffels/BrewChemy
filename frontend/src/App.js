import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Importa o AuthProvider
import { SidebarProvider } from './context/SidebarContext'; // Importando o SidebarProvider

import './styles/global.css';

import Logon from "./pages/Logon";
import Main from "./pages/Main";
import EquipmentList from "./pages/EquipmentList";
import FermentableList from "./pages/FermentableList";
import Fermentable from "./pages/Fermentables";
import HopList from "./pages/HopList";
import MiscList from "./pages/MiscList";
import RecipeList from "./pages/RecipeList";
import Recipe from "./pages/Recipe";
import YeastList from "./pages/YeastList";

import Layout from './components/Layout'; // Importando o Layout

const App = () => {
  return (
    <AuthProvider>  {/* Envolvendo a aplicação com o AuthProvider */}
      <SidebarProvider>
        <Router>
          <Routes>

            {/* Página de Logon não precisa de layout */}
            <Route path="/" element={<Logon />} />

            {/* Aqui estamos utilizando o Layout para envolver as páginas que precisam do Sidebar */}
            <Route element={<Layout />}>
              <Route path="/Main" element={<Main />} />
              <Route path="/EquipmentList" element={<EquipmentList />} />
              <Route path="/FermentableList" element={<FermentableList />} />
              <Route path="/Fermentables/:id/details" element={<Fermentable />} />
              <Route path="/Fermentables/:id/edit" element={<Fermentable />} />
              <Route path="/Fermentables/new" element={<Fermentable />} />
              <Route path="/HopList" element={<HopList />} />
              <Route path="/MiscList" element={<MiscList />} />
              <Route path="/RecipeList" element={<RecipeList />} />
              <Route path="/Recipes/:id/details" element={<Recipe />} />
              <Route path="/Recipes/:id/edit" element={<Recipe />} />
              <Route path="/Recipes/new" element={<Recipe />} />
              <Route path="/YeastList" element={<YeastList />} />
            </Route>

          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default App;
