// import React from 'react';
// import '../styles/Header.css';

// const Header = () => {
//   return (
//     //El JSX se va a renderizar como un elemento <header> con la clase CSS header (definida en el archivo Header.css).
//     <header className="header">
//       <h1>Mi Aplicación React</h1>
//     </header>
//   );
// };

// export default Header;


// import React, { useState } from 'react';
// import { AppBar, Toolbar, Container, Box, Drawer, useScrollTrigger } from '@mui/material';
// import { Link } from 'react-router-dom';
// import { Dehaze } from '@mui/icons-material'; // Ícono para el menú móvil
// import headerLogo from '../../assets/img/header_logo.png'; // Logo del header
// import epnLogo from '../../assets/img/logo-epn-white.png'; // Logo EPN
// import euGPLogo from '../../assets/img/EU-BEGP.png'; // Logo EU-GP
// import HeaderLinks from './Header.links'; // Importa el componente de enlaces
// //style
// // import HeaderStyle from '../../assets/css/header.style.css';
// import '../../assets/css/header.style.css'; // Importa los estilos del Header

// const Header = (props) => {
//     const [open, setOpen] = useState(false);
//     const { absolute, fixed, transparent } = props;

//     // Lógica para el efecto de scroll
//     const trigger = useScrollTrigger({
//         disableHysteresis: true,
//         threshold: 50,
//     });

//     // Clases dinámicas
//     const appBarClasses = [
//         'appBar',
//         transparent && !trigger ? 'transparent' : '',
//         absolute ? 'absolute' : '',
//         fixed ? 'fixed' : '',
//     ].join(' ').trim();

//     return (
//         <AppBar className={appBarClasses}
//             // sx={{
//             //     backgroundColor: transparent && !trigger ? 'transparent' : '#001f3e', // Color principal
//             //     position: absolute ? 'absolute' : fixed ? 'fixed' : 'static',
//             //     boxShadow: 'none',
//             // }}
//         >
//             <Toolbar>
//                 <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     {/* Logos */}
//                     <Box display="flex" alignItems="center">
//                         {/* <img src={epnLogo} alt="Logotipo EPN" style={{ height: '50px', maxWidth: '75px' }} /> */}
//                         <Link to="/" style={{ textDecoration: 'none' }}>
//                             <img src={euGPLogo} alt="Logotipo EU-GP" style={{ width: '70%', maxWidth: '500px', minWidth: '45px', maxHeight: '64px' }} />
//                         </Link>
//                     </Box>

//                     {/* Enlaces (versión escritorio) */}
//                     <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
//                         <HeaderLinks />
//                     </Box>

//                     {/* Menú móvil */}
//                     <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
//                         <Dehaze onClick={() => setOpen(true)} />
//                         <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
//                             <Box bgcolor="#001f3e" height="100%" width="225px" display="flex" flexDirection="column">
//                                 <img src={headerLogo} alt="Logotipo Scinergy" style={{ width: '100%', padding: '1rem' }} />
//                                 <HeaderLinks divider closeDrawer={() => setOpen(false)} />
//                             </Box>
//                         </Drawer>
//                     </Box>
//                 </Container>
//             </Toolbar>
//         </AppBar>
//     );
// };

// export default Header;

import React, { useState } from 'react';
import { AppBar, Toolbar, Container, Box, Drawer, useScrollTrigger } from '@mui/material';
import { Link } from 'react-router-dom';
import { Dehaze } from '@mui/icons-material';
import headerLogo from '../../assets/img/header_logo.png';
import epnLogo from '../../assets/img/logo-epn-white.png';
import euGPLogo from '../../assets/img/EU-BEGP_BN.png';
import HeaderLinks from './Header.links'; // Importa el componente de enlaces
import styles from '../../assets/css/header.module.css'; // Importa los estilos del Header

const Header = (props) => {
    const [open, setOpen] = useState(false);
    const { absolute, fixed, transparent } = props;

    // Lógica para el efecto de scroll
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 50,
    });

    // Clases dinámicas
    const appBarClasses = [
        styles.appBar,
        transparent && !trigger ? styles.transparent : '',
        absolute ? styles.absolute : '',
        fixed ? styles.fixed : '',
    ].join(' ').trim();

    return (
        <AppBar className={appBarClasses}>
            <Toolbar>
                <Container className={styles.container}>
                    <Box display="flex" alignItems="center">
                        {/* <img src={epnLogo} alt="Logotipo EPN" style={{ height: '50px', maxWidth: '75px' }} /> */}
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <img src={euGPLogo} alt="Logotipo EU-GP" style={{ width: '70%', maxWidth: '500px', minWidth: '45px', maxHeight: '64px' }} />
                        </Link>
                    </Box>
                    {/* Enlaces (versión escritorio) */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <HeaderLinks />
                    </Box>

                    {/* Menú móvil */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                        <Dehaze onClick={() => setOpen(true)} />
                        <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
                            <Box bgcolor="#001f3e" height="100%" width="225px" display="flex" flexDirection="column">
                                <img src={headerLogo} alt="Logotipo Scinergy" style={{ width: '100%', padding: '1rem' }} />
                                <HeaderLinks divider closeDrawer={() => setOpen(false)} />
                            </Box>
                        </Drawer>
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    );
};

export default Header;