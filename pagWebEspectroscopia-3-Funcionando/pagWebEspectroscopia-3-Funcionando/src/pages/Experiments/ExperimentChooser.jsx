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
  const [mensajeTurno, setMensajeTurno] = useState('');

  const { MAIN_TITLE, DESCRIPTION, VIEW_SUBSYSTEM_BUTTON } = PAGE_TITLES;

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
  const verificarTurnoActual = async () => {
    if (!user) {
      setHabilitado(false);
      setMensajeTurno('');
      return;
    }

    const ahora = new Date();
    const hoyStr = ahora.toISOString().split('T')[0];
    const horaActual = ahora.getHours();

    try {
      const q = query(
        collection(db, 'turnos'),
        where('uid', '==', user.uid),
        where('fecha', '==', hoyStr)
      );
      const snapshot = await getDocs(q);

      let turnoActivo = false;
      let mensajesActivos = [];
      let mensajesFuturos = [];

      snapshot.forEach(doc => {
        const turno = doc.data();
        const horaInicio = parseInt(turno.horaInicio.split(':')[0], 10);
        const horaFin = parseInt(turno.horaFin.split(':')[0], 10);

        if (horaActual >= horaInicio && horaActual < horaFin) {
          turnoActivo = true;
          mensajesActivos.push(`🟢 Turno activo: ${turno.horaInicio} - ${turno.horaFin}`);
        } else {
          mensajesFuturos.push(`📅 Turno agendado: ${turno.horaInicio} - ${turno.horaFin}`);
        }
      });

      setHabilitado(turnoActivo);
      setMensajeTurno([...mensajesActivos, ...mensajesFuturos].join(' | '));
    } catch (error) {
      console.error('Error al verificar turno del usuario:', error);
      setHabilitado(false);
      setMensajeTurno('');
    }
  };

  verificarTurnoActual();
  const interval = setInterval(verificarTurnoActual, 60000); // verifica cada minuto

  return () => clearInterval(interval);
}, [user]);

 
  //const mostrarMensaje = !user || !habilitado;
  const mostrarMensaje = false; 

  return (
    <div>
      <Box className={styles.container}>
        <Typography variant="h3" gutterBottom>
          {MAIN_TITLE}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {DESCRIPTION}
        </Typography>
        {mensajeTurno && (
          <Typography
            variant="body1"
            sx={{ mb: 2, color: habilitado ? 'green' : 'orange' }}
          >
            {mensajeTurno}
          </Typography>
        )}
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
