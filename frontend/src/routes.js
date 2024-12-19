import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
/*
import Logon from './pages/Logon';
import Register from './pages/Register'; //nao pepga o global
import Profile from './pages/Profile';
import NewIncident from './pages/NewIncident'; //nao pepga o global
import Testes from './pages/Testes'; //nao pepga o global
*/
import Main from './pages/Main';

export default function appRoutes() {
    return (
     /*   <BrowserRouter>
            <Routes>
                <Route path="/" exact element={<Logon />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/incidents/new" element={<NewIncident />} />
                <Route path="/Testes" element={<Testes />} />
            </ Routes>
        </ BrowserRouter>*/

        <BrowserRouter>
            <Routes>
                <Route path="/" exact element={<Main />} />
            </ Routes>
        </ BrowserRouter>
    );
}