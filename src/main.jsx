// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// // import React from 'react';
// // import ReactDOM from 'react-dom';
// // import { ThemeProvider } from '@mui/material/styles';
// // import { Provider } from 'react-redux';
// // import store from './Redux/store';
// // import theme from './theme'; // Importa el tema personalizado
// // import AppRouter from './routes/index';
// // import './Index.css';

// // ReactDOM.render(
// //     <React.StrictMode>
// //         <ThemeProvider theme={theme}>
// //             <Provider store={store}>
// //                 <AppRouter />
// //             </Provider>
// //         </ThemeProvider>
// //     </React.StrictMode>,
// //     document.getElementById('root')
// // );

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