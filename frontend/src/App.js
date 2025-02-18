import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Importa o AuthProvider
import { SidebarProvider } from './context/SidebarContext'; // Importando o SidebarProvider
import { ToastContainer } from "react-toastify"; // Importa o ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importa os estilos do Toastify

import './styles/global.css';

import Logon from "./pages/Logon";
import Main from "./pages/Main";
import EquipmentList from "./pages/EquipmentList";
import FermentableList from "./pages/FermentableList";
import Fermentable from "./pages/Fermentable";
import HopList from "./pages/HopList";
import Hop from "./pages/Hop";
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
          <ToastContainer autoClose={3000} position="top-right" /> {/* Adicionando o ToastContainer */}
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
              <Route path="/Hops/:id/details" element={<Hop />} />
              <Route path="/Hops/:id/edit" element={<Hop />} />
              <Route path="/Hops/new" element={<Hop />} />
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
