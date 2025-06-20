// // componente principal que renderiza toda la aplicación
// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App




// const App = () => {
  //   return (
//     <Router>
//       <div className="app">
//         <Header />
//         <nav>
//           <Link to="/">Inicio</Link>
//           <Link to="/subsistema1">Subsistema 1</Link>
//           <Link to="/subsistema2">Experimentos2</Link>
//         </nav>
//         <Routes>
//           <Route
//             path="/"
//             element={
  //               <>
  //                 <SliderComponent />
  //                 <TableComponent />
  //               </>
  //             }
  //           />
  //           <Route path="/subsistema1" element={<Subsistema1 />} />
  //           <Route path="/subsistema2" element={<Subsistema2 />} />
  //         </Routes>
  //         <Footer />
  //       </div>
  //     </Router>
  //   );
  // };
  
  // export default App;
  
  // const App = () => {
    //   return (
      //       <div className="app">
      //           <Header />
      //           <AppRouter /> 
      //       </div>
      //   );
      // };
      
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

// const App = () => {
//   return (
//       <Router>
//           <Box
//               sx={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   minHeight: '100vh', // Asegura que el contenedor ocupe al menos el 100% de la altura de la ventana
//                   width: '100vw', // Ocupa todo el ancho del navegador
//                   margin: 0, // Elimina márgenes
//                   padding: 0, // Elimina padding
//                   overflowX: 'hidden', // Evita el desplazamiento horizontal
//               }}
//           >
//               {/* Header */}
//               <Header />

//               {/* Contenido principal */}
//               <Box
//                   component="main"
//                   sx={{
//                       flex: 1, // Hace que el contenido principal ocupe el espacio restante
//                       width: '100%', // Ocupa todo el ancho
//                       margin: 0, // Elimina márgenes
//                       padding: 0, // Elimina padding
//                   }}
//               >
//                   <AppRouter /> {/* Aquí se renderizan las rutas */}
//               </Box>

//               {/* Footer */}
//               <Footer />
//           </Box>
//       </Router>
//   );
// };

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