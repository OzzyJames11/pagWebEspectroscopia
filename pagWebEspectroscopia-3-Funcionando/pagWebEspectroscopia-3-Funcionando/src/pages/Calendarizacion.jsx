import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  Box, Typography, TextField, Button, MenuItem, Alert
} from '@mui/material';

const horasDisponibles = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00'
]; // últimas dos horas disponibles: 16:00–18:00

const Calendarizacion = () => {
  const user = useSelector(state => state.auth.user);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarHorasOcupadas = async () => {
      if (!fecha) return;
      const q = query(collection(db, 'turnos'), where('fecha', '==', fecha));
      const snap = await getDocs(q);
      const ocupadas = [];

      snap.forEach(doc => {
        const { horaInicio, horaFin } = doc.data();
        const ini = parseInt(horaInicio.split(':')[0]);
        const fin = parseInt(horaFin.split(':')[0]);
        for (let h = ini; h < fin; h++) {
          ocupadas.push(`${String(h).padStart(2, '0')}:00`);
        }
      });

      setHorasOcupadas(ocupadas);
    };

    cargarHorasOcupadas();
  }, [fecha]);

  const validar = () => {
    if (!fecha || !horaInicio || !duracion) return false;

    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDay(); // lunes = 1, domingo = 0
    const hora = parseInt(horaInicio.split(':')[0]);
    const fin = hora + duracion;

    if (dia === 0 || dia === 6) {
      setMensaje('Solo se puede agendar de lunes a viernes.');
      return false;
    }

    if (dia === 1 && hora >= 7 && hora < 9) {
      setMensaje('Los lunes entre 07:00 y 09:00 está reservado por mantenimiento.');
      return false;
    }

    if (hora < 6 || fin > 18) {
      setMensaje('El horario debe estar entre 06:00 y 18:00.');
      return false;
    }

    for (let i = 0; i < duracion; i++) {
      const h = `${String(hora + i).padStart(2, '0')}:00`;
      if (horasOcupadas.includes(h)) {
        setMensaje(`El horario ${h} ya está ocupado.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Inicia sesión para agendar.');
    setMensaje('');

    if (!validar()) return;

    try {
      const horaFin = `${String(parseInt(horaInicio) + duracion).padStart(2, '0')}:00`;

      await addDoc(collection(db, 'turnos'), {
        uid: user.uid,
        fecha,
        horaInicio,
        horaFin
      });

      setMensaje('✅ Turno agendado correctamente.');
      setHoraInicio('');
      setDuracion(1);
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al agendar el turno.');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Calendarización de Experimentos</Typography>
      {mensaje && <Alert severity={mensaje.startsWith('✅') ? 'success' : 'warning'}>{mensaje}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          required
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          margin="normal"
        />
        <TextField
          select
          label="Hora de inicio"
          fullWidth
          required
          value={horaInicio}
          onChange={e => setHoraInicio(e.target.value)}
          margin="normal"
        >
          {horasDisponibles.map(h =>
            <MenuItem key={h} value={h} disabled={horasOcupadas.includes(h)}>
              {h}
            </MenuItem>
          )}
        </TextField>
        <TextField
          select
          label="Duración (máx. 2 horas)"
          fullWidth
          required
          value={duracion}
          onChange={e => setDuracion(Number(e.target.value))}
          margin="normal"
        >
          {[1, 2].map(n => <MenuItem key={n} value={n}>{n} hora(s)</MenuItem>)}
        </TextField>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Agendar Turno
        </Button>
      </form>
    </Box>
  );
};

export default Calendarizacion;
