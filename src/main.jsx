import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from './Redux/store';
import theme from './theme'; // Importa el tema personalizado
import App from './App.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <App />
            </Provider>
        </ThemeProvider>
    </StrictMode>
);