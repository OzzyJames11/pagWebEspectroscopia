// import React, { useState } from 'react';
// import { Box, Paper, Typography, Grid, TextField, CircularProgress } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// // Importación de imágenes
// import camaraPanelSolar from '../../assets/img/experimentos/camaraPanelesSolares.png';
// import graficoSpectroscopia from '../../assets/img/experimentos/espectro_completo.png';

// // Importación de constantes
// import Button from '../../components/Elements/Button.jsx';
// import { PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema4Strings.jsx';

// // Importación de estilos
// import '../../assets/css/Elements/PaperStyles.css';

// // exportacion de datos
// import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

// const Subsistema4 = () => {
//     const navigate = useNavigate();
//     const { MAIN_TITLE, DESCRIPTION, BACK_BUTTON, CAMERA_TITLE, SPECTROSCOPY_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, DOWNLOAD_1_GRAPH } = PAGE_TITLES;

//     const [integrationTime, setIntegrationTime] = useState(20); // ms
//     const [loading, setLoading] = useState(false);
//     const [spectroImage, setSpectroImage] = useState(graficoSpectroscopia);
//     const [wavelengthData, setWavelengthData] = useState([]);
//     const [intensityData, setIntensityData] = useState([]);

//     // Función para volver al menú anterior
//     const handleBack = () => {
//         navigate('/experiments/experimentChooser');
//     };


//     //Funciones para recolectar datos de longitud de onda e intensidad
//   // const wavelengthData = []; // eje X (en nm)
//   // const intensityData = [];  // eje Y (en a.u.)

//   //descargar datos
//   const handleDownloadSpectralData = () => {
//     generateTXT({
//       filename: "spectral_analysis.txt",
//       sections: [
//         {
//           title: "Spectral Analysis: Intensity (a.u.) vs Wavelength (nm)",
//           headers: ["Wavelength (nm)", "Intensity (a.u.)"],
//           data: wavelengthData.map((w, i) => [w, intensityData[i]]),
//         },
//       ],
//     });
//   };


// //   Ejecutar medición
//   const handleRunSpectrometer = async () => {
//     if (integrationTime < 0.01 || integrationTime > 100) {
//         alert("El tiempo de integración debe estar entre 0.01 y 100 ms.");
//         return;
//     }
//     setLoading(true);

// //     try {
// //         // Ejecutar el espectrómetro
// //         const response = await fetch("http://localhost:8000/run-spectrometer/", {
// //             method: "POST",
// //             headers: { "Content-Type": "application/json" },
// //             body: JSON.stringify({ integration_time: integrationTime }),
// //         });

// //         if (!response.ok) throw new Error("Error al ejecutar espectrómetro");

// //         // Refrescar imagen (con timestamp para evitar caché)
// //         const timestamp = Date.now();
// //         setSpectroImage(`http://localhost:8000/descargar/espectro?t=${timestamp}`);

// //         // Cargar datos .txt
// //         const dataResponse = await fetch(`http://localhost:8000/descargar/datos`);
// //         const text = await dataResponse.text();

// //         const parsedWavelengths = [];
// //         const parsedIntensities = [];
// //         const lines = text.split("\n").slice(1); // saltar encabezado
// //         for (const line of lines) {
// //             const [w, i] = line.split(";");
// //             if (w && i) {
// //                 parsedWavelengths.push(parseFloat(w));
// //                 parsedIntensities.push(parseFloat(i));
// //             }
// //         }
// //         setWavelengthData(parsedWavelengths);
// //         setIntensityData(parsedIntensities);
// //     } catch (err) {
// //         alert("Ocurrió un error al ejecutar el espectrómetro.");
// //         console.error(err);
// //     } finally {
// //         setLoading(false);
// //     }
// //   };

// const handleRunSpectrometer = async () => {
//     if (integrationTime < 0.01 || integrationTime > 100) {
//         alert("El tiempo de integración debe estar entre 0.01 y 100 ms.");
//         return;
//     }
//     setLoading(true);

//     try {
//         const API_BASE_URL = "http://localhost:8000"; // Cambiar en el futuro

//         // 1. Ejecutar el espectrómetro
//         const response = await fetch(`${API_BASE_URL}/run-spectrometer/`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ integration_time: integrationTime }),
//         });

//         if (!response.ok) throw new Error("Error al ejecutar espectrómetro");

//         // 2. Refrescar imagen (con timestamp para evitar caché)
//         const timestamp = Date.now();
//         setSpectroImage(`${API_BASE_URL}/descargar/espectro?t=${timestamp}`);

//         // 3. Cargar datos .txt para el botón de descarga
//         const dataResponse = await fetch(`${API_BASE_URL}/descargar/datos`);
//         const text = await dataResponse.text();

//         const parsedWavelengths = [];
//         const parsedIntensities = [];
//         const lines = text.split("\n").slice(1); // saltar encabezado
//         for (const line of lines) {
//             const [w, i] = line.split(";");
//             if (w && i) {
//                 parsedWavelengths.push(parseFloat(w));
//                 parsedIntensities.push(parseFloat(i));
//             }
//         }
//         setWavelengthData(parsedWavelengths);
//         setIntensityData(parsedIntensities);
//     } catch (err) {
//         alert("Ocurrió un error al ejecutar el espectrómetro.");
//         console.error(err);
//     } finally {
//         setLoading(false);
//     }
// };

//     return (
//         <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//             {/* Título y descripción */}
//             <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
//             <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>{DESCRIPTION}</Typography>

//             <Paper className="paper-graph">
//                 {/*<Typography variant="h5">{SPECTROSCOPY_TITLE}</Typography>*/}
//                 <img
//                     src={spectroImage}
//                     alt="Gráfico de Radiación Solar"
//                     className="paper-image"
//                 />
//             </Paper>

//             {/* INPUT + BOTÓN EJECUTAR */}
//             <Grid container spacing={2} alignItems="center" justifyContent="flex-start" mt={2}>
//                 <Grid item>
//                     <TextField
//                         type="number"
//                         label="Tiempo de integración (ms)"
//                         value={integrationTime}
//                         onChange={(e) => setIntegrationTime(parseFloat(e.target.value))}
//                         inputProps={{ min: 0.01, max: 100, step: 0.01 }}
//                         size="small"
//                     />
//                 </Grid>
//                 <Grid item>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleRunSpectrometer}
//                         disabled={loading}
//                     >
//                         {loading ? <CircularProgress size={24} /> : "Ejecutar espectrómetro"}
//                     </Button>
//                 </Grid>
//             </Grid>

//             {/* BOTÓN DESCARGAR */}
//             <Button variant="contained" color="pink" onClick={handleDownloadSpectralData} align="center" marginTop={1}>{DOWNLOAD_1_GRAPH}</Button>

//             {/* Botón para volver */}
//             <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={2} >
//                 {BACK_BUTTON}
//             </Button>
//         </Box>
//     );
// };

// export default Subsistema4;



// import React, { useState, useEffect } from 'react';
// import { Box, Paper, Typography, Grid, TextField, CircularProgress } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from "react-redux"; // <--- Importamos Redux para el Auth

// // Firebase
// import { getDatabase, ref, set, onValue, off } from "firebase/database";
// import app from "../../firebaseConfig.js"; // <--- Tu archivo de configuración

