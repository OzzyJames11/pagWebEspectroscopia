// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { db } from '../firebaseConfig';
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   deleteDoc,
//   doc
// } from 'firebase/firestore';
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Paper,
//   Alert,
//   Stack,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   Snackbar,
//   IconButton
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AccessTimeIcon from "@mui/icons-material/AccessTime";

// const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// const times = Array.from({ length: 13 }, (_, i) => `${6 + i}:00`);
// const maxDuration = 2;

// const getCurrentMonday = () => {
//   const today = new Date();
//   const day = today.getDay();
//   const diff = today.getDate() - day + (day === 0 ? -6 : 1);
//   const monday = new Date(today.setDate(diff));
//   monday.setHours(0, 0, 0, 0);
//   return monday;
// };

// const Calendarizacion = () => {
//   const user = useSelector(state => state.auth.user);
//   const [availability, setAvailability] = useState({});
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     institution: '',
//     country: '',
//     description: ''
//   });
//   const [confirmDialog, setConfirmDialog] = useState(false);
//   const [weekDates, setWeekDates] = useState([]);
//   const [userTurnos, setUserTurnos] = useState([]);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [horaLocal, setHoraLocal] = useState('');
//   const [horaPaises, setHoraPaises] = useState({});

//   const currentMonday = getCurrentMonday();

//   const fetchAvailability = async () => {
//     const week = Array.from({ length: 5 }, (_, i) => {
//       const date = new Date(currentMonday);
//       date.setDate(currentMonday.getDate() + i);
//       return date;
//     });

//     setWeekDates(week);

//     const newAvailability = {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     for (let i = 0; i < 5; i++) {
//       const date = week[i];
//       const dateStr = date.toISOString().split('T')[0];
//       newAvailability[dateStr] = {};

//       // ✅ Bloquear días pasados
//       if (date < today) {
//         times.forEach(t => {
//           newAvailability[dateStr][t] = 'unavailable';
//         });
//         continue;
//       }

//       for (let t = 0; t < times.length; t++) {
//         const hour = parseInt(times[t]);
//         if (hour < 6 || (i === 0 && hour >= 7 && hour < 9)) {
//           newAvailability[dateStr][times[t]] = 'maintenance';
//           continue;
//         }
//         newAvailability[dateStr][times[t]] = 'available';
//       }

//       const q = query(collection(db, 'turnos'), where('fecha', '==', dateStr));
//       const snap = await getDocs(q);
//       snap.forEach(doc => {
//         const { horaInicio, horaFin } = doc.data();
//         const ini = parseInt(horaInicio);
//         const fin = parseInt(horaFin);
//         for (let h = ini; h < fin; h++) {
//           const hStr = `${h}:00`;
//           newAvailability[dateStr][hStr] = 'reserved';
//         }
//       });
//     }
//     setAvailability(newAvailability);
//   };

//   const fetchUserTurnos = async () => {
//     if (!user) return;
//     const q = query(collection(db, 'turnos'), where('uid', '==', user.uid));
//     const snap = await getDocs(q);
//     const results = snap.docs.map(doc => {
//       const data = doc.data();
//       const turnoDate = new Date(`${data.fecha}T${data.horaFin}`);
//       const isCompleted = new Date() >= turnoDate;
//       return { id: doc.id, ...data, isCompleted };
//     });
//     setUserTurnos(results);
//   };

//   const obtenerHoraLocal = () => {
//     return new Date().toLocaleTimeString('es-EC', {
//       timeZone: 'America/Guayaquil',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };

//   const obtenerHoraPaises = () => {
//     const paises = {
//       Bolivia: 'America/La_Paz',
//       Guatemala: 'America/Guatemala',
//       Peru: 'America/Lima',
//       España: 'Europe/Madrid',
//       Francia: 'Europe/Paris'
//     };

//     // Offset de Ecuador en minutos
//     const offsetEcuador = new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' });
//     const horaEcuador = new Date(offsetEcuador);

//     let horas = {};
//     for (const [pais, zona] of Object.entries(paises)) {
//       const fechaPais = new Date(new Date().toLocaleString('en-US', { timeZone: zona }));
//       const diferenciaHoras = Math.round((fechaPais - horaEcuador) / (1000 * 60 * 60));
//       const signo = diferenciaHoras >= 0 ? `+${diferenciaHoras}` : `${diferenciaHoras}`;
//       horas[pais] = {
//         hora: fechaPais.toLocaleTimeString('es-EC', {
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit'
//         }),
//         diff: signo
//       };
//     }
//     return horas;
//   };

//   useEffect(() => {
//     fetchAvailability();
//   }, []);

//   useEffect(() => {
//     if (user) {
//       setFormData(prev => ({
//         ...prev,
//         name: user.displayName || '',
//         email: user.email || ''
//       }));
//       fetchUserTurnos();
//     }
//   }, [user]);

//     useEffect(() => {
//     setHoraLocal(obtenerHoraLocal());
//     setHoraPaises(obtenerHoraPaises());

//     const intervalo = setInterval(() => {
//       setHoraLocal(obtenerHoraLocal());
//       setHoraPaises(obtenerHoraPaises());
//     }, 1000);

//     return () => clearInterval(intervalo);
//   }, []);

//   const handleSlotClick = (dateStr, time) => {
//     if (!user) return alert('Inicia sesión para agendar.');
//     if (availability[dateStr][time] !== 'available') return;

//     setSelectedSlot({ date: dateStr, time });
//     setOpenDialog(true);
//   };

//   const handleChange = e => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = () => {
//     setOpenDialog(false);
//     setConfirmDialog(true);
//   };

