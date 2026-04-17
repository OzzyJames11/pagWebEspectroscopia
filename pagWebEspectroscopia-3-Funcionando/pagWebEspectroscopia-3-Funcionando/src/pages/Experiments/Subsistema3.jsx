/*import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

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
        const dbRef = ref(db, "Exp3/FrontToBack");
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
    const dbRef = ref(db, "Exp3/data"); // Escucha todo el nodo "Lectures"

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
    const dbRef = ref(db, "Exp3/BackToFront");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const mensaje = snapshot.val();
        console.log("Mensaje recibidooo:", mensaje);
        setIsSliderDisabled_1(false);
        setIsMoveButtonDisabled_1(false);
        setIsTextDisabled_1(false);
        setIsGuardarLecturaDisabled_1(false);
        change5sec(); //enviar mensaje de mover de nuevo
        hacerCambio();
        setEstado('dirty');

      }
    });
    return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, [db]); // ✅ Se ejecuta al montar el componente y escucha cambios en Firebase


  // Estado del subsistema
  const [estado, setEstado] = useState("dirty"); // Por defecto, el subsistema está sucio

  // Estado para los datos de la tabla
  const [datos, setDatos] = useState([]);
  const [isGuardarLecturaDisabled_1, setIsGuardarLecturaDisabled_1] =
      useState(false); // Estado para habilitar/deshabilitar el boton de guardar datos
  
  
  const [youtubeVideoId] = useState("nAQz4RMaHVA");


  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);

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

  // Función para limpiar el subsistema
  const handleLimpiar = () => {
    setEstado("clean");
    try {
        const msg = "c"; // Mensaje a enviar
        const db = getDatabase(app);
        const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD
  
        set(docRef, msg).catch((error) => {
          alert("Error: " + error.message);
        });
  
        console.log(`Mensaje enviado: ${msg}`);
      } catch (error) {
        console.error("Error al enviar datos a Firebase:", error);
      }
  };

  // Función para descargar gráficos (pendiente de implementación)
  /*const handleDescargarGraficos = () => {
    alert("Funcionalidad de descarga pendiente de implementación");
  };*/

  // Descargar ambos gráficos en un solo archivo*/
  /*const handleDownloadBothData = () => {
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

  // Función para volver al menú anterior
  const handleBack = () => {
    noEnviarNuevoAngulo();
    change1hour();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };
  //Acciones al presionar el Boton Move (Envío de dato de ángulo)
  const envioDatos = async () => {
    setIsSliderDisabled_1(true);
    setIsSliderDisabled_Zenith(true);
    setIsMoveButtonDisabled_1(true);
    setIsGuardarLecturaDisabled_1(true);
    setIsTextDisabled_1(true);
    setactualPanelAngle(angulo);
    try {
      const msg = "p" + angulo; // Mensaje a enviar
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD

      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });

      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos a Firebase:", error);
    }

    // try {
    //   //const msg = anguloZenith
    //   const msg = "r" + angulo;
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, msg)
    //     .catch((error) => {
    //       alert("Error: " + error.message);
    //     });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    change5sec();
    hacerCambio();
  };

  //Envio de señal para 1 hora
  const change1hour = async () => {
    try {
      const msg = "s";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
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
      const docRef = ref(db, "Exp3/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };

  //Envío de señal para parar de enviar ángulos
  const noEnviarNuevoAngulo = async () => {
    try {
      const signal1hour = "n";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
      set(docRef, signal1hour).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${messageToSend}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };
  //Envío de señal para parar de enviar ángulos
  const hacerCambio = async () => {
    try {
      const msg = "x";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
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
      const dbRef = ref(db, "Exp3/data"); // Obtén la referencia a la clave
  
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
*/
      {/* Boton para controlar arduinos */}
      {/*<Button variant="contained" marginTop={-2} marginBottom={3}>Controlar Arduino</Button>*/}

      {/* Contenedor con dos columnas */}
     // <Grid container spacing={4} alignItems="flex-start">
        {/* Columna Izquierda: Estado del subsistema, botón de limpieza y tabla */}
       // <Grid item xs={12} md={6}>
          {/* Estado del subsistema y botón de limpieza */}
        /*  <Paper
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
*/
          {/* Tabla de datos */}
         /* <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />
*/
          {/* Botón para guardar datos */}
         /* <Box mt={2}>
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
*/
        {/* Columna Derecha: Gráficos */}
       /* <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper
              className="paper-camera"
              sx={{
                p: 2,
                width: "100%",
                backgroundColor: "#121212",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
              >
                {CAMERA_TITLE}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "#e53935",
                    fontWeight: "bold",
                    ml: 1,
                  }}
                >
                  ● En vivo
                </Typography>
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: "400px",
                  mt: 1,
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                  title="Transmisión en vivo de YouTube"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "8px" }}
                ></iframe>
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Paper className="paper-graph">
              <GraphTitleWithTooltip 
                title={VOLTAGE_VS_TIME_TITLE} 
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />*/
              {/* Desactivado temporalmente por OzzyJames11 
              <div style={styles.smallGraph}>
                <Line
                  data={voltajeChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>*/}
           /* </Paper>
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
              */{/* Desactivado temporalmente por OzzyJames11 
              <div style={styles.smallGraph}>
                <Line
                  data={corrienteChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>*/}
            /*</Paper>
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
*/
      {/* Botón para volver */}
     /* <Button
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

export default Subsistema3;*/








/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Firebase e Auth
import {
  getDatabase,
  ref,
  set,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import { getAuth } from "firebase/auth"; // Importante para el UID
import app from "../../firebaseConfig.js";

// Importación de componentes
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

// Importación de constantes y estilos
import {
  SUBSISTEMA3_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
import "../../assets/css/Elements/PaperStyles.css";

const Subsistema3 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const auth = getAuth(app);
  const user = auth.currentUser; // Obtenemos el usuario actual

  const {
    MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH, BACK_BUTTON, CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, CLEAN_BUTTON,
  } = PAGE_TITLES;

  // Estados
  const [corrienteData, setCorrienteData] = useState([]);
  const [voltajeData, setVoltajeData] = useState([]);
  const [contadorLabels, setContadorLabels] = useState([]);
  const [voltajeValue, setVoltajeValue] = useState(0);
  const [corrienteValue, setCorrienteValue] = useState(0);
  const [estado, setEstado] = useState("dirty");
  const [datos, setDatos] = useState([]);
  const [youtubeVideoId] = useState("nAQz4RMaHVA");
  const [angulo, setAngulo] = useState(5);

  // 1. Efecto inicial: Cargar datos locales y enviar señal de inicio
  useEffect(() => {
    const datosGuardados = JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);
   
    if (user) {
      enviarComando("y"); // Señal de inicio 'y' según tu lógica anterior
    }
  }, [user]);

  // 2. Listener de Datos (Measurements) - Ahora basado en el UID del usuario
  useEffect(() => {
    if (!user) return;

    // Nota: El backend antiguo enviaba a Exp3/data, el nuevo lo maneja por usuario
    // Si el backend envía datos crudos a una ruta global, usa "Exp3/data"
    // Pero si quieres aislamiento total, el backend debería escribir en users/uid/Exp3/data
    const dataRef = ref(db, `Exp3/data`);

    const unsubscribe = onChildAdded(dataRef, (snapshot) => {
      const newData = snapshot.val();
      if (newData && newData.data1) {
        setCorrienteData((prev) => [...prev.slice(-19), newData.data1.current]);
        setVoltajeData((prev) => [...prev.slice(-19), newData.data1.voltage]);
        setContadorLabels((prev) => [...prev.slice(-19), newData.data1.cont || prev.length]);
        setVoltajeValue(newData.data1.voltage);
        setCorrienteValue(newData.data1.current);
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // 3. Listener de BackToFront (Handshake/EndMov) - ESPECÍFICO POR USUARIO
  useEffect(() => {
    if (!user) return;

    const btfRef = ref(db, `users/${user.uid}/Exp3/communication/BackToFront`);

    const unsubscribe = onValue(btfRef, (snapshot) => {
      const mensaje = snapshot.val();
      console.log("MENSAJE RECIBIDO DESDE FIREBASE:", mensaje); 
      if (mensaje === "EndMov") {
        console.log("Movimiento finalizado para este usuario");
        // Aquí puedes reactivar botones si los deshabilitaste
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // Función genérica para enviar comandos al nuevo Backend
  const enviarComando = (cmd) => {
    if (!user) {
        console.error("No hay usuario autenticado");
        return;
    }
    const commandRef = ref(db, `users/${user.uid}/Exp3/communication/FrontToBack`);
    set(commandRef, cmd).catch(err => console.error("Error enviando comando:", err));
  };

  const handleLimpiar = () => {
    setEstado("clean");
    enviarComando("c");
  };

  const handleMove = () => {
    enviarComando(`p${angulo}`);
  };

  const handleGuardar = () => {
    const nuevoDato = {
      [SUBSISTEMA3_COLUMNS[0]]: voltajeValue.toFixed(2),
      [SUBSISTEMA3_COLUMNS[1]]: corrienteValue.toFixed(2),
      [SUBSISTEMA3_COLUMNS[2]]: (voltajeValue * corrienteValue).toFixed(2), // Ejemplo Potencia
      [SUBSISTEMA3_COLUMNS[3]]: "1.00",
    };
    const nuevosDatos = [...datos, nuevoDato];
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
  };

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index);
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
  };

  const handleBack = async () => {
    enviarComando("n"); // Stop
    // Limpiar datos de Firebase si es necesario antes de salir
    const dataRef = ref(db, "Exp3/data");
    await remove(dataRef);
    navigate("/experiments/experimentChooser");
  };

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4}>*/
        {/* Columna Izquierda */}
       /* <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
            <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={handleLimpiar}
              disabled={estado === "clean"}
            >
              {CLEAN_BUTTON}
            </Button>
          </Paper>

          <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />

          <Box mt={2}>
            <Button variant="contained" onClick={handleGuardar}>
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

       */ {/* Columna Derecha */}
       /* <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
              {CAMERA_TITLE} <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
            </Typography>
            <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
              <iframe
                width="100%" height="400"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                title="Live Stream" frameBorder="0" allowFullScreen
              ></iframe>
            </Box>
          </Paper>

          <Box mt={3}>
             <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Control de Ángulo</Typography>
                <input
                    type="range" min="0" max="180" value={angulo}
                    onChange={(e) => setAngulo(e.target.value)}
                    style={{ width: "100%" }}
                />
                <Typography>Ángulo seleccionado: {angulo}°</Typography>
                <Button variant="contained" onClick={handleMove} fullWidth>Mover Panel</Button>
             </Paper>
          </Box>
        </Grid>
      </Grid>

      <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
        {BACK_BUTTON}
      </Button>
    </Box>
  );
};

export default Subsistema3;
*/




// import React, { useState, useEffect } from "react";
// import { Box, Paper, Typography, Grid } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// // Firebase
// import { getDatabase, ref, set, onValue, remove } from "firebase/database";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import app from "../../firebaseConfig.js";

// // Componentes (los tuyos)
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";

// // Strings (puedes ajustar los textos en tu archivo si quieres)
// import {
//   PAGE_TITLES,
// } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";

// import "../../assets/css/Elements/PaperStyles.css";

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const auth = getAuth(app);

//   // =========================================================
//   // ESTADOS
//   // =========================================================
//   const [currentUser, setCurrentUser] = useState(null);

//   // Pitch live + historial corto para gráfica (si la usas en otra parte)
//   const [pitchValue, setPitchValue] = useState(null);
//   const [pitchData, setPitchData] = useState([]);
//   const [timeLabels, setTimeLabels] = useState([]);

//   // Tabla local (guardado manual)
//   const [estado, setEstado] = useState("dirty");
//   const [datos, setDatos] = useState([]);

//   const [youtubeVideoId] = useState("nAQz4RMaHVA");

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   // Columnas para PITCH
//   const TABLE_COLUMNS = ["Pitch", "Hora"];

//   // =========================================================
//   // 1) AUTH: Detectar usuario
//   // =========================================================
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setCurrentUser(user);
//         console.log("✅ Usuario autenticado:", user.uid);
//       } else {
//         setCurrentUser(null);
//         console.warn("❌ No hay sesión activa.");
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   // =========================================================
//   // 2) Cargar tabla local + mandar "y" al entrar
//   // =========================================================
//   useEffect(() => {
//     const datosGuardados =
//       JSON.parse(localStorage.getItem("historicalData_subsistema3_pitch")) || [];
//     setDatos(datosGuardados);

//     if (currentUser) {
//       enviarComando("y"); // iniciar medición/streaming
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUser]);

//   // =========================================================
//   // 3) Listener LIVE pitch (por usuario)
//   // Ruta: users/{uid}/Exp3/live
//   // =========================================================
//   useEffect(() => {
//     if (!currentUser) return;

//     const liveRef = ref(db, `users/${currentUser.uid}/Exp3/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v || typeof v.pitch !== "number") return;

//       const pitch = v.pitch;
//       const label = v.timestamp
//         ? new Date(v.timestamp).toLocaleTimeString()
//         : new Date().toLocaleTimeString();

//       setPitchValue(pitch);
//       setPitchData((prev) => [...prev.slice(-19), pitch]);
//       setTimeLabels((prev) => [...prev.slice(-19), label]);
//     });

//     return () => unsubscribe();
//   }, [currentUser, db]);

//   // =========================================================
//   // 4) Listener BackToFront (por usuario) — opcional
//   // Ruta: users/{uid}/Exp3/communication/BackToFront
//   // =========================================================
//   useEffect(() => {
//     if (!currentUser) return;

//     const btfRef = ref(db, `users/${currentUser.uid}/Exp3/communication/BackToFront`);
//     const unsubscribe = onValue(btfRef, (snapshot) => {
//       const mensaje = snapshot.val();
//       if (!mensaje || mensaje === "x") return;

//       console.log("📩 BackToFront Exp3:", mensaje);
//       // Si tu Arduino manda EndMov para algún proceso, aquí lo capturas:
//       // if (mensaje === "EndMov") { ... }
//     });

//     return () => unsubscribe();
//   }, [currentUser, db]);

//   // =========================================================
//   // Enviar comandos a Exp3 (por usuario)
//   // =========================================================
//   const enviarComando = (cmd) => {
//     if (!currentUser) {
//       console.error("⛔ Acción bloqueada: esperando autenticación...");
//       return;
//     }
//     const commandRef = ref(
//       db,
//       `users/${currentUser.uid}/Exp3/communication/FrontToBack`
//     );

//     set(commandRef, cmd)
//       .then(() => console.log(`🚀 Comando "${cmd}" enviado.`))
//       .catch((err) => console.error("❌ Error enviando comando:", err));
//   };

//   // =========================================================
//   // UI actions
//   // =========================================================
//   const handleLimpiar = () => {
//     setEstado("clean");
//     // Limpieza local
//     setPitchData([]);
//     setTimeLabels([]);
//     setPitchValue(null);

//     enviarComando("c");
//   };

//   const handleGuardar = () => {
//     const now = new Date();
//     const row = {
//       [TABLE_COLUMNS[0]]: pitchValue === null ? "-" : pitchValue.toFixed(4),
//       [TABLE_COLUMNS[1]]: now.toLocaleTimeString(),
//     };

//     const nuevosDatos = [...datos, row];
//     setDatos(nuevosDatos);
//     localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
//     setEstado("dirty");
//   };

//   const handleEliminar = (index) => {
//     const nuevosDatos = datos.filter((_, i) => i !== index);
//     setDatos(nuevosDatos);
//     localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
//   };

//   const handleBack = async () => {
//     try {
//       // Detener streaming/medición
//       enviarComando("n");

//       if (currentUser) {
//         // Limpia solo lo de este usuario (opcional)
//         await remove(ref(db, `users/${currentUser.uid}/Exp3/live`));
//         // Si guardas histórico:
//         // await remove(ref(db, `users/${currentUser.uid}/Exp3/measurements`));
//       }
//     } catch (e) {
//       console.warn("⚠️ Error limpiando datos de Exp3:", e);
//     }

//     navigate("/experiments/experimentChooser");
//   };

//   // =========================================================
//   // Render
//   // =========================================================
//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         {/* Columna Izquierda */}
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Pitch actual:{" "}
//               <strong>
//                 {pitchValue === null ? "—" : `${pitchValue.toFixed(4)}`}
//               </strong>
//             </Typography>

//             <Button variant="contained" onClick={handleLimpiar} disabled={estado === "clean"}>
//               {CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datos}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={handleGuardar} disabled={pitchValue === null}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         {/* Columna Derecha */}
//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>

//           {/* Si luego quieres una gráfica, aquí puedes renderizarla usando pitchData y timeLabels */}
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;










// //
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import CircularProgress from "@mui/material/CircularProgress";

// import {
//   getDatabase,
//   ref,
//   set,
//   update,
//   onValue,
//   onChildAdded,
//   get,
//   onDisconnect,
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);
//   const shouldSendNOnUnmountRef = useRef(false);
//   const initKeyRef = useRef(`exp3_init_${UID_USUARIO}`);

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Inicialización
//   useEffect(() => {
//     if (!user) return;

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     const initKey = initKeyRef.current;

//     onDisconnect(fbRef).set("n");

//     const inicializar = async () => {
//       try {
//         const yaInicializado = sessionStorage.getItem(initKey) === "1";

//         if (!yaInicializado) {
//           await set(fbRef, "y");
//           sessionStorage.setItem(initKey, "1");
//         }

//         shouldSendNOnUnmountRef.current = true;
//       } catch (err) {
//         console.error("Error inicializando Exp3:", err);
//       }
//     };

//     inicializar();

//     return () => {
//       onDisconnect(fbRef).cancel().catch(() => {});

//       if (shouldSendNOnUnmountRef.current) {
//         set(fbRef, "n").catch(() => {});
//         sessionStorage.removeItem(initKey);
//       }

//       const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//       if (datosBasura.length > 0) {
//         const updates = {};
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });

//         update(ref(db), updates)
//           .then(() => {
//             console.log(`✅ Se eliminaron ${datosBasura.length} mediciones no guardadas de Exp3.`);
//           })
//           .catch((e) => {
//             console.error("❌ Error eliminando datos temporales de Exp3:", e);
//           });
//       }
//     };
//   }, [user, db, BASE_PATH, UID_USUARIO]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   const handleBack = async () => {
//     try {
//       await enviarComando("n");
//     } catch (e) {
//       console.warn("⚠️ Error cerrando Exp3:", e);
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || estado === "cleaning"}
//             >
//               {!isHardwareReady ? "Calibrating..." : estado === "cleaning" ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;





//nuvea corregida

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import CircularProgress from "@mui/material/CircularProgress";

// import { getDatabase, ref, set, update, onValue, onChildAdded, get } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";

// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // const UID_USUARIO = user?.uid || "invitado";
//   // const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // // ==========================================
//   // // NUEVO: CONTROL DE FLUJO (n -> y -> n)
//   // // ==========================================
//   // useEffect(() => {
//   //   // Si no hay usuario, no hacemos nada todavía
//   //   if (!user || UID_USUARIO === "invitado") return;

//   //   const iniciarSecuencia = async () => {
//   //     try {
//   //       // 1. Al arrancar: Enviar 'n' para silenciar
//   //       console.log("🤫 Pasos iniciales: Enviando 'n'...");
//   //       await enviarComando("n");

//   //       // 2. Esperar 1 segundo y enviar 'y' para entrar al experimento
//   //       setTimeout(async () => {
//   //         console.log("🚀 Entrando al experimento: Enviando 'y'...");
//   //         await enviarComando("y");
//   //       }, 1000);
//   //     } catch (error) {
//   //       console.error("Error en secuencia inicial:", error);
//   //     }
//   //   };

//   //   iniciarSecuencia();

//   //   // 3. Al salir (Desmontaje): Enviar 'n' para silenciar
//   //   return () => {
//   //     console.log("👋 Saliendo: Enviando 'n'...");
//   //     enviarComando("n");
//   //   };
//   // }, [user, UID_USUARIO]); 
//   // // ==========================================

//   // const [pitchValue, setPitchValue] = useState(null);
//   // const [voltageValue, setVoltageValue] = useState(null);
//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // ==========================================
//   // CONTROL DE FLUJO: Solo 'y' al arrancar, y 'n' al salir
//   // ==========================================
//   useEffect(() => {
//     // Si no hay usuario, no hacemos nada todavía
//     if (!user || UID_USUARIO === "invitado") return;

//     const iniciarSecuencia = async () => {
//       try {
//         // Enviar DIRECTAMENTE 'y' para entrar al experimento
//         console.log("🚀 Entrando al experimento: Enviando 'y'...");
//         await enviarComando("y");
//       } catch (error) {
//         console.error("Error al iniciar el experimento:", error);
//       }
//     };

//     iniciarSecuencia();

//     // Al salir (Desmontaje o cambio de ruta): Enviar 'n' para silenciar
//     return () => {
//       console.log("👋 Saliendo: Enviando 'n'...");
//       enviarComando("n");
//     };
//   }, [user, UID_USUARIO]); 
//   // ==========================================

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [isCleaning, setIsCleaning] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado de hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//       if (typeof v.isCleaning === "boolean") setIsCleaning(v.isCleaning);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Bloquear recarga/cierre mientras limpia o si hay datos sin guardar
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);

//       if (isCleaning) {
//         e.preventDefault();
//         e.returnValue = "";
//         return;
//       }

//       if (haySinGuardar) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [isCleaning, datosTemporales]);

//   // Trampa flecha atrás
//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);

//     const handlePopState = () => {
//       if (isCleaning) {
//         alert("⚠️ La limpieza está en curso. Espera a que termine antes de salir.");
//         window.history.pushState(null, null, window.location.pathname);
//         return;
//       }

//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);
//       if (haySinGuardar) {
//         const confirmar = window.confirm(
//           "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//         );
//         if (!confirmar) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }

//       navigate("/experiments/experimentChooser", { replace: true });
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [navigate, isCleaning, datosTemporales]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setIsCleaning(true);
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//       setIsCleaning(false);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   const handleBack = async () => {
//     if (isCleaning) {
//       alert("⚠️ La limpieza está en curso. Espera a que termine antes de salir.");
//       return;
//     }
  
//     if (hayDatosSinGuardar) {
//       const confirmar = window.confirm(
//         "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//       );
//       if (!confirmar) return;
  
//       const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//       if (datosBasura.length > 0) {
//         const updates = {};
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });
//         await update(ref(db), updates).catch((e) => {
//           console.error("Error eliminando datos temporales Exp3:", e);
//         });
//       }
//     }
  
