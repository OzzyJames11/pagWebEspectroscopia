import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

import imagen_subsistema1 from "../../assets/img/experimentos/imagen_subsistema1.png";
import imagen_subsistema1V2 from "../../assets/img/experimentos/imagen_subsistema1V2.png";

import Hls from 'hls.js';

// Importación de componentes
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Importación de constantes
import {
  SUBSISTEMA3_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";

// Importación de estilos
import "../../assets/css/Elements/PaperStyles.css";

//Importación envío de datos - COMENTADO PARA MIGRACIÓN
// import {
//   getDatabase,
//   ref,
//   set,
//   get,
//   onValue,
//   onChildAdded,
//   remove,
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

// Importar el componente de gráficos
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema3 = () => {
  const navigate = useNavigate();
  const {
    MAIN_TITLE,
    DESCRIPTION,
    SAVE_BUTTON,
    DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH,
    BACK_BUTTON,
    CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE,
    SUBSYSTEM_STATUS_TITLE,
    CURRENT_STATUS_LABEL,
    CLEAN_BUTTON,
  } = PAGE_TITLES;

  //Estados para salir de pagina

  //Estados para video 
  const videoRef = useRef(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [streamError, setStreamError] = useState('');
  

  //Estados para gráficos
  const [contadorValue, setContadorValue] = useState("");
  const [corrienteData, setCorrienteData] = useState([]);
  const [voltajeData, setVoltajeData] = useState([]);
  const [contadorLabels, setContadorLabels] = useState([]);
  //Corriente_1
  const [corrienteValue_1, setcorrienteValue_1] = useState(false);
  //Voltaje_1
  const [voltajeValue_1, setvoltajeValue_1] = useState(false);

  //Deslizador de ángulos
  const [isSliderDisabled_1, setIsSliderDisabled_1] = useState(false); //Para activar y desactivar el slider
  const [isSliderDisabled_Zenith, setIsSliderDisabled_Zenith] = useState(false); //Para activar y desactivar el slider
  const [angulo, setAngulo] = useState(5);
  const [anguloZenith, setAnguloZenith] = useState(5); //Para el de dos ejes

  const [actualPanelAngle, setactualPanelAngle] = useState(5);
  const [actualPanelAngleZenith, setactualPanelAngleZenith] = useState(5);
  const [isMoveButtonDisabled_1, setIsMoveButtonDisabled_1] = useState(false); // Estado para habilitar/deshabilitar el boton
  const [isTextDisabled_1, setIsTextDisabled_1] = useState(false); // Estado para habilitar/deshabilitar el mensaje de movimiento
  const [messageToSend, setMessageToSend] = useState(``); // Estado para el mensaje que se enviará

  //Lectura de datos desde Firebase - COMENTADO PARA MIGRACIÓN
  // const db = getDatabase(app);

  useEffect(() => {
    //Enviar mensaje de inicio a los arduinos - COMENTADO PARA MIGRACIÓN
    // change5sec();
    //hacerCambio();
  }, []);

  // 🔹 Obtener ángulo del panel una sola vez al montar el componente - COMENTADO PARA MIGRACIÓN
  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const dbRef = ref(db, "Exp3/FrontToBack");
    //     const snapshot = await get(dbRef);
    //     if (snapshot.exists()) {
    //       setactualPanelAngle(snapshot.val() || "");
    //     } else {
    //       console.warn("No se encontraron datos para 'anguloObjetivo'");
    //     }
    //   } catch (error) {
    //     console.error("Error al obtener datos de Firebase:", error);
    //   }
    // };

    // fetchData();
  }, []); // ✅ Se ejecuta solo al montar el componente

  // 🔹 Obtener inputs una sola vez al montar el componente - COMENTADO PARA MIGRACIÓN
  useEffect(() => {
    // const fetchDataInputs = async () => {
    //   try {
    //     const dbRef = ref(db, "Lectures");
    //     const snapshot = await get(dbRef);
    //     if (snapshot.exists()) {
    //       setInputs(snapshot.val() || "");
    //     } else {
    //       console.warn("No se encontraron datos para 'Lectures'");
    //     }
    //   } catch (error) {
    //     console.error("Error al obtener datos de Firebase:", error);
    //   }
    // };

    // fetchDataInputs();
  }, []); // ✅ Se ejecuta solo una vez

  // 🔹 Escuchar cambios en Firebase en tiempo real - COMENTADO PARA MIGRACIÓN
  useEffect(() => {
    // const dbRef = ref(db, "Exp3/data"); // Escucha todo el nodo "Lectures"

    // const unsubscribe = onChildAdded(dbRef, (snapshot) => {
    //   console.log(
    //     `Nuevo valor agregado - Clave: ${snapshot.key}`,
    //     snapshot.val()
    //   );
    //   const newData = snapshot.val();
    //   setCorrienteData((prev) => [...prev.slice(-20), newData.data1.current]); // Solo los últimos 20 valores
    //   setVoltajeData((prev) => [...prev.slice(-20), newData.data1.voltage]);
    //   setContadorLabels((prev) => [...prev.slice(-20), newData.data1.cont]);
    //   setvoltajeValue_1(newData.data1.voltage);
    //   setcorrienteValue_1(newData.data1.current);
    // });
    
    // return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, []); // ✅ Se ejecuta al montar el componente

  //Lectura de BackToFront - COMENTADO PARA MIGRACIÓN
  useEffect(() => {
    // const dbRef = ref(db, "Exp3/BackToFront");

    // const unsubscribe = onValue(dbRef, (snapshot) => {
    //   if (snapshot.exists()) {
    //     const mensaje = snapshot.val();
    //     console.log("Mensaje recibidooo:", mensaje);
    //     setIsSliderDisabled_1(false);
    //     setIsMoveButtonDisabled_1(false);
    //     setIsTextDisabled_1(false);
    //     setIsGuardarLecturaDisabled_1(false);
    //     change5sec(); //enviar mensaje de mover de nuevo
    //     hacerCambio();
    //     setEstado('dirty');
    //   }
    // });
    // return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, []); // ✅ Se ejecuta al montar el componente

  // Estado del subsistema
  const [estado, setEstado] = useState("dirty"); // Por defecto, el subsistema está sucio

  // Estado para los datos de la tabla
  const [datos, setDatos] = useState([]);
  const [isGuardarLecturaDisabled_1, setIsGuardarLecturaDisabled_1] =
      useState(false); // Estado para habilitar/deshabilitar el boton de guardar datos
  

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);

    const initVideoStream = async () => {
      try {
          // Intenta conexión WebRTC primero
          const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });

          pc.ontrack = (event) => {
              if (videoRef.current && !videoRef.current.srcObject) {
                  videoRef.current.srcObject = event.streams[0];
                  setIsStreamActive(true);
                  setStreamError('');
              }
          };

          const streamId = "mystream";
          const response = await fetch(
              `http://172.30.43.173:5080/WebRTCApp/rest/v2/broadcasts/${streamId}/websocket`,
              {
                  headers: {
                      'Content-Type': 'application/json'
                  }
              }
          );

          if (!response.ok) {
              throw new Error('No se pudo conectar al servidor de streaming');
          }

          const offer = await response.json();
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await fetch(
              `http://172.30.43.173:5080/WebRTCApp/rest/v2/broadcasts/${streamId}/answer`,
              {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(answer)
              }
          );

          // Fallback a HLS si WebRTC falla después de 5 segundos
          const fallbackTimer = setTimeout(() => {
              if (!isStreamActive) {
                  initHLSFallback();
              }
          }, 5000);

          return () => clearTimeout(fallbackTimer);

      } catch (error) {
          console.error("Error WebRTC:", error);
          initHLSFallback();
      }
  };

  const initHLSFallback = () => {
      if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource('http://172.30.43.173:5080/WebRTCApp/streams/mystream.m3u8');
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsStreamActive(true);
              setStreamError('');
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                  setStreamError('Error cargando la transmisión HLS');
              }
          });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Soporte nativo para Safari
          videoRef.current.src = 'http://172.30.43.173:5080/WebRTCApp/streams/mystream.m3u8';
          videoRef.current.addEventListener('loadedmetadata', () => {
              setIsStreamActive(true);
              setStreamError('');
          });
      } else {
          setStreamError('Tu navegador no soporta la reproducción de video en vivo');
      }
  };

  initVideoStream();

  return () => {
      if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
  };


  }, []);

  // Función para generar valores aleatorios
  const generarValoresAleatorios = () => ({
    [SUBSISTEMA3_COLUMNS[0]]: voltajeValue_1.toFixed(2), // Voltage
    [SUBSISTEMA3_COLUMNS[1]]: corrienteValue_1.toFixed(2), // Current
    [SUBSISTEMA3_COLUMNS[2]]: (Math.random() * 100).toFixed(2), // Efficiency
    [SUBSISTEMA3_COLUMNS[3]]: (Math.random() * 1).toFixed(2), // Fill Factor
  });

  // Función para guardar datos
  const handleGuardar = () => {
    const nuevoDato = generarValoresAleatorios();
    const nuevosDatos = [...datos, nuevoDato];

    setDatos(nuevosDatos);
    localStorage.setItem(
      "historicalData_subsistema3",
      JSON.stringify(nuevosDatos)
    );
  };

  // Función para eliminar un registro de la tabla
  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index); // Filtra los datos para eliminar el registro seleccionado
    setDatos(nuevosDatos);
    localStorage.setItem(
      "historicalData_subsistema3",
      JSON.stringify(nuevosDatos)
    ); // Actualiza el localStorage
  };

  // Función para limpiar el subsistema - COMENTADO PARA MIGRACIÓN
  const handleLimpiar = () => {
    setEstado("clean");
    // try {
    //     const msg = "c"; // Mensaje a enviar
    //     const db = getDatabase(app);
    //     const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD
  
    //     set(docRef, msg).catch((error) => {
    //       alert("Error: " + error.message);
    //     });
  
    //     console.log(`Mensaje enviado: ${msg}`);
    //   } catch (error) {
    //     console.error("Error al enviar datos a Firebase:", error);
    //   }
  };

  // Descargar ambos gráficos en un solo archivo
  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem3_all_data.txt",
      metadata: [
        { label: "Panel Status", value: estado }, // "clean" o "dirty"
      ],
      sections: [
        {
          title: "Voltage (V) vs Time (s)",
          headers: ["Time (s)", "Voltage (V)"],
          data: contadorLabels.map((label, i) => [label, voltajeData[i]]),
        },
        {
          title: "Current (A) vs Time (s)",
          headers: ["Time (s)", "Current (A)"],
          data: contadorLabels.map((label, i) => [label, corrienteData[i]]),
        },
      ],
    });
  };
   // Descargar solo voltaje
   const handleDownloadVoltageData = () => {
    generateTXT({
      filename: "voltage_vs_time.txt",
      sections: [
        {
          title: "Voltage (V) vs Time (s)",
          headers: ["Time (s)", "Voltage (V)"],
          data: contadorLabels.map((label, i) => [label, voltajeData[i]]),
        },
      ],
    });
  };

  // Descargar solo corriente
  const handleDownloadCurrentData = () => {
    generateTXT({
      filename: "current_vs_time.txt",
      sections: [
        {
          title: "Current (A) vs Time (s)",
          headers: ["Time (s)", "Current (A)"],
          data: contadorLabels.map((label, i) => [label, corrienteData[i]]),
        },
      ],
    });
  };

  // Función para volver al menú anterior - COMENTADO PARA MIGRACIÓN
  const handleBack = () => {
    // noEnviarNuevoAngulo();
    // change1hour();
    navigate("/experiments/experimentChooser");
    // eliminarDatos();
  };
  
  //Acciones al presionar el Boton Move (Envío de dato de ángulo) - COMENTADO PARA MIGRACIÓN
  const envioDatos = async () => {
    setIsSliderDisabled_1(true);
    setIsSliderDisabled_Zenith(true);
    setIsMoveButtonDisabled_1(true);
    setIsGuardarLecturaDisabled_1(true);
    setIsTextDisabled_1(true);
    setactualPanelAngle(angulo);
    
    // try {
    //   const msg = "p" + angulo; // Mensaje a enviar
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD

    //   set(docRef, msg).catch((error) => {
    //     alert("Error: " + error.message);
    //   });

    //   console.log(`Mensaje enviado: ${msg}`);
    // } catch (error) {
    //   console.error("Error al enviar datos a Firebase:", error);
    // }

    // change5sec();
    // hacerCambio();
  };

  //Envio de señal para 1 hora - COMENTADO PARA MIGRACIÓN
  const change1hour = async () => {
    // try {
    //   const msg = "s";
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, msg).catch((error) => {
    //     alert("Error: " + error.message);
    //   });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    // hacerCambio();
  };

  //Envío de señal de envío cada 5 segundos / recibir nuevo ángulo - COMENTADO PARA MIGRACIÓN
  const change5sec = async () => {
    // try {
    //   const msg = "y";
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, msg).catch((error) => {
    //     alert("Error: " + error.message);
    //   });
    //   console.log(`Mensaje enviado: ${msg}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    // hacerCambio();
  };

  //Envío de señal para parar de enviar ángulos - COMENTADO PARA MIGRACIÓN
  const noEnviarNuevoAngulo = async () => {
    // try {
    //   const signal1hour = "n";
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, signal1hour).catch((error) => {
    //     alert("Error: " + error.message);
    //   });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    // hacerCambio();
  };
  
  //Envío de señal para parar de enviar ángulos - COMENTADO PARA MIGRACIÓN
  const hacerCambio = async () => {
    // try {
    //   const msg = "x";
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, msg).catch((error) => {
    //     alert("Error: " + error.message);
    //   });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
  };

  // Configuración de los gráficos
  const corrienteChart = {
    labels: contadorLabels,
    datasets: [
      {
        label: "Corriente (A)",
        data: corrienteData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,

        animation: {
          duration: 100, // Duración de la animación en milisegundos (controla la "sensación" de los FPS)
          easing: "easeOutQuart", // Suavidad de la animación
        },
      },
    ],
  };

  const voltajeChart = {
    labels: contadorLabels,
    datasets: [
      {
        label: "Voltaje (V)",
        data: voltajeData,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
        animation: {
          duration: 100, // Duración de la animación en milisegundos (controla la "sensación" de los FPS)
          easing: "easeOutQuart", // Suavidad de la animación
        },
      },
    ],
  };

  //Acciones al cerrer la pagina o recargar
  //Pendiente

  //Eliminar datos - COMENTADO PARA MIGRACIÓN
  const eliminarDatos = async () => {
    // const dbRef = ref(db, "Exp3/data"); // Obtén la referencia a la clave
  
    // try {
    //   await remove(dbRef); // Usa remove() correctamente en Firebase v9+
    //   console.log("Datos eliminados exitosamente.");
    // } catch (error) {
    //   console.error("Error al eliminar los datos: ", error);
    // }
  };


  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      {/* Boton para controlar arduinos */}
      {/*<Button variant="contained" marginTop={-2} marginBottom={3}>Controlar Arduino</Button>*/}

      {/* Contenedor con dos columnas */}
      <Grid container spacing={4} alignItems="flex-start">
        {/* Columna Izquierda: Estado del subsistema, botón de limpieza y tabla */}
        <Grid item xs={12} md={6}>
          {/* Estado del subsistema y botón de limpieza */}
          <Paper
            className="paper-camera"
            sx={{ p: 3, textAlign: "center", mb: 3 }}
          >
            <Typography variant="h5" gutterBottom>
              {SUBSYSTEM_STATUS_TITLE}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLimpiar}
              disabled={estado === "clean"}
              align="center"
              extraClass={estado === "clean" ? "subsystem-disabled" : ""}
            >
              {CLEAN_BUTTON}
            </Button>
          </Paper>

          {/* Tabla de datos */}
          <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />

          {/* Botón para guardar datos */}
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardar}
              align="right"
              disabled={isGuardarLecturaDisabled_1}
            >
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

        {/* Columna Derecha: Gráficos */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Paper className="paper-camera" sx={{ p: 2, width: '100%' }}>
                  <Typography variant="h5" gutterBottom>
                      {CAMERA_TITLE}
                      {isStreamActive && (
                          <Typography component="span" variant="caption" color="success.main" sx={{ ml: 1 }}>
                              ● En vivo
                          </Typography>
                      )}
                  </Typography>
                  {streamError ? (
                      <Box sx={{ 
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1
                      }}>
                          <Typography color="error">{streamError}</Typography>
                      </Box>
                  ) : (
                      <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          controls
                          style={{
                              width: '100%',
                              maxHeight: '400px',
                              borderRadius: '4px',
                              backgroundColor: '#000'
                          }}
                      />
                  )}
              </Paper>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Paper className="paper-graph">
              <GraphTitleWithTooltip 
                title={VOLTAGE_VS_TIME_TITLE} 
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />
              <div style={styles.smallGraph}>
                <Line
                  data={voltajeChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>
            </Paper>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownloadVoltageData}
            align="right"
            marginTop={-1}
          >
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box
            mt={2}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Paper className="paper-graph">
              <GraphTitleWithTooltip 
                title={CURRENT_VS_TIME_TITLE} 
                description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME}
              />
              <div style={styles.smallGraph}>
                <Line
                  data={corrienteChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>
            </Paper>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownloadCurrentData}
            align="right"
            marginTop={-1}
          >
            {DOWNLOAD_1_GRAPH}
          </Button>
          <Button
            variant="contained"
            color="pink"
            onClick={handleDownloadBothData}
            fullWidth
            align="center"
            marginTop={2}
          >
            {DOWNLOAD_GRAPHS_BUTTON}
          </Button>
        </Grid>
      </Grid>

      {/* Botón para volver */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleBack}
        align="center"
        marginTop={4}
      >
        {BACK_BUTTON}
      </Button>
    </Box>
  );
};
const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#F9F9F9",
      gap: "20px",
    },
    card: {
      padding: "40px",
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      width: "680px",
      border: "none",
      gap: "20px",
    },
    smallGraph: {
      width: "80%",
      height: "400px", // Altura reducida
      background: "white",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      alignItems: "center",
      flexDirection: "column",
    },
  };

export default Subsistema3;