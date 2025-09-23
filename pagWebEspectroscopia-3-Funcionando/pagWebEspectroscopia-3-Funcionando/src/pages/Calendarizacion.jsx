// src/components/Calendarizacion.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchReservations,
  createReservation,
  deleteReservation,
} from "../Redux/Actions/authActions";

import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Paper, Alert, List,
  ListItem, ListItemText, Divider, Snackbar, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const reservations = useSelector((state) => state.auth.reservations);

  const [availability, setAvailability] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    institution: "",
    country: "",
    description: "",
  });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [weekDates, setWeekDates] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentMonday = getCurrentMonday();

  // ✅ Función segura para formatear fecha
  const formatDateSafe = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleDateString();
    } catch (error) {
      return "Error en fecha";
    }
  };

  // ✅ Función segura para formatear hora
  const formatTimeSafe = (timeString) => {
    if (!timeString) return "Hora no disponible";
    try {
      const date = new Date(timeString);
      return isNaN(date.getTime()) ? "Hora inválida" : date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return "Error en hora";
    }
  };

  // ✅ Función para recargar reservas
  const reloadReservations = async () => {
    if (user && user.user_id) {
      try {
        await dispatch(fetchReservations(user.user_id));
      } catch (error) {
        console.error("Error recargando reservas:", error);
      }
    }
  };

  // ✅ Generar grilla semanal
  const fetchAvailability = async () => {
    const week = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + i);
      return date;
    });
    setWeekDates(week);

    const newAvailability = {};
    for (let i = 0; i < 5; i++) {
      const date = week[i];
      const dateStr = date.toISOString().split("T")[0];
      newAvailability[dateStr] = {};

      for (let t = 0; t < times.length; t++) {
        const hour = parseInt(times[t]);
        if (hour < 6 || (i === 0 && hour >= 7 && hour < 9)) {
          newAvailability[dateStr][times[t]] = "maintenance";
          continue;
        }
        newAvailability[dateStr][times[t]] = "available";
      }

      // Bloquear horas ya reservadas (solo si reservations es un array)
      if (Array.isArray(reservations)) {
        reservations.forEach((res) => {
          if (res && res.reservation_date) {
            try {
              const resDate = new Date(res.reservation_date).toISOString().split("T")[0];
              const resTime = res.reservation_time ? new Date(res.reservation_time) : null;
              if (resTime && !isNaN(resTime.getTime()) && resDate === dateStr) {
                const resHour = resTime.getHours();
                newAvailability[dateStr][`${resHour}:00`] = "reserved";
              }
            } catch (error) {
              console.error("Error procesando reserva:", error);
            }
          }
        });
      }
    }
    setAvailability(newAvailability);
  };

  // ✅ Cargar reservas del usuario al iniciar
  useEffect(() => {
    if (user && user.user_id) {
      dispatch(fetchReservations(user.user_id));
    }
  }, [dispatch, user]);

  // ✅ Regenerar disponibilidad cuando cambien las reservas
  useEffect(() => {
    fetchAvailability();
  }, [reservations]);

  const handleSlotClick = (dateStr, time) => {
    if (!user) {
      alert("Inicia sesión para agendar.");
      return;
    }
    if (availability[dateStr] && availability[dateStr][time] !== "available") return;

    setSelectedSlot({ date: dateStr, time });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!selectedSlot) return;
    setOpenDialog(false);
    setConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !user) return;

    setLoading(true);
    const hourStart = parseInt(selectedSlot.time);
    const reservationData = {
      user_id: user.user_id,
      experiment_description: formData.description,
      reservation_date: selectedSlot.date,
      reservation_time: `${selectedSlot.date}T${hourStart.toString().padStart(2, '0')}:00:00Z`,
      institution: formData.institution,
      country: formData.country
    };

    try {
      // ✅ Crear la reserva
      await dispatch(createReservation(reservationData));
      
      // ✅ Recargar las reservas después de crear una nueva
      await reloadReservations();
      
      setConfirmDialog(false);
      setSnackbarMessage("Reserva creada exitosamente");
      setSnackbarOpen(true);
      setFormData({ institution: "", country: "", description: "" });
      setSelectedSlot(null);
    } catch (e) {
      console.error("Error creando reserva:", e);
      setSnackbarMessage("Error al crear la reserva");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user || !id) return;

    setLoading(true);
    try {
      await dispatch(deleteReservation(id, user.user_id));
      
      // ✅ Recargar las reservas después de eliminar
      await reloadReservations();
      
      setSnackbarMessage("Reserva eliminada exitosamente");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error eliminando reserva:", error);
      setSnackbarMessage("Error al eliminar la reserva");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener reservas seguras (si no es array, devolver array vacío)
  const safeReservations = Array.isArray(reservations) ? reservations : [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Calendar</Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        You can only schedule appointments Monday through Friday between 6:00 AM and 6:00 PM. Mondays between 7:00 AM and 9:00 AM are unavailable due to maintenance. You can schedule a maximum of two consecutive hours.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Time</th>
                  {weekDates.map((date, i) => {
                    const dateStr = date.toISOString().split("T")[0];
                    return <th key={i}>{days[i]}<br />{dateStr}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {times.map((time, i) => (
                  <tr key={i}>
                    <td>{time}</td>
                    {weekDates.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split("T")[0];
                      const status = availability[dateStr]?.[time] || "loading";

                      const bgColor = {
                        available: "#aed581",
                        reserved: "#4fc3f7",
                        maintenance: "#b0bec5",
                        loading: "#eeeeee",
                      }[status];

                      return (
                        <td
                          key={dayIdx}
                          onClick={() => handleSlotClick(dateStr, time)}
                          style={{
                            backgroundColor: bgColor,
                            padding: 8,
                            textAlign: "center",
                            cursor: status === "available" ? "pointer" : "not-allowed",
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
              {/* ✅ MAP SEGURO DE RESERVATIONS */}
              {safeReservations.length > 0 ? (
                safeReservations.map((res, index) => {
                  // ✅ Validación completa de cada reserva
                  if (!res || typeof res !== 'object') {
                    return null;
                  }

                  const reservationId = res.reservation_id || `temp-${index}`;
                  const reservationDate = res.reservation_date;
                  const reservationTime = res.reservation_time;
                  const description = res.experiment_description || "No description";

                  return (
                    <React.Fragment key={reservationId}>
                      <ListItem
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={() => res.reservation_id && handleDelete(res.reservation_id)}
                            disabled={!res.reservation_id || loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`📅 ${formatDateSafe(reservationDate)} | ⏰ ${formatTimeSafe(reservationTime)}`}
                          secondary={`🧪 ${description}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })
              ) : (
                <ListItem>
                  <ListItemText primary="You have no scheduled appointments." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Formulario */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reservation Form</DialogTitle>
        <DialogContent>
          {["institution", "country"].map((field, i) => (
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

      {/* Confirmación */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmed reservation</DialogTitle>
        <DialogContent>
          <Typography>Institution: {formData.institution}</Typography>
          <Typography>Date: {selectedSlot?.date}</Typography>
          <Typography>Time: {selectedSlot?.time} - {parseInt(selectedSlot?.time) + maxDuration}:00</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => { setConfirmDialog(false); setOpenDialog(true); }}>Edit</Button>
          <Button variant="contained" color="error" onClick={handleConfirm} disabled={loading}>
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar mejorado */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default Calendarizacion;