//     // --- CAMBIO AQUÍ: Enviar 'n' antes de salir por el botón ---
//     console.log("🔙 Saliendo por botón: Enviando 'n'...");
//     await enviarComando("n");
//     // -----------------------------------------------------------
  
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || isCleaning}
//             >
//               {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;



/*import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

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
        const dbRef = ref(db, "Exp3/FrontToBack");
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
    const dbRef = ref(db, "Exp3/data"); // Escucha todo el nodo "Lectures"

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
    const dbRef = ref(db, "Exp3/BackToFront");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const mensaje = snapshot.val();
        console.log("Mensaje recibidooo:", mensaje);
        setIsSliderDisabled_1(false);
        setIsMoveButtonDisabled_1(false);
        setIsTextDisabled_1(false);
        setIsGuardarLecturaDisabled_1(false);
        change5sec(); //enviar mensaje de mover de nuevo
        hacerCambio();
        setEstado('dirty');

      }
    });
    return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, [db]); // ✅ Se ejecuta al montar el componente y escucha cambios en Firebase


  // Estado del subsistema
  const [estado, setEstado] = useState("dirty"); // Por defecto, el subsistema está sucio

  // Estado para los datos de la tabla
  const [datos, setDatos] = useState([]);
  const [isGuardarLecturaDisabled_1, setIsGuardarLecturaDisabled_1] =
      useState(false); // Estado para habilitar/deshabilitar el boton de guardar datos
  
  
  const [youtubeVideoId] = useState("nAQz4RMaHVA");


  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);

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

  // Función para limpiar el subsistema
  const handleLimpiar = () => {
    setEstado("clean");
    try {
        const msg = "c"; // Mensaje a enviar
        const db = getDatabase(app);
        const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD
  
        set(docRef, msg).catch((error) => {
          alert("Error: " + error.message);
        });
  
        console.log(`Mensaje enviado: ${msg}`);
      } catch (error) {
        console.error("Error al enviar datos a Firebase:", error);
      }
  };

  // Función para descargar gráficos (pendiente de implementación)
  /*const handleDescargarGraficos = () => {
    alert("Funcionalidad de descarga pendiente de implementación");
  };*/

  // Descargar ambos gráficos en un solo archivo*/
  /*const handleDownloadBothData = () => {
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

  // Función para volver al menú anterior
  const handleBack = () => {
    noEnviarNuevoAngulo();
    change1hour();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };
  //Acciones al presionar el Boton Move (Envío de dato de ángulo)
  const envioDatos = async () => {
    setIsSliderDisabled_1(true);
    setIsSliderDisabled_Zenith(true);
    setIsMoveButtonDisabled_1(true);
    setIsGuardarLecturaDisabled_1(true);
    setIsTextDisabled_1(true);
    setactualPanelAngle(angulo);
    try {
      const msg = "p" + angulo; // Mensaje a enviar
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD

      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });

      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos a Firebase:", error);
    }

    // try {
    //   //const msg = anguloZenith
    //   const msg = "r" + angulo;
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, msg)
    //     .catch((error) => {
    //       alert("Error: " + error.message);
    //     });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    change5sec();
    hacerCambio();
  };

  //Envio de señal para 1 hora
  const change1hour = async () => {
    try {
      const msg = "s";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
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
      const docRef = ref(db, "Exp3/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };

  //Envío de señal para parar de enviar ángulos
  const noEnviarNuevoAngulo = async () => {
    try {
      const signal1hour = "n";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
      set(docRef, signal1hour).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${messageToSend}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };
  //Envío de señal para parar de enviar ángulos
  const hacerCambio = async () => {
    try {
      const msg = "x";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
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
      const dbRef = ref(db, "Exp3/data"); // Obtén la referencia a la clave
  
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
*/
      {/* Boton para controlar arduinos */}
      {/*<Button variant="contained" marginTop={-2} marginBottom={3}>Controlar Arduino</Button>*/}

      {/* Contenedor con dos columnas */}
     // <Grid container spacing={4} alignItems="flex-start">
        {/* Columna Izquierda: Estado del subsistema, botón de limpieza y tabla */}
       // <Grid item xs={12} md={6}>
          {/* Estado del subsistema y botón de limpieza */}
        /*  <Paper
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
*/
          {/* Tabla de datos */}
         /* <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />
*/
          {/* Botón para guardar datos */}
         /* <Box mt={2}>
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
*/
        {/* Columna Derecha: Gráficos */}
       /* <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper
              className="paper-camera"
              sx={{
                p: 2,
                width: "100%",
                backgroundColor: "#121212",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
              >
                {CAMERA_TITLE}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "#e53935",
                    fontWeight: "bold",
                    ml: 1,
                  }}
                >
                  ● En vivo
                </Typography>
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: "400px",
                  mt: 1,
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                  title="Transmisión en vivo de YouTube"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "8px" }}
                ></iframe>
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Paper className="paper-graph">
              <GraphTitleWithTooltip 
                title={VOLTAGE_VS_TIME_TITLE} 
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />*/
              {/* Desactivado temporalmente por OzzyJames11 
              <div style={styles.smallGraph}>
                <Line
                  data={voltajeChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>*/}
           /* </Paper>
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
              */{/* Desactivado temporalmente por OzzyJames11 
              <div style={styles.smallGraph}>
                <Line
                  data={corrienteChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>*/}
            /*</Paper>
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
*/
      {/* Botón para volver */}
     /* <Button
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

export default Subsistema3;*/








