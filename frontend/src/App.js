import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Importa o AuthProvider

import './global.css';

import Logon from "./pages/Logon";
import Main from "./pages/Main";
import MaltList from "./pages/MaltList";
import Malt from "./pages/Malt";

const App = () => {
  return (
    <AuthProvider>  {/* Envolvendo a aplicação com o AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Logon />} />
          <Route path="/Main" element={<Main />} />
          <Route path="/MaltList" element={<MaltList />} />
          <Route path="/Malts/new" element={<Malt />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
