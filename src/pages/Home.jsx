// import React from 'react';
// import { Link } from 'react-router-dom';
// import SliderComponent from '../components/SliderComponent';
// import TableComponent from '../components/TableComponent';
// import Footer from '../components/Footer/Footer';
// import Header from '../components/Header/Header';
// //importar paths
// import { ROUTES } from '../assets/Strings/routes';
// import './Home.css'; // Importa los estilos para Home

// const Home = () => {
//     return (
//         <div className="home">
//             {/* <Header /> */}
//             <h1>Bienvenido a la Página de Inicio</h1>
//             {/* <nav className="nav-tabs">
//                 <Link to="/" className="nav-tab">Inicio</Link>
//                 <Link to={ROUTES.EXPERIMENTSCH} className="nav-tab">Experiments</Link>
//                 <Link to={ROUTES.SUBSISTEMA1} className="nav-tab">Subsistema 1</Link>
//                 <Link to={ROUTES.SUBSISTEMA2} className="nav-tab">Subsistema 2</Link>
//                 <Link to={ROUTES.SUBSISTEMA3} className="nav-tab">Subsistema 3</Link>
//                 <Link to={ROUTES.SUBSISTEMA4} className="nav-tab">Subsistema 4</Link>
//                 <Link to={ROUTES.DATA_SUMMARY} className="nav-tab">Data Summary</Link>
//             </nav> */}

//             {/* Contenido de la página de inicio */}
//             {/* <SliderComponent />
//             <TableComponent /> */}
//             {/* <Footer /> */}
//         </div>
//     );
// };

// export default Home;


// import React, { useState } from 'react';
// import Map from '../components/Elements/Map';
// import UniversityList from '../components/UniversityList/UniversityList';
// import './Home.css';

// const Home = () => {
//     const [selectedUniversity, setSelectedUniversity] = useState(null);

//     // Datos de ejemplo de universidades
//     const universities = [
//         { name: "Universidad de Buenos Aires", country: "Argentina", coordinates: [-34.5997, -58.3819] },
//         { name: "Universidad Nacional Autónoma de México", country: "México", coordinates: [19.3328, -99.1865] },
//         { name: "Universidad de São Paulo", country: "Brasil", coordinates: [-23.5614, -46.7308] },
//         { name: "Universidad de Chile", country: "Chile", coordinates: [-33.4489, -70.6693] },
//         { name: "Universidad Nacional de Colombia", country: "Colombia", coordinates: [4.6372, -74.0842] },
//         { name: "Universidad de Costa Rica", country: "Costa Rica", coordinates: [9.9347, -84.0505] },
//         { name: "Universidad de La Habana", country: "Cuba", coordinates: [23.1371, -82.3807] },
//         { name: "Universidad de Puerto Rico", country: "Puerto Rico", coordinates: [18.4037, -66.0506] },
//         { name: "Universidad de la República", country: "Uruguay", coordinates: [-34.9011, -56.1645] },
//         { name: "Universidad Central de Venezuela", country: "Venezuela", coordinates: [10.491, -66.9021] }
//     ];

//     const handleUniversityClick = (university) => {
//         setSelectedUniversity(university);
//     };

//     return (
//         <div className="home">
//             <h1>Bienvenido a la Página de Inicio</h1>
//             <div className="map-container">
//                 <Map
//                     universities={universities}
//                     selectedUniversity={selectedUniversity}
//                     onUniversityClick={handleUniversityClick}
//                 />
//                 <UniversityList
//                     universities={universities}
//                     onUniversityClick={handleUniversityClick}
//                 />
//             </div>
//         </div>
//     );
// };

// export default Home;


// src/pages/Home.jsx
// import React, { useState } from 'react';
// import MinimalistMap from '../components/Elements/Map';
// import UniversityList from '../components/UniversityList/UniversityList';
// import './Home.css';

// const Home = () => {
//     const [selectedUniversity, setSelectedUniversity] = useState(null);

//     // Datos de ejemplo de universidades
//     const universities = [
//         { name: "Universidad de Buenos Aires", country: "Argentina", coordinates: [-58.3819, -34.5997] },
//         { name: "Universidad Nacional Autónoma de México", country: "México", coordinates: [-99.1865, 19.3328] },
//         { name: "Universidad de São Paulo", country: "Brasil", coordinates: [-46.7308, -23.5614] },
//         { name: "Universidad de Chile", country: "Chile", coordinates: [-70.6693, -33.4489] },
//         { name: "Universidad Nacional de Colombia", country: "Colombia", coordinates: [-74.0842, 4.6372] },
//         { name: "Universidad de Costa Rica", country: "Costa Rica", coordinates: [-84.0505, 9.9347] },
//         { name: "Universidad de La Habana", country: "Cuba", coordinates: [-82.3807, 23.1371] },
//         { name: "Universidad de Puerto Rico", country: "Puerto Rico", coordinates: [-66.0506, 18.4037] },
//         { name: "Universidad de la República", country: "Uruguay", coordinates: [-56.1645, -34.9011] },
//         { name: "Universidad Central de Venezuela", country: "Venezuela", coordinates: [-66.9021, 10.491] }
//     ];

//     const handleUniversityClick = (university) => {
//         setSelectedUniversity(university);
//     };

//     return (
//         <div className="home">
//             <h1>Bienvenido a la Página de Inicio</h1>
//             <div className="content-container">
//                 <MinimalistMap
//                     universities={universities}
//                     selectedUniversity={selectedUniversity}
//                     onUniversityClick={handleUniversityClick}
//                 />
//                 <UniversityList
//                     universities={universities}
//                     onUniversityClick={handleUniversityClick}
//                 />
//             </div>
//         </div>
//     );
// };