/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Firebase e Auth
import {
  getDatabase,
  ref,
  set,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import { getAuth } from "firebase/auth"; // Importante para el UID
import app from "../../firebaseConfig.js";

// Importación de componentes
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

// Importación de constantes y estilos
import {
  SUBSISTEMA3_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
import "../../assets/css/Elements/PaperStyles.css";

const Subsistema3 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const auth = getAuth(app);
  const user = auth.currentUser; // Obtenemos el usuario actual

  const {
    MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH, BACK_BUTTON, CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, CLEAN_BUTTON,
  } = PAGE_TITLES;

  // Estados
  const [corrienteData, setCorrienteData] = useState([]);
  const [voltajeData, setVoltajeData] = useState([]);
  const [contadorLabels, setContadorLabels] = useState([]);
  const [voltajeValue, setVoltajeValue] = useState(0);
  const [corrienteValue, setCorrienteValue] = useState(0);
  const [estado, setEstado] = useState("dirty");
  const [datos, setDatos] = useState([]);
  const [youtubeVideoId] = useState("nAQz4RMaHVA");
  const [angulo, setAngulo] = useState(5);

  // 1. Efecto inicial: Cargar datos locales y enviar señal de inicio
  useEffect(() => {
    const datosGuardados = JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);
   
    if (user) {
      enviarComando("y"); // Señal de inicio 'y' según tu lógica anterior
    }
  }, [user]);

  // 2. Listener de Datos (Measurements) - Ahora basado en el UID del usuario
  useEffect(() => {
    if (!user) return;

    // Nota: El backend antiguo enviaba a Exp3/data, el nuevo lo maneja por usuario
    // Si el backend envía datos crudos a una ruta global, usa "Exp3/data"
    // Pero si quieres aislamiento total, el backend debería escribir en users/uid/Exp3/data
    const dataRef = ref(db, `Exp3/data`);

    const unsubscribe = onChildAdded(dataRef, (snapshot) => {
      const newData = snapshot.val();
      if (newData && newData.data1) {
        setCorrienteData((prev) => [...prev.slice(-19), newData.data1.current]);
        setVoltajeData((prev) => [...prev.slice(-19), newData.data1.voltage]);
        setContadorLabels((prev) => [...prev.slice(-19), newData.data1.cont || prev.length]);
        setVoltajeValue(newData.data1.voltage);
        setCorrienteValue(newData.data1.current);
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // 3. Listener de BackToFront (Handshake/EndMov) - ESPECÍFICO POR USUARIO
  useEffect(() => {
    if (!user) return;

    const btfRef = ref(db, `users/${user.uid}/Exp3/communication/BackToFront`);

    const unsubscribe = onValue(btfRef, (snapshot) => {
      const mensaje = snapshot.val();
      console.log("MENSAJE RECIBIDO DESDE FIREBASE:", mensaje); 
      if (mensaje === "EndMov") {
        console.log("Movimiento finalizado para este usuario");
        // Aquí puedes reactivar botones si los deshabilitaste
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // Función genérica para enviar comandos al nuevo Backend
  const enviarComando = (cmd) => {
    if (!user) {
        console.error("No hay usuario autenticado");
        return;
    }
    const commandRef = ref(db, `users/${user.uid}/Exp3/communication/FrontToBack`);
    set(commandRef, cmd).catch(err => console.error("Error enviando comando:", err));
  };

  const handleLimpiar = () => {
    setEstado("clean");
    enviarComando("c");
  };

  const handleMove = () => {
    enviarComando(`p${angulo}`);
  };

  const handleGuardar = () => {
    const nuevoDato = {
      [SUBSISTEMA3_COLUMNS[0]]: voltajeValue.toFixed(2),
      [SUBSISTEMA3_COLUMNS[1]]: corrienteValue.toFixed(2),
      [SUBSISTEMA3_COLUMNS[2]]: (voltajeValue * corrienteValue).toFixed(2), // Ejemplo Potencia
      [SUBSISTEMA3_COLUMNS[3]]: "1.00",
    };
    const nuevosDatos = [...datos, nuevoDato];
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
  };

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index);
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
  };

  const handleBack = async () => {
    enviarComando("n"); // Stop
    // Limpiar datos de Firebase si es necesario antes de salir
    const dataRef = ref(db, "Exp3/data");
    await remove(dataRef);
    navigate("/experiments/experimentChooser");
  };

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4}>*/
        {/* Columna Izquierda */}
       /* <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
            <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={handleLimpiar}
              disabled={estado === "clean"}
            >
              {CLEAN_BUTTON}
            </Button>
          </Paper>

          <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />

          <Box mt={2}>
            <Button variant="contained" onClick={handleGuardar}>
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

       */ {/* Columna Derecha */}
       /* <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
              {CAMERA_TITLE} <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
            </Typography>
            <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
              <iframe
                width="100%" height="400"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                title="Live Stream" frameBorder="0" allowFullScreen
              ></iframe>
            </Box>
          </Paper>

          <Box mt={3}>
             <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Control de Ángulo</Typography>
                <input
                    type="range" min="0" max="180" value={angulo}
                    onChange={(e) => setAngulo(e.target.value)}
                    style={{ width: "100%" }}
                />
                <Typography>Ángulo seleccionado: {angulo}°</Typography>
                <Button variant="contained" onClick={handleMove} fullWidth>Mover Panel</Button>
             </Paper>
          </Box>
        </Grid>
      </Grid>

      <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
        {BACK_BUTTON}
      </Button>
    </Box>
  );
};

export default Subsistema3;
*/




// import React, { useState, useEffect } from "react";
// import { Box, Paper, Typography, Grid } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// // Firebase
// import { getDatabase, ref, set, onValue, remove } from "firebase/database";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import app from "../../firebaseConfig.js";

// // Componentes (los tuyos)
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";

// // Strings (puedes ajustar los textos en tu archivo si quieres)
// import {
//   PAGE_TITLES,
// } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";

// import "../../assets/css/Elements/PaperStyles.css";

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const auth = getAuth(app);

//   // =========================================================
//   // ESTADOS
//   // =========================================================
//   const [currentUser, setCurrentUser] = useState(null);

//   // Pitch live + historial corto para gráfica (si la usas en otra parte)
//   const [pitchValue, setPitchValue] = useState(null);
//   const [pitchData, setPitchData] = useState([]);
//   const [timeLabels, setTimeLabels] = useState([]);

//   // Tabla local (guardado manual)
//   const [estado, setEstado] = useState("dirty");
//   const [datos, setDatos] = useState([]);

//   const [youtubeVideoId] = useState("nAQz4RMaHVA");

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   // Columnas para PITCH
//   const TABLE_COLUMNS = ["Pitch", "Hora"];

//   // =========================================================
//   // 1) AUTH: Detectar usuario
//   // =========================================================
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setCurrentUser(user);
//         console.log("✅ Usuario autenticado:", user.uid);
//       } else {
//         setCurrentUser(null);
//         console.warn("❌ No hay sesión activa.");
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   // =========================================================
//   // 2) Cargar tabla local + mandar "y" al entrar
//   // =========================================================
//   useEffect(() => {
//     const datosGuardados =
//       JSON.parse(localStorage.getItem("historicalData_subsistema3_pitch")) || [];
//     setDatos(datosGuardados);

//     if (currentUser) {
//       enviarComando("y"); // iniciar medición/streaming
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUser]);

//   // =========================================================
//   // 3) Listener LIVE pitch (por usuario)
//   // Ruta: users/{uid}/Exp3/live
//   // =========================================================
//   useEffect(() => {
//     if (!currentUser) return;

//     const liveRef = ref(db, `users/${currentUser.uid}/Exp3/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v || typeof v.pitch !== "number") return;

//       const pitch = v.pitch;
//       const label = v.timestamp
//         ? new Date(v.timestamp).toLocaleTimeString()
//         : new Date().toLocaleTimeString();

//       setPitchValue(pitch);
//       setPitchData((prev) => [...prev.slice(-19), pitch]);
//       setTimeLabels((prev) => [...prev.slice(-19), label]);
//     });

//     return () => unsubscribe();
//   }, [currentUser, db]);

//   // =========================================================
//   // 4) Listener BackToFront (por usuario) — opcional
//   // Ruta: users/{uid}/Exp3/communication/BackToFront
//   // =========================================================
//   useEffect(() => {
//     if (!currentUser) return;

//     const btfRef = ref(db, `users/${currentUser.uid}/Exp3/communication/BackToFront`);
//     const unsubscribe = onValue(btfRef, (snapshot) => {
//       const mensaje = snapshot.val();
//       if (!mensaje || mensaje === "x") return;

//       console.log("📩 BackToFront Exp3:", mensaje);
//       // Si tu Arduino manda EndMov para algún proceso, aquí lo capturas:
//       // if (mensaje === "EndMov") { ... }
//     });

//     return () => unsubscribe();
//   }, [currentUser, db]);

//   // =========================================================
//   // Enviar comandos a Exp3 (por usuario)
//   // =========================================================
//   const enviarComando = (cmd) => {
//     if (!currentUser) {
//       console.error("⛔ Acción bloqueada: esperando autenticación...");
//       return;
//     }
//     const commandRef = ref(
//       db,
//       `users/${currentUser.uid}/Exp3/communication/FrontToBack`
//     );

//     set(commandRef, cmd)
//       .then(() => console.log(`🚀 Comando "${cmd}" enviado.`))
//       .catch((err) => console.error("❌ Error enviando comando:", err));
//   };

//   // =========================================================
//   // UI actions
//   // =========================================================
//   const handleLimpiar = () => {
//     setEstado("clean");
//     // Limpieza local
//     setPitchData([]);
//     setTimeLabels([]);
//     setPitchValue(null);

//     enviarComando("c");
//   };

//   const handleGuardar = () => {
//     const now = new Date();
//     const row = {
//       [TABLE_COLUMNS[0]]: pitchValue === null ? "-" : pitchValue.toFixed(4),
//       [TABLE_COLUMNS[1]]: now.toLocaleTimeString(),
//     };

//     const nuevosDatos = [...datos, row];
//     setDatos(nuevosDatos);
//     localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
//     setEstado("dirty");
//   };

//   const handleEliminar = (index) => {
//     const nuevosDatos = datos.filter((_, i) => i !== index);
//     setDatos(nuevosDatos);
//     localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
//   };

//   const handleBack = async () => {
//     try {
//       // Detener streaming/medición
//       enviarComando("n");

//       if (currentUser) {
//         // Limpia solo lo de este usuario (opcional)
//         await remove(ref(db, `users/${currentUser.uid}/Exp3/live`));
//         // Si guardas histórico:
//         // await remove(ref(db, `users/${currentUser.uid}/Exp3/measurements`));
//       }
//     } catch (e) {
//       console.warn("⚠️ Error limpiando datos de Exp3:", e);
//     }

//     navigate("/experiments/experimentChooser");
//   };

//   // =========================================================
//   // Render
//   // =========================================================
//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         {/* Columna Izquierda */}
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Pitch actual:{" "}
//               <strong>
//                 {pitchValue === null ? "—" : `${pitchValue.toFixed(4)}`}
//               </strong>
//             </Typography>

//             <Button variant="contained" onClick={handleLimpiar} disabled={estado === "clean"}>
//               {CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datos}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={handleGuardar} disabled={pitchValue === null}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         {/* Columna Derecha */}
//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>

//           {/* Si luego quieres una gráfica, aquí puedes renderizarla usando pitchData y timeLabels */}
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;










// //
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import CircularProgress from "@mui/material/CircularProgress";

// import {
//   getDatabase,
//   ref,
//   set,
//   update,
//   onValue,
//   onChildAdded,
//   get,
//   onDisconnect,
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);
//   const shouldSendNOnUnmountRef = useRef(false);
//   const initKeyRef = useRef(`exp3_init_${UID_USUARIO}`);

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Inicialización
//   useEffect(() => {
//     if (!user) return;

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     const initKey = initKeyRef.current;

//     onDisconnect(fbRef).set("n");

//     const inicializar = async () => {
//       try {
//         const yaInicializado = sessionStorage.getItem(initKey) === "1";

//         if (!yaInicializado) {
//           await set(fbRef, "y");
//           sessionStorage.setItem(initKey, "1");
//         }

//         shouldSendNOnUnmountRef.current = true;
//       } catch (err) {
//         console.error("Error inicializando Exp3:", err);
//       }
//     };

//     inicializar();

//     return () => {
//       onDisconnect(fbRef).cancel().catch(() => {});

//       if (shouldSendNOnUnmountRef.current) {
//         set(fbRef, "n").catch(() => {});
//         sessionStorage.removeItem(initKey);
//       }

//       const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//       if (datosBasura.length > 0) {
//         const updates = {};
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });

//         update(ref(db), updates)
//           .then(() => {
//             console.log(`✅ Se eliminaron ${datosBasura.length} mediciones no guardadas de Exp3.`);
//           })
//           .catch((e) => {
//             console.error("❌ Error eliminando datos temporales de Exp3:", e);
//           });
//       }
//     };
//   }, [user, db, BASE_PATH, UID_USUARIO]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   const handleBack = async () => {
//     try {
//       await enviarComando("n");
//     } catch (e) {
//       console.warn("⚠️ Error cerrando Exp3:", e);
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || estado === "cleaning"}
//             >
//               {!isHardwareReady ? "Calibrating..." : estado === "cleaning" ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;





//nuvea corregida

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import CircularProgress from "@mui/material/CircularProgress";

// import { getDatabase, ref, set, update, onValue, onChildAdded, get } from "firebase/database";

// import app from "../../firebaseConfig.js";

// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";

// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // const UID_USUARIO = user?.uid || "invitado";
//   // const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // // ==========================================
//   // // NUEVO: CONTROL DE FLUJO (n -> y -> n)
//   // // ==========================================
//   // useEffect(() => {
//   //   // Si no hay usuario, no hacemos nada todavía
//   //   if (!user || UID_USUARIO === "invitado") return;

//   //   const iniciarSecuencia = async () => {
//   //     try {
//   //       // 1. Al arrancar: Enviar 'n' para silenciar
//   //       console.log("🤫 Pasos iniciales: Enviando 'n'...");
//   //       await enviarComando("n");

//   //       // 2. Esperar 1 segundo y enviar 'y' para entrar al experimento
//   //       setTimeout(async () => {
//   //         console.log("🚀 Entrando al experimento: Enviando 'y'...");
//   //         await enviarComando("y");
//   //       }, 1000);
//   //     } catch (error) {
//   //       console.error("Error en secuencia inicial:", error);
//   //     }
//   //   };

//   //   iniciarSecuencia();

//   //   // 3. Al salir (Desmontaje): Enviar 'n' para silenciar
//   //   return () => {
//   //     console.log("👋 Saliendo: Enviando 'n'...");
//   //     enviarComando("n");
//   //   };
//   // }, [user, UID_USUARIO]); 
//   // // ==========================================

//   // const [pitchValue, setPitchValue] = useState(null);
//   // const [voltageValue, setVoltageValue] = useState(null);
//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // 1. Añadimos un ref para asegurar que la 'y' se envíe una sola vez
//   const flujoIniciado = useRef(false);

//   // ==========================================
//   // CONTROL DE FLUJO: Solo 'y' al arrancar
//   // ==========================================
//   useEffect(() => {
//     if (!user || UID_USUARIO === "invitado") return;

//     // Si ya se envió la 'y', no hacemos nada más
//     if (!flujoIniciado.current) {
//       flujoIniciado.current = true; // Marcamos que ya se envió
      
//       const iniciarSecuencia = async () => {
//         try {
//           console.log("🚀 Entrando al experimento: Enviando 'y'...");
//           await enviarComando("y");
//         } catch (error) {
//           console.error("Error al iniciar el experimento:", error);
//         }
//       };

//       iniciarSecuencia();
//     }
    
//     // Eliminamos el return () => enviarComando("n") de aquí para 
//     // evitar que React Strict Mode mande la 'n' al instante.
//   }, [user, UID_USUARIO]); 
//   // ==========================================

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [isCleaning, setIsCleaning] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado de hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//       if (typeof v.isCleaning === "boolean") setIsCleaning(v.isCleaning);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Bloquear recarga/cierre mientras limpia o si hay datos sin guardar
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);

//       if (isCleaning) {
//         e.preventDefault();
//         e.returnValue = "";
//         return;
//       }

//       if (haySinGuardar) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [isCleaning, datosTemporales]);

//   // Trampa flecha atrás
//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);

//     const handlePopState = () => {
//       if (isCleaning) {
//         alert("⚠️ La limpieza está en curso. Espera a que termine antes de salir.");
//         window.history.pushState(null, null, window.location.pathname);
//         return;
//       }

//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);
//       if (haySinGuardar) {
//         const confirmar = window.confirm(
//           "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//         );
//         if (!confirmar) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }

//       navigate("/experiments/experimentChooser", { replace: true });
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [navigate, isCleaning, datosTemporales]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setIsCleaning(true);
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//       setIsCleaning(false);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   const handleBack = async () => {
//     if (isCleaning) {
//       alert("⚠️ La limpieza está en curso. Espera a que termine antes de salir.");
//       return;
//     }
  
//     if (hayDatosSinGuardar) {
//       const confirmar = window.confirm(
//         "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//       );
//       if (!confirmar) return;
  
//       const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//       if (datosBasura.length > 0) {
//         const updates = {};
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });
//         await update(ref(db), updates).catch((e) => {
//           console.error("Error eliminando datos temporales Exp3:", e);
//         });
//       }
//     }
  
