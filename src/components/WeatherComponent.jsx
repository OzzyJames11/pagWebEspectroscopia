import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import './styles/WeatherComponent.css';

import {
    faThermometerHalf, // Icono para temperatura
    faTint, // Icono para humedad
    faWind, // Icono para velocidad del viento
    faCloudRain, // Icono para precipitación
    faCloud, // Icono para nubosidad
    faTachometerAlt, // Icono para presión
    faSun, // Icono para UV Index
    faSun as faClearSky, // Icono para cielo despejado
    faCloudSun, // Icono para parcialmente nublado
    faSmog, // Icono para niebla
    faIcicles, // Icono para lluvia helada
    faSnowflake, // Icono para nieve
    faBolt, // Icono para tormenta
} from '@fortawesome/free-solid-svg-icons';

const WeatherComponent = () => {
    const [temperatura, setTemperatura] = useState(null);
    const [humedad, setHumedad] = useState(null);
    const [velocidadViento, setVelocidadViento] = useState(null);
    const [precipitacion, setPrecipitacion] = useState(null);
    const [nubosidad, setNubosidad] = useState(null);
    const [presion, setPresion] = useState(null);
    const [uvIndex, setUvIndex] = useState(null);
    const [weatherCode, setWeatherCode] = useState(null);

    // Mapeo de weather codes a iconos y descripciones
    const weatherCodeMap = {
        0: { icon: faClearSky, description: 'Cielo despejado' },
        1: { icon: faCloudSun, description: 'Principalmente despejado' },
        2: { icon: faCloudSun, description: 'Parcialmente nublado' },
        3: { icon: faCloud, description: 'Nublado' },
        45: { icon: faSmog, description: 'Niebla' },
        48: { icon: faSmog, description: 'Niebla con escarcha' },
        51: { icon: faCloudRain, description: 'Llovizna ligera' },
        53: { icon: faCloudRain, description: 'Llovizna moderada' },
        55: { icon: faCloudRain, description: 'Llovizna densa' },
        56: { icon: faIcicles, description: 'Llovizna helada ligera' },
        57: { icon: faIcicles, description: 'Llovizna helada densa' },
        61: { icon: faCloudRain, description: 'Lluvia ligera' },
        63: { icon: faCloudRain, description: 'Lluvia moderada' },
        65: { icon: faCloudRain, description: 'Lluvia intensa' },
        66: { icon: faIcicles, description: 'Lluvia helada ligera' },
        67: { icon: faIcicles, description: 'Lluvia helada intensa' },
        71: { icon: faSnowflake, description: 'Nieve ligera' },
        73: { icon: faSnowflake, description: 'Nieve moderada' },
        75: { icon: faSnowflake, description: 'Nieve intensa' },
        77: { icon: faSnowflake, description: 'Granos de nieve' },
        80: { icon: faCloudRain, description: 'Chubascos ligeros' },
        81: { icon: faCloudRain, description: 'Chubascos moderados' },
        82: { icon: faCloudRain, description: 'Chubascos violentos' },
        85: { icon: faSnowflake, description: 'Chubascos de nieve ligeros' },
        86: { icon: faSnowflake, description: 'Chubascos de nieve intensos' },
        95: { icon: faBolt, description: 'Tormenta eléctrica' },
        96: { icon: faBolt, description: 'Tormenta eléctrica con granizo ligero' },
        99: { icon: faBolt, description: 'Tormenta eléctrica con granizo intenso' },
    };

    // Función para obtener la descripción del Índice UV
    const getUvIndexDescription = (uvIndex) => {
        if (uvIndex === null) return 'Cargando...';
        if (uvIndex <= 2) return 'Bajo';
        if (uvIndex <= 5) return 'Moderado';
        if (uvIndex <= 7) return 'Alto';
        if (uvIndex <= 10) return 'Muy alto';
        return 'Extremo';
    };

    useEffect(() => {
        const obtenerDatosMeteorologicos = async () => {
            try {
                const respuesta = await axios.get('https://api.open-meteo.com/v1/forecast', {
                    params: {
                        latitude: -0.2299,
                        longitude: -78.5250,
                        elevation: 2850,
                        current_weather: true,
                        hourly: 'relativehumidity_2m,precipitation,cloudcover,pressure_msl,uv_index',
                    },
                });

                const { temperature, windspeed, humidity, weathercode } = respuesta.data.current_weather;
                const {
                    relativehumidity_2m,
                    precipitation,
                    cloudcover,
                    pressure_msl,
                    uv_index,
                } = respuesta.data.hourly;

                setTemperatura(temperature);
                setHumedad(humidity || relativehumidity_2m[0]);
                setVelocidadViento(windspeed);
                setPrecipitacion(precipitation[0]);
                setNubosidad(cloudcover[0]);
                setPresion(pressure_msl[0]);
                setUvIndex(uv_index[0]);
                setWeatherCode(weathercode);
            } catch (error) {
                console.error('Error al obtener los datos meteorológicos:', error);
            }
        };

        obtenerDatosMeteorologicos();
    }, []);

    const weatherInfo = weatherCode !== null ? weatherCodeMap[weatherCode] : null;

    return (
        <div className="container">
            <div className="card">
                <h2>Datos Meteorológicos en Quito:</h2>
                <div className="weatherGrid">
                    {/* Weather Code */}
                    {weatherInfo && (
                        <div className="weatherBox">
                            <span className="data-name">Condición</span>
                            <FontAwesomeIcon icon={weatherInfo.icon} className="icon icon-weather" />
                            <span className="data-value">{weatherInfo.description}</span>
                        </div>
                    )}

                    {/* Resto de los datos meteorológicos */}
                    <div className="weatherBox">
                        <span className="data-name">Temperatura</span>
                        <FontAwesomeIcon icon={faThermometerHalf} className="icon icon-temperature" />
                        <span className="data-value">{temperatura !== null ? `${temperatura}°C` : 'Cargando...'}</span>
                    </div>
                    <div className="weatherBox">
                        <span className="data-name">Humedad</span>
                        <FontAwesomeIcon icon={faTint} className="icon icon-humidity" />
                        <span className="data-value">{humedad !== null ? `${humedad}%` : 'Cargando...'}</span>
                    </div>
                    <div className="weatherBox">
                        <span className="data-name">Viento</span>
                        <FontAwesomeIcon icon={faWind} className="icon icon-wind" />
                        <span className="data-value">{velocidadViento !== null ? `${velocidadViento} km/h` : 'Cargando...'}</span>
                    </div>
                    <div className="weatherBox">
                        <span className="data-name">Precipitación</span>
                        <FontAwesomeIcon icon={faCloudRain} className="icon icon-precipitation" />
                        <span className="data-value">{precipitacion !== null ? `${precipitacion} mm` : 'Cargando...'}</span>
                    </div>
                    <div className="weatherBox">
                        <span className="data-name">Nubosidad</span>
                        <FontAwesomeIcon icon={faCloud} className="icon icon-cloudiness" />
                        <span className="data-value">{nubosidad !== null ? `${nubosidad}%` : 'Cargando...'}</span>
                    </div>
                    <div className="weatherBox">
                        <span className="data-name">Presión</span>
                        <FontAwesomeIcon icon={faTachometerAlt} className="icon icon-pressure" />
                        <span className="data-value">{presion !== null ? `${presion} hPa` : 'Cargando...'}</span>
                    </div>
                    <div className="weatherBox">
                        <span className="data-name">Índice UV</span>
                        <FontAwesomeIcon icon={faSun} className="icon icon-uv" />
                        <span className="data-value">{uvIndex !== null ? `${uvIndex} (${getUvIndexDescription(uvIndex)})` : 'Cargando...'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherComponent;