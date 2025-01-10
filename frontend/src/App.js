import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Importa o AuthProvider

import './styles/global.css';

import Logon from "./pages/Logon";
import Main from "./pages/Main";
import MaltList from "./pages/MaltList";
import Malt from "./pages/Malt";
import RecipeList from "./pages/RecipeList";
import Recipe from "./pages/Recipe";


const App = () => {
  return (
    <AuthProvider>  {/* Envolvendo a aplicação com o AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Logon />} />
          <Route path="/Main" element={<Main />} />
          <Route path="/MaltList" element={<MaltList />} />
          <Route path="/Malts/:id/details" element={<Malt />} />
          <Route path="/Malts/:id/edit" element={<Malt />} />
          <Route path="/Malts/new" element={<Malt />} />
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
