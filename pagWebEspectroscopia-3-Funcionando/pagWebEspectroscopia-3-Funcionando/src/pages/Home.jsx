// import React, { useState } from 'react';
// import { Box, Paper, Typography, Grid } from '@mui/material';
// import Map from '../components/Elements/Map';
// import UniversityList from '../components/UniversityList/UniversityList';
// import camaraPanelSolar from '../assets/img/experimentos/camaraPanelesSolares.png';
// import imagenHome from '../assets/img/experimentos/imagenHome01.jpg';
// import WeatherComponent from '../components/WeatherComponent';
// import '../assets/css/Home.css';

// const Home = () => {
//     const [selectedCountry, setSelectedCountry] = useState(null);

//     // Datos de las universidades
//     const universities = [
//         { name: "UMSS-BO: Universidad Mayor de San Simón, Bolivia", country: "Bolivia" },
//         { name: "UMSA-BO: Universidad Mayor de San Andrés, Bolivia", country: "Bolivia" },
//         { name: "UPB-BO: Universidad Privada Boliviana, Bolivia", country: "Bolivia" },
//         { name: "EPN-EC: Escuela Politécnica Nacional, Ecuador", country: "Ecuador" },
//         { name: "ESPOL-EC: Escuela Superior Politécnica del Litoral, Ecuador", country: "Ecuador" },
//         { name: "GALILEO-GT: Universidad Galileo, Guatemala", country: "Guatemala" },
//         { name: "USPG-GT: Universidad San Pablo de Guatemala, Guatemala", country: "Guatemala" },
//         { name: "PUCP-PE: Pontificia Universidad Católica del Perú, Peru", country: "Peru" },
//         { name: "UNI-PE: Universidad Nacional de Ingeniería, Peru", country: "Peru" },
//         { name: "UPC-ES: Universitat Politècnica de Catalunya, Spain", country: "Spain" },
//         { name: "UB-FR: Université de Bordeaux, France", country: "France" }
//     ];

//     const handleUniversityClick = (university) => {
//         setSelectedCountry(university.country);
//     };

//     return (
//         <div className="home">
//             {/* Contenedor de la imagen de fondo */}
//             <div className="background-image">
//                 <img src={imagenHome} alt="Background" className="background-img" />
//                 <div className="overlay"></div> {/* Capa opaca */}
//                 <div className="text-container">
//                     <Typography variant="h3" className="title-text">
//                         RemoteSolarLabEC
//                     </Typography>
//                     <Typography variant="h5" sx = {{color: 'white', fontSize: '1.1rem', padding: '0 20px'}}>
//                         {"The advanced photovoltaic laboratory of the Escuela Politécnica Nacional del Ecuador, located in Quito (RemoteSolarLabEC), endeavors to provide resources for the study of photovoltaic systems remotely. These resources are available through the scheduling system and can be used at no cost."}
//                     </Typography>
//                 </div>
//             </div>       

//             {/* Componente de Datos Meteorológicos */}
//             <Typography variant="h4" marginTop={2} gutterBottom sx={{ textAlign: 'left' }}>{"Data in real time"}</Typography>
//             <WeatherComponent />

//             {/* Sección "Our Subsystems" */}
//             <Typography variant="h4" marginTop={4} gutterBottom sx={{ textAlign: 'left' }}>{"Our Subsystems"}</Typography>
//             <Grid container spacing={2} sx={{ marginBottom: 4 }}>
//                 {/* <Grid item xs={6}> */}
//                     <Box
//                         component="img"
//                         src= {camaraPanelSolar} // Reemplaza con la ruta de tu imagen
//                         alt="Imagen 1"
//                         sx={{ width: '70%', height: 'auto', borderRadius: 2, textAlign: 'center' }}
//                     />
//                 {/* </Grid> */}
                
//             </Grid>

//             <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{"EPN Station - Rubén Orellana Campus"}</Typography>

//             <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{"Partner Labs"}</Typography>
//             <div className="grid-container">
//                 <div className="map-container">
//                     <Map selectedCountry={selectedCountry} />
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



import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Map from '../components/Elements/Map';
import UniversityList from '../components/UniversityList/UniversityList';
import imagenHome from '../assets/img/experimentos/imagenHome01.jpg';
import WeatherComponent from '../components/WeatherComponent';
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
                        RemoteSolarLabEC
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'white', fontSize: '1.1rem', padding: '0 20px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Poppins", sans-serif', fontWeight: 400, lineHeight: 1.6 }}>
                        {"The advanced photovoltaic laboratory of the Escuela Politécnica Nacional del Ecuador, located in Quito (RemoteSolarLabEC), endeavors to provide resources for the study of photovoltaic systems remotely. These resources are available through the scheduling system and can be used at no cost."}
                    </Typography>
                </div>
            </div>       

            {/* ✅ NUEVO: Contenedor centralizado para todo el contenido inferior con padding */}
            <Box sx={{ width: '90%', maxWidth: '1200px', margin: '0 auto', padding: '40px 0', fontFamily: '"Poppins", sans-serif' }}>
                
                {/* Componente de Datos Meteorológicos */}
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    Data in real time
                </Typography>
                <WeatherComponent />

                {/* Sección "Our Subsystems" con CÁMARA EN VIVO */}
                <Typography variant="h4" sx={{ textAlign: 'left', mt: 6, mb: 3, fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    Our Subsystems
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
                    <Paper 
                        sx={{ 
                            p: 2, 
                            backgroundColor: "#121212", 
                            color: "#fff", 
                            borderRadius: "12px", 
                            width: "100%", 
                            maxWidth: "900px", /* Limita el ancho para que se vea elegante */
                            boxShadow: "0px 10px 30px rgba(0,0,0,0.2)"
                        }}
                    >
                        <Typography variant="h5" sx={{ display: "flex", alignItems: "center", mb: 1, fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                            Live Camera
                            <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
                        </Typography>
                        <Box sx={{ width: "100%", height: { xs: "250px", sm: "400px", md: "500px" }, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1&playsinline=1"
                                title="Live Stream"
                                frameBorder="0"
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                allowFullScreen
                            />
                        </Box>
                    </Paper>
                </Box>

                <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', mt: 6, fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    EPN Station - Rubén Orellana Campus
                </Typography>

                <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', mt: 4, fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    Partner Labs
                </Typography>
                
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
            </Box>
        </div>
    );
};

export default Home;