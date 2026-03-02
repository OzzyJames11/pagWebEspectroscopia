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




import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Firebase
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../firebaseConfig.js";

// Componentes (los tuyos)
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";

// Strings (puedes ajustar los textos en tu archivo si quieres)
import {
  PAGE_TITLES,
} from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";

import "../../assets/css/Elements/PaperStyles.css";

const Subsistema3 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const auth = getAuth(app);

  // =========================================================
  // ESTADOS
  // =========================================================
  const [currentUser, setCurrentUser] = useState(null);

  // Pitch live + historial corto para gráfica (si la usas en otra parte)
  const [pitchValue, setPitchValue] = useState(null);
  const [pitchData, setPitchData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);

  // Tabla local (guardado manual)
  const [estado, setEstado] = useState("dirty");
  const [datos, setDatos] = useState([]);

  const [youtubeVideoId] = useState("nAQz4RMaHVA");

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

  // Columnas para PITCH
  const TABLE_COLUMNS = ["Pitch", "Hora"];

  // =========================================================
  // 1) AUTH: Detectar usuario
  // =========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        console.log("✅ Usuario autenticado:", user.uid);
      } else {
        setCurrentUser(null);
        console.warn("❌ No hay sesión activa.");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // =========================================================
  // 2) Cargar tabla local + mandar "y" al entrar
  // =========================================================
  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema3_pitch")) || [];
    setDatos(datosGuardados);

    if (currentUser) {
      enviarComando("y"); // iniciar medición/streaming
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // =========================================================
  // 3) Listener LIVE pitch (por usuario)
  // Ruta: users/{uid}/Exp3/live
  // =========================================================
  useEffect(() => {
    if (!currentUser) return;

    const liveRef = ref(db, `users/${currentUser.uid}/Exp3/live`);
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const v = snapshot.val();
      if (!v || typeof v.pitch !== "number") return;

      const pitch = v.pitch;
      const label = v.timestamp
        ? new Date(v.timestamp).toLocaleTimeString()
        : new Date().toLocaleTimeString();

      setPitchValue(pitch);
      setPitchData((prev) => [...prev.slice(-19), pitch]);
      setTimeLabels((prev) => [...prev.slice(-19), label]);
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  // =========================================================
  // 4) Listener BackToFront (por usuario) — opcional
  // Ruta: users/{uid}/Exp3/communication/BackToFront
  // =========================================================
  useEffect(() => {
    if (!currentUser) return;

    const btfRef = ref(db, `users/${currentUser.uid}/Exp3/communication/BackToFront`);
    const unsubscribe = onValue(btfRef, (snapshot) => {
      const mensaje = snapshot.val();
      if (!mensaje || mensaje === "x") return;

      console.log("📩 BackToFront Exp3:", mensaje);
      // Si tu Arduino manda EndMov para algún proceso, aquí lo capturas:
      // if (mensaje === "EndMov") { ... }
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  // =========================================================
  // Enviar comandos a Exp3 (por usuario)
  // =========================================================
  const enviarComando = (cmd) => {
    if (!currentUser) {
      console.error("⛔ Acción bloqueada: esperando autenticación...");
      return;
    }
    const commandRef = ref(
      db,
      `users/${currentUser.uid}/Exp3/communication/FrontToBack`
    );

    set(commandRef, cmd)
      .then(() => console.log(`🚀 Comando "${cmd}" enviado.`))
      .catch((err) => console.error("❌ Error enviando comando:", err));
  };

  // =========================================================
  // UI actions
  // =========================================================
  const handleLimpiar = () => {
    setEstado("clean");
    // Limpieza local
    setPitchData([]);
    setTimeLabels([]);
    setPitchValue(null);

    enviarComando("c");
  };

  const handleGuardar = () => {
    const now = new Date();
    const row = {
      [TABLE_COLUMNS[0]]: pitchValue === null ? "-" : pitchValue.toFixed(4),
      [TABLE_COLUMNS[1]]: now.toLocaleTimeString(),
    };

    const nuevosDatos = [...datos, row];
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
    setEstado("dirty");
  };

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index);
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema3_pitch", JSON.stringify(nuevosDatos));
  };

  const handleBack = async () => {
    try {
      // Detener streaming/medición
      enviarComando("n");

      if (currentUser) {
        // Limpia solo lo de este usuario (opcional)
        await remove(ref(db, `users/${currentUser.uid}/Exp3/live`));
        // Si guardas histórico:
        // await remove(ref(db, `users/${currentUser.uid}/Exp3/measurements`));
      }
    } catch (e) {
      console.warn("⚠️ Error limpiando datos de Exp3:", e);
    }

    navigate("/experiments/experimentChooser");
  };

  // =========================================================
  // Render
  // =========================================================
  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4}>
        {/* Columna Izquierda */}
        <Grid item xs={12} md={6}>
          <Paper className="paper-camera" sx={{ p: 3, textAlign: "center", mb: 3 }}>
            <Typography variant="h5">{SUBSYSTEM_STATUS_TITLE}</Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              {CURRENT_STATUS_LABEL} <strong>{estado}</strong>
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Pitch actual:{" "}
              <strong>
                {pitchValue === null ? "—" : `${pitchValue.toFixed(4)}`}
              </strong>
            </Typography>

            <Button variant="contained" onClick={handleLimpiar} disabled={estado === "clean"}>
              {CLEAN_BUTTON}
            </Button>
          </Paper>

          <DataTable
            columns={TABLE_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
          />

          <Box mt={2}>
            <Button variant="contained" onClick={handleGuardar} disabled={pitchValue === null}>
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

        {/* Columna Derecha */}
        <Grid item xs={12} md={6}>
          <Paper
            className="paper-camera"
            sx={{
              p: 2,
              backgroundColor: "#121212",
              color: "#fff",
              borderRadius: "12px"
            }}
          >
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
              {CAMERA_TITLE}
              <span style={{ color: "#e53935", fontSize: "0.8rem", marginLeft: "10px" }}>
                ● En vivo
              </span>
            </Typography>

            <Box sx={{ width: "100%", height: "400px", mt: 1, backgroundColor: "#000" }}>
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                title="Live Stream"
                frameBorder="0"
                allowFullScreen
              />
            </Box>
          </Paper>

          {/* Si luego quieres una gráfica, aquí puedes renderizarla usando pitchData y timeLabels */}
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

export default Subsistema3;