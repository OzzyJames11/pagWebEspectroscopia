import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import { useDispatch } from "react-redux";
import theme from "./theme"; // Tema personalizado

// Componentes
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AppRouter from "./routes/index"; // Enrutador principal

// Estilos globales
import "./styles/global.css";
import "./App.css";

// Redux actions
// ⬇️ Importamos la nueva acción que creaste
import { loadUserFromStorage, logout } from "./Redux/Actions/authActions";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Usamos la acción que carga token y usuario desde localStorage
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100vw",
            margin: 0,
            padding: 0,
            overflowX: "hidden",
          }}
        >
          {/* Header */}
          <Header />

          {/* Contenido principal */}
          <Box
            component="main"
            sx={{
              flex: 1,
              width: "100%",
              margin: 0,
              padding: 0,
            }}
          >
            <AppRouter /> {/* Rutas de la app */}
          </Box>

          {/* Footer */}
          <Footer />
        </Box>
      </ThemeProvider>
    </Router>
  );
};

export default App;
