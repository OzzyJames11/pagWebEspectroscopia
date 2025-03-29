import React from 'react';
import { /*BrowserRouter as Router, */Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Importa tus vistas (páginas)
import Home from '../pages/Home';
import Login from '../pages/Login';
//import Register from '../pages/Register';
// import Dashboard from '../pages/Dashboard';
// import Login from '../pages/Login';
// import Admin from '../pages/Admin';
// import NotFound from '../pages/NotFound';
// import SolarMap from '../pages/SolarMap';
// import Downloads from '../pages/Downloads';
// import Experimentos from '../pages/Experimentos';
import {Subsistema1, Subsistema2, Subsistema3, Subsistema4, DataSummary, ExperimentChooser} from '../pages/Experiments';

import { ROUTES } from '../assets/Strings/routes';
const AppRouter = () => {
    return (
        // <Router>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path={ROUTES.EXPERIMENTSCH} element={<ExperimentChooser />} />
                <Route path={ROUTES.SUBSISTEMA1} element={<Subsistema1 />} />
                <Route path={ROUTES.SUBSISTEMA2} element={<Subsistema2 />} />
                <Route path={ROUTES.SUBSISTEMA3} element={<Subsistema3 />} />
                <Route path={ROUTES.SUBSISTEMA4} element={<Subsistema4 />} />
                <Route path={ROUTES.DATA_SUMMARY} element={<DataSummary />} />
                <Route path="/login" element={<Login />} />
               {/*<Route path= "/register" element = {<Register />} />*/}
                {/* Ruta privada (requiere autenticación) */}
                {/*
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <Admin />
                        </PrivateRoute>
                    }
                />*/}

                {/* Ruta para páginas no encontradas */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        // </Router>
    );
};

export default AppRouter;