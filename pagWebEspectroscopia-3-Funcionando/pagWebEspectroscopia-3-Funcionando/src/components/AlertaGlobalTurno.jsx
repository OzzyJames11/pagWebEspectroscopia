// src/components/AlertaGlobalTurno.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ajusta esta ruta si es necesario
import { TURNOS_CONFIG } from '../assets/Strings/ConfiguracionTurnos';

// Función auxiliar para obtener la hora exacta en Ecuador siempre
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
  const [turnoActivo, setTurnoActivo] = useState(null);
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

//   // EFECTO 1: Descargar los turnos del usuario para HOY
//   useEffect(() => {
//     if (!user) {
//       setTurnoActivo(null);
//       return;
//     }

//     const { fechaEcuadorStr } = getEcuadorTime();
//     const q = query(collection(db, 'turnos'), where('uid', '==', user.uid), where('fecha', '==', fechaEcuadorStr));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       let turnoActualEncontrado = null;
//       const { fechaObjetoEcuador } = getEcuadorTime();

//       snapshot.forEach(doc => {
//         const turno = doc.data();
//         const [horaI, minI] = turno.horaInicio.split(':');
//         const [horaF, minF] = turno.horaFin.split(':');
        
//         // Creamos objetos Date para el inicio y el fin basándonos en hoy (Ecuador)
//         const inicioDate = new Date(fechaObjetoEcuador);
//         inicioDate.setHours(parseInt(horaI), parseInt(minI), 0);
        
//         const finDate = new Date(fechaObjetoEcuador);
//         finDate.setHours(parseInt(horaF), parseInt(minF), 0);

//         // Si la hora actual de Ecuador está dentro del turno, lo guardamos
//         if (fechaObjetoEcuador >= inicioDate && fechaObjetoEcuador < finDate) {
//           turnoActualEncontrado = turno;
//         }
//       });

//       setTurnoActivo(turnoActualEncontrado);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   // EFECTO 2: El Cronómetro Invasivo
//   useEffect(() => {
//     if (!turnoActivo) {
//       setMensaje(null);
//       return;
//     }

//     const intervalo = setInterval(() => {
//       const { fechaObjetoEcuador } = getEcuadorTime();
      
//       const [horaF, minF] = turnoActivo.horaFin.split(':');
//       const finReal = new Date(fechaObjetoEcuador);
//       finReal.setHours(parseInt(horaF), parseInt(minF), 0);

//       // Calculamos los tiempos exactos
//       const finAjustado = new Date(finReal.getTime() - (TURNOS_CONFIG.TIEMPO_BUFFER_FIN_MINUTOS * 60000));
//       const tiempoAlerta = new Date(finAjustado.getTime() - (TURNOS_CONFIG.TIEMPO_ALERTA_PREVIA_MINUTOS * 60000));

//       if (fechaObjetoEcuador >= finAjustado) {
//         // 🚀 SE ACABÓ EL TIEMPO PERMITIDO
//         clearInterval(intervalo); // 👈 ¡NUEVO! Destruimos el reloj para evitar alertas infinitas
//         setMensaje(null);
//         alert("Your session has safely concluded. The hardware is returning to its resting position.");
//         navigate('/'); // 👈 ¡CORREGIDO! Ahora te lleva correctamente a Home
//       } 
//       else if (fechaObjetoEcuador >= tiempoAlerta) {
//         // ⚠️ EN ZONA DE ALERTA ROJA
//         const minutosRestantes = Math.ceil((finAjustado - fechaObjetoEcuador) / 60000);
//         setMensaje(`⚠️ IMPORTANT: Your experiment session will automatically close in ${minutosRestantes} minutes for safety protocols. Please wrap up your work.`);
//       } else {
//         setMensaje(null); // Aún hay tiempo de sobra
//       }
//     }, 1000); // Revisa cada segundo para mayor precisión

//     return () => clearInterval(intervalo);
//   }, [turnoActivo, navigate]);


