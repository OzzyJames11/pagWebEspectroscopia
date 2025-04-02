
import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import '../../assets/css/Elements/Map.css';

// URL del archivo topojson con los datos de los países
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Coordenadas centrales y nivel de zoom para cada país
const countryCoordinates = {
    Bolivia: { coordinates: [-64.6854, -16.2902], zoom: 4 },
    Ecuador: { coordinates: [-78.1834, -1.8312], zoom: 5 },
    Guatemala: { coordinates: [-90.2308, 15.7835], zoom: 6 },
    Peru: { coordinates: [-75.0152, -9.1899], zoom: 4 },
    Spain: { coordinates: [-3.7038, 40.4168], zoom: 4 },
    France: { coordinates: [2.2137, 46.2276], zoom: 4 },
};

const Map = ({ selectedCountry }) => {
    const { coordinates, zoom } = useMemo(() => {
        return selectedCountry ? countryCoordinates[selectedCountry] : { coordinates: [0, 0], zoom: 1 };
    }, [selectedCountry]);

    return (
        <ComposableMap projection="geoMercator" style={{ width: '100%', height: '300px' }}>
            <ZoomableGroup
                center={coordinates}
                zoom={zoom}
                zoomable="false" // Deshabilita el zoom (pasamos un string)
                disablePanning={true} // Deshabilita el arrastre
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            // Verifica si el país actual está seleccionado
                            const isSelected = selectedCountry === geo.properties.name;
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={isSelected ? '#FF5722' : '#EAEAEC'} // Resalta el país seleccionado
                                    stroke="#D6D6DA"
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: 'none' },
                                        hover: { outline: 'none' }, // Deshabilita el resaltado al pasar el cursor
                                        pressed: { outline: 'none' },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ZoomableGroup>
        </ComposableMap>
    );
};

export default Map;