//   const handleConfirm = async () => {
//     const hourStart = parseInt(selectedSlot.time);
//     const hourEnd = hourStart + maxDuration;
//     try {
//       await addDoc(collection(db, 'turnos'), {
//         uid: user.uid,
//         ...formData,
//         fecha: selectedSlot.date,
//         horaInicio: `${hourStart}:00`,
//         horaFin: `${hourEnd}:00`
//       });
//       setConfirmDialog(false);
//       await fetchAvailability();
//       await fetchUserTurnos();
//       setSnackbarOpen(true);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteDoc(doc(db, 'turnos', id));
//       await fetchAvailability();
//       await fetchUserTurnos();
//       setSnackbarOpen(true);
//     } catch (error) {
//       console.error('Error deleting turno:', error);
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" gutterBottom>Calendar</Typography>

//       <Alert severity="info" sx={{ mb: 3 }}>
//         You can only schedule appointments Monday through Friday between 6:00 AM and 6:00 PM. Mondays between 7:00 AM and 9:00 AM are unavailable due to maintenance. You can schedule a maximum of two consecutive hours if the time is available. Click on an available time to start your reservation.
//       </Alert>

//       <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
//         <Alert severity="success" icon={<AccessTimeIcon fontSize="inherit" />} sx={{
//           width: "100%",
//           maxWidth: 500,
//           textAlign: "center",
//           background: "linear-gradient(135deg, #d4fc79, #96e6a1)", // degradado verde
//           color: "#1b4332",
//           borderRadius: 3,
//           boxShadow: 3,
//           p: 3,
//         }}>
//           <Typography variant="h6" fontWeight="bold" gutterBottom>
//             🕑 Hora en tiempo real
//           </Typography>
//           <Typography variant="body1" gutterBottom>
//             <strong>Ecuador:</strong> {horaLocal}
//           </Typography>
//           {Object.entries(horaPaises).map(([pais, data]) => (
//           <Typography key={pais} variant="body2" sx={{ mt: 0.5 }}>
//             <strong>{pais}:</strong> {data.hora}{" "}
//             <span style={{ color: data.diff === 0 ? "green" : "gray" }}>
//               ({data.diff === 0
//                ? "Misma hora"
//                : `${data.diff > 0 ? "+" : ""}${data.diff}h respecto a Ecuador`})
//             </span>
//           </Typography>
//            ))}
//         </Alert>
//      </Box>

//       <Alert severity="info" sx={{ mb: 3 }}>
//         <strong>Legend:</strong> 
//         <span style={{ backgroundColor: '#aed581', padding: '0 8px' }}>available</span> = Disponible, 
//         <span style={{ backgroundColor: '#4fc3f7', padding: '0 8px' }}>reserved</span> = Reservado, 
//         <span style={{ backgroundColor: '#b0bec5', padding: '0 8px' }}>maintenance</span> = Mantenimiento, 
//         <span style={{ backgroundColor: '#ef9a9a', padding: '0 8px' }}>unavailable</span> = Día pasado
//       </Alert>

//       <Grid container spacing={3}>
//         <Grid item xs={12} md={8}>
//           <Paper>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th>Time</th>
//                   {weekDates.map((date, i) => {
//                     const dateStr = date.toISOString().split('T')[0];
//                     return <th key={i}>{days[i]}<br />{dateStr}</th>;
//                   })}
//                 </tr>
//               </thead>
//               <tbody>
//                 {times.map((time, i) => (
//                   <tr key={i}>
//                     <td>{time}</td>
//                     {weekDates.map((date, dayIdx) => {
//                       const dateStr = date.toISOString().split('T')[0];
//                       const status = availability[dateStr]?.[time] || 'loading';

//                       const bgColor = {
//                         available: '#aed581',
//                         reserved: '#4fc3f7',
//                         maintenance: '#b0bec5',
//                         loading: '#eeeeee',
//                         unavailable: '#ef9a9a'
//                       }[status];

//                       return (
//                         <td
//                           key={dayIdx}
//                           onClick={() => status === 'available' && handleSlotClick(dateStr, time)}
//                           style={{
//                             backgroundColor: bgColor,
//                             padding: 8,
//                             textAlign: 'center',
//                             cursor: status === 'available' ? 'pointer' : 'not-allowed'
//                           }}
//                         >
//                           {status}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </Paper>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Typography variant="h6" gutterBottom>My Scheduled Appointments</Typography>
//           <Paper>
//             <List>
//               {userTurnos.map((turno, i) => (
//                 <React.Fragment key={i}>
//                   <ListItem
//                     secondaryAction={!turno.isCompleted && (
//                       <IconButton edge="end" onClick={() => handleDelete(turno.id)}>
//                         <DeleteIcon />
//                       </IconButton>
//                     )}
//                   >
//                     <ListItemText
//                       primary={`📅 ${turno.fecha} | ⏰ ${turno.horaInicio} - ${turno.horaFin}`}
//                       secondary={`🧪 ${turno.description || 'No description'} ${turno.isCompleted ? '✅ Completed' : ''}`}
//                     />
//                   </ListItem>
//                   <Divider />
//                 </React.Fragment>
//               ))}
//               {userTurnos.length === 0 && (
//                 <ListItem>
//                   <ListItemText primary="You have no scheduled appointments." />
//                 </ListItem>
//               )}
//             </List>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>Reservation Form</DialogTitle>
//         <DialogContent>
//           {['name', 'email'].map((field, i) => (
//             <TextField
//               key={i}
//               label={field[0].toUpperCase() + field.slice(1)}
//               name={field}
//               fullWidth
//               margin="dense"
//               value={formData[field]}
//               InputProps={{ readOnly: true }}
//             />
//           ))}
//           {['institution', 'country'].map((field, i) => (
//             <TextField
//               key={i}
//               label={field[0].toUpperCase() + field.slice(1)}
//               name={field}
//               fullWidth
//               margin="dense"
//               value={formData[field]}
//               onChange={handleChange}
//             />
//           ))}
//           <TextField
//             label="Describe your experiment"
//             name="description"
//             fullWidth
//             margin="dense"
//             multiline
//             rows={2}
//             value={formData.description}
//             onChange={handleChange}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleSubmit} variant="contained">Send</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
//         <DialogTitle>Confirmed reservation</DialogTitle>
//         <DialogContent>
//           <Typography>Reservation Data:</Typography>
//           <Typography>Name: {formData.name}</Typography>
//           <Typography>Institution: {formData.institution}</Typography>
//           <Typography>Date: {selectedSlot?.date}</Typography>
//           <Typography>Time: {selectedSlot?.time} - {parseInt(selectedSlot?.time) + maxDuration}:00</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button variant="outlined" onClick={() => { setConfirmDialog(false); setOpenDialog(true); }}>Edit</Button>
//           <Button variant="contained" color="error" onClick={handleConfirm}>Confirm</Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={3000}
//         onClose={() => setSnackbarOpen(false)}
//         message="Operación realizada exitosamente"
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       />
//     </Box>
//   );
// };

// export default Calendarizacion;


// si funciona
// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { db } from '../firebaseConfig';
// import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot, getDocs } from 'firebase/firestore'; 
// import {
//   Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
//   DialogActions, Grid, Paper, Alert, List, ListItem, ListItemText,
//   Divider, Snackbar, IconButton, CircularProgress
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import EventIcon from '@mui/icons-material/Event';
// import ScienceIcon from '@mui/icons-material/Science';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import { SECRET_WORD } from '../assets/Strings/CalendarStrings';

// // =========================================================================
// // ⚙️ CONFIGURACIÓN GLOBAL DE HORARIOS (FORMATO 24 HORAS)
// // =========================================================================
// const HORA_INICIO = 0;  
// const HORA_FIN = 23;    
// const maxDuration = 2;  
// const MAX_TURNOS_POR_USUARIO = 2;

// // Se calcula el arreglo de horas dinámicamente basado en la configuración
// const totalHours = HORA_FIN - HORA_INICIO + 1;
// const times = Array.from({ length: totalHours }, (_, i) => `${HORA_INICIO + i}:00`);
// const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// const getCurrentMonday = () => {
//   const today = new Date();
//   const day = today.getDay();
//   const diff = today.getDate() - day + (day === 0 ? -6 : 1);
//   const monday = new Date(today.setDate(diff));
//   monday.setHours(0, 0, 0, 0);
//   return monday;
// };

// // =========================================================================
// // 1. COMPONENTE RELOJ (Aislado)
// // =========================================================================
// const obtenerHoraLocal = () => new Date().toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit', second: '2-digit' });
// const obtenerHoraPaises = () => {
//   const paises = { Bolivia: 'America/La_Paz', Guatemala: 'America/Guatemala', Perú: 'America/Lima', España: 'Europe/Madrid', Francia: 'Europe/Paris' };
//   const horaEcuador = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
//   let horas = {};
//   for (const [pais, zona] of Object.entries(paises)) {
//     const fechaPais = new Date(new Date().toLocaleString('en-US', { timeZone: zona }));
//     const diff = Math.round((fechaPais - horaEcuador) / (1000 * 60 * 60));
//     horas[pais] = { hora: fechaPais.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), diff: diff >= 0 ? `+${diff}` : `${diff}` };
//   }
//   return horas;
// };

// const RelojRealTime = () => {
//   const [horaLocal, setHoraLocal] = useState(obtenerHoraLocal());
//   const [horaPaises, setHoraPaises] = useState(obtenerHoraPaises());

//   useEffect(() => {
//     const intervalo = setInterval(() => { setHoraLocal(obtenerHoraLocal()); setHoraPaises(obtenerHoraPaises()); }, 1000);
//     return () => clearInterval(intervalo);
//   }, []);

//   return (
//     <Alert severity="success" icon={<AccessTimeIcon fontSize="inherit" />} sx={{ width: "100%", maxWidth: 500, textAlign: "center", background: "linear-gradient(135deg, #d4fc79, #96e6a1)", color: "#1b4332", borderRadius: 3, boxShadow: 3, p: 3 }}>
//       <Typography variant="h6" fontWeight="bold" gutterBottom>🕑 Real time time</Typography>
//       <Typography variant="body1" gutterBottom><strong>Ecuador:</strong> {horaLocal}</Typography>
//       {Object.entries(horaPaises).map(([pais, data]) => (
//         <Typography key={pais} variant="body2" sx={{ mt: 0.5 }}>
//           <strong>{pais}:</strong> {data.hora} <span style={{ color: data.diff === 0 ? "green" : "gray" }}>({data.diff === 0 ? "Misma hora" : `${data.diff > 0 ? "+" : ""}${data.diff}h respecto a Ecuador`})</span>
//         </Typography>
//       ))}
//     </Alert>
//   );
// };

// // =========================================================================
// // 2. CALENDARIZACIÓN PRINCIPAL
// // =========================================================================
// const Calendarizacion = () => {
//   const user = useSelector(state => state.auth.user);
//   const [availability, setAvailability] = useState({});
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [formData, setFormData] = useState({ name: '', email: '', institution: '', country: '', description: '' });
//   const [confirmDialog, setConfirmDialog] = useState(false);
//   const [weekDates, setWeekDates] = useState([]);
//   const [userTurnos, setUserTurnos] = useState([]);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false); 

//   const currentMonday = getCurrentMonday();

//   // ✅ EFECTO 1: ESCUCHAR DISPONIBILIDAD EN TIEMPO REAL
//   useEffect(() => {
//     console.log("🚀 Iniciando carga de disponibilidad global...");
//     const startTime = performance.now();

//     const week = Array.from({ length: 5 }, (_, i) => {
//       const date = new Date(currentMonday);
//       date.setDate(currentMonday.getDate() + i);
//       return date;
//     });
//     setWeekDates(week);
//     const dateStrings = week.map(d => d.toISOString().split('T')[0]);

//     const q = query(collection(db, 'turnos'), where('fecha', 'in', dateStrings));
    
//     const unsubscribe = onSnapshot(q, (snap) => {
//       console.log(`✅ [PERFORMANCE] Disponibilidad descargada de Firestore en ${(performance.now() - startTime).toFixed(2)} ms. Datos encontrados: ${snap.size}`);
      