// // Importación de imágenes
// import graficoSpectroscopia from '../../assets/img/experimentos/espectro_completo.png';

// // Importación de constantes
// import Button from '../../components/Elements/Button.jsx';
// import { PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema4Strings.jsx';
// import '../../assets/css/Elements/PaperStyles.css';

// // ==========================================
// // ⚠️ ATENCIÓN: Actualiza esta URL cada vez que inicies Ngrok en su versión gratuita
// const API_BASE_URL = "https://tactilely-furrowless-liane.ngrok-free.dev"; 
// // ==========================================

// const Subsistema4 = () => {
//     const navigate = useNavigate();
//     const db = getDatabase(app);

//     // ==================== AUTENTICACIÓN ====================
//     const user = useSelector((state) => state.auth.user);
    
//     // ==================== ESTADOS ====================
//     const [integrationTime, setIntegrationTime] = useState(20);
//     const [loading, setLoading] = useState(false);
//     const [spectroImage, setSpectroImage] = useState(graficoSpectroscopia);
//     const [currentMeasurement, setCurrentMeasurement] = useState(null);

//     const { MAIN_TITLE, DESCRIPTION, BACK_BUTTON, DOWNLOAD_1_GRAPH } = PAGE_TITLES;

//     // Si Redux aún no carga el usuario, mostramos un loader para evitar errores
//     if (!user) {
//         return (
//             <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//                 <CircularProgress />
//             </Box>
//         );
//     }

//     const UID_USUARIO = user.uid;
//     const BASE_PATH = `users/${UID_USUARIO}/Exp4`;

//     // ==================== ESCUCHAR RESPUESTAS DEL BACKEND ====================
//     useEffect(() => {
//         if (!currentMeasurement) return; 

//         const statusRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
        
//         const unsubscribe = onValue(statusRef, (snapshot) => {
//             const status = snapshot.val();
//             console.log("📡 Estado recibido de Firebase:", status);

//             if (status === "ScanComplete") {
//                 console.log("✅ ScanComplete detectado. Descargando imagen en segundo plano...");
                
//                 const timestamp = Date.now();
//                 const nuevaUrlImagen = `${API_BASE_URL}/descargar/espectro/${UID_USUARIO}/${currentMeasurement}?t=${timestamp}`;
                
//                 // MAGIA: Usamos fetch para saltar la seguridad de Ngrok
//                 fetch(nuevaUrlImagen, {
//                     method: "GET",
//                     headers: {
//                         "ngrok-skip-browser-warning": "69420" // Esta cabecera salta la pantalla de advertencia
//                     }
//                 })
//                 .then(response => {
//                     if (!response.ok) throw new Error("Error en la descarga de la imagen");
//                     return response.blob(); // Convertimos la respuesta a un archivo binario (imagen)
//                 })
//                 .then(blob => {
//                     // Creamos una URL local en el navegador a partir del binario y la mostramos
//                     const imageObjectUrl = URL.createObjectURL(blob);
//                     setSpectroImage(imageObjectUrl);
//                     console.log("🖼️ ¡Imagen renderizada con éxito!");
//                 })
//                 .catch(error => {
//                     console.error("❌ Error al cargar la imagen:", error);
//                 })
//                 .finally(() => {
//                     setLoading(false);
//                     // Damos un respiro antes de limpiar el comando en Firebase
//                     setTimeout(() => {
//                         set(statusRef, "x"); 
//                     }, 500);
//                 });
//             }
//         });

//         return () => unsubscribe();
//     }, [currentMeasurement, BASE_PATH, UID_USUARIO, db]);

//     // ==================== EJECUTAR MEDICIÓN ====================
//     const handleRunSpectrometer = async () => {
//         if (integrationTime < 0.01 || integrationTime > 100) {
//             alert("El tiempo de integración debe estar entre 0.01 y 100 ms.");
//             return;
//         }
//         setLoading(true);

//         try {
//             // 1. Crear un nuevo identificador único para esta medición
//             const newMeasurementId = `meas_${Date.now()}`;
//             setCurrentMeasurement(newMeasurementId);
            
//             // 2. Escribir los metadatos en Firebase
//             await set(ref(db, `${BASE_PATH}/currentMeasurementId`), newMeasurementId);
//             await set(ref(db, `${BASE_PATH}/measurements/${newMeasurementId}`), {
//                 integrationTime: integrationTime,
//                 timestamp: Date.now(),
//                 status: "pending",
//                 isSaved: false // Aquí luego implementarás la lógica para el historial
//             });

//             // 3. Mandar la orden al espectrómetro (Ej: "s20")
//             await set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `s${integrationTime}`);
            
//             console.log(`[FRONTEND] Orden s${integrationTime} enviada para ${newMeasurementId}`); // <-- CORREGIDO
//         } catch (err) {
//             console.error("Error al iniciar el espectrómetro:", err);
//             setLoading(false);
//             alert("Hubo un error de conexión con la base de datos.");
//         }
//     };

//     // ==================== DESCARGA DIRECTA DE DATOS ====================
//     const handleDownloadSpectralData = () => {
//         if(!currentMeasurement) return alert("Por favor, ejecuta una medición primero."); // <-- CORREGIDO
        
//         // Abre una nueva pestaña que descarga directamente desde tu PC (Ngrok)
//         const downloadUrl = `${API_BASE_URL}/descargar/datos/${UID_USUARIO}/${currentMeasurement}`;
//         window.open(downloadUrl, '_blank');
//     };

//     const handleBack = () => {
//         navigate('/experiments/experimentChooser');
//     };

//     return (
//         <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//             <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>{MAIN_TITLE}</Typography>
//             <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>{DESCRIPTION}</Typography>

//             <Paper className="paper-graph">
//                 <img
//                     src={spectroImage}
//                     alt="Gráfico de Radiación Solar"
//                     className="paper-image"
//                     style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
//                 />
//             </Paper>

//             <Grid container spacing={2} alignItems="center" justifyContent="flex-start" mt={2}>
//                 <Grid item>
//                     <TextField
//                         type="number"
//                         label="Tiempo de integración (ms)"
//                         value={integrationTime}
//                         onChange={(e) => setIntegrationTime(parseFloat(e.target.value))}
//                         inputProps={{ min: 0.01, max: 100, step: 0.01 }}
//                         size="small"
//                         disabled={loading}
//                     />
//                 </Grid>
//                 <Grid item>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleRunSpectrometer}
//                         disabled={loading}
//                     >
//                         {loading ? <CircularProgress size={24} /> : "Ejecutar espectrómetro"}
//                     </Button>
//                 </Grid>
//             </Grid>

//             <Button variant="contained" color="pink" onClick={handleDownloadSpectralData} align="center" marginTop={3}>
//                 {DOWNLOAD_1_GRAPH}
//             </Button>

//             <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={2}>
//                 {BACK_BUTTON}
//             </Button>
//         </Box>
//     );
// };

// export default Subsistema4;





// ozzyjames11: subsistema 4 completo. Se implemento: graficas actualizables, slider adecuado, botones
// futura expansion a la segunda parte del subsistema 4, 
// se uso firebase para metadatos, ngrok para envio de imagenes por túnel