//     // --- CAMBIO AQUÍ: Enviar 'n' antes de salir por el botón ---
//     console.log("🔙 Saliendo por botón: Enviando 'n'...");
//     await enviarComando("n");
//     // -----------------------------------------------------------
  
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || isCleaning}
//             >
//               {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;

/*import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

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
        const dbRef = ref(db, "Exp3/FrontToBack");
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
    const dbRef = ref(db, "Exp3/data"); // Escucha todo el nodo "Lectures"

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
    const dbRef = ref(db, "Exp3/BackToFront");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const mensaje = snapshot.val();
        console.log("Mensaje recibidooo:", mensaje);
        setIsSliderDisabled_1(false);
        setIsMoveButtonDisabled_1(false);
        setIsTextDisabled_1(false);
        setIsGuardarLecturaDisabled_1(false);
        change5sec(); //enviar mensaje de mover de nuevo
        hacerCambio();
        setEstado('dirty');

      }
    });
    return () => unsubscribe(); // 🔄 Limpieza del listener cuando el componente se desmonta
  }, [db]); // ✅ Se ejecuta al montar el componente y escucha cambios en Firebase


  // Estado del subsistema
  const [estado, setEstado] = useState("dirty"); // Por defecto, el subsistema está sucio

  // Estado para los datos de la tabla
  const [datos, setDatos] = useState([]);
  const [isGuardarLecturaDisabled_1, setIsGuardarLecturaDisabled_1] =
      useState(false); // Estado para habilitar/deshabilitar el boton de guardar datos
  
  
  const [youtubeVideoId] = useState("nAQz4RMaHVA");


  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);

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

  // Función para limpiar el subsistema
  const handleLimpiar = () => {
    setEstado("clean");
    try {
        const msg = "c"; // Mensaje a enviar
        const db = getDatabase(app);
        const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD
  
        set(docRef, msg).catch((error) => {
          alert("Error: " + error.message);
        });
  
        console.log(`Mensaje enviado: ${msg}`);
      } catch (error) {
        console.error("Error al enviar datos a Firebase:", error);
      }
  };

  // Función para descargar gráficos (pendiente de implementación)
  /*const handleDescargarGraficos = () => {
    alert("Funcionalidad de descarga pendiente de implementación");
  };*/

  // Descargar ambos gráficos en un solo archivo*/
  /*const handleDownloadBothData = () => {
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

  // Función para volver al menú anterior
  const handleBack = () => {
    noEnviarNuevoAngulo();
    change1hour();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };
  //Acciones al presionar el Boton Move (Envío de dato de ángulo)
  const envioDatos = async () => {
    setIsSliderDisabled_1(true);
    setIsSliderDisabled_Zenith(true);
    setIsMoveButtonDisabled_1(true);
    setIsGuardarLecturaDisabled_1(true);
    setIsTextDisabled_1(true);
    setactualPanelAngle(angulo);
    try {
      const msg = "p" + angulo; // Mensaje a enviar
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack"); // Ruta correcta en la BD

      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });

      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos a Firebase:", error);
    }

    // try {
    //   //const msg = anguloZenith
    //   const msg = "r" + angulo;
    //   const db = getDatabase(app);
    //   const docRef = ref(db, "Exp3/FrontToBack");
    //   set(docRef, msg)
    //     .catch((error) => {
    //       alert("Error: " + error.message);
    //     });
    //   console.log(`Mensaje enviado: ${messageToSend}`);
    // } catch (error) {
    //   console.error("Error al enviar datos seriales:", error);
    // }
    change5sec();
    hacerCambio();
  };

  //Envio de señal para 1 hora
  const change1hour = async () => {
    try {
      const msg = "s";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
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
      const docRef = ref(db, "Exp3/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };

  //Envío de señal para parar de enviar ángulos
  const noEnviarNuevoAngulo = async () => {
    try {
      const signal1hour = "n";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
      set(docRef, signal1hour).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${messageToSend}`);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
    hacerCambio();
  };
  //Envío de señal para parar de enviar ángulos
  const hacerCambio = async () => {
    try {
      const msg = "x";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp3/FrontToBack");
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
      const dbRef = ref(db, "Exp3/data"); // Obtén la referencia a la clave
  
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
*/
      {/* Boton para controlar arduinos */}
      {/*<Button variant="contained" marginTop={-2} marginBottom={3}>Controlar Arduino</Button>*/}

      {/* Contenedor con dos columnas */}
     // <Grid container spacing={4} alignItems="flex-start">
        {/* Columna Izquierda: Estado del subsistema, botón de limpieza y tabla */}
       // <Grid item xs={12} md={6}>
          {/* Estado del subsistema y botón de limpieza */}
        /*  <Paper
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
*/
          {/* Tabla de datos */}
         /* <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />
*/
          {/* Botón para guardar datos */}
         /* <Box mt={2}>
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
*/
        {/* Columna Derecha: Gráficos */}
       /* <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper
              className="paper-camera"
              sx={{
                p: 2,
                width: "100%",
                backgroundColor: "#121212",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
              >
                {CAMERA_TITLE}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "#e53935",
                    fontWeight: "bold",
                    ml: 1,
                  }}
                >
                  ● En vivo
                </Typography>
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: "400px",
                  mt: 1,
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                  title="Transmisión en vivo de YouTube"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "8px" }}
                ></iframe>
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Paper className="paper-graph">
              <GraphTitleWithTooltip 
                title={VOLTAGE_VS_TIME_TITLE} 
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />*/
              {/* Desactivado temporalmente por OzzyJames11 
              <div style={styles.smallGraph}>
                <Line
                  data={voltajeChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>*/}
           /* </Paper>
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
              */{/* Desactivado temporalmente por OzzyJames11 
              <div style={styles.smallGraph}>
                <Line
                  data={corrienteChart}
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>*/}
            /*</Paper>
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
*/
      {/* Botón para volver */}
     /* <Button
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

export default Subsistema3;*/








