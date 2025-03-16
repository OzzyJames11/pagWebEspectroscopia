import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import imagen_subsistema1 from '../../assets/img/experimentos/imagen_subsistema1.png';
import imagen_subsistema1V2 from '../../assets/img/experimentos/imagen_subsistema1V2.png';
import camaraPanelSolar from '../../assets/img/experimentos/camaraPanelesSolares.png';

// Importación de componentes
import DataTable from '../../components/Elements/DataTable';
import Button from '../../components/Elements/Button.jsx';

// Importación de constantes
import { SUBSISTEMA3_COLUMNS, PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema3Strings.jsx';

// Importación de estilos
import '../../assets/css/Elements/PaperStyles.css';

const Subsistema3 = () => {
    const navigate = useNavigate();
    const { MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, DOWNLOAD_GRAPHS_BUTTON, DOWNLOAD_1_GRAPH, BACK_BUTTON, CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, CLEAN_BUTTON } = PAGE_TITLES;

    // Estado del subsistema
    const [estado, setEstado] = useState('dirty'); // Por defecto, el subsistema está sucio

    // Estado para los datos de la tabla
    const [datos, setDatos] = useState([]);

    // Cargar datos guardados al montar el componente
    useEffect(() => {
        const datosGuardados = JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
        setDatos(datosGuardados);
    }, []);

    // Función para generar valores aleatorios
    const generarValoresAleatorios = () => ({
        [SUBSISTEMA3_COLUMNS[0]]: (Math.random() * 100).toFixed(2), // Voltage
        [SUBSISTEMA3_COLUMNS[1]]: (Math.random() * 10).toFixed(2),  // Current
        [SUBSISTEMA3_COLUMNS[2]]: (Math.random() * 100).toFixed(2), // Efficiency
        [SUBSISTEMA3_COLUMNS[3]]: (Math.random() * 1).toFixed(2),   // Fill Factor
    });

    // Función para guardar datos
    const handleGuardar = () => {
        const nuevoDato = generarValoresAleatorios();
        const nuevosDatos = [...datos, nuevoDato];

        setDatos(nuevosDatos);
        localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
    };

    // Función para eliminar un registro de la tabla
    const handleEliminar = (index) => {
        const nuevosDatos = datos.filter((_, i) => i !== index); // Filtra los datos para eliminar el registro seleccionado
        setDatos(nuevosDatos);
        localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos)); // Actualiza el localStorage
    };

    // Función para limpiar el subsistema
    const handleLimpiar = () => {
        setEstado('clean');
    };

    // Función para descargar gráficos (pendiente de implementación)
    const handleDescargarGraficos = () => {
        alert('Funcionalidad de descarga pendiente de implementación');
    };

    // Función para volver al menú anterior
    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };

    return (
        <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>{DESCRIPTION}</Typography>

            {/* Contenedor con dos columnas */}
            <Grid container spacing={4} alignItems="flex-start">
                {/* Columna Izquierda: Estado del subsistema, botón de limpieza y tabla */}
                <Grid item xs={12} md={6}>
                    {/* Estado del subsistema y botón de limpieza */}
                    <Paper className="paper-camera" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                        <Typography variant="h5" gutterBottom>{SUBSYSTEM_STATUS_TITLE}</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
                        </Typography>
                        <Button variant="contained" color="primary" onClick={handleLimpiar} disabled={estado === 'clean'} align='center' extraClass={estado === 'clean' ? 'subsystem-disabled' : ''}>
                            {CLEAN_BUTTON}
                        </Button>
                    </Paper>

                    {/* Tabla de datos */}
                    <DataTable columns={SUBSISTEMA3_COLUMNS} data={datos} onDelete={handleEliminar} />

                    {/* Botón para guardar datos */}
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={handleGuardar} align="right">
                            {SAVE_BUTTON}
                        </Button>
                    </Box>
                </Grid>

                {/* Columna Derecha: Cámara y gráficos */}
                <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Cámara */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Paper className="paper-camera">
                            <Typography variant="h5">{CAMERA_TITLE}</Typography>
                            <img
                                src={camaraPanelSolar}
                                alt="Cámara de paneles solares"
                                className="paper-image"
                            />
                        </Paper>
                    </Box>

                    {/* Gráfico de voltaje vs tiempo */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Paper className="paper-graph">
                            <Typography variant="h5">{VOLTAGE_VS_TIME_TITLE}</Typography>
                            <img
                                src={imagen_subsistema1}
                                alt="Gráfico de voltaje vs tiempo"
                                className="paper-image"
                            />
                        </Paper>
                    </Box>

                    {/* Botón para descargar gráfico de voltaje */}
                    <Button variant="contained" color="secondary" onClick={handleDescargarGraficos} align="right" marginTop={-1}>
                        {DOWNLOAD_1_GRAPH}
                    </Button>

                    {/* Gráfico de corriente vs tiempo */}
                    <Box mt={2} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Paper className="paper-graph">
                            <Typography variant="h5">{CURRENT_VS_TIME_TITLE}</Typography>
                            <img
                                src={imagen_subsistema1V2}
                                alt="Gráfico de corriente vs tiempo"
                                className="paper-image"
                            />
                        </Paper>
                    </Box>

                    {/* Botón para descargar gráfico de corriente */}
                    <Button variant="contained" color="secondary" onClick={handleDescargarGraficos} align="right" marginTop={-1}>
                        {DOWNLOAD_1_GRAPH}
                    </Button>

                    {/* Botón para descargar todos los gráficos */}
                    <Button variant="contained" color="pink" onClick={handleDescargarGraficos} fullWidth align="center" marginTop={2}>
                        {DOWNLOAD_GRAPHS_BUTTON}
                    </Button>
                </Grid>
            </Grid>

            {/* Botón para volver */}
            <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
                {BACK_BUTTON}
            </Button>
        </Box>
    );
};

export default Subsistema3;