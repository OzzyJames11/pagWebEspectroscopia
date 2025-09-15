// src/Redux/store.jsx
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Reducers/authReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 👈 evita warnings con localStorage
    }),
  devTools: process.env.NODE_ENV !== 'production', // 👈 habilita Redux DevTools en desarrollo
});

export default store;