//       const newAvailability = {};
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       for (let i = 0; i < 5; i++) {
//         const dateStr = dateStrings[i];
//         newAvailability[dateStr] = {};

//         if (week[i] < today) {
//           times.forEach(t => newAvailability[dateStr][t] = 'unavailable');
//           continue;
//         }

//         for (let t = 0; t < times.length; t++) {
//           const hour = parseInt(times[t]);
//           // Mantenimiento los lunes de 7 a 9 (si tu horario empieza después de las 9, esto se ignora solo)
//           if (i === 0 && hour >= 7 && hour < 9) {
//             newAvailability[dateStr][times[t]] = 'maintenance';
//             continue;
//           }
//           newAvailability[dateStr][times[t]] = 'available';
//         }
//       }

//       snap.forEach(doc => {
//         const { fecha, horaInicio, horaFin } = doc.data();
//         if (newAvailability[fecha]) {
//           const ini = parseInt(horaInicio);
//           const fin = parseInt(horaFin);
//           for (let h = ini; h < fin; h++) {
//             const hStr = `${h}:00`;
//             if(newAvailability[fecha][hStr] !== 'unavailable') {
//               newAvailability[fecha][hStr] = 'reserved';
//             }
//           }
//         }
//       });
//       setAvailability(newAvailability);
//     }, (error) => {
//       console.error("❌ Error descargando disponibilidad: ", error);
//     });

//     return () => unsubscribe();
//   }, [currentMonday.getTime()]);

//   // ✅ EFECTO 2: ESCUCHAR TURNOS PERSONALES
//   useEffect(() => {
//     if (!user) return;
//     console.log("🚀 Iniciando carga de turnos personales...");
//     const startTime = performance.now();

//     setFormData(prev => ({ ...prev, name: user.displayName || '', email: user.email || '' }));

//     const q = query(collection(db, 'turnos'), where('uid', '==', user.uid));
//     const unsubscribe = onSnapshot(q, (snap) => {
//       console.log(`✅ [PERFORMANCE] Turnos personales descargados en ${(performance.now() - startTime).toFixed(2)} ms. Turnos tuyos: ${snap.size}`);
//       const results = snap.docs.map(doc => {
//         const data = doc.data();
//         const turnoDate = new Date(`${data.fecha}T${data.horaFin}`);
//         return { id: doc.id, ...data, isCompleted: new Date() >= turnoDate };
//       });
//       setUserTurnos(results);
//     }, (error) => {
//       console.error("❌ Error descargando turnos personales: ", error);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   const handleSlotClick = (dateStr, time) => {
//     if (!user) return alert('Please log in to schedule an appointment.');
//     if (availability[dateStr][time] !== 'available') return;
//     setSelectedSlot({ date: dateStr, time });
//     setOpenDialog(true);
//   };

//   const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleConfirm = async () => {
//     if (isSubmitting) return; 
//     setIsSubmitting(true);
//     console.time("⏱️ [PERFORMANCE] Tiempo en guardar nuevo turno");

//     const hourStart = parseInt(selectedSlot.time);
//     const hourEnd = hourStart + maxDuration;

//     try {
//       await addDoc(collection(db, 'turnos'), {
//         uid: user.uid, ...formData, fecha: selectedSlot.date,
//         horaInicio: `${hourStart}:00`, horaFin: `${hourEnd}:00`
//       });
//       console.timeEnd("⏱️ [PERFORMANCE] Tiempo en guardar nuevo turno");
//       setConfirmDialog(false);
//       setSnackbarOpen(true);
//     } catch (e) {
//       console.error("❌ Error guardando: ", e);
//       alert("Hubo un error al crear la cita.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     console.time("⏱️ [PERFORMANCE] Tiempo en eliminar turno");
//     try { 
//       await deleteDoc(doc(db, 'turnos', id)); 
//       console.timeEnd("⏱️ [PERFORMANCE] Tiempo en eliminar turno");
//       setSnackbarOpen(true); 
//     } 
//     catch (error) { console.error("❌ Error eliminando: ", error); }
//   };

//   return (
//     <Box 
//       sx={{ 
//         p: 4, mt: 4,
//         /* 🚀 REGLA MAESTRA: Fuerza Poppins en todos los elementos de MUI y en la tabla HTML */
//         fontFamily: '"Poppins", sans-serif',
//         '& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-input, & .MuiFormLabel-root, & th, & td': {
//           fontFamily: '"Poppins", sans-serif !important'
//         }
//       }}
//     >
//       <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>Calendar</Typography>
//       <Alert severity="info" sx={{ mb: 3 }}>
//         <Typography variant="body1">
//         You can only schedule appointments Monday through Friday between {HORA_INICIO}:00 and {HORA_FIN}:00. Mondays between 7:00 AM and 9:00 AM are unavailable due to maintenance. You can schedule a maximum of two consecutive hours if the time is available.
//         </Typography>
//       </Alert>
      
//       <Box display="flex" justifyContent="center" alignItems="center" mt={3} mb={3}><RelojRealTime /></Box>

//       <Alert severity="info" sx={{ mb: 3 }}>
//         <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
//           <strong>Legend:</strong> 
//           <span style={{ backgroundColor: '#aed581', padding: '2px 10px', borderRadius: '4px', color: '#1b4332' }}>available</span>
//           <span style={{ backgroundColor: '#4fc3f7', padding: '2px 10px', borderRadius: '4px', color: '#01579b' }}>reserved</span>
//           <span style={{ backgroundColor: '#b0bec5', padding: '2px 10px', borderRadius: '4px', color: '#263238' }}>maintenance</span>
//           <span style={{ backgroundColor: '#ef9a9a', padding: '2px 10px', borderRadius: '4px', color: '#b71c1c' }}>unavailable</span>
//         </Typography>
//       </Alert>

//       <Grid container spacing={3}>
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
//               <thead>
//                 <tr>
//                   <th style={{ padding: 10, borderBottom: '2px solid #ccc' }}>Time</th>
//                   {weekDates.map((date, i) => (
//                     <th key={i} style={{ padding: 10, borderBottom: '2px solid #ccc' }}>{days[i]}<br />{date.toISOString().split('T')[0]}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {times.map((time, i) => (
//                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
//                     <td style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>{time}</td>
//                     {weekDates.map((date, dayIdx) => {
//                       const dateStr = date.toISOString().split('T')[0];
//                       const status = availability[dateStr]?.[time] || 'loading';
//                       const bgColor = { available: '#aed581', reserved: '#4fc3f7', maintenance: '#b0bec5', loading: '#eeeeee', unavailable: '#ef9a9a' }[status];
//                       return (
//                         <td
//                           key={dayIdx}
//                           onClick={() => status === 'available' && handleSlotClick(dateStr, time)}
//                           style={{ backgroundColor: bgColor, padding: 12, textAlign: 'center', cursor: status === 'available' ? 'pointer' : 'not-allowed', borderLeft: '1px solid #fff', borderRight: '1px solid #fff', opacity: status === 'available' ? 0.9 : 1 }}
//                           onMouseEnter={(e) => { if(status === 'available') e.target.style.opacity = 1 }}
//                           onMouseLeave={(e) => { if(status === 'available') e.target.style.opacity = 0.9 }}
//                         >
//                           {status}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </Paper>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, 
//               color: '#333333', // 👈 AÑADIDO: Gris oscuro casi negro para máximo contraste
//               borderBottom: '2px solid #e0e0e0', // 👈 AÑADIDO: Una línea sutil debajo para enmarcar el título
//               pb: 1, // Padding bottom para la línea
//               mb: 2  // Margin bottom
//             }}>My Scheduled Appointments</Typography>
//           <Paper sx={{ maxHeight: '550px', overflowY: 'auto', boxShadow: 3 }}>
//             <List>
//               {userTurnos.map((turno, i) => (
//                 <React.Fragment key={i}>
//                   <ListItem secondaryAction={!turno.isCompleted && <IconButton edge="end" onClick={() => handleDelete(turno.id)}><DeleteIcon color="error" /></IconButton>}>
//                     {/* <ListItemText  primary={`📅 ${turno.fecha} | ⏰ ${turno.horaInicio} - ${turno.horaFin}`} secondary={`🧪 ${turno.description || 'No description'} ${turno.isCompleted ? '✅ Completed' : ''}`} /> */}
//                     <ListItemText
//                     disableTypography // 👈 Evita que MUI use Roboto por defecto aquí
//                     primary={
//                       <Box display="flex" alignItems="center" gap={1} mb={0.5} sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 300 }}>
//                         <EventIcon fontSize="small" color="action" />
//                         <span>{turno.fecha}</span>
//                         <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>
//                         <AccessTimeIcon fontSize="small" color="action" />
//                         <span>{turno.horaInicio} - {turno.horaFin}</span>
//                       </Box>
//                     }
//                     secondary={
//                       <Box display="flex" alignItems="center" gap={1} sx={{ fontFamily: '"Poppins", sans-serif', color: '#666', fontSize: '0.9rem' }}>
//                         <ScienceIcon fontSize="small" color="action" />
//                         <span>{turno.description || 'No description'}</span>
                        
//                         {turno.isCompleted && (
//                           <>
//                             <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>
//                             <CheckCircleOutlineIcon fontSize="small" color="success" />
//                             <span style={{ color: '#2e7d32', fontWeight: 300 }}>Completed</span>
//                           </>
//                         )}
//                       </Box>
//                     }
//                   />
//                   </ListItem>
//                   <Divider />
//                 </React.Fragment>
//               ))}
//               {userTurnos.length === 0 && <ListItem><ListItemText primary="You have no scheduled appointments." /></ListItem>}
//             </List>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* DIÁLOGOS DE FORMULARIO */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>Reservation Form</DialogTitle>
//         <DialogContent>
//           {['name', 'email'].map((f, i) => <TextField key={i} label={f} name={f} fullWidth margin="dense" value={formData[f]} InputProps={{ readOnly: true }} />)}
//           {['institution', 'country'].map((f, i) => <TextField key={i} label={f} name={f} fullWidth margin="dense" value={formData[f]} onChange={handleChange} />)}
//           <TextField label="Describe your experiment" name="description" fullWidth margin="dense" multiline rows={2} value={formData.description} onChange={handleChange} />
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={() => { setOpenDialog(false); setConfirmDialog(true); }} variant="contained">Send</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={confirmDialog} onClose={() => !isSubmitting && setConfirmDialog(false)}>
//         <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>Confirm Reservation</DialogTitle>
//         <DialogContent dividers>
//           <Typography gutterBottom><strong>Name:</strong> {formData.name}</Typography>
//           <Typography gutterBottom><strong>Date:</strong> {selectedSlot?.date}</Typography>
//           <Typography gutterBottom><strong>Time:</strong> {selectedSlot?.time} - {parseInt(selectedSlot?.time) + maxDuration}:00</Typography>
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button variant="outlined" onClick={() => { setConfirmDialog(false); setOpenDialog(true); }} disabled={isSubmitting}>Edit</Button>
//           <Button variant="contained" color="primary" onClick={handleConfirm} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
//             {isSubmitting ? 'Confirming...' : 'Confirm'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message="Operación exitosa" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
//     </Box>
//   );
// };

// export default Calendarizacion;



// traduciendo, agregando seguridad contra spam
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { db } from '../firebaseConfig';
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'; 
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Paper, Alert, List, ListItem, ListItemText,
  Divider, Snackbar, IconButton, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from '@mui/icons-material/Event';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { SECRET_WORD } from '../assets/Strings/CalendarStrings';

// =========================================================================
// ⚙️ CONFIGURACIÓN GLOBAL DE HORARIOS (FORMATO 24 HORAS)
// =========================================================================
const HORA_INICIO = 0;  
const HORA_FIN = 23;    
const maxDuration = 2;  
const MAX_TURNOS_POR_DIA = 2;

const totalHours = HORA_FIN - HORA_INICIO + 1;
const times = Array.from({ length: totalHours }, (_, i) => `${HORA_INICIO + i}:00`);
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getCurrentMonday = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// =========================================================================
// 1. COMPONENTE RELOJ (Aislado, Corregido y Traducido)
// =========================================================================
// Cambiamos a 'en-US' para que muestre AM/PM correctamente
const obtenerHoraLocal = () => new Date().toLocaleTimeString('en-US', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const obtenerHoraPaises = () => {
  const paises = { Bolivia: 'America/La_Paz', Guatemala: 'America/Guatemala', Peru: 'America/Lima', Spain: 'Europe/Madrid', France: 'Europe/Paris' };
  const horaEcuador = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
  let horas = {};
  for (const [pais, zona] of Object.entries(paises)) {
    const fechaPais = new Date(new Date().toLocaleString('en-US', { timeZone: zona }));
    const diff = Math.round((fechaPais - horaEcuador) / (1000 * 60 * 60));
    // Se guarda el número puro (diff) para no duplicar signos en el renderizado
    horas[pais] = { 
      hora: fechaPais.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
      diff: diff 
    };
  }
  return horas;
};

const RelojRealTime = () => {
  const [horaLocal, setHoraLocal] = useState(obtenerHoraLocal());
  const [horaPaises, setHoraPaises] = useState(obtenerHoraPaises());

  useEffect(() => {
    const intervalo = setInterval(() => { setHoraLocal(obtenerHoraLocal()); setHoraPaises(obtenerHoraPaises()); }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <Alert severity="success" icon={<AccessTimeIcon fontSize="inherit" />} sx={{ width: "100%", maxWidth: 500, textAlign: "center", background: "linear-gradient(135deg, #d4fc79, #96e6a1)", color: "#1b4332", borderRadius: 3, boxShadow: 3, p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>🕑 Real-Time Clock</Typography>
      <Typography variant="body1" gutterBottom><strong>Ecuador:</strong> {horaLocal}</Typography>
      {Object.entries(horaPaises).map(([pais, data]) => (
        <Typography key={pais} variant="body2" sx={{ mt: 0.5 }}>
          <strong>{pais}:</strong> {data.hora} <span style={{ color: data.diff === 0 ? "green" : "gray" }}>({data.diff === 0 ? "Same time" : `${data.diff > 0 ? "+" : ""}${data.diff}h compared to Ecuador`})</span>
        </Typography>
      ))}
    </Alert>
  );
};

// =========================================================================
// 2. CALENDARIZACIÓN PRINCIPAL
// =========================================================================
const Calendarizacion = () => {
  const user = useSelector(state => state.auth.user);
  const [availability, setAvailability] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', institution: '', country: '', description: '' });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [weekDates, setWeekDates] = useState([]);
  const [userTurnos, setUserTurnos] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const currentMonday = getCurrentMonday();

  // ✅ EFECTO 1: ESCUCHAR DISPONIBILIDAD EN TIEMPO REAL
  useEffect(() => {
    const week = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + i);
      return date;
    });
    setWeekDates(week);
    const dateStrings = week.map(d => d.toISOString().split('T')[0]);

    const q = query(collection(db, 'turnos'), where('fecha', 'in', dateStrings));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const newAvailability = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 5; i++) {
        const dateStr = dateStrings[i];
        newAvailability[dateStr] = {};

        if (week[i] < today) {
          times.forEach(t => newAvailability[dateStr][t] = 'unavailable');
          continue;
        }

        for (let t = 0; t < times.length; t++) {
          const hour = parseInt(times[t]);
          if (i === 0 && hour >= 7 && hour < 9) {
            newAvailability[dateStr][times[t]] = 'maintenance';
            continue;
          }
          newAvailability[dateStr][times[t]] = 'available';
        }
      }

      snap.forEach(doc => {
        const { fecha, horaInicio, horaFin, description } = doc.data();
        if (newAvailability[fecha]) {
          const ini = parseInt(horaInicio);
          const fin = parseInt(horaFin);
          
          const isMaintenanceCode = description && description.trim().toLowerCase() === SECRET_WORD.toLowerCase();;

          for (let h = ini; h < fin; h++) {
            const hStr = `${h}:00`;
            if(newAvailability[fecha][hStr] !== 'unavailable') {
              // Asignamos el color/estado dependiendo si usaron la palabra secreta
              newAvailability[fecha][hStr] = isMaintenanceCode ? 'maintenance' : 'reserved';
            }
          }
        }
      });
      setAvailability(newAvailability);
    }, (error) => {
      console.error("Error fetching availability: ", error);
    });

    return () => unsubscribe();
  }, [currentMonday.getTime()]);

  // ✅ EFECTO 2: ESCUCHAR TURNOS PERSONALES
  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({ ...prev, name: user.displayName || '', email: user.email || '' }));

    const q = query(collection(db, 'turnos'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const results = snap.docs.map(doc => {
        const data = doc.data();
        const turnoDate = new Date(`${data.fecha}T${data.horaFin}`);
        return { id: doc.id, ...data, isCompleted: new Date() >= turnoDate };
      });

      // 🚀 1. FILTRAMOS: Solo nos quedamos con los turnos que NO han terminado
      const turnosFuturos = results.filter(turno => !turno.isCompleted);

      // 🚀 2. ORDENAMOS: El turno más próximo aparece primero (arriba)
      turnosFuturos.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
        const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
        return fechaA - fechaB; // Orden ascendente cronológico
      });

      setUserTurnos(turnosFuturos);
    }, (error) => {
      console.error("Error fetching personal appointments: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // const handleSlotClick = (dateStr, time) => {
  //   if (!user) return alert('Please log in to schedule an appointment.');
  //   if (availability[dateStr][time] !== 'available') return;

  //   // 🚀 CONTROL DE SPAM DIARIO: Contamos cuántos turnos tiene el usuario específicamente en 'dateStr'
  //   const turnosEnEseDia = userTurnos.filter(turno => turno.fecha === dateStr).length;
    
  //   if (turnosEnEseDia >= MAX_TURNOS_POR_DIA) {
  //     return alert(`You have reached the limit of ${MAX_TURNOS_POR_DIA} appointments per day (${MAX_TURNOS_POR_DIA * 2} hours). Please select a different day.`);
  //   }

  //   setSelectedSlot({ date: dateStr, time });
  //   setOpenDialog(true);
  // };

  const handleSlotClick = (dateStr, time) => {
    if (!user) return alert('Please log in to schedule an appointment.');
    if (availability[dateStr][time] !== 'available') return;

    const hourStart = parseInt(time);
    let duration = maxDuration; // Por defecto 2 horas
    const nextHour = hourStart + 1;
    const nextTimeStr = `${nextHour}:00`;

    // 🚀 VALIDACIÓN 1: ¿Hay choque con otro turno o es el fin del día?
    if (nextHour > HORA_FIN || availability[dateStr][nextTimeStr] !== 'available') {
      const accept = window.confirm("Due to other scheduled appointments or end of day, this slot is only available for 1 hour. Do you want to proceed with a 1-hour appointment?");
      if (!accept) return; // Si el usuario no quiere 1 hora, cancelamos
      duration = 1; // Si acepta, reducimos el turno a 1 hora
    }

    // 🚀 VALIDACIÓN 2: Bloqueo de turnos "Muertos" (Pasado absoluto)
    const now = new Date();
    // Calculamos a qué hora termina el turno que intenta agendar
    const endDate = new Date(`${dateStr}T${(hourStart + duration).toString().padStart(2, '0')}:00:00`);
    
    if (endDate <= now) {
      return alert("You cannot schedule an appointment that has already ended.");
    }

    // 🚀 VALIDACIÓN 3: Control de Spam Diario
    const turnosEnEseDia = userTurnos.filter(turno => turno.fecha === dateStr).length;
    if (turnosEnEseDia >= MAX_TURNOS_POR_DIA) {
      return alert(`You have reached the limit of ${MAX_TURNOS_POR_DIA} appointments per day. Please select a different day.`);
    }

    // Guardamos la duración seleccionada junto con la fecha y hora
    setSelectedSlot({ date: dateStr, time, duration });
    setOpenDialog(true);
  };

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // const handleConfirm = async () => {
  //   if (isSubmitting) return; 
  //   setIsSubmitting(true);

  //   const hourStart = parseInt(selectedSlot.time);
  //   const hourEnd = hourStart + maxDuration;

  //   try {
  //     await addDoc(collection(db, 'turnos'), {
  //       uid: user.uid, ...formData, fecha: selectedSlot.date,
  //       horaInicio: `${hourStart}:00`, horaFin: `${hourEnd}:00`
  //     });
  //     setConfirmDialog(false);
  //     setSnackbarOpen(true);
  //   } catch (e) {
  //     console.error("Error saving appointment: ", e);
  //     alert("There was an error creating the appointment.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleConfirm = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);

    const hourStart = parseInt(selectedSlot.time);
    // Ahora usamos la duración específica que calculamos antes
    const hourEnd = hourStart + selectedSlot.duration; 

    try {
      await addDoc(collection(db, 'turnos'), {
        uid: user.uid, ...formData, fecha: selectedSlot.date,
        horaInicio: `${hourStart}:00`, horaFin: `${hourEnd}:00`
      });
      setConfirmDialog(false);
      setSnackbarOpen(true);
      
      // LIMPIEZA DE SEGURIDAD: Vaciamos los campos para el próximo turno
      setFormData(prev => ({ ...prev, institution: '', country: '', description: '' }));

    } catch (e) {
      console.error("Error saving appointment: ", e);
      alert("There was an error creating the appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try { 
      await deleteDoc(doc(db, 'turnos', id)); 
      setSnackbarOpen(true); 
    } 
    catch (error) { console.error("Error deleting appointment: ", error); }
  };

  return (
    <Box 
      sx={{ 
        p: 4, mt: 4,
        fontFamily: '"Poppins", sans-serif',
        '& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-input, & .MuiFormLabel-root, & th, & td, & .MuiAlert-message': {
          fontFamily: '"Poppins", sans-serif !important'
        }
      }}
    >




      <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>Calendar</Typography>

      {/* <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>Calendar</Typography> */}
      <Alert severity="info" sx={{ mb: 3, alignItems: 'center' }}>
        <Typography variant="body1">
        You can only schedule appointments Monday through Friday between {HORA_INICIO}:00 and {HORA_FIN}:00. Mondays between 7:00 AM and 9:00 AM are unavailable due to maintenance. You can schedule a maximum of two consecutive hours if the time is available.
        </Typography>
      </Alert>
      
      <Box display="flex" justifyContent="center" alignItems="center" mt={3} mb={3}><RelojRealTime /></Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <strong>Legend:</strong> 
          <span style={{ backgroundColor: '#aed581', padding: '2px 10px', borderRadius: '4px', color: '#1b4332' }}>available</span>
          <span style={{ backgroundColor: '#4fc3f7', padding: '2px 10px', borderRadius: '4px', color: '#01579b' }}>reserved</span>
          <span style={{ backgroundColor: '#b0bec5', padding: '2px 10px', borderRadius: '4px', color: '#263238' }}>maintenance</span>
          <span style={{ backgroundColor: '#ef9a9a', padding: '2px 10px', borderRadius: '4px', color: '#b71c1c' }}>unavailable</span>
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ padding: 10, borderBottom: '2px solid #ccc' }}>Time</th>
                  {weekDates.map((date, i) => (
                    <th key={i} style={{ padding: 10, borderBottom: '2px solid #ccc' }}>{days[i]}<br />{date.toISOString().split('T')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>{time}</td>
                    {weekDates.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const status = availability[dateStr]?.[time] || 'loading';
                      const bgColor = { available: '#aed581', reserved: '#4fc3f7', maintenance: '#b0bec5', loading: '#eeeeee', unavailable: '#ef9a9a' }[status];
                      return (
                        <td
                          key={dayIdx}
                          onClick={() => status === 'available' && handleSlotClick(dateStr, time)}
                          style={{ backgroundColor: bgColor, padding: 12, textAlign: 'center', cursor: status === 'available' ? 'pointer' : 'not-allowed', borderLeft: '1px solid #fff', borderRight: '1px solid #fff', opacity: status === 'available' ? 0.9 : 1 }}
                          onMouseEnter={(e) => { if(status === 'available') e.target.style.opacity = 1 }}
                          onMouseLeave={(e) => { if(status === 'available') e.target.style.opacity = 0.9 }}
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
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', borderBottom: '2px solid #e0e0e0', pb: 1, mb: 2 }}>
            My Scheduled Appointments
          </Typography>
          <Paper sx={{ maxHeight: '550px', overflowY: 'auto', boxShadow: 3 }}>
            <List>
              {userTurnos.map((turno, i) => (
                <React.Fragment key={i}>
                  <ListItem secondaryAction={!turno.isCompleted && <IconButton edge="end" onClick={() => handleDelete(turno.id)}><DeleteIcon color="error" /></IconButton>}>
                    <ListItemText
                    disableTypography 
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5} sx={{ fontWeight: 400 }}>
                        <EventIcon fontSize="small" color="action" />
                        <span>{turno.fecha}</span>
                        <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <span>{turno.horaInicio} - {turno.horaFin}</span>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} sx={{ color: '#666', fontSize: '0.9rem' }}>
                        <ScienceIcon fontSize="small" color="action" />
                        {/* 🚀 OCULTAMOS LA PALABRA SECRETA EN LA VISTA PARA QUE NADIE SOSPECHE */}
                        <span>{turno.description.toLowerCase() === SECRET_WORD.toLowerCase() ? 'System Maintenance' : (turno.description || 'No description')}</span>
                        
                        {turno.isCompleted && (
                          <>
                            <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>
                            <CheckCircleOutlineIcon fontSize="small" color="success" />
                            <span style={{ color: '#2e7d32', fontWeight: 500 }}>Completed</span>
                          </>
                        )}
                      </Box>
                    }
                  />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {userTurnos.length === 0 && <ListItem><ListItemText primary="You have no scheduled appointments." /></ListItem>}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* DIÁLOGOS DE FORMULARIO */}
      {/* <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>Reservation Form</DialogTitle>
        <DialogContent>
          {['name', 'email'].map((f, i) => <TextField key={i} label={f.charAt(0).toUpperCase() + f.slice(1)} name={f} fullWidth margin="dense" value={formData[f]} InputProps={{ readOnly: true }} />)}
          {['institution', 'country'].map((f, i) => <TextField key={i} label={f.charAt(0).toUpperCase() + f.slice(1)} name={f} fullWidth margin="dense" value={formData[f]} onChange={handleChange} />)}
          <TextField label="Describe your experiment" name="description" fullWidth margin="dense" multiline rows={2} value={formData.description} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={() => { setOpenDialog(false); setConfirmDialog(true); }} variant="contained">Next</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog} onClose={() => !isSubmitting && setConfirmDialog(false)}>
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>Confirm Reservation</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom><strong>Name:</strong> {formData.name}</Typography>
          <Typography gutterBottom><strong>Date:</strong> {selectedSlot?.date}</Typography>
          <Typography gutterBottom><strong>Time:</strong> {selectedSlot?.time} - {parseInt(selectedSlot?.time) + maxDuration}:00</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => { setConfirmDialog(false); setOpenDialog(true); }} disabled={isSubmitting}>Edit</Button>
          <Button variant="contained" color="primary" onClick={handleConfirm} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* DIÁLOGOS DE FORMULARIO */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>Reservation Form</DialogTitle>
        <DialogContent>
          {['name', 'email'].map((f, i) => <TextField key={i} label={f.charAt(0).toUpperCase() + f.slice(1)} name={f} fullWidth margin="dense" value={formData[f]} InputProps={{ readOnly: true }} />)}
          {['institution', 'country'].map((f, i) => <TextField key={i} label={f.charAt(0).toUpperCase() + f.slice(1)} name={f} fullWidth margin="dense" value={formData[f]} onChange={handleChange} />)}
          <TextField label="Describe your experiment" name="description" fullWidth margin="dense" multiline rows={2} value={formData.description} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {/* 🚀 Limpiamos el formulario si el usuario presiona "Cancelar" */}
          <Button onClick={() => { setOpenDialog(false); setFormData(prev => ({ ...prev, institution: '', country: '', description: '' })); }} color="inherit">Cancel</Button>
          <Button onClick={() => { setOpenDialog(false); setConfirmDialog(true); }} variant="contained">Next</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog} onClose={() => !isSubmitting && setConfirmDialog(false)}>
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>Confirm Reservation</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom><strong>Name:</strong> {formData.name}</Typography>
          <Typography gutterBottom><strong>Date:</strong> {selectedSlot?.date}</Typography>
          {/* 🚀 Mostramos dinámicamente si es 1 o 2 horas */}
          <Typography gutterBottom>
            <strong>Time:</strong> {selectedSlot?.time} - {selectedSlot ? parseInt(selectedSlot.time) + selectedSlot.duration : ''}:00
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => { setConfirmDialog(false); setOpenDialog(true); }} disabled={isSubmitting}>Edit</Button>
          <Button variant="contained" color="primary" onClick={handleConfirm} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message="Operation successful" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

export default Calendarizacion;