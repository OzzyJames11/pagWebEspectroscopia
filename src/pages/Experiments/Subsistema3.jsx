import React, { useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importación de imágenes
import camaraPanelSolar from '../../assets/img/experimentos/camaraPanelesSolares.png';
import graficoVoltaje from '../../assets/img/experimentos/imagen_subsistema1.png';
import graficoCorriente from '../../assets/img/experimentos/imagen_subsistema1V2.png';

// Importación de constantes
import Button from '../../components/Elements/Button.jsx';
import { PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema3Strings.jsx';

// Importación de estilos
import '../../assets/css/Elements/PaperStyles.css';

const Subsistema3 = () => {
    const navigate = useNavigate();
    const { MAIN_TITLE, DESCRIPTION, BACK_BUTTON, CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, CLEAN_BUTTON } = PAGE_TITLES;

    // Estado del subsistema
    const [estado, setEstado] = useState('dirty'); // Por defecto, el subsistema está sucio

    // Función para limpiar el subsistema
    const handleLimpiar = () => {
        setEstado('clean');
    };

    // Función para volver al menú anterior
    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };

    return (
        <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
            {/* Título y descripción */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>{DESCRIPTION}</Typography>

            {/* Contenedor con dos columnas */}
            <Grid container spacing={4} alignItems="flex-start">
                {/* Columna Izquierda: Estado del subsistema y botón de limpieza */}
                <Grid item xs={12} md={6}>
                    <Paper className="paper-camera" sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>{SUBSYSTEM_STATUS_TITLE}</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
                        </Typography>
                        <Button variant="contained" color="primary" onClick={handleLimpiar} disabled={estado === 'clean'} align='center' extraClass={estado === 'clean' ? 'subsystem-disabled' : ''}>
                            {CLEAN_BUTTON}
                        </Button>
                    </Paper>
                </Grid>

                {/* Columna Derecha: Cámara */}
                <Grid item xs={12} md={6}>
                    <Paper className="paper-camera">
                        <Typography variant="h5">{CAMERA_TITLE}</Typography>
                        <img
                            src={camaraPanelSolar}
                            alt="Cámara de paneles solares"
                            className="paper-image"
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Gráficos de voltaje y corriente */}
            <Grid container spacing={4} mt={2}>
                <Grid item xs={12} md={6}>
                    <Paper className="paper-graph">
                        <Typography variant="h5">{VOLTAGE_VS_TIME_TITLE}</Typography>
                        <img
                            src={graficoVoltaje}
                            alt="Gráfico de voltaje vs tiempo"
                            className="paper-image"
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="paper-graph">
                        <Typography variant="h5">{CURRENT_VS_TIME_TITLE}</Typography>
                        <img
                            src={graficoCorriente}
                            alt="Gráfico de corriente vs tiempo"
                            className="paper-image"
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Botón para volver */}
            <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4} >
                {BACK_BUTTON}
            </Button>
        </Box>
    );
};

export default Subsistema3;