/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Firebase e Auth
import {
  getDatabase,
  ref,
  set,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import { getAuth } from "firebase/auth"; // Importante para el UID
import app from "../../firebaseConfig.js";

// Importación de componentes
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

// Importación de constantes y estilos
import {
  SUBSISTEMA3_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
import "../../assets/css/Elements/PaperStyles.css";

const Subsistema3 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const auth = getAuth(app);
  const user = auth.currentUser; // Obtenemos el usuario actual

  const {
    MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH, BACK_BUTTON, CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE, SUBSYSTEM_STATUS_TITLE, CURRENT_STATUS_LABEL, CLEAN_BUTTON,
  } = PAGE_TITLES;

  // Estados
  const [corrienteData, setCorrienteData] = useState([]);
  const [voltajeData, setVoltajeData] = useState([]);
  const [contadorLabels, setContadorLabels] = useState([]);
  const [voltajeValue, setVoltajeValue] = useState(0);
  const [corrienteValue, setCorrienteValue] = useState(0);
  const [estado, setEstado] = useState("dirty");
  const [datos, setDatos] = useState([]);
  const [youtubeVideoId] = useState("nAQz4RMaHVA");
  const [angulo, setAngulo] = useState(5);

  // 1. Efecto inicial: Cargar datos locales y enviar señal de inicio
  useEffect(() => {
    const datosGuardados = JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    setDatos(datosGuardados);
   
    if (user) {
      enviarComando("y"); // Señal de inicio 'y' según tu lógica anterior
    }
  }, [user]);

  // 2. Listener de Datos (Measurements) - Ahora basado en el UID del usuario
  useEffect(() => {
    if (!user) return;

    // Nota: El backend antiguo enviaba a Exp3/data, el nuevo lo maneja por usuario
    // Si el backend envía datos crudos a una ruta global, usa "Exp3/data"
    // Pero si quieres aislamiento total, el backend debería escribir en users/uid/Exp3/data
    const dataRef = ref(db, `Exp3/data`);

    const unsubscribe = onChildAdded(dataRef, (snapshot) => {
      const newData = snapshot.val();
      if (newData && newData.data1) {
        setCorrienteData((prev) => [...prev.slice(-19), newData.data1.current]);
        setVoltajeData((prev) => [...prev.slice(-19), newData.data1.voltage]);
        setContadorLabels((prev) => [...prev.slice(-19), newData.data1.cont || prev.length]);
        setVoltajeValue(newData.data1.voltage);
        setCorrienteValue(newData.data1.current);
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // 3. Listener de BackToFront (Handshake/EndMov) - ESPECÍFICO POR USUARIO
  useEffect(() => {
    if (!user) return;

    const btfRef = ref(db, `users/${user.uid}/Exp3/communication/BackToFront`);

    const unsubscribe = onValue(btfRef, (snapshot) => {
      const mensaje = snapshot.val();
      console.log("MENSAJE RECIBIDO DESDE FIREBASE:", mensaje); 
      if (mensaje === "EndMov") {
        console.log("Movimiento finalizado para este usuario");
        // Aquí puedes reactivar botones si los deshabilitaste
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // Función genérica para enviar comandos al nuevo Backend
  const enviarComando = (cmd) => {
    if (!user) {
        console.error("No hay usuario autenticado");
        return;
    }
    const commandRef = ref(db, `users/${user.uid}/Exp3/communication/FrontToBack`);
    set(commandRef, cmd).catch(err => console.error("Error enviando comando:", err));
  };

  const handleLimpiar = () => {
    setEstado("clean");
    enviarComando("c");
  };

  const handleMove = () => {
    enviarComando(`p${angulo}`);
  };

  const handleGuardar = () => {
    const nuevoDato = {
      [SUBSISTEMA3_COLUMNS[0]]: voltajeValue.toFixed(2),
      [SUBSISTEMA3_COLUMNS[1]]: corrienteValue.toFixed(2),
      [SUBSISTEMA3_COLUMNS[2]]: (voltajeValue * corrienteValue).toFixed(2), // Ejemplo Potencia
      [SUBSISTEMA3_COLUMNS[3]]: "1.00",
    };
    const nuevosDatos = [...datos, nuevoDato];
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
  };

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index);
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3", JSON.stringify(nuevosDatos));
  };

  const handleBack = async () => {
    enviarComando("n"); // Stop
    // Limpiar datos de Firebase si es necesario antes de salir
    const dataRef = ref(db, "Exp3/data");
    await remove(dataRef);
    navigate("/experiments/experimentChooser");
  };

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4}>*/
        {/* Columna Izquierda */}
       /* <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
            <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={handleLimpiar}
              disabled={estado === "clean"}
            >
              {CLEAN_BUTTON}
            </Button>
          </Paper>

          <DataTable
            columns={SUBSISTEMA3_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />

          <Box mt={2}>
            <Button variant="contained" onClick={handleGuardar}>
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

       */ {/* Columna Derecha */}
       /* <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
              {CAMERA_TITLE} <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
            </Typography>
            <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
              <iframe
                width="100%" height="400"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                title="Live Stream" frameBorder="0" allowFullScreen
              ></iframe>
            </Box>
          </Paper>

          <Box mt={3}>
             <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Control de Ángulo</Typography>
                <input
                    type="range" min="0" max="180" value={angulo}
                    onChange={(e) => setAngulo(e.target.value)}
                    style={{ width: "100%" }}
                />
                <Typography>Ángulo seleccionado: {angulo}°</Typography>
                <Button variant="contained" onClick={handleMove} fullWidth>Mover Panel</Button>
             </Paper>
          </Box>
        </Grid>
      </Grid>

      <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
        {BACK_BUTTON}
      </Button>
    </Box>
  );
};

export default Subsistema3;
*/




// import React, { useState, useEffect } from "react";
// import { Box, Paper, Typography, Grid } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// // Firebase
// import { getDatabase, ref, set, onValue, remove } from "firebase/database";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import app from "../../firebaseConfig.js";

// // Componentes (los tuyos)
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";

// // Strings (puedes ajustar los textos en tu archivo si quieres)
// import {
//   PAGE_TITLES,
// } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";

// import "../../assets/css/Elements/PaperStyles.css";

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const auth = getAuth(app);

//   // =========================================================
//   // ESTADOS
//   // =========================================================
//   const [currentUser, setCurrentUser] = useState(null);

//   // Pitch live + historial corto para gráfica (si la usas en otra parte)
//   const [pitchValue, setPitchValue] = useState(null);
//   const [pitchData, setPitchData] = useState([]);
//   const [timeLabels, setTimeLabels] = useState([]);

//   // Tabla local (guardado manual)
//   const [estado, setEstado] = useState("dirty");
//   const [datos, setDatos] = useState([]);

//   const [youtubeVideoId] = useState("nAQz4RMaHVA");

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   // Columnas para PITCH
//   const TABLE_COLUMNS = ["Pitch", "Hora"];

//   // =========================================================
//   // 1) AUTH: Detectar usuario
//   // =========================================================
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setCurrentUser(user);
//         console.log("✅ Usuario autenticado:", user.uid);
//       } else {
//         setCurrentUser(null);
//         console.warn("❌ No hay sesión activa.");
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   // =========================================================
//   // 2) Cargar tabla local + mandar "y" al entrar
//   // =========================================================
//   useEffect(() => {
//     const datosGuardados =
//       JSON.parse(localStorage.getItem("historicalData_subsistema3_pitch")) || [];
//     setDatos(datosGuardados);

//     if (currentUser) {
//       enviarComando("y"); // iniciar medición/streaming
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUser]);

//   // =========================================================
//   // 3) Listener LIVE pitch (por usuario)
//   // Ruta: users/{uid}/Exp3/live
//   // =========================================================
//   useEffect(() => {
//     if (!currentUser) return;

//     const liveRef = ref(db, `users/${currentUser.uid}/Exp3/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v || typeof v.pitch !== "number") return;

//       const pitch = v.pitch;
//       const label = v.timestamp
//         ? new Date(v.timestamp).toLocaleTimeString()
//         : new Date().toLocaleTimeString();

//       setPitchValue(pitch);
//       setPitchData((prev) => [...prev.slice(-19), pitch]);
//       setTimeLabels((prev) => [...prev.slice(-19), label]);
//     });

//     return () => unsubscribe();
//   }, [currentUser, db]);

//   // =========================================================
//   // 4) Listener BackToFront (por usuario) — opcional
//   // Ruta: users/{uid}/Exp3/communication/BackToFront
//   // =========================================================
//   useEffect(() => {
//     if (!currentUser) return;

//     const btfRef = ref(db, `users/${currentUser.uid}/Exp3/communication/BackToFront`);
//     const unsubscribe = onValue(btfRef, (snapshot) => {
//       const mensaje = snapshot.val();
//       if (!mensaje || mensaje === "x") return;

//       console.log("📩 BackToFront Exp3:", mensaje);
//       // Si tu Arduino manda EndMov para algún proceso, aquí lo capturas:
//       // if (mensaje === "EndMov") { ... }
//     });

//     return () => unsubscribe();
//   }, [currentUser, db]);

//   // =========================================================
//   // Enviar comandos a Exp3 (por usuario)
//   // =========================================================
//   const enviarComando = (cmd) => {
//     if (!currentUser) {
//       console.error("⛔ Acción bloqueada: esperando autenticación...");
//       return;
//     }
//     const commandRef = ref(
//       db,
//       `users/${currentUser.uid}/Exp3/communication/FrontToBack`
//     );

//     set(commandRef, cmd)
//       .then(() => console.log(`🚀 Comando "${cmd}" enviado.`))
//       .catch((err) => console.error("❌ Error enviando comando:", err));
//   };

//   // =========================================================
//   // UI actions
//   // =========================================================
//   const handleLimpiar = () => {
//     setEstado("clean");
//     // Limpieza local
//     setPitchData([]);
//     setTimeLabels([]);
//     setPitchValue(null);

//     enviarComando("c");
//   };

//   const handleGuardar = () => {
//     const now = new Date();
//     const row = {
//       [TABLE_COLUMNS[0]]: pitchValue === null ? "-" : pitchValue.toFixed(4),
//       [TABLE_COLUMNS[1]]: now.toLocaleTimeString(),
//     };

//     const nuevosDatos = [...datos, row];
//     setDatos(nuevosDatos);
//     localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
//     setEstado("dirty");
//   };

//   const handleEliminar = (index) => {
//     const nuevosDatos = datos.filter((_, i) => i !== index);
//     setDatos(nuevosDatos);
//     localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
//   };

//   const handleBack = async () => {
//     try {
//       // Detener streaming/medición
//       enviarComando("n");

//       if (currentUser) {
//         // Limpia solo lo de este usuario (opcional)
//         await remove(ref(db, `users/${currentUser.uid}/Exp3/live`));
//         // Si guardas histórico:
//         // await remove(ref(db, `users/${currentUser.uid}/Exp3/measurements`));
//       }
//     } catch (e) {
//       console.warn("⚠️ Error limpiando datos de Exp3:", e);
//     }

//     navigate("/experiments/experimentChooser");
//   };

//   // =========================================================
//   // Render
//   // =========================================================
//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         {/* Columna Izquierda */}
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Pitch actual:{" "}
//               <strong>
//                 {pitchValue === null ? "—" : `${pitchValue.toFixed(4)}`}
//               </strong>
//             </Typography>

//             <Button variant="contained" onClick={handleLimpiar} disabled={estado === "clean"}>
//               {CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datos}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={handleGuardar} disabled={pitchValue === null}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         {/* Columna Derecha */}
//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>

//           {/* Si luego quieres una gráfica, aquí puedes renderizarla usando pitchData y timeLabels */}
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;










// //
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import CircularProgress from "@mui/material/CircularProgress";

// import {
//   getDatabase,
//   ref,
//   set,
//   update,
//   onValue,
//   onChildAdded,
//   get,
//   onDisconnect,
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);
//   const shouldSendNOnUnmountRef = useRef(false);
//   const initKeyRef = useRef(`exp3_init_${UID_USUARIO}`);

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Inicialización
//   useEffect(() => {
//     if (!user) return;

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     const initKey = initKeyRef.current;

//     onDisconnect(fbRef).set("n");

//     const inicializar = async () => {
//       try {
//         const yaInicializado = sessionStorage.getItem(initKey) === "1";

//         if (!yaInicializado) {
//           await set(fbRef, "y");
//           sessionStorage.setItem(initKey, "1");
//         }

//         shouldSendNOnUnmountRef.current = true;
//       } catch (err) {
//         console.error("Error inicializando Exp3:", err);
//       }
//     };

//     inicializar();

//     return () => {
//       onDisconnect(fbRef).cancel().catch(() => {});

//       if (shouldSendNOnUnmountRef.current) {
//         set(fbRef, "n").catch(() => {});
//         sessionStorage.removeItem(initKey);
//       }

//       const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//       if (datosBasura.length > 0) {
//         const updates = {};
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });

//         update(ref(db), updates)
//           .then(() => {
//             console.log(`✅ Se eliminaron ${datosBasura.length} mediciones no guardadas de Exp3.`);
//           })
//           .catch((e) => {
//             console.error("❌ Error eliminando datos temporales de Exp3:", e);
//           });
//       }
//     };
//   }, [user, db, BASE_PATH, UID_USUARIO]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   const handleBack = async () => {
//     try {
//       await enviarComando("n");
//     } catch (e) {
//       console.warn("⚠️ Error cerrando Exp3:", e);
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || estado === "cleaning"}
//             >
//               {!isHardwareReady ? "Calibrating..." : estado === "cleaning" ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="400"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;





// ozzyjames11: version casi final
// ESTE CODIGO ES EL QUE FUNCIONA BIEN HASTA EL MOMENTO
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import CircularProgress from "@mui/material/CircularProgress";

// import { getDatabase, ref, set, update, onValue, onChildAdded, get, remove, onDisconnect } from "firebase/database";

// import app from "../../firebaseConfig.js";

// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";

// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// let subsistema3Activo = false;
// let timeoutCierre3 = null;

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // const UID_USUARIO = user?.uid || "invitado";
//   // const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // // ==========================================
//   // // NUEVO: CONTROL DE FLUJO (n -> y -> n)
//   // // ==========================================
//   // useEffect(() => {
//   //   // Si no hay usuario, no hacemos nada todavía
//   //   if (!user || UID_USUARIO === "invitado") return;

//   //   const iniciarSecuencia = async () => {
//   //     try {
//   //       // 1. Al arrancar: Enviar 'n' para silenciar
//   //       console.log("🤫 Pasos iniciales: Enviando 'n'...");
//   //       await enviarComando("n");

//   //       // 2. Esperar 1 segundo y enviar 'y' para entrar al experimento
//   //       setTimeout(async () => {
//   //         console.log("🚀 Entrando al experimento: Enviando 'y'...");
//   //         await enviarComando("y");
//   //       }, 1000);
//   //     } catch (error) {
//   //       console.error("Error en secuencia inicial:", error);
//   //     }
//   //   };

//   //   iniciarSecuencia();

//   //   // 3. Al salir (Desmontaje): Enviar 'n' para silenciar
//   //   return () => {
//   //     console.log("👋 Saliendo: Enviando 'n'...");
//   //     enviarComando("n");
//   //   };
//   // }, [user, UID_USUARIO]); 
//   // // ==========================================

//   // const [pitchValue, setPitchValue] = useState(null);
//   // const [voltageValue, setVoltageValue] = useState(null);
//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // 1. Añadimos un ref para asegurar que la 'y' se envíe una sola vez
//   // const flujoIniciado = useRef(false);

//   // ==========================================
//   // CONTROL DE FLUJO: 'y' al arrancar, 'n' al salir
//   // ==========================================
//   useEffect(() => {
//     if (!user || UID_USUARIO === "invitado") return;

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

//     // Seguro en caso de que cierren la pestaña abruptamente
//     onDisconnect(fbRef).set("n");

//     // Si existe un cierre pendiente (por Strict Mode o un re-render muy rápido), lo cancelamos
//     if (timeoutCierre3) {
//       clearTimeout(timeoutCierre3);
//       timeoutCierre3 = null;
//     }

//     // Solo enviamos 'y' si el subsistema no estaba activo previamente
//     if (!subsistema3Activo) {
//       subsistema3Activo = true;
//       console.log("🚀 Entrando al experimento: Enviando 'y'...");
//       set(fbRef, "y").catch(err => console.error(err));
//     }
    
//     // Al desmontarse el componente (cambiar de página en el Header)
//     return () => {
//       // Damos 500ms de gracia. Si React vuelve a montar el componente de inmediato, 
//       // el clearTimeout de arriba anulará esta salida.
//       timeoutCierre3 = setTimeout(() => {
//         subsistema3Activo = false;
//         console.log("🧹 Saliendo verdaderamente del experimento: Enviando 'n'...");
//         set(fbRef, "n").catch(() => {});
//         onDisconnect(fbRef).cancel();

//         // Limpiamos los datos basura al salir por el Header
//         const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//         if (datosBasura.length > 0) {
//           const updates = {};
//           datosBasura.forEach((d) => {
//             updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//           });
//           update(ref(db), updates).catch((e) => console.error(e));
//         }
//       }, 500); 
//     };
//   }, [user, UID_USUARIO, db, BASE_PATH]); 
//   // ==========================================

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [isCleaning, setIsCleaning] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado de hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//       if (typeof v.isCleaning === "boolean") setIsCleaning(v.isCleaning);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Bloquear recarga/cierre mientras limpia o si hay datos sin guardar
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);

//       if (isCleaning) {
//         e.preventDefault();
//         e.returnValue = "";
//         return;
//       }

//       if (haySinGuardar) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [isCleaning, datosTemporales]);

//   // Trampa flecha atrás
//   // useEffect(() => {
//   //   window.history.pushState(null, null, window.location.pathname);

//   //   const handlePopState = () => {
//   //     if (isCleaning) {
//   //       alert("⚠️ La limpieza está en curso. Espera a que termine antes de salir.");
//   //       window.history.pushState(null, null, window.location.pathname);
//   //       return;
//   //     }

//   //     const haySinGuardar = datosTemporales.some((d) => !d.isSaved);
//   //     if (haySinGuardar) {
//   //       const confirmar = window.confirm(
//   //         "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//   //       );
//   //       if (!confirmar) {
//   //         window.history.pushState(null, null, window.location.pathname);
//   //         return;
//   //       }
//   //     }

//   //     navigate("/experiments/experimentChooser", { replace: true });
//   //   };
//   // Trampa flecha atrás
//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);

//     const handlePopState = () => {
//       // 🛑 PRIORIDAD 1: LIMPIEZA EN PROGRESO
//       if (isCleaning) {
//         window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
//         window.history.pushState(null, null, window.location.pathname);
//         return;
//       }

//       // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR
//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);
//       if (haySinGuardar) {
//         const confirmar = window.confirm(
//           "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
//         );
//         if (!confirmar) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }

//       navigate("/experiments/experimentChooser", { replace: true });
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [navigate, isCleaning, datosTemporales]);

//   // const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   // const enviarComando = async (cmd) => {

//     // ==================== VARIABLES GLOBALES PARA EL HEADER ====================
//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   useEffect(() => {
//     window.barridoEnProgreso = isCleaning; 
//     window.datosEnPeligro = hayDatosSinGuardar;
    
//     return () => {
//       window.barridoEnProgreso = false;
//       window.datosEnPeligro = false;
//     };
//   }, [isCleaning, hayDatosSinGuardar]);
//   // ===========================================================================

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setIsCleaning(true);
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//       setIsCleaning(false);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   // const handleBack = async () => {
//   //   if (isCleaning) {
//   //     alert("⚠️ La limpieza está en curso. Espera a que termine antes de salir.");
//   //     return;
//   //   }
  
//   //   if (hayDatosSinGuardar) {
//   //     const confirmar = window.confirm(
//   //       "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//   //     );
//   //     if (!confirmar) return;
  
//   //     const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//   //     if (datosBasura.length > 0) {
//   //       const updates = {};
//   //       datosBasura.forEach((d) => {
//   //         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//   //       });
//   //       await update(ref(db), updates).catch((e) => {
//   //         console.error("Error eliminando datos temporales Exp3:", e);
//   //       });
//   //     }
//   //   }
  
//   //   // --- CAMBIO AQUÍ: Enviar 'n' antes de salir por el botón ---
//   //   console.log("🔙 Saliendo por botón: Enviando 'n'...");
//   //   await enviarComando("n");
//   //   // -----------------------------------------------------------
  
//   //   navigate("/experiments/experimentChooser");
//   // };
//   // ==================== BOTÓN GO BACK ====================
//   const handleBack = () => {
//     // 🛑 PRIORIDAD 1: LIMPIEZA EN PROGRESO
//     if (isCleaning) {
//       window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
//       return;
//     }
  
//     // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR
//     if (hayDatosSinGuardar) {
//       const confirmar = window.confirm(
//         "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
//       );
//       if (!confirmar) return;
//     }
  
//     // Ya no es necesario mandar la 'n' ni borrar basura aquí manualmente.
//     // Al ejecutar el navigate, el componente se desmonta y el código del 
//     // "CONTROL DE FLUJO" (Cambio 1) manda la 'n' y borra la basura en automático.
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || isCleaning}
//             >
//               {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//             <iframe
//               width="100%"
//               height="400"
//               src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1&playsinline=1"
//               title="Live Stream"
//               frameBorder="0"
//               allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
//               allowFullScreen
//             />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;









// Funciona bien, es la primera idea, necesita correccion de
// formatos de DataTable y evitar generar graficos de mas
// si funciona

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import CircularProgress from "@mui/material/CircularProgress";

// import { getDatabase, ref, set, update, onValue, onChildAdded, get, onDisconnect } from "firebase/database";
// import app from "../../firebaseConfig.js";

// // IMPORTACIONES NUEVAS PARA TABLA PERSONALIZADA Y GRÁFICOS
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
// import { Bar } from "react-chartjs-2";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import { PAGE_TITLES, GRAPH_DESCRIPTIONS } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// import DataTable from "../../components/Elements/DataTable";

// const TABLE_COLUMNS = ["Pitch", "Voltage", "Current", "Status", "Hora"];

// let subsistema3Activo = false;
// let timeoutCierre3 = null;

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);


//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // 1. Añadimos un ref para asegurar que la 'y' se envíe una sola vez
//   // const flujoIniciado = useRef(false);

//   // ==========================================
//   // CONTROL DE FLUJO: 'y' al arrancar, 'n' al salir
//   // ==========================================
//   useEffect(() => {
//     if (!user || UID_USUARIO === "invitado") return;

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

