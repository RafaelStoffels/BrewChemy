import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Main from './pages/Main';

export default function appRoutes() {
    return (

        <BrowserRouter>
            <Routes>
                <Route path="/" exact element={<Main />} />
            </ Routes>
        </ BrowserRouter>
    );
}