import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Main from "./pages/Main";

import MaltList from "./pages/MaltList";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas */}
        <Route path="/" element={<Main />} />
        <Route path="/MaltList" element={<MaltList />} />

      </Routes>
    </Router>
  );
};

export default App;