//     // Seguro en caso de que cierren la pestaña abruptamente
//     onDisconnect(fbRef).set("n");

//     // Si existe un cierre pendiente (por Strict Mode o un re-render muy rápido), lo cancelamos
//     if (timeoutCierre3) {
//       clearTimeout(timeoutCierre3);
//       timeoutCierre3 = null;
//     }

//     // Solo enviamos 'y' si el subsistema no estaba activo previamente
//     if (!subsistema3Activo) {
//       subsistema3Activo = true;
//       console.log("🚀 Entrando al experimento: Enviando 'y'...");
//       set(fbRef, "y").catch(err => console.error(err));
//     }
    
//     // Al desmontarse el componente (cambiar de página en el Header)
//     return () => {
//       // Damos 500ms de gracia. Si React vuelve a montar el componente de inmediato, 
//       // el clearTimeout de arriba anulará esta salida.
//       timeoutCierre3 = setTimeout(() => {
//         subsistema3Activo = false;
//         console.log("🧹 Saliendo verdaderamente del experimento: Enviando 'n'...");
//         set(fbRef, "n").catch(() => {});
//         onDisconnect(fbRef).cancel();

//         // Limpiamos los datos basura al salir por el Header
//         const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//         if (datosBasura.length > 0) {
//           const updates = {};
//           datosBasura.forEach((d) => {
//             updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//           });
//           update(ref(db), updates).catch((e) => console.error(e));
//         }
//       }, 500); 
//     };
//   }, [user, UID_USUARIO, db, BASE_PATH]); 
//   // ==========================================

//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [isCleaning, setIsCleaning] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // Estado de hardware
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   // Live data
//   useEffect(() => {
//     if (!user) return;

//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//       if (typeof v.isCleaning === "boolean") setIsCleaning(v.isCleaning);
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Measurements
//   useEffect(() => {
//     if (!user) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (!newData) return;

//       setDatosTemporales((prev) => {
//         const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//         return yaExiste ? prev : [...prev, newData];
//       });
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // Bloquear recarga/cierre mientras limpia o si hay datos sin guardar
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);

//       if (isCleaning) {
//         e.preventDefault();
//         e.returnValue = "";
//         return;
//       }

//       if (haySinGuardar) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [isCleaning, datosTemporales]);

//   // Trampa flecha atrás
//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);

//     const handlePopState = () => {
//       // 🛑 PRIORIDAD 1: LIMPIEZA EN PROGRESO
//       if (isCleaning) {
//         window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
//         window.history.pushState(null, null, window.location.pathname);
//         return;
//       }

//       // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR
//       const haySinGuardar = datosTemporales.some((d) => !d.isSaved);
//       if (haySinGuardar) {
//         const confirmar = window.confirm(
//           "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
//         );
//         if (!confirmar) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }

//       navigate("/experiments/experimentChooser", { replace: true });
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [navigate, isCleaning, datosTemporales]);

//   // const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   // const enviarComando = async (cmd) => {

//     // ==================== VARIABLES GLOBALES PARA EL HEADER ====================
//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   useEffect(() => {
//     window.barridoEnProgreso = isCleaning; 
//     window.datosEnPeligro = hayDatosSinGuardar;
    
//     return () => {
//       window.barridoEnProgreso = false;
//       window.datosEnPeligro = false;
//     };
//   }, [isCleaning, hayDatosSinGuardar]);
//   // ===========================================================================

//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setIsCleaning(true);
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//       setIsCleaning(false);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) {
//       alert("No hay nuevos datos para guardar.");
//       return;
//     }

//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));

//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp3 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp3:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (index) => {
//     const datoOriginal = datosTemporales[index];
//     if (!datoOriginal?.timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${datoOriginal.timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== datoOriginal.timestamp));
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   // ==================== BOTÓN GO BACK ====================
//   const handleBack = () => {
//     // 🛑 PRIORIDAD 1: LIMPIEZA EN PROGRESO
//     if (isCleaning) {
//       window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
//       return;
//     }
  
//     // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR
//     if (hayDatosSinGuardar) {
//       const confirmar = window.confirm(
//         "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
//       );
//       if (!confirmar) return;
//     }
  
//     // Ya no es necesario mandar la 'n' ni borrar basura aquí manualmente.
//     // Al ejecutar el navigate, el componente se desmonta y el código del 
//     // "CONTROL DE FLUJO" (Cambio 1) manda la 'n' y borra la basura en automático.
//     navigate("/experiments/experimentChooser");
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || isCleaning}
//             >
//               {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>




// {/* aasdf */}
//           {/* <DataTable
//             columns={TABLE_COLUMNS}
//             data={datosTemporales.map((d) => ({
//               [TABLE_COLUMNS[0]]: d.pitch?.toFixed ? d.pitch.toFixed(2) : "—",
//               [TABLE_COLUMNS[1]]: d.voltage?.toFixed ? d.voltage.toFixed(2) : "—",
//               [TABLE_COLUMNS[2]]: d.current?.toFixed ? d.current.toFixed(2) : "—",
//               [TABLE_COLUMNS[3]]: d.panelStatus || "—",
//               [TABLE_COLUMNS[4]]: d.timestamp
//                 ? new Date(d.timestamp).toLocaleTimeString()
//                 : "—",
//             }))}
//             onDelete={handleEliminar}
//           />

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper
//             className="paper-camera"
//             sx={{
//               p: 2,
//               backgroundColor: "#121212",
//               color: "#fff",
//               borderRadius: "12px"
//             }}
//           >
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
//                 ● En vivo
//               </span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
//             <iframe
//               width="100%"
//               height="400"
//               src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1&playsinline=1"
//               title="Live Stream"
//               frameBorder="0"
//               allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
//               allowFullScreen
//             />
//             </Box>
//           </Paper>






//         </Grid>
//       </Grid> */}
//       {/* NUEVA TABLA PERSONALIZADA (SUCIO/LIMPIO) */}
//       <TableContainer component={Paper} sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
//             <Table size="small">
//               <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
//                 <TableRow>
//                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>Angle</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>Voltage (V)</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>Current (A)</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>Efficiency (%)</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fill Factor</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {datosTemporales.map((row, index) => (
//                   <React.Fragment key={row.timestamp}>
//                     {/* Fila 1: Datos Sucios */}
//                     <TableRow>
//                       <TableCell align="center" rowSpan={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>{row.angle}°</TableCell>
//                       <TableCell align="center"><b>{row.Vo?.toFixed(2)}</b> <span style={{color: '#8d6e63', fontSize: '0.8em'}}>(Dirty)</span></TableCell>
//                       <TableCell align="center">{row.Io?.toFixed(2)}</TableCell>
//                       <TableCell align="center">{(row.Eo * 100)?.toFixed(2)}</TableCell>
//                       <TableCell align="center">{row.FFo?.toFixed(2)}</TableCell>
//                       <TableCell align="center" rowSpan={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>
//                         <IconButton onClick={() => handleEliminar(index)}>
//                           <DeleteIcon sx={{ color: '#d84315' }} />
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                     {/* Fila 2: Datos Limpios */}
//                     <TableRow>
//                       <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}><b>{row.Vf?.toFixed(2)}</b> <span style={{color: '#1976d2', fontSize: '0.8em'}}>(Clean)</span></TableCell>
//                       <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}>{row.If?.toFixed(2)}</TableCell>
//                       <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}>{(row.Ef * 100)?.toFixed(2)}</TableCell>
//                       <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}>{row.FFf?.toFixed(2)}</TableCell>
//                     </TableRow>
//                   </React.Fragment>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Box mt={2}>
//             <Button variant="contained" onClick={guardarDatos} disabled={!hayDatosSinGuardar}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         {/* COLUMNA DERECHA: CÁMARA Y GRÁFICOS */}
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px", mb: 3 }}>
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
//             </Typography>

//             <Box sx={{ width: "100%", height: "300px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="100%"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>

//           {/* GRÁFICO 1: VOLTAGE */}
//           <Paper className="paper-graph" sx={{ p: 2, mb: 3 }}>
//             <GraphTitleWithTooltip title="Voltage Comparison (V)" description="Comparison of Voltage before (Dirty) and after (Clean) the cleaning process." />
//             <Box mt={2} sx={{ height: '250px' }}>
//               <Bar 
//                 data={{
//                   labels: datosTemporales.map((_, i) => `Test ${i + 1}`),
//                   datasets: [
//                     { label: "Dirty (Vo)", data: datosTemporales.map(d => d.Vo), backgroundColor: "#8d6e63" },
//                     { label: "Clean (Vf)", data: datosTemporales.map(d => d.Vf), backgroundColor: "#1976d2" }
//                   ]
//                 }}
//                 options={{
//                   responsive: true, maintainAspectRatio: false,
//                   plugins: {
//                     tooltip: {
//                       callbacks: {
//                         label: function(context) {
//                           const d = datosTemporales[context.dataIndex];
//                           const isDirty = context.datasetIndex === 0;
//                           return isDirty 
//                             ? [` Voltage: ${d.Vo?.toFixed(2)} V`, ` Current: ${d.Io?.toFixed(2)} A`, ` Efficiency: ${(d.Eo*100)?.toFixed(2)} %`, ` Fill Factor: ${d.FFo?.toFixed(2)}`]
//                             : [` Voltage: ${d.Vf?.toFixed(2)} V`, ` Current: ${d.If?.toFixed(2)} A`, ` Efficiency: ${(d.Ef*100)?.toFixed(2)} %`, ` Fill Factor: ${d.FFf?.toFixed(2)}`];
//                         }
//                       }
//                     }
//                   }
//                 }}
//               />
//             </Box>
//           </Paper>

//           {/* GRÁFICO 2: CURRENT */}
//           <Paper className="paper-graph" sx={{ p: 2 }}>
//             <GraphTitleWithTooltip title="Current Comparison (A)" description="Comparison of Current before (Dirty) and after (Clean) the cleaning process." />
//             <Box mt={2} sx={{ height: '250px' }}>
//               <Bar 
//                 data={{
//                   labels: datosTemporales.map((_, i) => `Test ${i + 1}`),
//                   datasets: [
//                     { label: "Dirty (Io)", data: datosTemporales.map(d => d.Io), backgroundColor: "#ffb74d" },
//                     { label: "Clean (If)", data: datosTemporales.map(d => d.If), backgroundColor: "#4caf50" }
//                   ]
//                 }}
//                 options={{
//                   responsive: true, maintainAspectRatio: false,
//                   plugins: {
//                     tooltip: {
//                       callbacks: {
//                         label: function(context) {
//                           const d = datosTemporales[context.dataIndex];
//                           const isDirty = context.datasetIndex === 0;
//                           return isDirty 
//                             ? [` Current: ${d.Io?.toFixed(2)} A`, ` Voltage: ${d.Vo?.toFixed(2)} V`, ` Efficiency: ${(d.Eo*100)?.toFixed(2)} %`, ` Fill Factor: ${d.FFo?.toFixed(2)}`]
//                             : [` Current: ${d.If?.toFixed(2)} A`, ` Voltage: ${d.Vf?.toFixed(2)} V`, ` Efficiency: ${(d.Ef*100)?.toFixed(2)} %`, ` Fill Factor: ${d.FFf?.toFixed(2)}`];
//                         }
//                       }
//                     }
//                   }
//                 }}
//               />
//             </Box>
//           </Paper>

//         </Grid>
//       </Grid>

//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={handleBack}
//         align="center"
//         marginTop={4}
//       >
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema3;








// SI FUNCIONA
// PERO TIENE EL PROBLEMA DE Y - N, VOY A PROBAR EL SIGUIENTE


// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Grid, IconButton } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import CircularProgress from "@mui/material/CircularProgress";
// import { Save, CloudDone } from "@mui/icons-material";
// import DeleteIcon from "@mui/icons-material/Delete";

// // Firebase
// import { getDatabase, ref, set, update, onValue, onChildAdded, get, onDisconnect } from "firebase/database";
// import app from "../../firebaseConfig.js";

// // Estilos y Componentes genéricos
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import { PAGE_TITLES } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
// import "../../assets/css/Elements/PaperStyles.css";

// // Importar CSS de la tabla original para mantener la estética
// import tableStyles from "../../assets/css/Elements/DataTable.module.css";
// import TooltipHeader from "../../components/Elements/TooltipHeader";
// import { COMMON_TOOLTIPS } from "../../assets/Strings/Experiments/CommonTooltips.jsx";

// // Importar Chart.js para los gráficos de barras
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
// import { Bar } from "react-chartjs-2";
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// const Subsistema3 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

//   // ==========================================
//   // ESTADOS DEL COMPONENTE
//   // ==========================================
//   const [pitchValue, setPitchValue] = useState(null);
//   const [voltageValue, setVoltageValue] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [estado, setEstado] = useState("dirty");

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [isCleaning, setIsCleaning] = useState(false);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const datosTemporalesRef = useRef([]);

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     CAMERA_TITLE,
//     SUBSYSTEM_STATUS_TITLE,
//     CURRENT_STATUS_LABEL,
//     CLEAN_BUTTON,
//   } = PAGE_TITLES;

//   useEffect(() => {
//     datosTemporalesRef.current = datosTemporales;
//   }, [datosTemporales]);

//   // =========================================================================
//   // 1. VARIABLES GLOBALES PARA EL HEADER
//   // =========================================================================
//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   useEffect(() => {
//     window.barridoEnProgreso = isCleaning; 
//     window.datosEnPeligro = hayDatosSinGuardar;
    
//     return () => {
//       window.barridoEnProgreso = false;
//       window.datosEnPeligro = false;
//     };
//   }, [isCleaning, hayDatosSinGuardar]);

//   // =========================================================================
//   // 2. INICIALIZACIÓN ('y') Y DESMONTAJE ('n')
//   // =========================================================================
//   const flujoIniciado = useRef(false);
//   useEffect(() => {
//     if (!user || UID_USUARIO === "invitado") return;

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     onDisconnect(fbRef).set("n");

//     if (!flujoIniciado.current) {
//       flujoIniciado.current = true;
//       console.log("🚀 Entrando al experimento 3: Enviando 'y'...");
//       set(fbRef, "y").catch(err => console.error(err));
//     }

//     return () => {
//       console.log("🧹 Saliendo del experimento: Enviando 'n'...");
//       set(fbRef, "n").catch(() => {});
//       onDisconnect(fbRef).cancel();

//       const datosBasura = datosTemporalesRef.current.filter((d) => d.isSaved === false);
//       if (datosBasura.length > 0) {
//         const updates = {};
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });
//         update(ref(db), updates).catch((e) => console.error(e));
//       }
//     };
//   }, [user, UID_USUARIO, db, BASE_PATH]);