// EFECTO 1: Descargar los turnos del usuario para HOY
useEffect(() => {
    if (!user) {
      setTurnoActivo(null);
      return;
    }

    const { fechaEcuadorStr } = getEcuadorTime();
    const q = query(collection(db, 'turnos'), where('uid', '==', user.uid), where('fecha', '==', fechaEcuadorStr));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let turnoActualEncontrado = null;
      const { fechaObjetoEcuador } = getEcuadorTime();

      snapshot.forEach(doc => {
        // 🚀 NUEVO: Extraemos el ID único del turno desde Firebase
        const turno = { id: doc.id, ...doc.data() }; 
        const [horaI, minI] = turno.horaInicio.split(':');
        const [horaF, minF] = turno.horaFin.split(':');
        
        const inicioDate = new Date(fechaObjetoEcuador);
        inicioDate.setHours(parseInt(horaI), parseInt(minI), 0);
        
        const finDate = new Date(fechaObjetoEcuador);
        finDate.setHours(parseInt(horaF), parseInt(minF), 0);

        if (fechaObjetoEcuador >= inicioDate && fechaObjetoEcuador < finDate) {
          turnoActualEncontrado = turno;
        }
      });

      setTurnoActivo(turnoActualEncontrado);
    });

    return () => unsubscribe();
  }, [user]);

  // EFECTO 2: El Cronómetro Invasivo
  useEffect(() => {
    if (!turnoActivo) {
      setMensaje(null);
      return;
    }

    // 🚀 SEGURO ANTI-BUCLES: Si ya lo expulsamos de ESTE turno, lo ignoramos y lo dejamos navegar
    if (sessionStorage.getItem(`expulsado_${turnoActivo.id}`)) {
      setMensaje(null);
      return;
    }

    const intervalo = setInterval(() => {
      const { fechaObjetoEcuador } = getEcuadorTime();
      
      const [horaF, minF] = turnoActivo.horaFin.split(':');
      const finReal = new Date(fechaObjetoEcuador);
      finReal.setHours(parseInt(horaF), parseInt(minF), 0);

      const finAjustado = new Date(finReal.getTime() - (TURNOS_CONFIG.TIEMPO_BUFFER_FIN_MINUTOS * 60000));
      const tiempoAlerta = new Date(finAjustado.getTime() - (TURNOS_CONFIG.TIEMPO_ALERTA_PREVIA_MINUTOS * 60000));

      if (fechaObjetoEcuador >= finAjustado) {
        // 🚀 SE ACABÓ EL TIEMPO PERMITIDO
        clearInterval(intervalo); // Destruimos el reloj
        
        // 🚀 MARCAMOS COMO EXPULSADO (Guardamos el ID en la memoria temporal del navegador)
        sessionStorage.setItem(`expulsado_${turnoActivo.id}`, 'true'); 
        
        setMensaje(null);
        alert("Your session has safely concluded. The hardware is returning to its resting position.");
        
        // Usamos '/home' para coincidir con tu ruta principal si es esa
        navigate('/'); 
      } 
      else if (fechaObjetoEcuador >= tiempoAlerta) {
        // ⚠️ EN ZONA DE ALERTA ROJA
        const minutosRestantes = Math.ceil((finAjustado - fechaObjetoEcuador) / 60000);
        setMensaje(`⚠️ IMPORTANT: Your experiment session will automatically close in ${minutosRestantes} minutes for safety protocols. Please wrap up your work.`);
      } else {
        setMensaje(null); 
      }
    }, 1000); 

    return () => clearInterval(intervalo);
  }, [turnoActivo, navigate]);


  // Renderizado Condicional: Si no hay mensaje, el componente es invisible
  if (!mensaje) return null;


return (
    // 🚀 CAJA FLOTANTE EN LA ESQUINA INFERIOR IZQUIERDA
    <Box sx={{
      position: 'fixed', 
      bottom: 20,     // Lo mandamos abajo para liberar el Header
      left: 20,       // Pegado a la izquierda
      width: 'auto',  // Ya no ocupa toda la pantalla
      maxWidth: '350px', // Ancho máximo para que sea un recuadro
      zIndex: 9999,
      backgroundColor: '#d32f2f', 
      color: 'white', 
      textAlign: 'left', 
      p: 2, 
      borderRadius: '8px', // Bordes redondeados
      boxShadow: '0px 4px 15px rgba(0,0,0,0.5)', 
      fontFamily: '"Poppins", sans-serif', 
      fontWeight: 600, 
      fontSize: '0.9rem'
    }}>
      {mensaje}
    </Box>
  );


};

export default AlertaGlobalTurno;