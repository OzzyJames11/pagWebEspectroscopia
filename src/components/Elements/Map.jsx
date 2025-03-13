// // src/components/Map/Map.jsx
// import React from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import '../../assets/css/Elements/Map.css';

// const Map = ({ universities, selectedUniversity, onUniversityClick }) => {
//     return (
//         <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
//             <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             />
//             {universities.map((university, index) => (
//                 <Marker
//                     key={index}
//                     position={university.coordinates}
//                     eventHandlers={{
//                         click: () => onUniversityClick(university),
//                     }}
//                 >
//                     <Popup>{university.name}</Popup>
//                 </Marker>
//             ))}
//         </MapContainer>
//     );
// };

// export default Map;


// import React from 'react';
// import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
// import '../../assets/css/Elements/Map.css';

// // URL del archivo topojson con los datos de los países
// const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// const MinimalistMap = ({ universities, selectedUniversity, onUniversityClick }) => {
//     return (
//         <ComposableMap projection="geoMercator" style={{ width: '100%', height: '500px' }}>
//             <Geographies geography={geoUrl}>
//                 {({ geographies }) =>
//                     geographies.map((geo) => {
//                         // Verifica si el país actual está seleccionado
//                         const isSelected = selectedUniversity && selectedUniversity.country === geo.properties.name;
//                         return (
//                             <Geography
//                                 key={geo.rsmKey}
//                                 geography={geo}
//                                 fill={isSelected ? '#FF5722' : '#EAEAEC'} // Resalta el país seleccionado
//                                 stroke="#D6D6DA"
//                                 strokeWidth={0.5}
//                                 style={{
//                                     default: { outline: 'none' },
//                                     hover: { fill: '#FF5722', outline: 'none' },
//                                     pressed: { outline: 'none' },
//                                 }}
//                             />
//                         );
//                     })
//                 }
//             </Geographies>
//             {universities.map((university, index) => (
//                 <Marker key={index} coordinates={university.coordinates}>
//                     <circle
//                         r={5}
//                         fill={selectedUniversity === university ? '#FF5722' : '#3F51B5'}
//                         stroke="#FFF"
//                         strokeWidth={1}
//                         onClick={() => onUniversityClick(university)}
//                         style={{ cursor: 'pointer' }}
//                     />
//                 </Marker>
//             ))}
//         </ComposableMap>
//     );
// };

// export default MinimalistMap;

// src/components/MinimalistMap/MinimalistMap.jsx
// import React from 'react';
// import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
// import '../../assets/css/Elements/Map.css';

// // URL del archivo topojson con los datos de los países
// const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// const MinimalistMap = ({ selectedCountry }) => {
//     return (
//         <ComposableMap projection="geoMercator" style={{ width: '100%', height: '300px' }}>
//             <Geographies geography={geoUrl}>
//                 {({ geographies }) =>
//                     geographies.map((geo) => {
//                         // Verifica si el país actual está seleccionado
//                         const isSelected = selectedCountry === geo.properties.name;
//                         return (
//                             <Geography
//                                 key={geo.rsmKey}
//                                 geography={geo}
//                                 fill={isSelected ? '#FF5722' : '#EAEAEC'} // Resalta el país seleccionado
//                                 stroke="#D6D6DA"
//                                 strokeWidth={0.5}
//                                 style={{
//                                     default: { outline: 'none' },
//                                     hover: { fill: '#FF5722', outline: 'none' },
//                                     pressed: { outline: 'none' },
//                                 }}
//                             />
//                         );
//                     })
//                 }
//             </Geographies>
//         </ComposableMap>
//     );
// };

// export default MinimalistMap;

// import React from 'react';
// import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
// import '../../assets/css/Elements/Map.css';

// // URL del archivo topojson con los datos de los países
// const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// const MinimalistMap = ({ selectedCountry }) => {
//     return (
//         <ComposableMap projection="geoMercator" style={{ width: '100%', height: '300px' }}>
//             <ZoomableGroup center={selectedCountry ? [0, 0] : [0, 0]} zoom={1}>
//                 <Geographies geography={geoUrl}>
//                     {({ geographies }) =>
//                         geographies.map((geo) => {
//                             // Verifica si el país actual está seleccionado
//                             const isSelected = selectedCountry === geo.properties.name;
//                             return (
//                                 <Geography
//                                     key={geo.rsmKey}
//                                     geography={geo}
//                                     fill={isSelected ? '#FF5722' : '#EAEAEC'} // Resalta el país seleccionado
//                                     stroke="#D6D6DA"
//                                     strokeWidth={0.5}
//                                     style={{
//                                         default: { outline: 'none' },
//                                         hover: { fill: '#FF5722', outline: 'none' },
//                                         pressed: { outline: 'none' },
//                                     }}
//                                 />
//                             );
//                         })
//                     }
//                 </Geographies>
//             </ZoomableGroup>
//         </ComposableMap>
//     );
// };

// export default MinimalistMap;

// src/components/Elements/Map.jsx
// src/components/Elements/Map.jsx
// src/components/Elements/Map.jsx
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