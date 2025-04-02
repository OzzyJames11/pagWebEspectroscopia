import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Reducers/authReducer';

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export default store;