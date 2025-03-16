import React, { useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import Map from '../components/Elements/Map';
import UniversityList from '../components/UniversityList/UniversityList';
import camaraPanelSolar from '../assets/img/experimentos/camaraPanelesSolares.png';
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
                        Q-LAP EPN
                    </Typography>
                    <Typography variant="h5" sx = {{color: 'white', fontSize: '1.1rem', padding: '0 20px'}}>
                        {"The advanced photovoltaic laboratory of the Escuela Politécnica Nacional del Ecuador, located in Quito (Q-LAP), endeavors to provide resources for the study of photovoltaic systems remotely. These resources are available through the scheduling system and can be used at no cost."}
                    </Typography>
                </div>
            </div>       

            {/* Componente de Datos Meteorológicos */}
            <Typography variant="h4" marginTop={2} gutterBottom sx={{ textAlign: 'left' }}>{"Data in real time"}</Typography>
            <WeatherComponent />

            {/* Sección "Our Subsystems" */}
            <Typography variant="h4" marginTop={4} gutterBottom sx={{ textAlign: 'left' }}>{"Our Subsystems"}</Typography>
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