// import React, { useState, useEffect } from 'react';
// import { 
//     Box, Paper, Typography, Grid, TextField, CircularProgress, 
//     FormGroup, FormControlLabel, Checkbox, Tooltip, Menu, Divider, Slider 
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from "react-redux"; 

// // Firebase
// import { getDatabase, ref, set, onValue, update, get } from "firebase/database";
// import app from "../../firebaseConfig.js";

// // Components
// import Button from '../../components/Elements/Button.jsx';

// // Importación de imágenes e iconos
// import graficoSpectroscopia from '../../assets/img/experimentos/espectro_completo.png';
// import placeholderCamara from '../../assets/img/experimentos/camaraPanelesSolares.png';
// import { Download, PlayArrow, CropFree, ArrowDropDown, Save, CloudDone } from '@mui/icons-material';

// // Strings y Estilos
// import { PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema4Strings.jsx';
// import '../../assets/css/Elements/PaperStyles.css';


// // ==========================================
// // 🧠 INTERRUPTOR DE ENTORNO
// // Ponlo en 'true' ÚNICAMENTE en la PC física del laboratorio.
// // Ponlo en 'false' cuando estés programando/probando desde tu casa.
// const ESTOY_EN_EL_LAB = false;

// const API_BASE_URL = ESTOY_EN_EL_LAB 
//     ? "http://127.0.0.1:8000" // Ruta directa y ultrarrápida (Sin Ngrok)
//     : "https://tactilely-furrowless-liane.ngrok-free.dev"; // Túnel para acceder desde tu casa
// // ==========================================


// // ==========================================
// // ozzyjames11: comentado momentaneamente
// // const API_BASE_URL = "https://tactilely-furrowless-liane.ngrok-free.dev"; 
// // ==========================================

// const Subsistema4 = () => {
//     const navigate = useNavigate();
//     const db = getDatabase(app);
//     const user = useSelector((state) => state.auth.user);
    
//     // ==================== ESTADOS ====================
//     const [integrationTime, setIntegrationTime] = useState(20);
//     const [loading, setLoading] = useState(false);
//     const [spectroImage, setSpectroImage] = useState(graficoSpectroscopia);
//     const [currentMeasurement, setCurrentMeasurement] = useState(null);
//     const [isCurrentSaved, setIsCurrentSaved] = useState(false); 
    
//     // NUEVO ESTADO: Para evitar el "salto" de la imagen inicial
//     const [isFetchingHistory, setIsFetchingHistory] = useState(true); 

//     // Estados para el Menú Desplegable de Imágenes
//     const [anchorEl, setAnchorEl] = useState(null);
//     const [imageSelection, setImageSelection] = useState({
//         completo: true,
//         uv: false,
//         visible: false,
//         nir: false
//     });

//     const { MAIN_TITLE, DESCRIPTION, BACK_BUTTON } = PAGE_TITLES;

//     if (!user) {
//         return (
//             <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//                 <CircularProgress />
//             </Box>
//         );
//     }

//     const UID_USUARIO = user.uid;
//     const BASE_PATH = `users/${UID_USUARIO}/Exp4`;

//     // ==================== RECUPERAR ÚLTIMA MEDICIÓN GUARDADA ====================
//     useEffect(() => {
//         const fetchLastSavedMeasurement = async () => {
//             try {
//                 const measRef = ref(db, `${BASE_PATH}/measurements`);
//                 const snapshot = await get(measRef);
                
//                 if (snapshot.exists()) {
//                     const measurements = snapshot.val();
//                     let latestSavedId = null;
//                     let latestSavedData = null;
//                     let maxTime = 0;

//                     Object.entries(measurements).forEach(([id, data]) => {
//                         if (data.isSaved && data.timestamp > maxTime) {
//                             maxTime = data.timestamp;
//                             latestSavedId = id;
//                             latestSavedData = data;
//                         }
//                     });

//                     if (latestSavedId && latestSavedData) {
//                         setCurrentMeasurement(latestSavedId);
//                         setIntegrationTime(latestSavedData.integrationTime);
//                         setIsCurrentSaved(true);

//                         const timestamp = Date.now();
//                         const savedImageUrl = `${API_BASE_URL}/descargar/espectro/${UID_USUARIO}/${latestSavedId}?t=${timestamp}`;
                        
//                         // Esperamos a descargar la imagen correcta antes de mostrarla
//                         const response = await fetch(savedImageUrl, {
//                             method: "GET",
//                             headers: { "ngrok-skip-browser-warning": "69420" }
//                         });

//                         if (response.ok) {
//                             const blob = await response.blob();
//                             setSpectroImage(URL.createObjectURL(blob));
//                         }
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error al buscar el historial de mediciones:", error);
//             } finally {
//                 // Ya sea que haya encontrado una imagen guardada o no, apagamos el estado de carga
//                 setIsFetchingHistory(false);
//             }
//         };

//         fetchLastSavedMeasurement();
//     }, [UID_USUARIO, BASE_PATH, db]);

//     // ==================== ESCUCHAR RESPUESTAS (NUEVAS MEDICIONES) ====================
//     useEffect(() => {
//         if (!currentMeasurement) return; 

//         const statusRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
        
//         const unsubscribe = onValue(statusRef, (snapshot) => {
//             const status = snapshot.val();
//             if (status === "ScanComplete") {
//                 const timestamp = Date.now();
//                 const nuevaUrlImagen = `${API_BASE_URL}/descargar/espectro/${UID_USUARIO}/${currentMeasurement}?t=${timestamp}`;
                
//                 fetch(nuevaUrlImagen, {
//                     method: "GET",
//                     headers: { "ngrok-skip-browser-warning": "69420" }
//                 })
//                 .then(response => {
//                     if (!response.ok) throw new Error("Error en la descarga de la imagen");
//                     return response.blob(); 
//                 })
//                 .then(blob => {
//                     const imageObjectUrl = URL.createObjectURL(blob);
//                     setSpectroImage(imageObjectUrl);
//                 })
//                 .catch(error => console.error("Error al cargar la imagen:", error))
//                 .finally(() => {
//                     setLoading(false);
//                     setTimeout(() => set(statusRef, "x"), 500);
//                 });
//             }
//         });
//         return () => unsubscribe();
//     }, [currentMeasurement, BASE_PATH, UID_USUARIO, db]);

//     // ==================== EJECUTAR MEDICIÓN ====================
//     const handleRunSpectrometer = async () => {
//         if (integrationTime < 0.01 || integrationTime > 100) {
//             alert("Integration time must be between 0.01 and 100 ms.");
//             return;
//         }
//         setLoading(true);

//         try {
//             const newMeasurementId = `meas_${Date.now()}`;
//             setCurrentMeasurement(newMeasurementId);
//             setIsCurrentSaved(false); 
            
//             await set(ref(db, `${BASE_PATH}/currentMeasurementId`), newMeasurementId);
//             await set(ref(db, `${BASE_PATH}/measurements/${newMeasurementId}`), {
//                 integrationTime: integrationTime,
//                 timestamp: Date.now(),
//                 status: "pending",
//                 isSaved: false
//             });

//             await set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `s${integrationTime}`);
//         } catch (err) {
//             console.error("Error:", err);
//             setLoading(false);
//             alert("Database connection error.");
//         }
//     };

//     // ==================== GUARDAR MEDICIÓN ====================
//     const handleSaveData = async () => {
//         if (!currentMeasurement) return alert("Please run the spectrometer first.");
        
