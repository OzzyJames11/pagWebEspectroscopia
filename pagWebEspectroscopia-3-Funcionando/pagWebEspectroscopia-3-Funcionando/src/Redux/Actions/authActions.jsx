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

export const register = (name, email, password) => async (dispatch) => {
  try {
    const res = await axios.post("http://localhost:3000/api/users/register", {
      name,
      email,
      password,
    });

    // 👇 si tu backend devuelve { token, user } al registrar, guarda también
    if (res.data.token && res.data.user) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      dispatch({
        type: "REGISTER_SUCCESS",
        payload: { user: res.data.user, token: res.data.token },
      });
    } else {
      // Si solo devuelve mensaje de éxito
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: res.data,
      });
    }
  } catch (error) {
    dispatch({
      type: "REGISTER_FAIL",
      payload: error.response?.data?.msg || "Error en registro",
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
