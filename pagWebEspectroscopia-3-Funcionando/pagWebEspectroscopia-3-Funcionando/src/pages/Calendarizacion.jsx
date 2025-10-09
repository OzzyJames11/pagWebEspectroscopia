import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = Array.from({ length: 13 }, (_, i) => `${6 + i}:00`);
const maxDuration = 2;

const getCurrentMonday = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const Calendarizacion = () => {
  const user = useSelector(state => state.auth.user);
  const [availability, setAvailability] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    country: '',
    description: ''
  });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [weekDates, setWeekDates] = useState([]);
  const [userTurnos, setUserTurnos] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [horaLocal, setHoraLocal] = useState('');
  const [horaPaises, setHoraPaises] = useState({});

  const currentMonday = getCurrentMonday();

  const fetchAvailability = async () => {
    const week = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + i);
      return date;
    });

    setWeekDates(week);

    const newAvailability = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
      const date = week[i];
      const dateStr = date.toISOString().split('T')[0];
      newAvailability[dateStr] = {};

      // ✅ Bloquear días pasados
      if (date < today) {
        times.forEach(t => {
          newAvailability[dateStr][t] = 'unavailable';
        });
        continue;
      }

      for (let t = 0; t < times.length; t++) {
        const hour = parseInt(times[t]);
        if (hour < 6 || (i === 0 && hour >= 7 && hour < 9)) {
          newAvailability[dateStr][times[t]] = 'maintenance';
          continue;
        }
        newAvailability[dateStr][times[t]] = 'available';
      }

      const q = query(collection(db, 'turnos'), where('fecha', '==', dateStr));
      const snap = await getDocs(q);
      snap.forEach(doc => {
        const { horaInicio, horaFin } = doc.data();
        const ini = parseInt(horaInicio);
        const fin = parseInt(horaFin);
        for (let h = ini; h < fin; h++) {
          const hStr = `${h}:00`;
          newAvailability[dateStr][hStr] = 'reserved';
        }
      });
    }
    setAvailability(newAvailability);
  };

  const fetchUserTurnos = async () => {
    if (!user) return;
    const q = query(collection(db, 'turnos'), where('uid', '==', user.uid));
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => {
      const data = doc.data();
      const turnoDate = new Date(`${data.fecha}T${data.horaFin}`);
      const isCompleted = new Date() >= turnoDate;
      return { id: doc.id, ...data, isCompleted };
    });
    setUserTurnos(results);
  };

  const obtenerHoraLocal = () => {
    return new Date().toLocaleTimeString('es-EC', {
      timeZone: 'America/Guayaquil',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const obtenerHoraPaises = () => {
    const paises = {
      Bolivia: 'America/La_Paz',
      Guatemala: 'America/Guatemala',
      Peru: 'America/Lima',
      España: 'Europe/Madrid',
      Francia: 'Europe/Paris'
    };

    // Offset de Ecuador en minutos
    const offsetEcuador = new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' });
    const horaEcuador = new Date(offsetEcuador);

    let horas = {};
    for (const [pais, zona] of Object.entries(paises)) {
      const fechaPais = new Date(new Date().toLocaleString('en-US', { timeZone: zona }));
      const diferenciaHoras = Math.round((fechaPais - horaEcuador) / (1000 * 60 * 60));
      const signo = diferenciaHoras >= 0 ? `+${diferenciaHoras}` : `${diferenciaHoras}`;
      horas[pais] = {
        hora: fechaPais.toLocaleTimeString('es-EC', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        diff: signo
      };
    }
    return horas;
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));
      fetchUserTurnos();
    }
  }, [user]);

    useEffect(() => {
    setHoraLocal(obtenerHoraLocal());
    setHoraPaises(obtenerHoraPaises());

    const intervalo = setInterval(() => {
      setHoraLocal(obtenerHoraLocal());
      setHoraPaises(obtenerHoraPaises());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const handleSlotClick = (dateStr, time) => {
    if (!user) return alert('Inicia sesión para agendar.');
    if (availability[dateStr][time] !== 'available') return;

    setSelectedSlot({ date: dateStr, time });
    setOpenDialog(true);
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    setOpenDialog(false);
    setConfirmDialog(true);
  };

  const handleConfirm = async () => {
    const hourStart = parseInt(selectedSlot.time);
    const hourEnd = hourStart + maxDuration;
    try {
      await addDoc(collection(db, 'turnos'), {
        uid: user.uid,
        ...formData,
        fecha: selectedSlot.date,
        horaInicio: `${hourStart}:00`,
        horaFin: `${hourEnd}:00`
      });
      setConfirmDialog(false);
      await fetchAvailability();
      await fetchUserTurnos();
      setSnackbarOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'turnos', id));
      await fetchAvailability();
      await fetchUserTurnos();
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting turno:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Calendar</Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        You can only schedule appointments Monday through Friday between 6:00 AM and 6:00 PM. Mondays between 7:00 AM and 9:00 AM are unavailable due to maintenance. You can schedule a maximum of two consecutive hours if the time is available. Click on an available time to start your reservation.
      </Alert>

      <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
        <Alert severity="success" icon={<AccessTimeIcon fontSize="inherit" />} sx={{
          width: "100%",
          maxWidth: 500,
          textAlign: "center",
          background: "linear-gradient(135deg, #d4fc79, #96e6a1)", // degradado verde
          color: "#1b4332",
          borderRadius: 3,
          boxShadow: 3,
          p: 3,
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🕑 Hora en tiempo real
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Ecuador:</strong> {horaLocal}
          </Typography>
          {Object.entries(horaPaises).map(([pais, data]) => (
          <Typography key={pais} variant="body2" sx={{ mt: 0.5 }}>
            <strong>{pais}:</strong> {data.hora}{" "}
            <span style={{ color: data.diff === 0 ? "green" : "gray" }}>
              ({data.diff === 0
               ? "Misma hora"
               : `${data.diff > 0 ? "+" : ""}${data.diff}h respecto a Ecuador`})
            </span>
          </Typography>
           ))}
        </Alert>
     </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Legend:</strong> 
        <span style={{ backgroundColor: '#aed581', padding: '0 8px' }}>available</span> = Disponible, 
        <span style={{ backgroundColor: '#4fc3f7', padding: '0 8px' }}>reserved</span> = Reservado, 
        <span style={{ backgroundColor: '#b0bec5', padding: '0 8px' }}>maintenance</span> = Mantenimiento, 
        <span style={{ backgroundColor: '#ef9a9a', padding: '0 8px' }}>unavailable</span> = Día pasado
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Time</th>
                  {weekDates.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return <th key={i}>{days[i]}<br />{dateStr}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {times.map((time, i) => (
                  <tr key={i}>
                    <td>{time}</td>
                    {weekDates.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const status = availability[dateStr]?.[time] || 'loading';

                      const bgColor = {
                        available: '#aed581',
                        reserved: '#4fc3f7',
                        maintenance: '#b0bec5',
                        loading: '#eeeeee',
                        unavailable: '#ef9a9a'
                      }[status];

                      return (
                        <td
                          key={dayIdx}
                          onClick={() => status === 'available' && handleSlotClick(dateStr, time)}
                          style={{
                            backgroundColor: bgColor,
                            padding: 8,
                            textAlign: 'center',
                            cursor: status === 'available' ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>My Scheduled Appointments</Typography>
          <Paper>
            <List>
              {userTurnos.map((turno, i) => (
                <React.Fragment key={i}>
                  <ListItem
                    secondaryAction={!turno.isCompleted && (
                      <IconButton edge="end" onClick={() => handleDelete(turno.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  >
                    <ListItemText
                      primary={`📅 ${turno.fecha} | ⏰ ${turno.horaInicio} - ${turno.horaFin}`}
                      secondary={`🧪 ${turno.description || 'No description'} ${turno.isCompleted ? '✅ Completed' : ''}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {userTurnos.length === 0 && (
                <ListItem>
                  <ListItemText primary="You have no scheduled appointments." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reservation Form</DialogTitle>
        <DialogContent>
          {['name', 'email'].map((field, i) => (
            <TextField
              key={i}
              label={field[0].toUpperCase() + field.slice(1)}
              name={field}
              fullWidth
              margin="dense"
              value={formData[field]}
              InputProps={{ readOnly: true }}
            />
          ))}
          {['institution', 'country'].map((field, i) => (
            <TextField
              key={i}
              label={field[0].toUpperCase() + field.slice(1)}
              name={field}
              fullWidth
              margin="dense"
              value={formData[field]}
              onChange={handleChange}
            />
          ))}
          <TextField
            label="Describe your experiment"
            name="description"
            fullWidth
            margin="dense"
            multiline
            rows={2}
            value={formData.description}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmed reservation</DialogTitle>
        <DialogContent>
          <Typography>Reservation Data:</Typography>
          <Typography>Name: {formData.name}</Typography>
          <Typography>Institution: {formData.institution}</Typography>
          <Typography>Date: {selectedSlot?.date}</Typography>
          <Typography>Time: {selectedSlot?.time} - {parseInt(selectedSlot?.time) + maxDuration}:00</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => { setConfirmDialog(false); setOpenDialog(true); }}>Edit</Button>
          <Button variant="contained" color="error" onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Operación realizada exitosamente"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Calendarizacion;
