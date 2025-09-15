// src/Redux/Reducers/authReducer.jsx

const initialState = {
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: true,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "LOAD_USER_FROM_STORAGE": // ✅ nueva acción
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
      };

    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default authReducer;
