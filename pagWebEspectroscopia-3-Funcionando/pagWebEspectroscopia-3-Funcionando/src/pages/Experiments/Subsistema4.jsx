import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, CircularProgress } from '@mui/material';
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

    const [integrationTime, setIntegrationTime] = useState(20); // ms
    const [loading, setLoading] = useState(false);
    const [spectroImage, setSpectroImage] = useState(graficoSpectroscopia);
    const [wavelengthData, setWavelengthData] = useState([]);
    const [intensityData, setIntensityData] = useState([]);

    // Función para volver al menú anterior
    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };


    //Funciones para recolectar datos de longitud de onda e intensidad
  // const wavelengthData = []; // eje X (en nm)
  // const intensityData = [];  // eje Y (en a.u.)

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


  // Ejecutar medición
  const handleRunSpectrometer = async () => {
    if (integrationTime < 0.01 || integrationTime > 100) {
        alert("El tiempo de integración debe estar entre 0.01 y 100 ms.");
        return;
    }
    setLoading(true);

    try {
        // Ejecutar el espectrómetro
        const response = await fetch("http://localhost:8000/run-spectrometer/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ integration_time: integrationTime }),
        });

        if (!response.ok) throw new Error("Error al ejecutar espectrómetro");

        // Refrescar imagen (con timestamp para evitar caché)
        const timestamp = Date.now();
        setSpectroImage(`http://localhost:8000/descargar/espectro?t=${timestamp}`);

        // Cargar datos .txt
        const dataResponse = await fetch(`http://localhost:8000/descargar/datos`);
        const text = await dataResponse.text();

        const parsedWavelengths = [];
        const parsedIntensities = [];
        const lines = text.split("\n").slice(1); // saltar encabezado
        for (const line of lines) {
            const [w, i] = line.split(";");
            if (w && i) {
                parsedWavelengths.push(parseFloat(w));
                parsedIntensities.push(parseFloat(i));
            }
        }
        setWavelengthData(parsedWavelengths);
        setIntensityData(parsedIntensities);
    } catch (err) {
        alert("Ocurrió un error al ejecutar el espectrómetro.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

    return (
        <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
            {/* Título y descripción */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>{DESCRIPTION}</Typography>

            <Paper className="paper-graph">
                {/*<Typography variant="h5">{SPECTROSCOPY_TITLE}</Typography>*/}
                <img
                    src={spectroImage}
                    alt="Gráfico de Radiación Solar"
                    className="paper-image"
                />
            </Paper>

            {/* INPUT + BOTÓN EJECUTAR */}
            <Grid container spacing={2} alignItems="center" justifyContent="flex-start" mt={2}>
                <Grid item>
                    <TextField
                        type="number"
                        label="Tiempo de integración (ms)"
                        value={integrationTime}
                        onChange={(e) => setIntegrationTime(parseFloat(e.target.value))}
                        inputProps={{ min: 0.01, max: 100, step: 0.01 }}
                        size="small"
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRunSpectrometer}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Ejecutar espectrómetro"}
                    </Button>
                </Grid>
            </Grid>

            {/* BOTÓN DESCARGAR */}
            <Button variant="contained" color="pink" onClick={handleDownloadSpectralData} align="center" marginTop={1}>{DOWNLOAD_1_GRAPH}</Button>

            {/* Botón para volver */}
            <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={2} >
                {BACK_BUTTON}
            </Button>
        </Box>
    );
};

export default Subsistema4;