
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Importa el tema personalizado
//componentes
import Header from './components/Header/Header';
import SliderComponent from './components/SliderComponent';
import TableComponent from './components/TableComponent';
import Footer from './components/Footer/Footer';
//estilos globales
import './styles/global.css';
//router
import { BrowserRouter as Router } from 'react-router-dom';
//otras paginas
import Subsistema1 from './pages/Experiments/Subsistema1';
import Subsistema2 from './pages/Experiments/Subsistema2';
// paths ?
import AppRouter from './routes/index'; // Importa el enrutador
import './App.css';


import { Box } from '@mui/material'; // Importa Box de Material-UI

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from './Redux/Actions/authActions';
import { auth } from './components/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';


const App = () => {

  const dispatch = useDispatch();

    useEffect(() => {
        // Verifica si hay un usuario autenticado al iniciar la aplicación
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(loginSuccess(user)); // Si hay usuario, actualiza Redux
            } else {
                dispatch(logoutSuccess()); // Si no hay usuario, limpia el estado
            }
        });

        return () => unsubscribe(); // Limpia el listener al desmontar el componente
    }, [dispatch]);
    
    return (
      <Router>
        <ThemeProvider theme={theme}>
          <Header />
          <AppRouter /> 
          <Footer />
        </ThemeProvider>
          

      </Router>
      );
    };

export default App;