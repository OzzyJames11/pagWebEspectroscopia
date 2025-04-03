import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

import imagen_subsistema1 from "../../assets/img/experimentos/imagen_subsistema1.png";
import imagen_subsistema1V2 from "../../assets/img/experimentos/imagen_subsistema1V2.png";

import Hls from 'hls.js';

//Importación de componentes
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";

//Importación de constantes
import {
  SUBSISTEMA1_COLUMNS,
  PAGE_TITLES,
} from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";

//Importación de estilos
import "../../assets/css/Elements/PaperStyles.css";

//Importación envío de datos
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import app from "../../firebaseConfig.js";

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

const Subsistema1 = () => {
  const navigate = useNavigate();
  const {
    MAIN_TITLE,
    DESCRIPTION,
    SAVE_BUTTON,
    MOVE_BUTTON,
    DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH,
    BACK_BUTTON,
    CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE,
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
  const [isSliderDisabled_1, setIsSliderDisabled_1] = useState(true); //Para activar y desactivar el slider
  const [isSliderDisabled_Zenith, setIsSliderDisabled_Zenith] = useState(true); //Para activar y desactivar el slider
  const [angulo, setAngulo] = useState(5);
  const [anguloZenith, setAnguloZenith] = useState(5); //Para el de dos ejes

  const [actualPanelAngle, setactualPanelAngle] = useState(5);
  const [actualPanelAngleZenith, setactualPanelAngleZenith] = useState(5);
  const [isMoveButtonDisabled_1, setIsMoveButtonDisabled_1] = useState(true); // Estado para habilitar/deshabilitar el boton
  const [isTextDisabled_1, setIsTextDisabled_1] = useState(true); // Estado para habilitar/deshabilitar el mensaje de movimiento
  const [messageToSend, setMessageToSend] = useState(``); // Estado para el mensaje que se enviará
  //Envio de angulo
  const [enviarAngulo, setEnviarAngulo] = useState(false);

  //Lectura de datos desde Firebase
  const db = getDatabase(app);

  useEffect(() => {
    //Enviar mensaje de inicio a los arduinos
    change5sec();
    //hacerCambio();
  }, []);

  // 🔹 Obtener ángulo del panel una sola vez al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(db, "Exp1/FrontToBack");
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          setactualPanelAngle(snapshot.val() || "");
        } else {
          console.warn("No se encontraron datos para 'anguloObjetivo'");
        }
      } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
      }
    };

    fetchData();
  }, [db]); // ✅ Se ejecuta solo al montar el componente

  // 🔹 Obtener inputs una sola vez al montar el componente
  useEffect(() => {
    const fetchDataInputs = async () => {
      try {
        const dbRef = ref(db, "Lectures");
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          setInputs(snapshot.val() || "");
        } else {
          console.warn("No se encontraron datos para 'Lectures'");
        }
      } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
      }
    };

    fetchDataInputs();
  }, [db]); // ✅ Se ejecuta solo una vez

  // 🔹 Escuchar cambios en Firebase en tiempo real
  useEffect(() => {
    const dbRef = ref(db, "Exp1/data"); // Escucha todo el nodo "Lectures"

    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      console.log(
        `Nuevo valor agregado - Clave: ${snapshot.key}`,
        snapshot.val()
      );
      const newData = snapshot.val();
      setCorrienteData((prev) => [...prev.slice(-20), newData.data1.current]); // Solo los últimos 20 valores
      setVoltajeData((prev) => [...prev.slice(-20), newData.data1.voltage]);
      setContadorLabels((prev) => [...prev.slice(-20), newData.data1.cont]);
      setvoltajeValue_1(newData.data1.voltage);
      setcorrienteValue_1(newData.data1.current);
    });
    // const dbRef = ref(db, "Lectures");

    // const unsubscribe = onValue(dbRef, (snapshot) => {
    //   if (snapshot.exists()) {
    //     const mensaje = snapshot.val();
    //     console.log("Mensaje recibido:", mensaje);

    //     const choose = mensaje.slice(0, 1);
    //     const valor = parseFloat(mensaje.slice(1));

    //     console.log("choose recibido:", choose);
    //     console.log("valor recibido:", valor);

    //     if (mensaje === "EndMov") {
    //       console.log("Activando controles");
    //       setIsSliderDisabled_1(false);
    //       setIsMoveButtonDisabled_1(false);
    //       setIsTextDisabled_1(false);
    //       setIsGuardarLecturaDisabled_1(false);
    //       change5sec();//enviar mensaje de mover de nuevo
    //       hacerCambio();
    //     } else if (choose === "I") {
    //       setcorrienteValue_1(valor);
    //       setCorrienteData((prev) => [...prev.slice(-20), valor]); // Solo los últimos 20 valores
    //     } else if (choose === "V") {
    //       setvoltajeValue_1(valor);
    //       setVoltajeData((prev) => [...prev.slice(-20), valor]);
    //     } else if (choose === "C") {
    //       setContadorValue(valor);
    //       setContadorLabels((prev) => [...prev.slice(-20), valor]);
    //     }
    //   } else {
    //     console.warn("No se encontraron datos en Firebase.");
    //   }
    // });

    return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, [db]); // ✅ Se ejecuta al montar el componente y escucha cambios en Firebase

  //Lectura de BackToFront
  useEffect(() => {
    const dbRef = ref(db, "Exp1/BackToFront");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const mensaje = snapshot.val();
        console.log("Mensaje recibidooo:", mensaje);
        if (mensaje === "EndMov") {
          setIsSliderDisabled_1(false);
          setIsMoveButtonDisabled_1(false);
          setIsTextDisabled_1(false);
          setIsGuardarLecturaDisabled_1(false);
        } else if (mensaje === "PITCH:") {
          console.log(mensaje)
          setEnviarAngulo(true);
        }

        //change5sec(); //enviar mensaje de mover de nuevo
        //hacerCambio();
      }
    });
    return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, [db]); // ✅ Se ejecuta al montar el componente y escucha cambios en Firebase

  //Tabla de datos que guarda el usuario
  const [datos, setDatos] = useState([]);
  const [isGuardarLecturaDisabled_1, setIsGuardarLecturaDisabled_1] =
    useState(true); // Estado para habilitar/deshabilitar el boton de guardar datos

  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema1")) || [];
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

  /**
   * Creo que es necesario crear esto en c/subsistema dependiendo de las variables que se agreguen
   * las cuales dependen del arreglo creado en columns.
   * @returns
   */
  const generarValoresAleatorios = () => ({
    [SUBSISTEMA1_COLUMNS[0]]: `${angulo}°`,
    [SUBSISTEMA1_COLUMNS[1]]: voltajeValue_1.toFixed(2),
    [SUBSISTEMA1_COLUMNS[2]]: corrienteValue_1.toFixed(2),
    [SUBSISTEMA1_COLUMNS[3]]: (Math.random() * 100).toFixed(2),
    [SUBSISTEMA1_COLUMNS[4]]: (Math.random() * 1).toFixed(2),
  });

  const handleGuardar = () => {
    // const nuevoDato = { angulo, ...generarValoresAleatorios() };
    const nuevoDato = generarValoresAleatorios();
    const nuevosDatos = [...datos, nuevoDato];

    setDatos(nuevosDatos);
    localStorage.setItem(
      "historicalData_subsistema1",
      JSON.stringify(nuevosDatos)
    );
  };

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index); // Filtra los datos para eliminar el registro seleccionado
    setDatos(nuevosDatos);
    localStorage.setItem(
      "historicalData_subsistema1",
      JSON.stringify(nuevosDatos)
    ); // Actualiza el localStorage
  };

  const handleDescargarGraficos = () => {
    alert("Funcionalidad de descarga pendiente de implementación");
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    //change1hour();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  //Acciones al presionar el Boton Move (Envío de dato de ángulo)
  const envioDatos = async () => {
    if (enviarAngulo) {
      setIsSliderDisabled_1(true);
      setIsSliderDisabled_Zenith(true);
      setIsMoveButtonDisabled_1(true);
      setIsGuardarLecturaDisabled_1(true);
      setIsTextDisabled_1(true);
      setactualPanelAngle(angulo);
      try {
        const msg = "p" + angulo; // Mensaje a enviar
        const db = getDatabase(app);
        const docRef = ref(db, "Exp1/FrontToBack"); // Ruta correcta en la BD

        set(docRef, msg).catch((error) => {
          alert("Error: " + error.message);
        });

        console.log(`Mensaje enviado: ${msg}`);
        setEnviarAngulo(false);
      } catch (error) {
        console.error("Error al enviar datos a Firebase:", error);
      }
             
    }

    // try {
    //   //const msg = anguloZenith
    //   const msg = "r" + angulo;
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp1/FrontToBack");
    //   set(docRef, msg)
    //     .catch((error) => {
    //       alert("Error: " + error.message);
    //     });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    //change5sec();
    //hacerCambio();
  };

  //Envio de señal para 1 hora
  const change1hour = async () => {
    try {
      const msg = "s";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp1/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${messageToSend}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };

  //Envío de señal de envío cada 5 segundos / recibir nuevo ángulo
  const change5sec = async () => {
    try {
      const msg = "y";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp1/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    //hacerCambio();
  };

  //Envío de señal para parar de enviar ángulos
  const noEnviarNuevoAngulo = async () => {
    try {
      const signal1hour = "n";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp1/FrontToBack");
      set(docRef, signal1hour).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${messageToSend}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    //hacerCambio();
  };
  //Envío de señal para parar de enviar ángulos
  const hacerCambio = async () => {
    try {
      const msg = "x";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp1/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${messageToSend}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
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

  //Eliminar datos
  const eliminarDatos = async () => {
    const dbRef = ref(db, "Exp1/data"); // Obtén la referencia a la clave

    try {
      await remove(dbRef); // Usa remove() correctamente en Firebase v9+
      console.log("Datos eliminados exitosamente.");
    } catch (error) {
      console.error("Error al eliminar los datos: ", error);
    }
  };

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      {/* Contenedor con dos columnas */}
      <Grid container spacing={4} alignItems="flex-start">
        {/* Columna Izquierda: Slider y Tabla */}
        <Grid item xs={12} md={6}>
          <SliderComponent
            value={angulo}
            label="Actual Azimuth Angle"
            min={-45}
            max={45}
            step={5}
            actualAngle={actualPanelAngle}
            onChange={(e, newValue) => setAngulo(newValue)}
            disabled={isSliderDisabled_1} //estado del slider
          />
          <Box mt={2}>
            {isTextDisabled_1 && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnMov1"
              variant="contained"
              color="primary"
              onClick={envioDatos}
              align="right"
              disabled={isMoveButtonDisabled_1}
            >
              {MOVE_BUTTON}
            </Button>
          </Box>
          <DataTable
            columns={SUBSISTEMA1_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />
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
              <Typography variant="h5">{VOLTAGE_VS_TIME_TITLE}</Typography>
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
            onClick={handleDescargarGraficos}
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
              <Typography variant="h5">{CURRENT_VS_TIME_TITLE}</Typography>
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
            onClick={handleDescargarGraficos}
            align="right"
            marginTop={-1}
          >
            {DOWNLOAD_1_GRAPH}
          </Button>
          <Button
            variant="contained"
            color="pink"
            onClick={handleDescargarGraficos}
            fullWidth
            align="center"
            marginTop={2}
          >
            {DOWNLOAD_GRAPHS_BUTTON}
          </Button>
        </Grid>
      </Grid>

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

export default Subsistema1;
