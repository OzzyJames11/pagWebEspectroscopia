import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import { TURNOS_CONFIG } from '../assets/Strings/ConfiguracionTurnos';

const getEcuadorTime = () => {
  const ecuadorDateStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
  const ecuadorDate = new Date(ecuadorDateStr);
  const year = ecuadorDate.getFullYear();
  const month = String(ecuadorDate.getMonth() + 1).padStart(2, '0');
  const day = String(ecuadorDate.getDate()).padStart(2, '0');
  
  return {
    fechaEcuadorStr: `${year}-${month}-${day}`,
    fechaObjetoEcuador: ecuadorDate
  };
};

const AlertaGlobalTurno = () => {
  const [mensaje, setMensaje] = useState(null);
  // 🚀 CAMBIO 1: Ahora guardamos TODOS los turnos de hoy en un arreglo
  const [turnosDeHoy, setTurnosDeHoy] = useState([]); 
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  // EFECTO 1: Descargar la lista de turnos (Se actualiza solo si hay cambios en Firebase)
  useEffect(() => {
    if (!user) {
      setTurnosDeHoy([]);
      return;
    }

    const { fechaEcuadorStr } = getEcuadorTime();
    const q = query(collection(db, 'turnos'), where('uid', '==', user.uid), where('fecha', '==', fechaEcuadorStr));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turnosGuardados = [];
      snapshot.forEach(doc => {
        turnosGuardados.push({ id: doc.id, ...doc.data() });
      });
      setTurnosDeHoy(turnosGuardados);
    });

    return () => unsubscribe();
  }, [user]);

  // EFECTO 2: El Cronómetro Invasivo (Se actualiza cada segundo)
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (turnosDeHoy.length === 0) {
        setMensaje(null);
        return;
      }

      const { fechaObjetoEcuador } = getEcuadorTime();
      let turnoActivoEnEsteSegundo = null;

      // 🚀 CAMBIO 2: Evaluamos cuál es el turno activo EN TIEMPO REAL cada segundo
      turnosDeHoy.forEach(turno => {
        const [horaI, minI] = turno.horaInicio.split(':');
        const [horaF, minF] = turno.horaFin.split(':');
        
        const inicioDate = new Date(fechaObjetoEcuador);
        inicioDate.setHours(parseInt(horaI), parseInt(minI), 0, 0);
        
        const finDate = new Date(fechaObjetoEcuador);
        finDate.setHours(parseInt(horaF), parseInt(minF), 0, 0);

        if (fechaObjetoEcuador >= inicioDate && fechaObjetoEcuador < finDate) {
          turnoActivoEnEsteSegundo = turno;
        }
      });

      // Si no hay turno activo ahora mismo, escondemos el mensaje
      if (!turnoActivoEnEsteSegundo) {
        setMensaje(null);
        return;
      }

      // Si ya lo expulsamos de ESTE turno, lo ignoramos para que pueda navegar
      if (sessionStorage.getItem(`expulsado_${turnoActivoEnEsteSegundo.id}`)) {
        setMensaje(null);
        return;
      }

      // Matemáticas de tiempos usando tu configuración
      const [horaF, minF] = turnoActivoEnEsteSegundo.horaFin.split(':');
      const finReal = new Date(fechaObjetoEcuador);
      finReal.setHours(parseInt(horaF), parseInt(minF), 0, 0);

      const finAjustado = new Date(finReal.getTime() - (TURNOS_CONFIG.MINUTOS_RECORTE_FIN * 60000));
      const tiempoAlerta = new Date(finAjustado.getTime() - (TURNOS_CONFIG.MINUTOS_ALERTA_PREVIA * 60000));

      if (fechaObjetoEcuador >= finAjustado) {
        // SE ACABÓ EL TIEMPO
        sessionStorage.setItem(`expulsado_${turnoActivoEnEsteSegundo.id}`, 'true'); 
        setMensaje(null);
        alert("Your session has safely concluded. The hardware is returning to its resting position.");
        navigate('/'); 
      } 
      else if (fechaObjetoEcuador >= tiempoAlerta) {
        // ZONA DE ALERTA ROJA
        const minutosRestantes = Math.ceil((finAjustado - fechaObjetoEcuador) / 60000);
        setMensaje(`⚠️ IMPORTANT: Your experiment session will automatically close in ${minutosRestantes} minutes for safety protocols. Please wrap up your work.`);
      } else {
        // AÚN HAY TIEMPO DE SOBRA
        setMensaje(null); 
      }
    }, 1000); 

    return () => clearInterval(intervalo);
  }, [turnosDeHoy, navigate]);


  if (!mensaje) return null;

  return (
    <Box sx={{
      position: 'fixed', bottom: 20, left: 20, width: 'auto', maxWidth: '350px', zIndex: 9999,
      backgroundColor: '#d32f2f', color: 'white', textAlign: 'left', p: 2, borderRadius: '8px', 
      boxShadow: '0px 4px 15px rgba(0,0,0,0.5)', fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.9rem'
    }}>
      {mensaje}
    </Box>
  );
};

export default AlertaGlobalTurno;