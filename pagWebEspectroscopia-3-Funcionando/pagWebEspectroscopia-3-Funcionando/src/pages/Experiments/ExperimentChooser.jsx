import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2'; 
import styles from '../../assets/css/experimentsChooser.module.css';
import Button from '../../components/Elements/Button';
import { PAGE_TITLES, SUBSYSTEMS } from '../../assets/Strings/Experiments/ExperimentChooserStrings.jsx';
import { db } from '../../firebaseConfig.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ExperimentChooser = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [habilitado, setHabilitado] = useState(false);

    const { MAIN_TITLE, DESCRIPTION, VIEW_SUBSYSTEM_BUTTON } = PAGE_TITLES;

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const verificarTurnoHoy = async () => {
            if (!user) {
                setHabilitado(false);
                return;
            }

            const hoy = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

            try {
                const q = query(
                    collection(db, 'turnos'),
                    where('uid', '==', user.uid),
                    where('fecha', '==', hoy)
                );
                const snapshot = await getDocs(q);
                setHabilitado(!snapshot.empty); // true si tiene turno hoy
            } catch (error) {
                console.error('Error al verificar turno del usuario:', error);
                setHabilitado(false);
            }
        };

        verificarTurnoHoy();
    }, [user]);

    const mostrarMensaje = !user || !habilitado;

    return (
        <div>
            <Box className={styles.container}>
                <Typography variant="h3" gutterBottom>
                    {MAIN_TITLE}
                </Typography>
                <Typography variant="h5" gutterBottom>
                    {DESCRIPTION}
                </Typography>
                <Grid2 container spacing={3} justifyContent="center" className={styles.gridContainer}>
                    {SUBSYSTEMS.map((subsistema, index) => (
                        <Grid2 key={index}>
                            <Card className={styles.card}>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        {subsistema.title}
                                    </Typography>
                                    <Typography className={styles.description}>
                                        {subsistema.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleNavigation(subsistema.path)}
                                        align="center"
                                        disabled={mostrarMensaje}
                                    >
                                        {VIEW_SUBSYSTEM_BUTTON}
                                    </Button>

                                    {/* Mensaje solo cuando el botón esté deshabilitado */}
                                    {mostrarMensaje && (
                                        <Typography
                                            variant="body2"
                                            color="error"
                                            sx={{ mt: 1 }}
                                        >
                                            ⚠ You must be logged in and have a scheduled appointment for today to access this experiment.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            </Box>
        </div>
    );
};

export default ExperimentChooser;
