import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import imagen_subsistema1 from '../../assets/img/experimentos/imagen_subsistema1.png';
import imagen_subsistema1V2 from '../../assets/img/experimentos/imagen_subsistema1V2.png';
import camaraPanelSolar from '../../assets/img/experimentos/camaraPanelesSolares.png';

//Importación de componentes
import SliderComponent from '../../components/Elements/SliderComponent';
import DataTable from '../../components/Elements/DataTable';
import Button from '../../components/Elements/Button.jsx';

//Importación de constantes
import { SUBSISTEMA2_COLUMNS, PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema2Strings.jsx';

//Importación de estilos
import '../../assets/css/Elements/PaperStyles.css';

const Subsistema2 = () => {
    const navigate = useNavigate();
    const {MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, DOWNLOAD_GRAPHS_BUTTON, DOWNLOAD_1_GRAPH, BACK_BUTTON, CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE} = PAGE_TITLES;
    const [zenithAngle, setZenithAngle] = useState(50); // Nuevo estado para Zenith Angle
    const [azimuthAngle, setAzimuthAngle] = useState(50); // Estado para Azimuth Angle
    const [datos, setDatos] = useState([]);

    useEffect(() => {
        const datosGuardados = JSON.parse(localStorage.getItem("historicalData_subsistema2")) || [];
        setDatos(datosGuardados);
    }, []);


    /**
     * Creo que es necesario crear esto en c/subsistema dependiendo de las variables que se agreguen
     * las cuales dependen del arreglo creado en columns.
     * @returns 
     */
    const generarValoresAleatorios = () => ({
        [SUBSISTEMA2_COLUMNS[0]]: `${zenithAngle}°`, // Zenith Angle
        [SUBSISTEMA2_COLUMNS[1]]: `${azimuthAngle}°`, // Azimuth Angle
        [SUBSISTEMA2_COLUMNS[2]]: (Math.random() * 100).toFixed(2),
        [SUBSISTEMA2_COLUMNS[3]]: (Math.random() * 10).toFixed(2),
        [SUBSISTEMA2_COLUMNS[4]]: (Math.random() * 100).toFixed(2),
        [SUBSISTEMA2_COLUMNS[5]]: (Math.random() * 1).toFixed(2),
    });

    const handleGuardar = () => {
        // const nuevoDato = { angulo, ...generarValoresAleatorios() };
        const nuevoDato = generarValoresAleatorios();
        const nuevosDatos = [...datos, nuevoDato];

        setDatos(nuevosDatos);
        localStorage.setItem("historicalData_subsistema2", JSON.stringify(nuevosDatos));
    };

    const handleEliminar = (index) => {
        const nuevosDatos = datos.filter((_, i) => i !== index); // Filtra los datos para eliminar el registro seleccionado
        setDatos(nuevosDatos);
        localStorage.setItem("historicalData_subsistema2", JSON.stringify(nuevosDatos)); // Actualiza el localStorage
    };

    const handleDescargarGraficos = () => {
        alert('Funcionalidad de descarga pendiente de implementación');
    };

    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };

    return (
        <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
            <Typography variant="body1"sx={{ textAlign: 'left', mb: 3  }} >{DESCRIPTION}</Typography>
            
            {/* Contenedor con dos columnas */}
            <Grid container spacing={4} alignItems="flex-start">
                {/* Columna Izquierda: Slider y Tabla */}
                <Grid item xs={12} md={6}>
                    <SliderComponent value={zenithAngle} label="Zenith Angle" min={0} max={100} step={5} onChange={(e, newValue) => setZenithAngle(newValue)} />
                    <SliderComponent value={azimuthAngle} label="Azimuth Angle" min={0} max={100} step={5} onChange={(e, newValue) => setAzimuthAngle(newValue)} />
                    <DataTable columns={SUBSISTEMA2_COLUMNS} data={datos} onDelete={handleEliminar}/>
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={handleGuardar} align="right">
                            {SAVE_BUTTON}
                        </Button>
                    </Box>
                </Grid>

                {/* Columna Derecha: Gráficos */}
                <Grid item xs={12} md={5.5}  sx={{ display: 'flex', flexDirection: 'column' }}> 
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Paper className="paper-camera">
                            <Typography variant="h5">{CAMERA_TITLE}</Typography>
                            <img 
                                src={camaraPanelSolar} 
                                alt="Gráfico 1" 
                                className="paper-image" 
                            />
                        </Paper>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Paper className="paper-graph">
                            <Typography variant="h5">{VOLTAGE_VS_TIME_TITLE}</Typography>
                            <img 
                                src={imagen_subsistema1} 
                                alt="Gráfico 1" 
                                className="paper-image" 
                            />
                        </Paper>
                    </Box>
                    
                    <Button variant="contained" color="secondary" onClick={handleDescargarGraficos} align="right" marginTop={-1} >
                        {DOWNLOAD_1_GRAPH}
                    </Button>

                    <Box mt={2} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Paper className="paper-graph">
                            <Typography variant="h5">{CURRENT_VS_TIME_TITLE}</Typography>
                            <img 
                                src={imagen_subsistema1V2} 
                                alt="Gráfico 2" 
                                className="paper-image" 
                            />
                        </Paper>
                    </Box>
                        <Button variant="contained" color="secondary" onClick={handleDescargarGraficos} align="right" marginTop={-1}>
                            {DOWNLOAD_1_GRAPH}
                        </Button>
                        <Button variant="contained" color="pink" onClick={handleDescargarGraficos} fullWidth align="center" marginTop={2}>
                            {DOWNLOAD_GRAPHS_BUTTON}
                        </Button>
                </Grid>
            </Grid>
            
            <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4} >
                {BACK_BUTTON}
            </Button>
        </Box>
    );
};

export default Subsistema2;
