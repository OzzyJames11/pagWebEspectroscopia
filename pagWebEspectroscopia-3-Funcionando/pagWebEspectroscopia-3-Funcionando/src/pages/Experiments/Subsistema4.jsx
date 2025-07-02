import React, { useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importación de imágenes
import camaraPanelSolar from '../../assets/img/experimentos/camaraPanelesSolares.png';
import graficoSpectroscopia from '../../assets/img/experimentos/espectro_completo.png';

// Importación de constantes
import Button from '../../components/Elements/Button.jsx';
import { PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema4Strings.jsx';

// Importación de estilos
import '../../assets/css/Elements/PaperStyles.css';

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema4 = () => {
    const navigate = useNavigate();
    const { MAIN_TITLE, DESCRIPTION, BACK_BUTTON, CAMERA_TITLE, SPECTROSCOPY_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, DOWNLOAD_1_GRAPH } = PAGE_TITLES;


    // Función para volver al menú anterior
    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };


    //Funciones para recolectar datos de longitud de onda e intensidad
  const wavelengthData = []; // eje X (en nm)
  const intensityData = [];  // eje Y (en a.u.)

  //descargar datos
  const handleDownloadSpectralData = () => {
    generateTXT({
      filename: "spectral_analysis.txt",
      sections: [
        {
          title: "Spectral Analysis: Intensity (a.u.) vs Wavelength (nm)",
          headers: ["Wavelength (nm)", "Intensity (a.u.)"],
          data: wavelengthData.map((w, i) => [w, intensityData[i]]),
        },
      ],
    });
  };


    return (
        <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
            {/* Título y descripción */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>{DESCRIPTION}</Typography>

            <Paper className="paper-graph">
                {/*<Typography variant="h5">{SPECTROSCOPY_TITLE}</Typography>*/}
                <img
                    src={graficoSpectroscopia}
                    alt="Gráfico de Radiación Solar"
                    className="paper-image"
                />
            </Paper>
            <Button variant="contained" color="pink" onClick={handleDownloadSpectralData} align="center" marginTop={1}>{DOWNLOAD_1_GRAPH}</Button>

            {/* Botón para volver */}
            <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={2} >
                {BACK_BUTTON}
            </Button>
        </Box>
    );
};

export default Subsistema4;