// export default Home;

// src/pages/Home.jsx
// import React, { useState } from 'react';
// import MinimalistMap from '../components/Elements/Map';
// import UniversityList from '../components/UniversityList/UniversityList';
// import './Home.css';

// const Home = () => {
//     const [selectedCountry, setSelectedCountry] = useState(null);

//     // Datos de ejemplo de universidades
//     const universities = [
//         { name: "Universidad de Buenos Aires", country: "Argentina" },
//         { name: "Universidad Nacional Autónoma de México", country: "Mexico" }, // Asegúrate de que el nombre coincida con el topojson
//         { name: "Universidad de São Paulo", country: "Brazil" },
//         { name: "Universidad de Chile", country: "Chile" },
//         { name: "Universidad Nacional de Colombia", country: "Colombia" },
//         { name: "Universidad de Costa Rica", country: "Costa Rica" },
//         { name: "Universidad de La Habana", country: "Cuba" },
//         { name: "Universidad de Puerto Rico", country: "Puerto Rico" },
//         { name: "Universidad de la República", country: "Uruguay" },
//         { name: "Universidad Central de Venezuela", country: "Venezuela" }
//     ];

//     const handleUniversityClick = (university) => {
//         setSelectedCountry(university.country);
//     };

//     return (
//         <div className="home">
//             <h1>Bienvenido a la Página de Inicio</h1>
//             <div className="grid-container">
//                 <div className="map-container">
//                     <MinimalistMap selectedCountry={selectedCountry} />
//                 </div>
//                 <div className="list-container">
//                     <UniversityList
//                         universities={universities}
//                         onUniversityClick={handleUniversityClick}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Home;


// src/pages/Home.jsx
import React, { useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import Map from '../components/Elements/Map';
import UniversityList from '../components/UniversityList/UniversityList';
import camaraPanelSolar from '../assets/img/experimentos/camaraPanelesSolares.png';
import imagenHome from '../assets/img/experimentos/imagenHome01.jpg';

import '../assets/css/Home.css';

const Home = () => {
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Datos de las universidades
    const universities = [
        { name: "UMSS-BO: Universidad Mayor de San Simón, Bolivia", country: "Bolivia" },
        { name: "UMSA-BO: Universidad Mayor de San Andrés, Bolivia", country: "Bolivia" },
        { name: "UPB-BO: Universidad Privada Boliviana, Bolivia", country: "Bolivia" },
        { name: "EPN-EC: Escuela Politécnica Nacional, Ecuador", country: "Ecuador" },
        { name: "ESPOL-EC: Escuela Superior Politécnica del Litoral, Ecuador", country: "Ecuador" },
        { name: "GALILEO-GT: Universidad Galileo, Guatemala", country: "Guatemala" },
        { name: "USPG-GT: Universidad San Pablo de Guatemala, Guatemala", country: "Guatemala" },
        { name: "PUCP-PE: Pontificia Universidad Católica del Perú, Peru", country: "Peru" },
        { name: "UNI-PE: Universidad Nacional de Ingeniería, Peru", country: "Peru" },
        { name: "UPC-ES: Universitat Politècnica de Catalunya, Spain", country: "Spain" },
        { name: "UB-FR: Université de Bordeaux, France", country: "France" }
    ];

    const handleUniversityClick = (university) => {
        setSelectedCountry(university.country);
    };

    return (
        <div className="home">
            {/* Contenedor de la imagen de fondo */}
            <div className="background-image">
                <img src={imagenHome} alt="Background" className="background-img" />
                <div className="overlay"></div> {/* Capa opaca */}
                <div className="text-container">
                    <Typography variant="h3" className="title-text">
                        Q-LAP EPN
                    </Typography>
                    <Typography variant="h5" sx = {{color: 'white', fontSize: '1.1rem', padding: '0 20px'}}>
                        {"The advanced photovoltaic laboratory of the Escuela Politécnica Nacional del Ecuador, located in Quito (Q-LAP), endeavors to provide resources for the study of photovoltaic systems remotely. These resources are available through the scheduling system and can be used at no cost."}
                    </Typography>
                </div>
            </div>       
            <Typography variant="h4" marginTop={2} gutterBottom sx={{ textAlign: 'left' }}>{"Our Subsystems"}</Typography>

            {/* Sección de imágenes con Grid */}
            <Grid container spacing={2} sx={{ marginBottom: 4 }}>
                <Grid item xs={6}>
                    <Box
                        component="img"
                        src= {camaraPanelSolar} // Reemplaza con la ruta de tu imagen
                        alt="Imagen 1"
                        sx={{ width: '70%', height: 'auto', borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Box
                        component="img"
                        src= {camaraPanelSolar} // Reemplaza con la ruta de tu imagen
                        alt="Imagen 2"
                        sx={{ width: '70%', height: 'auto', borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Box
                        component="img"
                        src= {camaraPanelSolar} // Reemplaza con la ruta de tu imagen
                        alt="Imagen 2"
                        sx={{ width: '70%', height: 'auto', borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Box
                        component="img"
                        src= {camaraPanelSolar} // Reemplaza con la ruta de tu imagen
                        alt="Imagen 2"
                        sx={{ width: '70%', height: 'auto', borderRadius: 2 }}
                    />
                </Grid>
            </Grid>

            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{"EPN Station - Rubén Orellana Campus"}</Typography>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>{"Data in real time"}</Typography>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{"Partner Labs"}</Typography>
            <div className="grid-container">
                <div className="map-container">
                    <Map selectedCountry={selectedCountry} />
                </div>
                <div className="list-container">
                    <UniversityList
                        universities={universities}
                        onUniversityClick={handleUniversityClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;