//         try {
//             await update(ref(db, `${BASE_PATH}/measurements/${currentMeasurement}`), {
//                 isSaved: true
//             });
//             setIsCurrentSaved(true); 
//         } catch (error) {
//             console.error("Error saving data:", error);
//             alert("Could not save data.");
//         }
//     };

//     // ==================== DESCARGAS Y MENÚ ====================
//     const handleDownloadTxt = () => {
//         if(!currentMeasurement) return alert("Please run the spectrometer first.");
//         const downloadUrl = `${API_BASE_URL}/descargar/datos/${UID_USUARIO}/${currentMeasurement}`;
//         window.open(downloadUrl, '_blank');
//     };

//     const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//     const handleMenuClose = () => setAnchorEl(null);

//     const handleCheckboxToggle = (name) => {
//         setImageSelection(prev => ({ ...prev, [name]: !prev[name] }));
//     };

//     const isAllSelected = imageSelection.completo && imageSelection.uv && imageSelection.visible && imageSelection.nir;
//     const handleSelectAll = (event) => {
//         const checked = event.target.checked;
//         setImageSelection({ completo: checked, uv: checked, visible: checked, nir: checked });
//     };

//     const handleDownloadImages = () => {
//         if(!currentMeasurement) {
//             alert("Please run the spectrometer first.");
//             return;
//         }

//         const haySeleccion = imageSelection.completo || imageSelection.uv || imageSelection.visible || imageSelection.nir;
//         if (!haySeleccion) {
//             alert("Please select at least one graph to download.");
//             return;
//         }

//         const queryParams = new URLSearchParams({
//             completo: imageSelection.completo,
//             uv: imageSelection.uv,
//             visible: imageSelection.visible,
//             nir: imageSelection.nir
//         }).toString();

//         const downloadUrl = `${API_BASE_URL}/descargar/graficas/${UID_USUARIO}/${currentMeasurement}?${queryParams}`;
//         window.open(downloadUrl, '_blank');
//         handleMenuClose();
//     };

//     const commonSliderSx = {
//         color: '#1976d2',
//         height: 5,
//         padding: '13px 0',
//         '& .MuiSlider-thumb': {
//             backgroundColor: '#fff',
//             border: '2px solid currentColor',
//             width: 18, 
//             height: 18,
//             '&:focus, &:hover, &.Mui-active': { boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)'},
//         },
//         '& .MuiSlider-markLabel': {
//             fontFamily: '"Poppins", sans-serif', 
//             fontSize: '0.85rem',
//             color: '#666',
//             marginTop: '5px',
//         },
//         '& .MuiSlider-track': { backgroundColor: '#1976d2' },
//         '& .MuiSlider-rail':  { backgroundColor: '#ccc' },
//     };

//     const pinkCheckboxSx = {
//         color: '#e91e63',
//         '&.Mui-checked': { color: '#e91e63' },
//     };

//     const tooltipFontSx = {
//         tooltip: { sx: { fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem', fontWeight: 400 } }
//     };

//     return (
//         <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//             <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', fontFamily: '"Poppins", sans-serif' }}>{MAIN_TITLE}</Typography>
//             <Typography variant="body1" sx={{ textAlign: 'left', mb: 4, color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>{DESCRIPTION}</Typography>

//             <Grid container spacing={4} alignItems="stretch">
//                 {/* COLUMNA IZQUIERDA: GRÁFICA */}
//                 <Grid item xs={12} md={7}>
//                     <Paper 
//                         sx={{ 
//                             height: '100%', 
//                             minHeight: '400px',
//                             p: 0, m: 0, overflow: 'hidden', borderRadius: '12px',
//                             display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
//                             backgroundColor: '#fff', border: '1px solid #e0e0e0' 
//                         }}
//                     >
//                         {/* CONDICIONAL: Mostramos el loader de historial, o la imagen */}
//                         {isFetchingHistory ? (
//                             <Box display="flex" flexDirection="column" alignItems="center">
//                                 <CircularProgress color="primary" />
//                                 <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
//                                     Loading history...
//                                 </Typography>
//                             </Box>
//                         ) : (
//                             <img
//                                 src={spectroImage}
//                                 alt="Radiation Spectrum"
//                                 style={{ width: "100%", height: "100%", display: "block", objectFit: "fill", margin: 0, padding: 0 }}
//                             />
//                         )}
//                     </Paper>
//                 </Grid>

//                 {/* COLUMNA DERECHA: CONTROLES */}
//                 <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    
//                     <Box sx={{ 
//                         mb: 2, 
//                         p: '15px 35px', 
//                         backgroundColor: 'rgba(255, 255, 255, 0.4)', 
//                         borderRadius: '12px', 
//                         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
//                         border: '1px solid #e0e0e0' 
//                     }}>
//                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                             <Typography variant="body1" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '1.1rem', color: '#444' }}>
//                                 Integration Time
//                             </Typography>
                            
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                 <TextField
//                                     value={integrationTime}
//                                     size="small"
//                                     onChange={(e) => setIntegrationTime(e.target.value === '' ? '' : Number(e.target.value))}
//                                     inputProps={{ step: 0.1, min: 0.01, max: 100, type: 'number' }}
//                                     sx={{ width: '80px', backgroundColor: '#fff', borderRadius: 1 }}
//                                     disabled={loading || isFetchingHistory} // <-- Bloqueado mientras carga
//                                 />
//                                 <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', color: '#666' }}>ms</Typography>
//                             </Box>
//                         </Box>
                        
//                         <Box sx={{ px: 1, mb: 1 }}>
//                             <Slider
//                                 value={typeof integrationTime === 'number' ? integrationTime : 0}
//                                 onChange={(e, val) => setIntegrationTime(val)}
//                                 min={0}
//                                 max={100}
//                                 step={0.1}
//                                 disabled={loading || isFetchingHistory} // <-- Bloqueado mientras carga
//                                 valueLabelDisplay="auto"
//                                 marks={[{value:0, label:'0'}, {value:20, label:'20'}, {value:40, label:'40'}, {value:60, label:'60'}, {value:80, label:'80'}, {value:100, label:'100'}]}
//                                 sx={commonSliderSx}
//                             />
//                         </Box>
//                     </Box>

//                     <Button
//                         variant="contained"
//                         color="primary"
//                         size="large"
//                         fullWidth
//                         onClick={handleRunSpectrometer}
//                         disabled={loading || isFetchingHistory} // <-- Bloqueado mientras carga
//                         startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
//                         sx={{ mt: 1, mb: 4, py: 1.5, fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}
//                     >
//                         {loading ? "RUNNING..." : "RUN SPECTROMETER"}
//                     </Button>

//                     <Box sx={{ mt: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Button
//                             variant={!isCurrentSaved ? "contained" : "outlined"}
//                             color="primary"
//                             size="medium"
//                             onClick={handleSaveData}
//                             disabled={!currentMeasurement || isFetchingHistory}
//                             startIcon={!isCurrentSaved ? <Save /> : <CloudDone />}
//                             sx={{ py: 0.8, px: 2, fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}
//                         >
//                             {!isCurrentSaved ? "SAVE DATA" : "SAVED"}
//                         </Button>

