// modificaciones para que la hora oficial de cierre sea :50
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2'; 
import styles from '../../assets/css/experimentsChooser.module.css';
import Button from '../../components/Elements/Button';
import { PAGE_TITLES, SUBSYSTEMS } from '../../assets/Strings/Experiments/ExperimentChooserStrings.jsx';
import { db, database } from '../../firebaseConfig.js';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { ref, onValue } from "firebase/database"; 
import { TURNOS_CONFIG } from '../../assets/Strings/ConfiguracionTurnos';

const ExperimentChooser = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  
  // const [habilitado, setHabilitado] = useState(false);
  // const [mensajeTurno, setMensajeTurno] = useState('');
  const [habilitado, setHabilitado] = useState(false);
  const [mensajes, setMensajes] = useState({ activo: null, futuros: null });
  const [turnosDeHoy, setTurnosDeHoy] = useState([]); 

  const [estadoHardware, setEstadoHardware] = useState({
    Exp1: 'CALIBRATING',
    Exp2: 'CALIBRATING',
    Exp3: 'CALIBRATING'
  });

  const { MAIN_TITLE, DESCRIPTION, VIEW_SUBSYSTEM_BUTTON } = PAGE_TITLES;

  const handleNavigation = (path) => {
    navigate(path);
  };

  // =================================================================
  // 🕒 FUNCIÓN MAESTRA: OBTENER FECHA Y HORA EXACTAS DE ECUADOR
  // =================================================================
  const getEcuadorTime = () => {
    // Convierte el reloj del usuario a la zona horaria de Ecuador
    const ecuadorDateStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const ecuadorDate = new Date(ecuadorDateStr);
    
    const year = ecuadorDate.getFullYear();
    const month = String(ecuadorDate.getMonth() + 1).padStart(2, '0');
    const day = String(ecuadorDate.getDate()).padStart(2, '0');
    
    return {
      hoyStr: `${year}-${month}-${day}`, // Ej: "2026-04-14" siempre en hora de Ecuador
      horaActual: ecuadorDate.getHours() // Ej: 17 (5 PM) siempre en hora de Ecuador
    };
  };

  // =================================================================
  // EFECTO 1: DESCARGAR LOS TURNOS DEL USUARIO EN TIEMPO REAL
  // =================================================================
  useEffect(() => {
    if (!user) {
      setTurnosDeHoy([]);
      setHabilitado(false);
      return;
    }

    const q = query(collection(db, 'turnos'), where('uid', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 🚀 Usamos la fecha de Ecuador para filtrar
      const { hoyStr } = getEcuadorTime(); 
      
      const turnos = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.fecha === hoyStr) {
          turnos.push(data);
        }
      });
      setTurnosDeHoy(turnos);
    }, (error) => {
      console.error("❌ [CHOOSER] Error descargando turnos: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // =================================================================
  // EFECTO 1.5: RELOJ LOCAL PARA HABILITAR/DESHABILITAR EL BOTÓN
  // =================================================================
  useEffect(() => {
    const verificarHora = () => {
      if (turnosDeHoy.length === 0) {
        setHabilitado(false);
        setMensajes({ activo: null, futuros: null });
        return;
      }

      // Obtenemos la fecha/hora exacta en Ecuador en este instante
      const ecuadorDateStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
      const horaRealEcuador = new Date(ecuadorDateStr);
      
      let turnoActivo = false;
      let mensajesActivos = [];
      let mensajesFuturos = [];

      turnosDeHoy.forEach(turno => {
        // Creamos objeto Date para la hora de inicio
        const [hI, mI] = turno.horaInicio.split(':');
        const horaInicioObj = new Date(ecuadorDateStr);
        horaInicioObj.setHours(parseInt(hI), parseInt(mI), 0, 0);

        // Creamos objeto Date para la hora de fin original (Ej: 10:00)
        const [hF, mF] = turno.horaFin.split(':');
        const horaFinOriginalObj = new Date(ecuadorDateStr);
        horaFinOriginalObj.setHours(parseInt(hF), parseInt(mF), 0, 0);

        // 🚀 MAGIA: Le restamos los minutos de recorte (Ej: 10:00 - 10 min = 9:50)
        const finAjustadoObj = new Date(horaFinOriginalObj.getTime() - (TURNOS_CONFIG.MINUTOS_RECORTE_FIN * 60000));

        // Función para formatear la hora (ej: 9:50 en lugar de 9:5)
        const formatearHora = (dateObj) => `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        const horaFinDisplay = formatearHora(finAjustadoObj);

        // Evaluamos si el turno está activo usando la hora AJUSTADA
        if (horaRealEcuador >= horaInicioObj && horaRealEcuador < finAjustadoObj) {
          turnoActivo = true;
          mensajesActivos.push(`🟢 Active appointment: ${turno.horaInicio} - ${horaFinDisplay}`);
        } else if (horaRealEcuador < horaInicioObj) {
          mensajesFuturos.push(`📅 Scheduled appointment: ${turno.horaInicio} - ${horaFinDisplay}`);
        }
      });

      setHabilitado(turnoActivo);
      // Guardamos el primer turno activo, y si hay futuros, los unimos (si es que hay varios)
      setMensajes({
        activo: mensajesActivos.length > 0 ? mensajesActivos[0] : null,
        futuros: mensajesFuturos.length > 0 ? mensajesFuturos.join(' | ') : null
      });
    };

    verificarHora(); 
    const interval = setInterval(verificarHora, 10000); 
    return () => clearInterval(interval);
  }, [turnosDeHoy]);

  useEffect(() => {
    const statusRef = ref(database, 'estado_general');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setEstadoHardware({
          Exp1: data?.Exp1?.hardwareStatus || 'CALIBRATING',
          Exp2: data?.Exp2?.hardwareStatus || 'CALIBRATING',
          Exp3: data?.Exp3?.hardwareStatus || 'CALIBRATING',
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const mostrarMensaje = !user || !habilitado; 

  return (
    <div>
      <Box className={styles.container} mt={9}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          {MAIN_TITLE}
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', textAlign: 'center', maxWidth: '800px', mb: 2 }}>
          {DESCRIPTION}
        </Typography>
        
        {/* ✅ CAJA GLOBAL DE MENSAJES (FIJA) */}
        {/* minHeight: '60px' asegura que el espacio esté reservado y nada salte */}
        {/* ✅ CAJA GLOBAL DE MENSAJES CON BORDE DINÁMICO */}
        <Box 
          sx={{ 
            minHeight: '40px', // Un poco más de altura para el padding interno
            mb: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            textAlign: 'center',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto 15px auto',
            // --- ESTILOS DEL RECUADRO ---
            padding: '15px 25px',
            borderRadius: '10px',
            border: '1.5px solid', 
            // Color de borde dinámico: Verde si está habilitado, Rojo si no
            borderColor: habilitado ? '#4caf50' : '#d32f2f',
            // Fondo sutil: un tono muy suave del mismo color para que no sea blanco puro
            backgroundColor: habilitado ? 'rgba(76, 175, 80, 0.04)' : 'rgba(211, 47, 47, 0.04)',
          }}
        >
          

{habilitado ? (
            // 🟢 MENSAJE ÉXITO (TURNO ACTIVO)
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, fontFamily: '"Poppins", sans-serif' }}>
                {mensajes.activo}
              </Typography>
              
              {/* Si tiene un turno activo PERO también tiene turnos futuros agendados */}
              {mensajes.futuros && (
                <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 400, mt: 1, borderTop: '1px solid rgba(46, 125, 50, 0.2)', pt: 1, width: '100%', fontFamily: '"Poppins", sans-serif' }}>
                  {mensajes.futuros}
                </Typography>
              )}
            </Box>
          ) : (
            // 🔴 MENSAJE ERROR (SIN TURNO)
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 600, mb: 0.5, fontFamily: '"Poppins", sans-serif' }}>
                ⚠ Access Restricted
              </Typography>
              <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 220, fontFamily: '"Poppins", sans-serif' }}>
                You must be logged in and have an active scheduled appointment to access the experiments.
              </Typography>
              
              {/* Si NO tiene turno activo, pero SÍ tiene turnos futuros agendados */}
              {mensajes.futuros && (
                <Typography variant="body2" sx={{ color: '#ed6c02', fontWeight: 500, mt: 1, borderTop: '1px solid rgba(237, 108, 2, 0.2)', pt: 1, width: '100%', fontFamily: '"Poppins", sans-serif' }}>
                  {mensajes.futuros}
                </Typography>
              )}
            </Box>
          )}

        </Box>

        <Grid2 container spacing={4} justifyContent="center" className={styles.gridContainer}>
        {SUBSYSTEMS.map((subsistema, index) => {
          const esSubsistemaConHardware = index < 3; 
          const hardwareID = `Exp${index + 1}`;
          const isHardwareReady = esSubsistemaConHardware ? estadoHardware[hardwareID] === 'READY' : true;

          const botonBloqueado = mostrarMensaje || !isHardwareReady;

          let textoBoton = VIEW_SUBSYSTEM_BUTTON;
          if (esSubsistemaConHardware && !mostrarMensaje && !isHardwareReady) {
            textoBoton = '⏳ CALIBRATING...';
          }

          return (
            <Grid2 item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card className={styles.card}>
              <CardContent className={styles.cardContent}>
                  <Typography variant="h5" gutterBottom className={styles.title}>
                    {subsistema.title}
                  </Typography>
                  
                  <Typography className={styles.description}>
                    {subsistema.description}
                  </Typography>
                  
                  <Box className={styles.buttonContainer}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleNavigation(subsistema.path)}
                      disabled={botonBloqueado}
                    >
                      {textoBoton}
                    </Button>
                  </Box>

                </CardContent>
              </Card>
            </Grid2>
          );
        })}
        </Grid2>
      </Box>
    </div>
  );
};

export default ExperimentChooser;