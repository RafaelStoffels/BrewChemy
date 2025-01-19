import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Importa o AuthProvider

import './styles/global.css';

import Logon from "./pages/Logon";
import Main from "./pages/Main";
import FermentableList from "./pages/FermentableList";
import Fermentable from "./pages/Fermentables";
import HopList from "./pages/HopList";
import RecipeList from "./pages/RecipeList";
import Recipe from "./pages/Recipe";


const App = () => {
  return (
    <AuthProvider>  {/* Envolvendo a aplicação com o AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Logon />} />
          <Route path="/Main" element={<Main />} />
          <Route path="/FermentableList" element={<FermentableList />} />
          <Route path="/Fermentables/:id/details" element={<Fermentable />} />
          <Route path="/Fermentables/:id/edit" element={<Fermentable />} />
          <Route path="/Fermentables/new" element={<Fermentable />} />
          <Route path="/HopList" element={<HopList />} />
          <Route path="/RecipeList" element={<RecipeList />} />
          <Route path="/Recipes/:id/details" element={<Recipe />} />
          <Route path="/Recipes/:id/edit" element={<Recipe />} />
          <Route path="/Recipes/new" element={<Recipe />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