//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                             <Tooltip title="Export raw values (Wavelength vs Intensity) in .txt format." arrow placement="top" slotProps={tooltipFontSx}>
//                                 <span>
//                                     <Button 
//                                         variant="outlined" 
//                                         size="small" 
//                                         color="primary" 
//                                         onClick={handleDownloadTxt}
//                                         disabled={!currentMeasurement || isFetchingHistory}
//                                         startIcon={<Download fontSize="small" />}
//                                     >
//                                         TXT
//                                     </Button>
//                                 </span>
//                             </Tooltip>
                            
//                             <Tooltip title="Select and download spectrum graphs." arrow placement="top" slotProps={tooltipFontSx}>
//                                 <span>
//                                     <Button 
//                                         variant="outlined" 
//                                         size="small" 
//                                         color="primary" 
//                                         onClick={handleMenuOpen}
//                                         disabled={!currentMeasurement || isFetchingHistory}
//                                         startIcon={<CropFree fontSize="small" />}
//                                         endIcon={<ArrowDropDown fontSize="small" sx={{ ml: -0.5 }}/>}
//                                     >
//                                         IMG
//                                     </Button>
//                                 </span>
//                             </Tooltip>
//                         </Box>
//                     </Box>
//                 </Grid>
//             </Grid>

//             {/* MENÚ FLOTANTE PARA IMÁGENES */}
//             <Menu 
//                 anchorEl={anchorEl} 
//                 open={Boolean(anchorEl)} 
//                 onClose={handleMenuClose} 
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                 transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//                 PaperProps={{ sx: { borderRadius: '12px', mt: 1, minWidth: '220px', p: 1 } }}
//             >
//                 <Box sx={{ px: 2, py: 1, outline: 'none' }}>
//                     <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}>
//                         Select graphs to export
//                     </Typography>
//                     <FormGroup>
//                         <FormControlLabel 
//                             control={<Checkbox checked={isAllSelected} onChange={handleSelectAll} size="small" sx={pinkCheckboxSx} />} 
//                             label={<Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}>All Graphs</Typography>} 
//                         />
//                         <Divider sx={{ my: 0.5 }} />
//                         <FormControlLabel 
//                             control={<Checkbox checked={imageSelection.completo} onChange={() => handleCheckboxToggle('completo')} size="small" sx={pinkCheckboxSx} />} 
//                             label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>Complete Spectrum</Typography>} 
//                         />
//                         <FormControlLabel 
//                             control={<Checkbox checked={imageSelection.uv} onChange={() => handleCheckboxToggle('uv')} size="small" sx={pinkCheckboxSx} />} 
//                             label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>UV Spectrum</Typography>} 
//                         />
//                         <FormControlLabel 
//                             control={<Checkbox checked={imageSelection.visible} onChange={() => handleCheckboxToggle('visible')} size="small" sx={pinkCheckboxSx} />} 
//                             label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>Visible Spectrum</Typography>} 
//                         />
//                         <FormControlLabel 
//                             control={<Checkbox checked={imageSelection.nir} onChange={() => handleCheckboxToggle('nir')} size="small" sx={pinkCheckboxSx} />} 
//                             label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>NIR Spectrum</Typography>} 
//                         />
//                     </FormGroup>
//                     <Button 
//                         variant="contained" 
//                         color="primary" 
//                         size="small" 
//                         fullWidth 
//                         sx={{ mt: 2, fontFamily: '"Poppins", sans-serif' }} 
//                         onClick={handleDownloadImages} 
//                         startIcon={<Download fontSize="small"/>}
//                     >
//                         Download
//                     </Button>
//                 </Box>
//             </Menu>

//             {/* SECCIÓN EXPERIMENTO 2 */}
//             <Box mt={6} mb={4}>
//                 <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}>
//                     Experiment 2
//                 </Typography>
//                 <Divider sx={{ mb: 3 }} />
                
//                 <Grid container spacing={3}>
//                     <Grid item xs={12} md={6}>
//                         <img src={placeholderCamara} alt="Panel Setup 1" style={{ width: '100%', borderRadius: '12px', opacity: 0.8 }} />
//                     </Grid>
//                     <Grid item xs={12} md={6}>
//                         <img src={placeholderCamara} alt="Panel Setup 2" style={{ width: '100%', borderRadius: '12px', opacity: 0.8 }} />
//                     </Grid>
//                 </Grid>
//             </Box>

//             {/* BOTÓN VOLVER */}
//             <Box mt={4} display="flex" justifyContent="center">
//                 <Button variant="outlined" color="secondary" onClick={() => navigate('/experiments/experimentChooser')}>
//                     {BACK_BUTTON}
//                 </Button>
//             </Box>
//         </Box>
//     );
// };

// export default Subsistema4;






import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Paper, Typography, Grid, TextField, CircularProgress, 
    FormGroup, FormControlLabel, Checkbox, Tooltip, Menu, Divider, Slider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux"; 

// Firebase
import { getDatabase, ref, set, onValue, update, get, onDisconnect } from "firebase/database";
import app from "../../firebaseConfig.js";

// Components
import Button from '../../components/Elements/Button.jsx';

// Importación de imágenes e iconos
import graficoSpectroscopia from '../../assets/img/experimentos/espectro_completo.png';
import placeholderCamara from '../../assets/img/experimentos/camaraPanelesSolares.png';
import { Download, PlayArrow, CropFree, ArrowDropDown, Save, CloudDone, Refresh } from '@mui/icons-material';

// Strings y Estilos
import { PAGE_TITLES } from '../../assets/Strings/Experiments/Subsistema4Strings.jsx';
import '../../assets/css/Elements/PaperStyles.css';


// ==========================================
// 🧠 INTERRUPTOR DE ENTORNO
// Ponlo en 'true' ÚNICAMENTE en la PC física del laboratorio.
// Ponlo en 'false' cuando estés programando/probando desde tu casa.
const ESTOY_EN_EL_LAB = true;

const API_BASE_URL = ESTOY_EN_EL_LAB 
    ? "http://127.0.0.1:8000" // Ruta directa y ultrarrápida (Sin Ngrok)
    : "https://tactilely-furrowless-liane.ngrok-free.dev"; // Túnel para acceder desde tu casa
// ==========================================




// ==========================================
// ozzyjames11: comentado momentaneamente
// const API_BASE_URL = "https://tactilely-furrowless-liane.ngrok-free.dev"; 
// ==========================================

