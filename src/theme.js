import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#001f3e', // Color principal
        },
        secondary: {
            main: '#ff4081', // Color secundario
        },
    },
    typography: {
        // fontFamily: 'Poppins, Arial, sans-serif',
// creo que lo siguiente no es necesario

        // body2: {
        //     // fontFamily: 'Poppins, Arial, sans-serif', // Define la fuente para body2
        //     fontSize: '0.875rem', // Tamaño de fuente por defecto para body2
        //     fontWeight: 400, // Peso de la fuente
        // },
        // // Puedes personalizar otras variantes si es necesario
        body1: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontSize: '0.9rem',
            color: '#444444',
            // color: '#333333',
            fontWeight: 100,
        },
        h3: {
          fontFamily: 'Poppins, Arial, sans-serif',
          fontSize: '3rem',
          fontWeight: 500,
          color: '#333333'
        },  
        h4: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontSize: '1.5rem',
            color: '#444444',
            fontWeight: 500,
        },
        h5: {
          fontFamily: 'Poppins, Arial, sans-serif',
          fontSize: '1.3rem',
          color: '#444444',
          fontWeight: 300,
        },
        columnheader: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontSize: '2rem',
            fontWeight: 800,
        },
    },
    components: {
        // Personalización global de componentes
        MuiTableCell: {
          styleOverrides: {
            root: {
                textAlign: 'center', // Centra el contenido de las celdas
                fontFamily: 'inherit', // Hereda la fuente del tema
            },
          },
        },
        MuiSlider: {
          styleOverrides: {
            valueLabel: {
              fontFamily: 'inherit', // Hereda la fuente del tema
            },
          },
        },
      },
});

export default theme;