//   // =========================================================================
//   // 3. LECTURA DE HARDWARE Y DATOS FIREBASE
//   // =========================================================================
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   useEffect(() => {
//     if (!user) return;
//     const liveRef = ref(db, `${BASE_PATH}/live`);
//     const unsubscribe = onValue(liveRef, (snapshot) => {
//       const v = snapshot.val();
//       if (!v) return;

//       if (typeof v.pitch === "number") setPitchValue(v.pitch);
//       if (typeof v.voltage === "number") setVoltageValue(v.voltage);
//       if (typeof v.current === "number") setCurrentValue(v.current);
//       if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
//       if (typeof v.isCleaning === "boolean") setIsCleaning(v.isCleaning);
//     });
//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   useEffect(() => {
//     if (!user) return;
//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       }
//     });

//     const unsubscribe = onValue(dbRef, (snapshot) => {
//       if(snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData);
//         loadedData.sort((a, b) => a.timestamp - b.timestamp);
//         setDatosTemporales(loadedData);
//       } else {
//         setDatosTemporales([]);
//       }
//     });

//     return () => unsubscribe();
//   }, [user, db, BASE_PATH]);

//   // =========================================================================
//   // 4. PROTECCIÓN F5, CERRAR PESTAÑA Y FLECHA ATRÁS
//   // =========================================================================
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       if (isCleaning || hayDatosSinGuardar) {
//         e.preventDefault();
//         e.returnValue = ""; 
//       }
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [isCleaning, hayDatosSinGuardar]);

//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);

//     const handlePopState = () => {
//       if (window.barridoEnProgreso) {
//         window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
//         window.history.pushState(null, null, window.location.pathname);
//         return;
//       }

//       if (window.datosEnPeligro) {
//         const confirmar = window.confirm(
//           "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
//         );
//         if (!confirmar) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }

//       window.datosEnPeligro = false;
//       window.removeEventListener("popstate", handlePopState);
//       setTimeout(() => navigate("/experiments/experimentChooser", { replace: true }), 10);
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => window.removeEventListener("popstate", handlePopState);
//   }, [navigate]);

//   // =========================================================================
//   // 5. ACCIONES DE BOTONES
//   // =========================================================================
//   const enviarComando = async (cmd) => {
//     if (!user) return;
//     const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(commandRef, cmd);
//   };

//   const handleLimpiar = async () => {
//     try {
//       setIsCleaning(true);
//       setEstado("cleaning");
//       await enviarComando("c");
//     } catch (err) {
//       console.error("Error iniciando limpieza:", err);
//       setIsCleaning(false);
//     }
//   };

//   const guardarDatos = async () => {
//     const unsaved = datosTemporales.filter((d) => !d.isSaved);
//     if (unsaved.length === 0) return alert("No hay nuevos datos para guardar.");
//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });

//       await update(ref(db), updates);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleEliminar = async (timestamp) => {
//     if (!timestamp) return;
//     const confirmar = window.confirm("¿Estás seguro de eliminar este registro permanentemente de la base de datos?");
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`), null);
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//     }
//   };

//   const handleBack = () => {
//     if (window.barridoEnProgreso) {
//       window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
//       return;
//     }
//     if (window.datosEnPeligro) {
//       const confirmar = window.confirm(
//         "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
//       );
//       if (!confirmar) return; 
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   // =========================================================================
//   // 6. DATOS PARA EL GRÁFICO (Último Registro)
//   // =========================================================================
//   const latestData = datosTemporales.length > 0 ? datosTemporales[datosTemporales.length - 1] : null;

//   const chartOptions = {
//     responsive: true, 
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { position: 'top' },
//       tooltip: {
//         callbacks: {
//           label: function(context) {
//             if (!latestData) return "";
//             const isDirty = context.datasetIndex === 0;
//             // Formato del Tooltip exacto que solicitaste
//             if(isDirty) {
//                return [
//                  ` Voltage: ${latestData.Vo?.toFixed(4)} V`,
//                  ` Current: ${latestData.Io?.toFixed(4)} A`,
//                  ` Power: ${latestData.Po?.toFixed(4)} W`,
//                  ` Efficiency: ${(latestData.Eo * 100)?.toFixed(2)} %`,
//                  ` Fill Factor: ${latestData.FFo?.toFixed(4)}`
//                ];
//             } else {
//                // Si es clean pero aún no hay datos, muestra procesando
//                if (latestData.Vf === null || latestData.Vf === undefined) return [" Processing Clean data..."];
//                return [
//                  ` Voltage: ${latestData.Vf?.toFixed(4)} V`,
//                  ` Current: ${latestData.If?.toFixed(4)} A`,
//                  ` Power: ${latestData.Pf?.toFixed(4)} W`,
//                  ` Efficiency: ${(latestData.Ef * 100)?.toFixed(2)} %`,
//                  ` Fill Factor: ${latestData.FFf?.toFixed(4)}`
//                ];
//             }
//           }
//         }
//       }
//     }
//   };

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         {/* COLUMNA IZQUIERDA: CONTROLES Y TABLA */}
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 4 }}>
//             <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Pitch actual: <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}°</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Voltage: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
//             </Typography>

//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Current: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={handleLimpiar}
//               disabled={!isHardwareReady || isCleaning}
//               size="large"
//             >
//               {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
//             </Button>
//           </Paper>

//           {/* TABLA PERSONALIZADA CON ESTILO DATATABLE */}
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//             <Typography variant="h5">Measurements Table</Typography>
//             <Button
//               variant={hayDatosSinGuardar ? "contained" : "outlined"}
//               color="primary"
//               onClick={guardarDatos}
//               disabled={datosTemporales.length === 0}
//               startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
//               size="medium"
//             >
//               {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
//             </Button>
//           </Box>

//           <Box className={tableStyles.dataTableContainer} sx={{ maxHeight: "500px", borderRadius: 2, border: '1px solid #e0e0e0' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
//               <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
//                 <tr>
//                   <th className={tableStyles.tableHeader} style={{ fontSize: '14px', padding: '12px 4px' }}>Angle</th>
//                   <th className={tableStyles.tableHeader} style={{ fontSize: '14px', padding: '12px 4px' }}>Voltage</th>
//                   <th className={tableStyles.tableHeader} style={{ fontSize: '14px', padding: '12px 4px' }}>Current</th>
//                   <th className={tableStyles.tableHeader} style={{ fontSize: '14px', padding: '12px 4px' }}>Efficiency</th>
//                   <th className={tableStyles.tableHeader} style={{ fontSize: '14px', padding: '12px 4px' }}>Fill Factor</th>
//                   <th className={tableStyles.tableHeader} style={{ fontSize: '14px', padding: '12px 4px' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {datosTemporales.map((row) => (
//                   <React.Fragment key={row.timestamp}>
//                     {/* FILA 1: DIRTY */}
//                     <tr className={tableStyles.tableRow}>
//                       <td className={tableStyles.tableCell} rowSpan={2} style={{ borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
//                         {row.angle}°
//                       </td>
//                       <td className={tableStyles.tableCell}>
//                         {row.Vo?.toFixed(2)} <span style={{ color: '#f57c00', fontSize: '0.8em' }}>(Dirty)</span>
//                       </td>
//                       <td className={tableStyles.tableCell}>{row.Io?.toFixed(2)}</td>
//                       <td className={tableStyles.tableCell}>{(row.Eo * 100)?.toFixed(2)}%</td>
//                       <td className={tableStyles.tableCell}>{row.FFo?.toFixed(2)}</td>
//                       <td className={tableStyles.tableCell} rowSpan={2} style={{ borderBottom: '1px solid #e0e0e0' }}>
//                         <IconButton color="error" onClick={() => handleEliminar(row.timestamp)}>
//                           <DeleteIcon />
//                         </IconButton>
//                       </td>
//                     </tr>
//                     {/* FILA 2: CLEAN */}
//                     <tr className={tableStyles.tableRow}>
//                       <td className={tableStyles.tableCell} style={{ borderBottom: '1px solid #e0e0e0' }}>
//                         {row.Vf !== null ? row.Vf?.toFixed(2) : "..."} <span style={{ color: '#4caf50', fontSize: '0.8em' }}>(Clean)</span>
//                       </td>
//                       <td className={tableStyles.tableCell} style={{ borderBottom: '1px solid #e0e0e0' }}>
//                         {row.If !== null ? row.If?.toFixed(2) : "..."}
//                       </td>
//                       <td className={tableStyles.tableCell} style={{ borderBottom: '1px solid #e0e0e0' }}>
//                         {row.Ef !== null ? `${(row.Ef * 100)?.toFixed(2)}%` : "..."}
//                       </td>
//                       <td className={tableStyles.tableCell} style={{ borderBottom: '1px solid #e0e0e0' }}>
//                         {row.FFf !== null ? row.FFf?.toFixed(2) : "..."}
//                       </td>
//                     </tr>
//                   </React.Fragment>
//                 ))}
//               </tbody>
//             </table>
//           </Box>

//         </Grid>

//         {/* COLUMNA DERECHA: CÁMARA Y GRÁFICOS */}
//         <Grid item xs={12} md={6}>
//           <Paper className="paper-camera" sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px", mb: 4 }}>
//             <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
//               {CAMERA_TITLE}
//               <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
//             </Typography>
//             <Box sx={{ width: "100%", height: "300px", mt: 1, backgroundColor: "#000" }}>
//               <iframe
//                 width="100%"
//                 height="100%"
//                 src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                 title="Live Stream"
//                 frameBorder="0"
//                 allowFullScreen
//               />
//             </Box>
//           </Paper>

//           {/* GRÁFICO 1: VOLTAGE */}
//           <Paper className="paper-graph" sx={{ p: 2, mb: 4 }}>
//             <GraphTitleWithTooltip title="Latest Test: Voltage Comparison (V)" description="Compares Voltage before and after the most recent cleaning." />
//             <Box mt={2} sx={{ height: '250px' }}>
//               <Bar 
//                 data={{
//                   labels: ["Voltage (V)"],
//                   datasets: [
//                     { 
//                       label: "Dirty (Vo)", 
//                       data: [latestData?.Vo || 0], 
//                       backgroundColor: "#f57c00" 
//                     },
//                     { 
//                       label: "Clean (Vf)", 
//                       data: [(latestData?.Vf !== null && latestData?.Vf !== undefined) ? latestData.Vf : 0], 
//                       backgroundColor: "#4caf50" 
//                     }
//                   ]
//                 }}
//                 options={chartOptions}
//               />
//             </Box>
//           </Paper>

//           {/* GRÁFICO 2: CURRENT */}
//           <Paper className="paper-graph" sx={{ p: 2 }}>
//             <GraphTitleWithTooltip title="Latest Test: Current Comparison (A)" description="Compares Current before and after the most recent cleaning." />
//             <Box mt={2} sx={{ height: '250px' }}>
//               <Bar 
//                 data={{
//                   labels: ["Current (A)"],
//                   datasets: [
//                     { 
//                       label: "Dirty (Io)", 
//                       data: [latestData?.Io || 0], 
//                       backgroundColor: "#f57c00" 
//                     },
//                     { 
//                       label: "Clean (If)", 
//                       data: [(latestData?.If !== null && latestData?.If !== undefined) ? latestData.If : 0], 
//                       backgroundColor: "#4caf50" 
//                     }
//                   ]
//                 }}
//                 options={chartOptions}
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Box display="flex" justifyContent="center" mt={4}>
//         <Button variant="outlined" color="secondary" onClick={handleBack}>
//           {PAGE_TITLES.BACK_BUTTON}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Subsistema3;


import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
// import { Save, CloudDone } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { exportData } from "../../utils/ExportUtils";

// Firebase
import { getDatabase, ref, set, update, onValue, onChildAdded, get, onDisconnect } from "firebase/database";
import app from "../../firebaseConfig.js";

// Estilos, Componentes y Tooltips
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import TooltipHeader from "../../components/Elements/TooltipHeader";
import { SUBSISTEMA3_COLUMNS, PAGE_TITLES, GRAPH_DESCRIPTIONS } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
import { COMMON_TOOLTIPS } from "../../assets/Strings/Experiments/CommonTooltips.jsx";
import "../../assets/css/Elements/PaperStyles.css";
import tableStyles from "../../assets/css/Elements/DataTable.module.css";

// Iconos Material UI
import { 
  RocketLaunch, 
  PlayArrow, 
  Stop, 
  Save, 
  CheckCircle,
  CloudDone,
  Download, 
  // FileDownload,
  CropFree,
  SaveAlt,
  Image,
  CameraAlt, 
  Science, 
  Warning,
  Build // Para el simulador
} from '@mui/icons-material';

// Gráficos Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);
ChartJS.defaults.font.family = 'Poppins, sans-serif';

const Subsistema3 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const user = useSelector((state) => state.auth.user);

  const UID_USUARIO = user?.uid || "invitado";
  const BASE_PATH = `users/${UID_USUARIO}/Exp3`;

  // ==========================================
  // ESTADOS DEL COMPONENTE
  // ==========================================
  const [pitchValue, setPitchValue] = useState(null);
  const [voltageValue, setVoltageValue] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [estado, setEstado] = useState("dirty");

  const [isHardwareReady, setIsHardwareReady] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [datosTemporales, setDatosTemporales] = useState([]);

  const datosTemporalesRef = useRef([]);
  const sessionStartTime = useRef(Date.now());
  // const shouldSendNOnUnmountRef = useRef(false);
  // const initKeyRef = useRef(`exp3_init_${UID_USUARIO}`);

  const {
    MAIN_TITLE,
    DESCRIPTION,
    SAVE_BUTTON,
    BACK_BUTTON,
    CAMERA_TITLE,
    SUBSYSTEM_STATUS_TITLE,
    CURRENT_STATUS_LABEL,
    CLEAN_BUTTON,
  } = PAGE_TITLES;

  useEffect(() => {
    datosTemporalesRef.current = datosTemporales;
  }, [datosTemporales]);

  // =========================================================================
  // 1. VARIABLES GLOBALES PARA EL HEADER
  // =========================================================================
  const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

  useEffect(() => {
    window.barridoEnProgreso = isCleaning; 
    window.datosEnPeligro = hayDatosSinGuardar;
    
    return () => {
      window.barridoEnProgreso = false;
      window.datosEnPeligro = false;
    };
  }, [isCleaning, hayDatosSinGuardar]);


  // =========================================================================
  // 2. INICIALIZACIÓN ('y') Y DESMONTAJE SEGURO ('n')
  // =========================================================================
  const hasSentY = useRef(false);

  useEffect(() => {
    if (!user || UID_USUARIO === "invitado") return;

    const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
    onDisconnect(fbRef).set("n");

    // 🛡️ ESCUDO ANTI-STRICT MODE: Retrasamos la 'y' apenas 150ms
    const timerId = setTimeout(() => {
      console.log("🚀 Entrando al experimento 3: Enviando 'y'...");
      set(fbRef, "y").catch(err => console.error(err));
      hasSentY.current = true;
    }, 150);

    // LIMPIEZA AL DESMONTAR (Cuando navegas por el Header o Go Back)
    return () => {
      clearTimeout(timerId); // Si React desmonta de inmediato, cancelamos la 'y' inicial

      // Solo enviamos 'n' si el hardware realmente llegó a encenderse
      if (hasSentY.current) {
        console.log("🧹 Saliendo del experimento: Enviando 'n'...");
        set(fbRef, "n").catch(() => {});
        onDisconnect(fbRef).cancel();

        // Limpiamos los datos basura
        const datos = datosTemporalesRef.current || [];
        const datosBasura = datos.filter((d) => d.isSaved === false);
        if (datosBasura.length > 0) {
          const updates = {};
          datosBasura.forEach((d) => {
            updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
          });
          update(ref(db), updates).catch((e) => console.error(e));
        }
      }
    };
  }, [user, UID_USUARIO, db, BASE_PATH]);

  // =========================================================================
  // 3. LECTURA DE HARDWARE Y DATOS FIREBASE
  // =========================================================================
  useEffect(() => {
    const statusRef = ref(db, "estado_general/Exp3/hardwareStatus");
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsHardwareReady(snapshot.val() === "READY");
      }
    });
    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!user) return;
    const liveRef = ref(db, `${BASE_PATH}/live`);
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const v = snapshot.val();
      if (!v) return;

      if (typeof v.pitch === "number") setPitchValue(v.pitch);
      if (typeof v.voltage === "number") setVoltageValue(v.voltage);
      if (typeof v.current === "number") setCurrentValue(v.current);
      if (typeof v.panelStatus === "string") setEstado(v.panelStatus);
      if (typeof v.isCleaning === "boolean") setIsCleaning(v.isCleaning);
    });
    return () => unsubscribe();
  }, [user, db, BASE_PATH]);

  useEffect(() => {
    if (!user) return;
    const dbRef = ref(db, `${BASE_PATH}/measurements`);

    // 🚨 Eliminamos el "get" inicial para que no cargue el historial antiguo.
    // Solo escuchamos los cambios en tiempo real y filtramos los nuevos.
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        
        // 🚨 FILTRO CLAVE: Solo mostramos mediciones creadas DESPUÉS de entrar a la página
        const loadedData = Object.values(rawData).filter(
          (d) => d.timestamp >= sessionStartTime.current
        );
        
        loadedData.sort((a, b) => a.timestamp - b.timestamp);
        setDatosTemporales(loadedData);
      } else {
        setDatosTemporales([]);
      }
    });

    return () => unsubscribe();
  }, [user, db, BASE_PATH]);

  // =========================================================================
  // 4. PROTECCIÓN F5, CERRAR PESTAÑA Y FLECHA ATRÁS
  // =========================================================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isCleaning || hayDatosSinGuardar) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isCleaning, hayDatosSinGuardar]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = () => {
      if (window.barridoEnProgreso) {
        window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
        window.history.pushState(null, null, window.location.pathname);
        return;
      }

      if (window.datosEnPeligro) {
        const confirmar = window.confirm(
          "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
        );
        if (!confirmar) {
          window.history.pushState(null, null, window.location.pathname);
          return;
        }
      }

      window.datosEnPeligro = false;
      window.removeEventListener("popstate", handlePopState);
      setTimeout(() => navigate("/experiments/experimentChooser", { replace: true }), 10);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  // =========================================================================
  // 5. ACCIONES DE BOTONES
  // =========================================================================
  const enviarComando = async (cmd) => {
    if (!user) return;
    const commandRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
    await set(commandRef, cmd);
  };

  const handleLimpiar = async () => {
    try {
      setIsCleaning(true);
      setEstado("cleaning");
      await enviarComando("c");
    } catch (err) {
      console.error("Error iniciando limpieza:", err);
      setIsCleaning(false);
    }
  };

  const guardarDatos = async () => {
    const unsaved = datosTemporales.filter((d) => !d.isSaved);
    if (unsaved.length === 0) return alert("No hay nuevos datos para guardar.");
    if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

    try {
      const updates = {};
      unsaved.forEach((d) => {
        updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
      });

      await update(ref(db), updates);
      alert("✅ Datos guardados con éxito.");
    } catch (error) {
      console.error("❌ Error guardando datos:", error);
      alert("❌ Hubo un error al guardar los datos.");
    }
  };

  const handleEliminar = async (timestamp) => {
    if (!timestamp) return;
    const confirmar = window.confirm("¿Estás seguro de eliminar este registro permanentemente de la base de datos?");
    if (!confirmar) return;

    try {
      await set(ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`), null);
    } catch (error) {
      console.error("Error eliminando registro:", error);
    }
  };

  const handleBack = () => {
    if (window.barridoEnProgreso) {
      window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the cleaning process is finished before leaving the page.");
      return;
    }
    if (window.datosEnPeligro) {
      const confirmar = window.confirm(
        "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
      );
      if (!confirmar) return; 
    }
    navigate("/experiments/experimentChooser");
  };

  // =========================================================================
  // 6. DATOS PARA EL GRÁFICO (Solo el último registro)
  // =========================================================================
  const latestData = datosTemporales.length > 0 ? datosTemporales[datosTemporales.length - 1] : null;

  // =========================================================================
  // 6. OPCIONES BASE DE LOS GRÁFICOS (Ajustadas a diseño limpio)
  // =========================================================================
  const getChartOptions = (yAxisTitle) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Ocultamos la leyenda superior porque ya lo dice el eje X
      tooltip: {
        titleFont: { family: '"Poppins", sans-serif', size: 14 },
        bodyFont: { family: '"Poppins", sans-serif', size: 13 },
        callbacks: {
          label: function (context) {
            if (!latestData) return "";
            // context.dataIndex 0 es Dirty, 1 es Clean
            const isDirty = context.dataIndex === 0;
            if (isDirty) {
              return [
                ` Voltage: ${latestData.Vo?.toFixed(4)} V`,
                ` Current: ${latestData.Io?.toFixed(4)} A`,
                ` Efficiency: ${(latestData.Eo * 100)?.toFixed(4)} %`,
                ` Fill Factor: ${latestData.FFo?.toFixed(4)}`,
              ];
            } else {
              if (latestData.Vf === null || latestData.Vf === undefined) return [" Processing Clean data..."];
              return [
                ` Voltage: ${latestData.Vf?.toFixed(4)} V`,
                ` Current: ${latestData.If?.toFixed(4)} A`,
                ` Efficiency: ${(latestData.Ef * 100)?.toFixed(4)} %`,
                ` Fill Factor: ${latestData.FFf?.toFixed(4)}`,
              ];
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Vuelve a la normalidad para no exagerar la barra
        title: {
          display: true,
          text: yAxisTitle,
          font: { family: '"Poppins", sans-serif', size: 14, weight: 500 },
        },
        ticks: { font: { family: '"Poppins", sans-serif' } },
      },
      x: {
        ticks: { font: { family: '"Poppins", sans-serif', size: 13, weight: 600 } },
      },
    },
  });

  // =========================================================================
  // 7. RENDERIZADO UI
  // =========================================================================
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4}>
        {/* COLUMNA IZQUIERDA: CONTROLES Y TABLA */}
        <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, textAlign: "center", mb: 2, width: "100%", boxSizing: "border-box", borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>            <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
            </Typography>

            {/* <Typography variant="body1" sx={{ mb: 1 }}>
              {PAGE_TITLES.PITCH_ACTUAL_LABEL} <strong>{pitchValue === null ? "—" : pitchValue.toFixed(2)}°</strong>            
            </Typography> */}

            <Typography variant="body1" sx={{ mb: 1 }}>
              {SUBSISTEMA3_COLUMNS[1].replace(' \n(V)', '')}: <strong>{voltageValue === null ? "—" : voltageValue.toFixed(2)} V</strong>
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {SUBSISTEMA3_COLUMNS[2].replace(' \n(I)', '')}: <strong>{currentValue === null ? "—" : currentValue.toFixed(2)} A</strong>
            </Typography>

          </Paper>
            {/* <Button
              variant="contained"
              color="primary" 
              size="large"
              fullWidth
              onClick={handleLimpiar}
              disabled={!isHardwareReady || isCleaning}
            >
              {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
            </Button> */}

            <Box sx={{ mb: 4, width: "100%" }}>
            <Button
              variant="contained"
              color="primary" 
              size="large"
              fullWidth
              onClick={handleLimpiar}
              disabled={!isHardwareReady || isCleaning}
            >
              {!isHardwareReady ? "Calibrating..." : isCleaning ? "Cleaning..." : CLEAN_BUTTON}
            </Button>
          </Box>

          {/* CABECERA DE LA TABLA Y BOTÓN SAVE */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">{PAGE_TITLES.MEASUREMENTS_TABLE_TITLE}</Typography>
            <Button
              variant={hayDatosSinGuardar ? "contained" : "outlined"}
              color="primary"
              onClick={guardarDatos}
              disabled={datosTemporales.length === 0}
              startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
              size="medium"
            >
              {hayDatosSinGuardar ? PAGE_TITLES.SAVE_BUTTON_NEW : PAGE_TITLES.SAVE_BUTTON_SAVED}
            </Button>
          </Box>

          {/* TABLA PERSONALIZADA CON ESTILO DATATABLE */}
          {/* TABLA PERSONALIZADA CON ESTILO DATATABLE CENTRALIZADO */}
          <TableContainer component={Paper} className={tableStyles.dataTableContainer} sx={{ maxHeight: "500px", borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <Table stickyHeader className={tableStyles.tableFit}>
              <TableHead>
                <TableRow>
                  {/* Mapeamos los títulos directamente desde Subsistema3Strings.jsx */}
                  {SUBSISTEMA3_COLUMNS.map((colString, index) => (
                    <TableCell key={index} className={tableStyles.tableHeader}>
                      {colString}
                    </TableCell>
                  ))}
                  {/* La columna de Actions */}
                  <TableCell className={tableStyles.tableHeader}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {datosTemporales.map((row) => (
                  <React.Fragment key={row.timestamp}>
                    {/* FILA 1: DIRTY */}
                    <TableRow className={tableStyles.tableRow}>
                      <TableCell className={tableStyles.tableCell} rowSpan={2}>
                        {row.angle}
                      </TableCell>
                      <TableCell className={tableStyles.tableCell}>
                        {row.Vo?.toFixed(2)} <span style={{ color: '#f57c00', fontSize: '0.8em' }}>(Dirty)</span>
                      </TableCell>
                      <TableCell className={tableStyles.tableCell}>{row.Io?.toFixed(2)}</TableCell>
                      <TableCell className={tableStyles.tableCell}>{(row.Eo * 100)?.toFixed(2)}</TableCell>
                      <TableCell className={tableStyles.tableCell}>{row.FFo?.toFixed(4)}</TableCell>
                      <TableCell className={tableStyles.tableCell} rowSpan={2}>
                        <IconButton color="error" onClick={() => handleEliminar(row.timestamp)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* FILA 2: CLEAN */}
                    <TableRow className={tableStyles.tableRow}>
                      <TableCell className={tableStyles.tableCell}>
                        {row.Vf !== null && row.Vf !== undefined ? row.Vf.toFixed(2) : "..."} <span style={{ color: '#4caf50', fontSize: '0.8em' }}>(Clean)</span>
                      </TableCell>
                      <TableCell className={tableStyles.tableCell}>
                        {row.If !== null && row.If !== undefined ? row.If.toFixed(2) : "..."}
                      </TableCell>
                      <TableCell className={tableStyles.tableCell}>
                        {row.Ef !== null && row.Ef !== undefined ? `${(row.Ef * 100).toFixed(2)}` : "..."}
                      </TableCell>
                      {/* Usamos la clase especial de CSS para forzar el borde derecho sin meter sx duro */}
                      <TableCell className={`${tableStyles.tableCell} ${tableStyles.forceRightBorder}`}>
                        {row.FFf !== null && row.FFf !== undefined ? row.FFf.toFixed(4) : "..."}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Grid>

        {/* COLUMNA DERECHA: CÁMARA Y GRÁFICOS */}
        <Grid item xs={12} md={6}>
          {/* <Paper className="paper-camera" sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px", mb: 4 }}> */}
          <Paper sx={{ p: 2, backgroundColor: "#121212", color: "#fff", borderRadius: "12px", mb: 4, width: "100%", boxSizing: "border-box" }}>
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
              {CAMERA_TITLE}
              <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>● En vivo</span>
            </Typography>
            <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
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

          {/* GRÁFICO 1: VOLTAGE */}
          {/* <Paper className="paper-graph" sx={{ p: 2, mb: 4 }}> */}
          <Paper sx={{ p: 2, mb: 4, width: "100%", boxSizing: "border-box", borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <GraphTitleWithTooltip title="Voltage Comparison" description="Compares Voltage before and after the most recent cleaning." />
            <Box mt={2} sx={{ height: '250px' }}>
              <Bar 
                data={{
                  labels: ["Dirty", "Clean"], // Etiquetas directamente en el eje X
                  datasets: [
                    {
                      data: [
                        latestData?.Vo || 0,
                        (latestData?.Vf !== null && latestData?.Vf !== undefined) ? latestData.Vf : 0
                      ],
                      backgroundColor: ["#f57c00", "#4caf50"], // Color por cada barra
                      borderRadius: 4,
                    }
                  ]
                }}
                options={getChartOptions("Voltage (V)")}
              />
            </Box>
          </Paper>

          {/* GRÁFICO 2: CURRENT */}
          {/* <Paper className="paper-graph" sx={{ p: 2 }}> */}
          <Paper sx={{ p: 2, width: "100%", boxSizing: "border-box", borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <GraphTitleWithTooltip title="Current Comparison" description="Compares Current before and after the most recent cleaning." />
            <Box mt={2} sx={{ height: '250px' }}>
              <Bar 
                data={{
                  labels: ["Dirty", "Clean"], // Etiquetas directamente en el eje X
                  datasets: [
                    {
                      data: [
                        latestData?.Io || 0,
                        (latestData?.If !== null && latestData?.If !== undefined) ? latestData.If : 0
                      ],
                      backgroundColor: ["#f57c00", "#4caf50"], // Color por cada barra
                      borderRadius: 4,
                    }
                  ]
                }}
                options={getChartOptions("Current (A)")}
              />
            </Box>
          </Paper>

          {/* --- DESCARGA TOTAL --- */}
          <Box mt={4}>
            <Button
              variant="contained" 
              color="pink" 
              onClick={() => exportData(datosTemporales, 'full_report', 'Exp3', 'csv')}
              fullWidth 
              startIcon={<SaveAlt />}
            >
              {PAGE_TITLES.DOWNLOAD_GRAPHS_BUTTON}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Button variant="outlined" color="secondary" onClick={handleBack}>
          {PAGE_TITLES.BACK_BUTTON}
        </Button>
      </Box>
    </Box>
  );
};

export default Subsistema3;