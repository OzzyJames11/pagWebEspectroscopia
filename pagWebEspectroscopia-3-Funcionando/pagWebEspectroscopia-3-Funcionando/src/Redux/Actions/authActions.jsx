// src/Redux/Actions/authActions.jsx
import axios from "axios";

export const login = (email, password) => async (dispatch) => {
  try {
    const res = await axios.post("http://localhost:3000/api/users/login", {
      email,
      password,
    });

    const { token, user } = res.data; // 👈 el backend debe devolver { token, user }

    // Guardamos el token y el user en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user, token },
    });
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: error.response?.data?.error || "Error en login", // 👈 tu backend devuelve "error", no "msg"
    });
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    const res = await axios.post("http://localhost:3000/api/users/register", userData);

    dispatch({
      type: "REGISTER_SUCCESS",
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: "REGISTER_FAIL",
      payload: error.response?.data?.error || "Error en registro",
    });
  }
};


export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // 👈 limpiar también el usuario
  dispatch({ type: "LOGOUT" });
};

export const loadUserFromStorage = () => (dispatch) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { token, user: JSON.parse(user) },
    });
  } else {
    dispatch({ type: "LOGOUT" });
  }
};

// ✅ Obtener reservas de un usuario
export const fetchReservations = (userId) => async (dispatch) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/reservations?user_id=${userId}`);
    dispatch({
      type: "SET_RESERVATIONS",
      payload: res.data,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
  }
};

// ✅ Crear reserva
export const createReservation = (reservationData) => async (dispatch) => {
  try {
    const res = await axios.post("http://localhost:3000/api/reservations", reservationData);
    dispatch(fetchReservations(res.data.user_id)); // refrescar lista
    return res.data;
  } catch (error) {
    console.error("Error al crear reserva:", error);
    throw error;
  }
};

// ✅ Eliminar reserva
export const deleteReservation = (id, userId) => async (dispatch) => {
  try {
    await axios.delete(`http://localhost:3000/api/reservations/${id}`);
    dispatch(fetchReservations(userId)); // refrescar lista
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
  }
};