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

  const currentMonday = getCurrentMonday();

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

      // Bloquear horas ya reservadas
      reservations.forEach((res) => {
        const resDate = new Date(res.reservation_date).toISOString().split("T")[0];
        const resHour = new Date(res.reservation_time).getHours();
        if (resDate === dateStr) {
          newAvailability[dateStr][`${resHour}:00`] = "reserved";
        }
      });
    }
    setAvailability(newAvailability);
  };

  // ✅ Cargar reservas del usuario
  useEffect(() => {
    if (user) {
      dispatch(fetchReservations(user.user_id));
    }
  }, [dispatch, user]);

  // ✅ Regenerar disponibilidad cuando cambien reservas
  useEffect(() => {
    fetchAvailability();
  }, [reservations]);

  const handleSlotClick = (dateStr, time) => {
    if (!user) return alert("Inicia sesión para agendar.");
    if (availability[dateStr][time] !== "available") return;

    setSelectedSlot({ date: dateStr, time });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    setOpenDialog(false);
    setConfirmDialog(true);
  };

  const handleConfirm = async () => {
    const hourStart = parseInt(selectedSlot.time);
    const reservationData = {
      user_id: user.user_id,
      experiment_description: formData.description,
      reservation_date: selectedSlot.date,
      reservation_time: `${selectedSlot.date}T${hourStart}:00:00Z`,
    };

    try {
      await dispatch(createReservation(reservationData));
      setConfirmDialog(false);
      setSnackbarOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteReservation(id, user.user_id));
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error eliminando reserva:", error);
    }
  };

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
                          onClick={() => status === "available" && handleSlotClick(dateStr, time)}
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
              {reservations.map((res, i) => (
                <React.Fragment key={i}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleDelete(res.reservation_id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`📅 ${new Date(res.reservation_date).toLocaleDateString()} | ⏰ ${new Date(res.reservation_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      secondary={`🧪 ${res.experiment_description || "No description"}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {reservations.length === 0 && (
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
          <Button variant="contained" color="error" onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Operación realizada exitosamente"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default Calendarizacion;