const Subsistema4 = () => {
    const navigate = useNavigate();
    const db = getDatabase(app);
    const user = useSelector((state) => state.auth.user);
    
    // ==================== ESTADOS ====================
    const [integrationTime, setIntegrationTime] = useState(20);
    const [loading, setLoading] = useState(false);
    const [spectroImage, setSpectroImage] = useState(graficoSpectroscopia);
    const [currentMeasurement, setCurrentMeasurement] = useState(null);
    const [isCurrentSaved, setIsCurrentSaved] = useState(false); 
    
    // NUEVO ESTADO: Para evitar el "salto" de la imagen inicial
    const [isFetchingHistory, setIsFetchingHistory] = useState(true); 

    // ==== NUEVOS ESTADOS PARA LOS FILTROS ====
    const [sensorData, setSensorData] = useState(null);
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Estados para el Menú Desplegable de Imágenes
    const [anchorEl, setAnchorEl] = useState(null);
    const [imageSelection, setImageSelection] = useState({
        completo: true,
        uv: false,
        visible: false,
        nir: false
    });

    const { MAIN_TITLE, DESCRIPTION, BACK_BUTTON } = PAGE_TITLES;

    // ==================== REFERENCIAS PARA LOGS DE SALIDA ====================
    const currentMeasurementRef = useRef(currentMeasurement);
    const integrationTimeRef = useRef(integrationTime);

    useEffect(() => {
        currentMeasurementRef.current = currentMeasurement;
        integrationTimeRef.current = integrationTime;
    }, [currentMeasurement, integrationTime]);
    // =========================================================================

    // const UID_USUARIO = user?.uid || "invitado";
    // const BASE_PATH = `users/${UID_USUARIO}/Exp4`;
    const UID_USUARIO = user?.uid || "invitado";
    const BASE_PATH = `users/${UID_USUARIO}/Exp4`;

    // ==================== LIMPIEZA DE VARIABLES ATASCADAS ====================
    // Este bloque garantiza que el sistema nunca empiece "atorado" si hubo un corte abrupto
    useEffect(() => {
        if (!user || UID_USUARIO === "invitado") return;

        const commSpectroRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
        const commFiltersRef = ref(db, `${BASE_PATH}/communicationFilters/FrontToBack`);
        const statusFiltersRef = ref(db, `${BASE_PATH}/communicationFilters/BackToFront`);

        // 1. Seguro de vida de Google: Si se cierra la pestaña a la fuerza, poner todo en "x"
        onDisconnect(commSpectroRef).set("x");
        onDisconnect(commFiltersRef).set("x");
        onDisconnect(statusFiltersRef).set("x");

        // 2. Limpieza inmediata al entrar a la página (Por si quedó sucia del pasado)
        console.log("🧹 [Subsistema4] Limpiando variables de comunicación...");
        set(commSpectroRef, "x").catch(() => {});
        set(commFiltersRef, "x").catch(() => {});
        set(statusFiltersRef, "x").catch(() => {});

        // 3. Limpieza al desmontar (Si navega por el Header a "Home" o "Experiment")
        return () => {
            console.log("👋 [Subsistema4] Saliendo... Asegurando variables en 'x'.");
            set(commSpectroRef, "x").catch(() => {});
            set(commFiltersRef, "x").catch(() => {});
            set(statusFiltersRef, "x").catch(() => {});
            
            // Cancelar el onDisconnect para que no afecte si vuelve a entrar
            onDisconnect(commSpectroRef).cancel();
            onDisconnect(commFiltersRef).cancel();
            onDisconnect(statusFiltersRef).cancel();
        };
    }, [user, UID_USUARIO, BASE_PATH, db]);

    // ==================== SEGURIDAD Y GUARDIA DE NAVEGACIÓN ====================
    // 1. Variable global para saber si hay peligro (Hay una medición actual pero no está guardada)
    useEffect(() => {
        const hayDatosSinGuardar = currentMeasurement && !isCurrentSaved;
        window.datosEnPeligro = hayDatosSinGuardar;

        return () => {
            window.datosEnPeligro = false;
        };
    }, [currentMeasurement, isCurrentSaved]);

    // 2. Proteger F5 y Cierre de Pestaña (beforeunload)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (window.datosEnPeligro) {
                console.log("⚠️ Intento de recarga detectado. Existen datos sin guardar.");
                e.preventDefault();
                e.returnValue = ""; 
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    // 3. Proteger Flecha Atrás del Navegador (popstate)
    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);

        const handlePopState = () => {
            if (window.datosEnPeligro) {
                const confirmar = window.confirm(
                    "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
                );
                if (!confirmar) {
                    window.history.pushState(null, null, window.location.pathname);
                    return;
                }else {
                    console.log(`[Spectrometer] ⚠️ Saliendo sin guardar la medida: ${currentMeasurementRef.current} (Tiempo: ${integrationTimeRef.current}ms). Se mantiene como isSaved: false.`);
                }
            }
            window.datosEnPeligro = false;
            setTimeout(() => navigate("/experiments/experimentChooser", { replace: true }), 10);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate]);

    // 4. Función segura para el botón GO BACK
    const handleBackSafe = () => {
        if (window.datosEnPeligro) {
            const confirmar = window.confirm(
                "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
            );
            if (!confirmar) return;
            console.log(`[Spectrometer] ⚠️ Saliendo sin guardar la medida: ${currentMeasurementRef.current} (Tiempo: ${integrationTimeRef.current}ms). Se mantiene como isSaved: false.`);
        }
        window.datosEnPeligro = false;
        navigate("/experiments/experimentChooser");
    };
    

    // ==================== RECUPERAR ÚLTIMA MEDICIÓN GUARDADA ====================
    useEffect(() => {
        const fetchLastSavedMeasurement = async () => {
            try {
                const measRef = ref(db, `${BASE_PATH}/measurements`);
                const snapshot = await get(measRef);
                
                if (snapshot.exists()) {
                    const measurements = snapshot.val();
                    let latestSavedId = null;
                    let latestSavedData = null;
                    let maxTime = 0;

                    Object.entries(measurements).forEach(([id, data]) => {
                        if (data.isSaved && data.timestamp > maxTime) {
                            maxTime = data.timestamp;
                            latestSavedId = id;
                            latestSavedData = data;
                        }
                    });

                    if (latestSavedId && latestSavedData) {
                        console.log(`[Spectrometer] 📂 Dato histórico cargado. ID: ${latestSavedId}`);
                        setCurrentMeasurement(latestSavedId);
                        setIntegrationTime(latestSavedData.integrationTime);
                        setIsCurrentSaved(true);

                        const timestamp = Date.now();
                        const savedImageUrl = `${API_BASE_URL}/descargar/espectro/${UID_USUARIO}/${latestSavedId}?t=${timestamp}`;
                        
                        // Esperamos a descargar la imagen correcta antes de mostrarla
                        const response = await fetch(savedImageUrl, {
                            method: "GET",
                            headers: { "ngrok-skip-browser-warning": "69420" }
                        });

                        if (response.ok) {
                            const blob = await response.blob();
                            setSpectroImage(URL.createObjectURL(blob));
                        }
                    }
                }
            } catch (error) {
                console.error("Error al buscar el historial de mediciones:", error);
            } finally {
                // Ya sea que haya encontrado una imagen guardada o no, apagamos el estado de carga
                setIsFetchingHistory(false);
            }
        };

        fetchLastSavedMeasurement();
    }, [UID_USUARIO, BASE_PATH, db]);

    // ==================== ESCUCHAR RESPUESTAS (NUEVAS MEDICIONES) ====================
    useEffect(() => {
        if (!currentMeasurement) return; 

        const statusRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
        
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const status = snapshot.val();
            if (status === "ScanComplete") {
                const timestamp = Date.now();
                const nuevaUrlImagen = `${API_BASE_URL}/descargar/espectro/${UID_USUARIO}/${currentMeasurement}?t=${timestamp}`;
                
                fetch(nuevaUrlImagen, {
                    method: "GET",
                    headers: { "ngrok-skip-browser-warning": "69420" }
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error en la descarga de la imagen");
                    return response.blob(); 
                })
                .then(blob => {
                    const imageObjectUrl = URL.createObjectURL(blob);
                    setSpectroImage(imageObjectUrl);
                })
                .catch(error => console.error("Error al cargar la imagen:", error))
                .finally(() => {
                    setLoading(false);
                    setTimeout(() => set(statusRef, "x"), 500);
                });
            }
        });
        return () => unsubscribe();
    }, [currentMeasurement, BASE_PATH, UID_USUARIO, db]);

    // ==================== EJECUTAR MEDICIÓN ====================
    const handleRunSpectrometer = async () => {
        if (integrationTime < 0.01 || integrationTime > 100) {
            alert("Integration time must be between 0.01 and 100 ms.");
            return;
        }
        setLoading(true);

        try {
            const newMeasurementId = `meas_${Date.now()}`;
            console.log(`[Spectrometer] 🚀 Nueva medida iniciada. ID: ${newMeasurementId} | Tiempo de Integración: ${integrationTime}ms`);
            setCurrentMeasurement(newMeasurementId);
            setIsCurrentSaved(false); 
            
            await set(ref(db, `${BASE_PATH}/currentMeasurementId`), newMeasurementId);
            await set(ref(db, `${BASE_PATH}/measurements/${newMeasurementId}`), {
                integrationTime: integrationTime,
                timestamp: Date.now(),
                status: "pending",
                isSaved: false
            });

            await set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `s${integrationTime}`);
        } catch (err) {
            console.error("Error:", err);
            setLoading(false);
            alert("Database connection error.");
        }
    };

    // ==================== GUARDAR MEDICIÓN ====================
    const handleSaveData = async () => {
        if (!currentMeasurement) return alert("Please run the spectrometer first.");
        
        try {
            await update(ref(db, `${BASE_PATH}/measurements/${currentMeasurement}`), {
                isSaved: true
            });
            setIsCurrentSaved(true); 
            console.log(`[Spectrometer] 💾 Medida guardada con éxito. ID: ${currentMeasurement}`);
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Could not save data.");
        }
    };

    // ==================== LÓGICA DE FILTROS (NUEVO) ====================
    // 1. Al cargar la página, buscar si hay datos viejos guardados
    useEffect(() => {
        const sensorRefId = ref(db, `${BASE_PATH}/currentSensorMeasurementId`);
        get(sensorRefId).then((snapshot) => {
            if (snapshot.exists()) {
                const lastSensId = snapshot.val();
                console.log(`[Filters] 📂 Dato de sensores histórico cargado. ID: ${lastSensId}`);
                get(ref(db, `${BASE_PATH}/environmentData/${lastSensId}`)).then((dataSnap) => {
                    if (dataSnap.exists()) setSensorData(dataSnap.val());
                });
            }
        }).catch(err => console.error(err));
    }, [BASE_PATH, db]);

    // 2. Escuchar cuando el Backend termine de leer los sensores
    useEffect(() => {
        const statusFiltersRef = ref(db, `${BASE_PATH}/communicationFilters/BackToFront`);
        
        const unsubscribe = onValue(statusFiltersRef, async (snapshot) => {
            if (snapshot.val() === "SensorsComplete") {
                const idSnap = await get(ref(db, `${BASE_PATH}/currentSensorMeasurementId`));
                if (idSnap.exists()) {
                    const newSensId = idSnap.val();
                    const dataSnap = await get(ref(db, `${BASE_PATH}/environmentData/${newSensId}`));
                    if (dataSnap.exists()) {
                        console.log(`[Filters] ✅ Nuevos datos de sensores recibidos. ID: ${newSensId}`);
                        setSensorData(dataSnap.val());
                    }
                }
                setLoadingFilters(false);
                set(statusFiltersRef, "x"); // Limpiar la bandera
            }
        });

        return () => unsubscribe();
    }, [BASE_PATH, db]);

    // 3. Función del botón REFRESH
    const handleRefreshFilters = () => {
        console.log("[Filters] 🔄 Botón REFRESH presionado. Solicitando nueva lectura al hardware...");
        setLoadingFilters(true);
        set(ref(db, `${BASE_PATH}/communicationFilters/FrontToBack`), "read_sensors")
            .catch(err => {
                console.error(err);
                setLoadingFilters(false);
            });
    };

    // ==================== DESCARGAS Y MENÚ ====================
    const handleDownloadTxt = () => {
        if(!currentMeasurement) return alert("Please run the spectrometer first.");
        const downloadUrl = `${API_BASE_URL}/descargar/datos/${UID_USUARIO}/${currentMeasurement}`;
        window.open(downloadUrl, '_blank');
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleCheckboxToggle = (name) => {
        setImageSelection(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isAllSelected = imageSelection.completo && imageSelection.uv && imageSelection.visible && imageSelection.nir;
    const handleSelectAll = (event) => {
        const checked = event.target.checked;
        setImageSelection({ completo: checked, uv: checked, visible: checked, nir: checked });
    };

    const handleDownloadImages = () => {
        if(!currentMeasurement) {
            alert("Please run the spectrometer first.");
            return;
        }

        const haySeleccion = imageSelection.completo || imageSelection.uv || imageSelection.visible || imageSelection.nir;
        if (!haySeleccion) {
            alert("Please select at least one graph to download.");
            return;
        }

        const queryParams = new URLSearchParams({
            completo: imageSelection.completo,
            uv: imageSelection.uv,
            visible: imageSelection.visible,
            nir: imageSelection.nir
        }).toString();

        const downloadUrl = `${API_BASE_URL}/descargar/graficas/${UID_USUARIO}/${currentMeasurement}?${queryParams}`;
        window.open(downloadUrl, '_blank');
        handleMenuClose();
    };

    const commonSliderSx = {
        color: '#1976d2',
        height: 5,
        padding: '13px 0',
        '& .MuiSlider-thumb': {
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            width: 18, 
            height: 18,
            '&:focus, &:hover, &.Mui-active': { boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)'},
        },
        '& .MuiSlider-markLabel': {
            fontFamily: '"Poppins", sans-serif', 
            fontSize: '0.85rem',
            color: '#666',
            marginTop: '5px',
        },
        '& .MuiSlider-track': { backgroundColor: '#1976d2' },
        '& .MuiSlider-rail':  { backgroundColor: '#ccc' },
    };

    const pinkCheckboxSx = {
        color: '#e91e63',
        '&.Mui-checked': { color: '#e91e63' },
    };

    const tooltipFontSx = {
        tooltip: { sx: { fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem', fontWeight: 400 } }
    };

    // ==================== PANTALLA DE CARGA ====================
    if (!user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', fontFamily: '"Poppins", sans-serif' }}>{MAIN_TITLE}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 4, color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>{DESCRIPTION}</Typography>

            <Grid container spacing={4} alignItems="stretch">
                {/* COLUMNA IZQUIERDA: GRÁFICA */}
                <Grid item xs={12} md={7}>
                    <Paper 
                        sx={{ 
                            height: '100%', 
                            minHeight: '400px',
                            p: 0, m: 0, overflow: 'hidden', borderRadius: '12px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                            backgroundColor: '#fff', border: '1px solid #e0e0e0' 
                        }}
                    >
                        {/* CONDICIONAL: Mostramos el loader de historial, o la imagen */}
                        {isFetchingHistory ? (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <CircularProgress color="primary" />
                                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
                                    Loading history...
                                </Typography>
                            </Box>
                        ) : (
                            <img
                                src={spectroImage}
                                alt="Radiation Spectrum"
                                style={{ width: "100%", height: "100%", display: "block", objectFit: "fill", margin: 0, padding: 0 }}
                            />
                        )}
                    </Paper>
                </Grid>

                {/* COLUMNA DERECHA: CONTROLES */}
                <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    
                    <Box sx={{ 
                        mb: 2, 
                        p: '15px 35px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                        borderRadius: '12px', 
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
                        border: '1px solid #e0e0e0' 
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="body1" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '1.1rem', color: '#444' }}>
                                Integration Time
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    value={integrationTime}
                                    size="small"
                                    onChange={(e) => setIntegrationTime(e.target.value === '' ? '' : Number(e.target.value))}
                                    inputProps={{ step: 0.1, min: 0.01, max: 100, type: 'number' }}
                                    sx={{ width: '80px', backgroundColor: '#fff', borderRadius: 1 }}
                                    disabled={loading || isFetchingHistory} // <-- Bloqueado mientras carga
                                />
                                <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', color: '#666' }}>ms</Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ px: 1, mb: 1 }}>
                            <Slider
                                value={typeof integrationTime === 'number' ? integrationTime : 0}
                                onChange={(e, val) => setIntegrationTime(val)}
                                min={0}
                                max={100}
                                step={0.1}
                                disabled={loading || isFetchingHistory} // <-- Bloqueado mientras carga
                                valueLabelDisplay="auto"
                                marks={[{value:0, label:'0'}, {value:20, label:'20'}, {value:40, label:'40'}, {value:60, label:'60'}, {value:80, label:'80'}, {value:100, label:'100'}]}
                                sx={commonSliderSx}
                            />
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleRunSpectrometer}
                        disabled={loading || isFetchingHistory} // <-- Bloqueado mientras carga
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                        sx={{ mt: 1, mb: 4, py: 1.5, fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}
                    >
                        {loading ? "RUNNING..." : "RUN SPECTROMETER"}
                    </Button>

                    <Box sx={{ mt: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            variant={!isCurrentSaved ? "contained" : "outlined"}
                            color="primary"
                            size="medium"
                            onClick={handleSaveData}
                            disabled={!currentMeasurement || isFetchingHistory}
                            startIcon={!isCurrentSaved ? <Save /> : <CloudDone />}
                            sx={{ py: 0.8, px: 2, fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}
                        >
                            {!isCurrentSaved ? "SAVE DATA" : "SAVED"}
                        </Button>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Export raw values (Wavelength vs Intensity) in .txt format." arrow placement="top" slotProps={tooltipFontSx}>
                                <span>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        color="primary" 
                                        onClick={handleDownloadTxt}
                                        disabled={!currentMeasurement || isFetchingHistory}
                                        startIcon={<Download fontSize="small" />}
                                    >
                                        TXT
                                    </Button>
                                </span>
                            </Tooltip>
                            
                            <Tooltip title="Select and download spectrum graphs." arrow placement="top" slotProps={tooltipFontSx}>
                                <span>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        color="primary" 
                                        onClick={handleMenuOpen}
                                        disabled={!currentMeasurement || isFetchingHistory}
                                        startIcon={<CropFree fontSize="small" />}
                                        endIcon={<ArrowDropDown fontSize="small" sx={{ ml: -0.5 }}/>}
                                    >
                                        IMG
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* MENÚ FLOTANTE PARA IMÁGENES */}
            <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={handleMenuClose} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { borderRadius: '12px', mt: 1, minWidth: '220px', p: 1 } }}
            >
                <Box sx={{ px: 2, py: 1, outline: 'none' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}>
                        Select graphs to export
                    </Typography>
                    <FormGroup>
                        <FormControlLabel 
                            control={<Checkbox checked={isAllSelected} onChange={handleSelectAll} size="small" sx={pinkCheckboxSx} />} 
                            label={<Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: '"Poppins", sans-serif' }}>All Graphs</Typography>} 
                        />
                        <Divider sx={{ my: 0.5 }} />
                        <FormControlLabel 
                            control={<Checkbox checked={imageSelection.completo} onChange={() => handleCheckboxToggle('completo')} size="small" sx={pinkCheckboxSx} />} 
                            label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>Complete Spectrum</Typography>} 
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={imageSelection.uv} onChange={() => handleCheckboxToggle('uv')} size="small" sx={pinkCheckboxSx} />} 
                            label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>UV Spectrum</Typography>} 
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={imageSelection.visible} onChange={() => handleCheckboxToggle('visible')} size="small" sx={pinkCheckboxSx} />} 
                            label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>Visible Spectrum</Typography>} 
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={imageSelection.nir} onChange={() => handleCheckboxToggle('nir')} size="small" sx={pinkCheckboxSx} />} 
                            label={<Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>NIR Spectrum</Typography>} 
                        />
                    </FormGroup>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        fullWidth 
                        sx={{ mt: 2, fontFamily: '"Poppins", sans-serif' }} 
                        onClick={handleDownloadImages} 
                        startIcon={<Download fontSize="small"/>}
                    >
                        Download
                    </Button>
                </Box>
            </Menu>

            {/* ⚡ SECCIÓN FILTROS DE LUZ */}
            <Box mt={8} mb={4}>
                {/* Contenedor Flex para alinear Textos a la izquierda y el Botón a la derecha */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    
                    {/* Contenedor interno solo para Título y Descripción */}
                    <Box textAlign="left">
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', fontFamily: '"Poppins", sans-serif' }}>
                            Light Filters Efficiency
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
                            Measuring energy generation by applying light filters to solar panels.
                        </Typography>
                    </Box>

                    {/* Botón alineado a la derecha */}
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleRefreshFilters}
                        disabled={loadingFilters}
                        startIcon={loadingFilters ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                        sx={{ fontWeight: 'bold', fontFamily: '"Poppins", sans-serif', mt: 1 }}
                    >
                        {loadingFilters ? "READING..." : "REFRESH"}
                    </Button>

                </Box>
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={2}>
                    {/* ... (aquí sigue tu código del map para los 4 paneles) ... */}
                    {[
                        { label: 'Reference', key: 'referencia', color: '#9e9e9e' },
                        { label: 'Yellow Filter', key: 'filtroAmarillo', color: '#fbc02d' },
                        { label: 'Blue Filter', key: 'filtroAzul', color: '#1976d2' },
                        { label: 'Red Filter', key: 'filtroRojo', color: '#d32f2f' }
                    ].map((panel) => (
                        <Grid item xs={12} sm={6} md={3} key={panel.key}>
                            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '15px', border: '1px solid #eee' }}>
                                {/* Imagen Vertical del Panel */}
                                <img 
                                    src={placeholderCamara} 
                                    alt={panel.label}
                                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                                />
                                <Typography variant="subtitle2" color="text.secondary">{panel.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: panel.color, my: 1 }}>
                                    {sensorData ? `${sensorData[panel.key]}%` : "0.0%"}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled' }}>
                                    Relative Power
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* BOTÓN VOLVER */}
            <Box mt={4} display="flex" justifyContent="center">
                <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
                    {BACK_BUTTON}
                </Button>
            </Box>
        </Box>
    );
};

export default Subsistema4;