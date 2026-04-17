/*import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

//import imagen_subsistema1 from "../../assets/img/experimentos/imagen_subsistema1.png";
//import imagen_subsistema1V2 from "../../assets/img/experimentos/imagen_subsistema1V2.png"; 

import Hls from 'hls.js';

//Importación de componentes
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

//Importación de constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

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

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema2 = () => {
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
  const [zenithAngle, setZenithAngle] = useState(50); // Nuevo estado para Zenith Angle
  const [azimuthAngle, setAzimuthAngle] = useState(50); // Estado para Azimuth Angle


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
  const [isSliderDisabled_2, setIsSliderDisabled_2] = useState(true); //Para activar y desactivar el slider
  const [isSliderDisabled_Zenith, setIsSliderDisabled_Zenith] = useState(false); //Para activar y desactivar el slider
  const [angulo, setAngulo] = useState(5);
  const [angulo2, setAngulo2] = useState(5);
  const [anguloZenith, setAnguloZenith] = useState(5); //Para el de dos ejes

  const [actualPanelAngle, setactualPanelAngle] = useState(5);
  const [actualPanelAngle2, setactualPanelAngle2] = useState(5);
  const [actualPanelAngleZenith, setactualPanelAngleZenith] = useState(5);
  const [isMoveButtonDisabled_1, setIsMoveButtonDisabled_1] = useState(true); // Estado para habilitar/deshabilitar el boton
  const [isTextDisabled_1, setIsTextDisabled_1] = useState(true); // Estado para habilitar/deshabilitar el mensaje de movimiento
  const [messageToSend, setMessageToSend] = useState(``); // Estado para el mensaje que se enviará

  //Envio de angulo
  const [enviarAngulo, setEnviarAngulo] = useState(false);
  const [enviarAngulo2, setEnviarAngulo2] = useState(false);

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
        const dbRef = ref(db, "Exp2/FrontToBack");
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
    const dbRef = ref(db, "Exp2/data"); // Escucha todo el nodo "Lectures"

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
    const dbRef = ref(db, "Exp2/BackToFront");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const mensaje = snapshot.val();
        console.log("Mensaje recibidooo:", mensaje);
        if (mensaje === "EndMov") {
          setIsSliderDisabled_1(false);
          setIsSliderDisabled_2(false);
          setIsMoveButtonDisabled_1(false);
          setIsTextDisabled_1(false);
          setIsGuardarLecturaDisabled_1(false);
        } else if (mensaje === "PITCH:") {
          console.log(mensaje);
          setEnviarAngulo(true);
          console.log(enviarAngulo);
        } else if (mensaje === "ROLL:") {
          console.log(mensaje);
          setEnviarAngulo2(true);
          console.log(enviarAngulo2);
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

  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  useEffect(() => {
    const datosGuardados =
      JSON.parse(localStorage.getItem("historicalData_subsistema2")) || [];
    setDatos(datosGuardados);

  }, []);

  
  const generarValoresAleatorios = () => ({
    [SUBSISTEMA2_COLUMNS[0]]: `${angulo}°`, // Zenith Angle
    [SUBSISTEMA2_COLUMNS[1]]: `${angulo2}°`, // Azimuth Angle
    [SUBSISTEMA2_COLUMNS[2]]: voltajeValue_1.toFixed(2),
    [SUBSISTEMA2_COLUMNS[3]]: corrienteValue_1.toFixed(2),
    [SUBSISTEMA2_COLUMNS[4]]: (Math.random() * 100).toFixed(2),
    [SUBSISTEMA2_COLUMNS[5]]: (Math.random() * 1).toFixed(2),
  });

  const handleGuardar = () => {
    // const nuevoDato = { angulo, ...generarValoresAleatorios() };
    const nuevoDato = generarValoresAleatorios();
    const nuevosDatos = [...datos, nuevoDato];

    setDatos(nuevosDatos);
    localStorage.setItem(
      "historicalData_subsistema2",
      JSON.stringify(nuevosDatos)
    );
  };

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index); // Filtra los datos para eliminar el registro seleccionado
    setDatos(nuevosDatos);
    localStorage.setItem(
      "historicalData_subsistema2",
      JSON.stringify(nuevosDatos)
    ); // Actualiza el localStorage
  };




  // Descargar ambos gráficos en un solo archivo
  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem2_all_data.txt",
      metadata: [
        { label: "Azimuth Angle", value: `${angulo}°` },
        { label: "Zenith Angle", value: `${anguloZenith}°` },
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

  const handleBack = () => {
    noEnviarNuevoAngulo();
    //change1hour();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  //Acciones al presionar el Boton Move (Envío de dato de ángulo)
  const envioDatos = async () => {
    if (enviarAngulo) {
      console.log(enviarAngulo);
      setIsSliderDisabled_1(true);
      setIsSliderDisabled_2(true);
      setIsMoveButtonDisabled_1(true);
      setIsGuardarLecturaDisabled_1(true);
      setIsTextDisabled_1(true);
      setactualPanelAngle(angulo);
      try {
        const msg = "p" + angulo; // Mensaje a enviar
        const db = getDatabase(app);
        const docRef = ref(db, "Exp2/FrontToBack"); // Ruta correcta en la BD

        set(docRef, msg).catch((error) => {
          alert("Error: " + error.message);
        });

        console.log(`Mensaje enviado: ${msg}`);
        setEnviarAngulo(false);
      } catch (error) {
        console.error("Error al enviar datos a Firebase:", error);
      }
    }
  };
  useEffect(() => {
    // if (isFirstRender.current) {
    //   isFirstRender.current = false; // Lo marcamos como que ya se hizo el primer render
    //   return;
    // }
    if (enviarAngulo2) {
    try {
      const msg = "r" + angulo2;
      const db = getDatabase(app);
      const docRef = ref(db, "Exp2/FrontToBack");
      set(docRef, msg).catch((error) => {
        alert("Error: " + error.message);
      });
      console.log(`Mensaje enviado: ${msg}`);
      setEnviarAngulo2(false);
    } catch (error) {
      console.error("Error al enviar datos seriales:", error);
    }
  }
  }, [enviarAngulo2]);

  //Envio de señal para 1 hora
  const change1hour = async () => {
    try {
      const msg = "s";
      const db = getDatabase(app);
      const docRef = ref(db, "Exp2/FrontToBack");
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
      const docRef = ref(db, "Exp2/FrontToBack");
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
      const docRef = ref(db, "Exp2/FrontToBack");
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
      const docRef = ref(db, "Exp2/FrontToBack");
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
    const dbRef = ref(db, "Exp2/data"); // Obtén la referencia a la clave

    try {
      await remove(dbRef); // Usa remove() correctamente en Firebase v9+
      console.log("Datos eliminados exitosamente.");
    } catch (error) {
      console.error("Error al eliminar los datos: ", error);
    }
  };

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>
      
      
      

      <Grid container spacing={4} alignItems="flex-start">
       
        <Grid item xs={12} md={6}>
          <SliderComponent
            value={angulo}
            label="Actual Azimuth Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={actualPanelAngle}
            onChange={(e, newValue) => setAngulo(newValue)}
            disabled={isSliderDisabled_1} //estado del slider
          />
          <SliderComponent
            value={angulo2}
            label="Actual Zenith Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={actualPanelAngle2}
            onChange={(e, newValue) => setAngulo2(newValue)}
            disabled={isSliderDisabled_2} //estado del slider
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
            columns={SUBSISTEMA2_COLUMNS}
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

        
        <Grid
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
              />
              Desactivado temporalmente por OzzyJames11 
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
              Desactivado temporalmente por OzzyJames11 
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

export default Subsistema2;
*/
















// Nueva version
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

// UI antigua
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// Estilos antiguos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import app from "../../firebaseConfig.js";

// exportacion de datos (igual que antes)
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  const {
    MAIN_TITLE,
    DESCRIPTION,
    SAVE_BUTTON,
    MOVE_BUTTON, // lo reutilizamos como texto de iniciar barrido
    DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH,
    BACK_BUTTON,
    CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE,
  } = PAGE_TITLES;

  // ==================== ESTADOS (BARRIDO 2 EJES) ====================
  // Azimuth
  const [azimuthStart, setAzimuthStart] = useState(0);
  const [azimuthEnd, setAzimuthEnd] = useState(20);

  // Zenith
  const [zenithStart, setZenithStart] = useState(0);
  const [zenithEnd, setZenithEnd] = useState(20);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);

  // Listas de ángulos por eje
  const [azimuthAngles, setAzimuthAngles] = useState([]);
  const [zenithAngles, setZenithAngles] = useState([]);

  // Control de fase
  const [faseBarrido, setFaseBarrido] = useState("azimuth");
  // "azimuth" -> "zenith" -> "done"

  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // refs para evitar closures viejos
  const azimuthAnglesRef = useRef([]);
  const zenithAnglesRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("azimuth");
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    azimuthAnglesRef.current = azimuthAngles;
    zenithAnglesRef.current = zenithAngles;
    anguloActualIndexRef.current = anguloActualIndex;
    faseBarridoRef.current = faseBarrido;
    sweepIdActualRef.current = sweepIdActual;
  }, [azimuthAngles, zenithAngles, anguloActualIndex, faseBarrido, sweepIdActual]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () =>
      `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== AUXILIAR LISTA DE ÁNGULOS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== INICIAR BARRIDO 2 EJES ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");

    if (azimuthStart === azimuthEnd)
      return alert("Azimuth Start y End deben ser diferentes");
    if (zenithStart === zenithEnd)
      return alert("Zenith Start y End deben ser diferentes");

    try {
      const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
      const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);

      setAzimuthAngles(azList);
      setZenithAngles(zeList);

      setBarridoEnProgreso(true);
      setFaseBarrido("azimuth");
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      // Guardar sweep en Exp2 y publicar currentSweepId
      await Promise.all([
        set(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
          status: "in_progress",
          fase: "azimuth",
          timestamp: Date.now(),
          userSession,
        }),
        set(ref(db, "experiments/Exp2/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido Exp2 iniciado:", { azList, zeList });

      // arrancar primer movimiento en azimuth
      setTimeout(() => moverASiguienteAngulo("azimuth", azList[0], sweepId, 0), 1000);
    } catch (error) {
      console.error("❌ Error al iniciar barrido Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER PANEL POR FASE ====================
  const moverASiguienteAngulo = async (fase, angulo, sweepId, index) => {
    try {
      const comando = fase === "azimuth" ? "p" + angulo : "r" + angulo;

      console.log(
        `🎯 [${fase}] Moviendo a ${angulo}° (${index + 1}/${
          fase === "azimuth"
            ? azimuthAnglesRef.current.length
            : zenithAnglesRef.current.length
        })`
      );

      const fbRef = ref(db, "experiments/Exp2/communication/FrontToBack");
      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      // reset canal
      setTimeout(async () => {
        await set(fbRef, "x");
      }, 500);

      // actualizar sweep estado
      await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
        fase,
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error al mover panel Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR FIN DE MOVIMIENTO ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/communication/BackToFront");
    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (msg !== "EndMov") return;

      console.log("✅ EndMov recibido Exp2");
      const fase = faseBarridoRef.current;
      const indexActual = anguloActualIndexRef.current;
      const siguiente = indexActual + 1;
      const sweepId = sweepIdActualRef.current;

      if (!sweepId) return;

      if (fase === "azimuth") {
        const azList = azimuthAnglesRef.current;

        if (siguiente < azList.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(
            () => moverASiguienteAngulo("azimuth", azList[siguiente], sweepId, siguiente),
            2000
          );
        } else {
          // terminó azimuth => pasar a zenith
          console.log("🔁 Azimuth terminado, iniciando Zenith...");
          setFaseBarrido("zenith");
          setAnguloActualIndex(0);

          const zeList = zenithAnglesRef.current;
          setTimeout(
            () => moverASiguienteAngulo("zenith", zeList[0], sweepId, 0),
            2000
          );
        }
      }

      if (fase === "zenith") {
        const zeList = zenithAnglesRef.current;

        if (siguiente < zeList.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(
            () => moverASiguienteAngulo("zenith", zeList[siguiente], sweepId, siguiente),
            2000
          );
        } else {
          // terminó zenith => fin total
          console.log("🎉 Barrido Exp2 completado!");
          setBarridoEnProgreso(false);
          setFaseBarrido("done");

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            status: "completed",
            fase: "done",
            lastUpdated: Date.now(),
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/measurements");
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        console.log("📊 Nueva medición temporal Exp2:", data);
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

  // ==================== GUARDAR BARRIDO LOCAL ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp2/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
        },
        data: datosTemporales,
      };

      localStorage.setItem(
        `historicalData_subsistema2_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido Exp2:", error);
    }
  };

  // ==================== BACK COMO ANTES ====================
  const noEnviarNuevoAngulo = async () => {
    try {
      await set(ref(db, "Exp2/FrontToBack"), "n").catch(() => {});
      await set(ref(db, "experiments/Exp2/communication/FrontToBack"), "n").catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarDatos = async () => {
    try {
      await remove(ref(db, "Exp2/data")).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  // ==================== EXPORT TXT (igual que antes placeholder) ====================
  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem2_all_data.txt",
      metadata: [
        { label: "Azimuth Sweep", value: `${azimuthStart}° → ${azimuthEnd}°` },
        { label: "Zenith Sweep", value: `${zenithStart}° → ${zenithEnd}°` },
      ],
      sections: [
        {
          title: "Measurements",
          headers: ["Angle", "Voltage", "Current"],
          data: datosTemporales.map((d) => [d.angle, d.voltage, d.current]),
        },
      ],
    });
  };

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            🚀 Automatic sweeping control (2-axis)
          </Typography>

          
          <SliderComponent
            value={azimuthStart}
            label="Azimuth Start Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={azimuthStart}
            onChange={(e, v) => setAzimuthStart(v)}
            disabled={barridoEnProgreso}
          />
          <Box mt={2}>
            <SliderComponent
              value={azimuthEnd}
              label="Azimuth End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={azimuthEnd}
              onChange={(e, v) => setAzimuthEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

         
          <Box mt={3}>
            <SliderComponent
              value={zenithStart}
              label="Zenith Start Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithStart}
              onChange={(e, v) => setZenithStart(v)}
              disabled={barridoEnProgreso}
            />
          </Box>
          <Box mt={2}>
            <SliderComponent
              value={zenithEnd}
              label="Zenith End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithEnd}
              onChange={(e, v) => setZenithEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={2}>
            {barridoEnProgreso && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnSweep2"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              align="right"
              disabled={barridoEnProgreso}
            >
              {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
            </Button>
          </Box>

         
          {barridoEnProgreso && (
            <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width:
                    faseBarrido === "azimuth"
                      ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
                      : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

         
          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA2_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA2_COLUMNS[0]]: `${d.angle}°`, // si luego quieres separar ejes, lo ajustamos
                  [SUBSISTEMA2_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[3]]: (
                    ((d.voltage ?? 0) * (d.current ?? 0)) / 100
                  ).toFixed(2),
                  [SUBSISTEMA2_COLUMNS[4]]: "—",
                  [SUBSISTEMA2_COLUMNS[5]]: "—",
                }))}
              />
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay mediciones temporales del barrido.
                </Typography>
              </Paper>
            )}
          </Box>

         
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={guardarBarrido}
              align="right"
              disabled={datosTemporales.length === 0}
            >
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

        
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
                  sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}
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
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={VOLTAGE_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />
            </Paper>
          </Box>
          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={CURRENT_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME}
              />
            </Paper>
          </Box>
          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
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

export default Subsistema2;
*/










































//Nueva nueva version
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

// UI antigua
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// Estilos antiguos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import app from "../../firebaseConfig.js";

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  const {
    MAIN_TITLE,
    DESCRIPTION,
    SAVE_BUTTON,
    MOVE_BUTTON, // texto de "iniciar barrido"
    DOWNLOAD_GRAPHS_BUTTON,
    DOWNLOAD_1_GRAPH,
    BACK_BUTTON,
    CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE,
  } = PAGE_TITLES;

  // ==================== ESTADOS (BARRIDO 2 EJES) ====================
  // Azimuth
  const [azimuthStart, setAzimuthStart] = useState(0);
  const [azimuthEnd, setAzimuthEnd] = useState(20);

  // Zenith
  const [zenithStart, setZenithStart] = useState(0);
  const [zenithEnd, setZenithEnd] = useState(20);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);

  const [azimuthAngles, setAzimuthAngles] = useState([]);
  const [zenithAngles, setZenithAngles] = useState([]);

  // Fase actual del barrido
  const [faseBarrido, setFaseBarrido] = useState("azimuth");
  // "azimuth" -> "zenith" -> "done"

  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // refs para evitar closures viejos
  const azimuthAnglesRef = useRef([]);
  const zenithAnglesRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("azimuth");
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    azimuthAnglesRef.current = azimuthAngles;
    zenithAnglesRef.current = zenithAngles;
    anguloActualIndexRef.current = anguloActualIndex;
    faseBarridoRef.current = faseBarrido;
    sweepIdActualRef.current = sweepIdActual;
  }, [azimuthAngles, zenithAngles, anguloActualIndex, faseBarrido, sweepIdActual]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () =>
      `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserSession(generarUserSession());
  }, []);

  // ==================== AUXILIAR: LISTA DE ÁNGULOS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== INICIAR BARRIDO 2 EJES ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");

    if (azimuthStart === azimuthEnd)
      return alert("Azimuth Start y End deben ser diferentes");
    if (zenithStart === zenithEnd)
      return alert("Zenith Start y End deben ser diferentes");

    try {
      const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
      const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);

      setAzimuthAngles(azList);
      setZenithAngles(zeList);

      setBarridoEnProgreso(true);
      setFaseBarrido("azimuth");
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await Promise.all([
        set(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
          status: "in_progress",
          fase: "azimuth",
          timestamp: Date.now(),
          userSession,
        }),
        set(ref(db, "experiments/Exp2/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido Exp2 iniciado:", { azList, zeList });
      // ⚠️ NO enviamos comando aquí.
      // Esperamos a que Arduino mande PITCH: para iniciar el handshake.
    } catch (error) {
      console.error("❌ Error al iniciar barrido Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER PANEL SEGÚN FASE ====================
  const moverASiguienteAngulo = async (fase, angulo, sweepId, index) => {
    try {
      const comando = fase === "azimuth" ? "p" + angulo : "r" + angulo;

      console.log(
        `🎯 [${fase}] Moviendo a ${angulo}° (${index + 1}/${fase === "azimuth"
          ? azimuthAnglesRef.current.length
          : zenithAnglesRef.current.length
        })`
      );

      const fbRef = ref(db, "experiments/Exp2/communication/FrontToBack");
      await set(fbRef, comando);

      setTimeout(async () => {
        await set(fbRef, "x");
      }, 500);

      await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
        fase,
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error al mover panel Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== HANDSHAKE + FIN MOVIMIENTO ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/communication/BackToFront");

    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (!msg || msg === "x") return;

      const fase = faseBarridoRef.current;
      const indexActual = anguloActualIndexRef.current;
      const sweepId = sweepIdActualRef.current;
      if (!sweepId) return;

      // ---------- HANDSHAKE ----------
      if (msg === "PITCH:") {
        if (fase === "azimuth") {
          const azList = azimuthAnglesRef.current;
          const ang = azList[indexActual];
          console.log(`🟦 PITCH pedido -> envío p${ang}`);
          moverASiguienteAngulo("azimuth", ang, sweepId, indexActual);
        }

        if (fase === "zenith") {
          console.log(`🟩 PITCH pedido (zenith fase) -> envío p${azimuthEnd} fijo`);
          moverASiguienteAngulo("azimuth", azimuthEnd, sweepId, indexActual);
        }
        return;
      }

      if (msg === "ROLL:") {
        if (fase === "azimuth") {
          console.log(`🟦 ROLL pedido -> envío r${zenithStart} fijo`);
          moverASiguienteAngulo("zenith", zenithStart, sweepId, indexActual);
        }

        if (fase === "zenith") {
          const zeList = zenithAnglesRef.current;
          const ang = zeList[indexActual];
          console.log(`🟩 ROLL pedido -> envío r${ang}`);
          moverASiguienteAngulo("zenith", ang, sweepId, indexActual);
        }
        return;
      }

      // ---------- FIN MOVIMIENTO ----------
      if (msg === "EndMov") {
        console.log("✅ EndMov recibido Exp2");

        const siguiente = indexActual + 1;

        if (fase === "azimuth") {
          const azList = azimuthAnglesRef.current;

          if (siguiente < azList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🔁 Azimuth terminado, iniciando Zenith...");
            setFaseBarrido("zenith");
            setAnguloActualIndex(0);
          }
          return;
        }

        if (fase === "zenith") {
          const zeList = zenithAnglesRef.current;

          if (siguiente < zeList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🎉 Barrido Exp2 completado!");
            setBarridoEnProgreso(false);
            setFaseBarrido("done");

            await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
              status: "completed",
              fase: "done",
              lastUpdated: Date.now(),
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/measurements");
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

  // ==================== GUARDAR BARRIDO LOCAL ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp2/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
        },
        data: datosTemporales,
      };

      localStorage.setItem(
        `historicalData_subsistema2_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido Exp2:", error);
    }
  };

  // ==================== BACK COMO ANTES ====================
  const noEnviarNuevoAngulo = async () => {
    try {
      await set(ref(db, "Exp2/FrontToBack"), "n").catch(() => {});
      await set(ref(db, "experiments/Exp2/communication/FrontToBack"), "n").catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarDatos = async () => {
    try {
      await remove(ref(db, "Exp2/data")).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  // ==================== EXPORT TXT ====================
  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem2_all_data.txt",
      metadata: [
        { label: "Azimuth Sweep", value: `${azimuthStart}° → ${azimuthEnd}°` },
        { label: "Zenith Sweep", value: `${zenithStart}° → ${zenithEnd}°` },
      ],
      sections: [
        {
          title: "Measurements",
          headers: ["Angle", "Voltage", "Current"],
          data: datosTemporales.map((d) => [d.angle, d.voltage, d.current]),
        },
      ],
    });
  };

  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            🚀 Automatic sweeping control (2-axis)
          </Typography>

          
          <SliderComponent
            value={azimuthStart}
            label="Azimuth Start Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={azimuthStart}
            onChange={(e, v) => setAzimuthStart(v)}
            disabled={barridoEnProgreso}
          />
          <Box mt={2}>
            <SliderComponent
              value={azimuthEnd}
              label="Azimuth End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={azimuthEnd}
              onChange={(e, v) => setAzimuthEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          
          <Box mt={3}>
            <SliderComponent
              value={zenithStart}
              label="Zenith Start Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithStart}
              onChange={(e, v) => setZenithStart(v)}
              disabled={barridoEnProgreso}
            />
          </Box>
          <Box mt={2}>
            <SliderComponent
              value={zenithEnd}
              label="Zenith End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithEnd}
              onChange={(e, v) => setZenithEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          
          <Box mt={2}>
            {barridoEnProgreso && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnSweep2"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              align="right"
              disabled={barridoEnProgreso}
            >
              {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
            </Button>
          </Box>

         
          {barridoEnProgreso && (
            <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width:
                    faseBarrido === "azimuth"
                      ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
                      : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

          
          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA2_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA2_COLUMNS[0]]: `${d.angle}°`,
                  [SUBSISTEMA2_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[3]]: (
                    ((d.voltage ?? 0) * (d.current ?? 0)) / 100
                  ).toFixed(2),
                  [SUBSISTEMA2_COLUMNS[4]]: "—",
                  [SUBSISTEMA2_COLUMNS[5]]: "—",
                }))}
              />
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay mediciones temporales del barrido.
                </Typography>
              </Paper>
            )}
          </Box>

          
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={guardarBarrido}
              align="right"
              disabled={datosTemporales.length === 0}
            >
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

        
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
                <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>
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
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={VOLTAGE_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={CURRENT_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME}
              />
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
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

export default Subsistema2;*/
































//Nueva version

/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

// UI antigua
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// Estilos antiguos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import app from "../../firebaseConfig.js";

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

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

  // ==================== ESTADOS (BARRIDO 2 EJES) ====================
  const [azimuthStart, setAzimuthStart] = useState(0);
  const [azimuthEnd, setAzimuthEnd] = useState(20);

  const [zenithStart, setZenithStart] = useState(0);
  const [zenithEnd, setZenithEnd] = useState(20);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);

  const [azimuthAngles, setAzimuthAngles] = useState([]);
  const [zenithAngles, setZenithAngles] = useState([]);

  const [faseBarrido, setFaseBarrido] = useState("azimuth");
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // refs de listas/fase/index/sweep
  const azimuthAnglesRef = useRef([]);
  const zenithAnglesRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("azimuth");
  const sweepIdActualRef = useRef(null);

  // refs IMPORTANTES para valores fijos (evitan stale closure)
  const azimuthEndRef = useRef(azimuthEnd);
  const zenithStartRef = useRef(zenithStart);

  useEffect(() => {
    azimuthAnglesRef.current = azimuthAngles;
    zenithAnglesRef.current = zenithAngles;
    anguloActualIndexRef.current = anguloActualIndex;
    faseBarridoRef.current = faseBarrido;
    sweepIdActualRef.current = sweepIdActual;
  }, [azimuthAngles, zenithAngles, anguloActualIndex, faseBarrido, sweepIdActual]);

  // mantener refs fijos actualizados
  useEffect(() => {
    azimuthEndRef.current = azimuthEnd;
  }, [azimuthEnd]);

  useEffect(() => {
    zenithStartRef.current = zenithStart;
  }, [zenithStart]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () =>
      `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserSession(generarUserSession());
  }, []);

  // ==================== AUXILIAR ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== INICIAR BARRIDO ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");

    if (azimuthStart === azimuthEnd)
      return alert("Azimuth Start y End deben ser diferentes");
    if (zenithStart === zenithEnd)
      return alert("Zenith Start y End deben ser diferentes");

    try {
      const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
      const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);

      setAzimuthAngles(azList);
      setZenithAngles(zeList);

      setBarridoEnProgreso(true);
      setFaseBarrido("azimuth");
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await Promise.all([
        set(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
          status: "in_progress",
          fase: "azimuth",
          timestamp: Date.now(),
          userSession,
        }),
        set(ref(db, "experiments/Exp2/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido Exp2 iniciado:", { azList, zeList });
      // esperamos handshake del Arduino
    } catch (error) {
      console.error("❌ Error al iniciar barrido Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER PANEL ====================
  const moverASiguienteAngulo = async (fase, angulo, sweepId, index) => {
    try {
      const comando = fase === "azimuth" ? "p" + angulo : "r" + angulo;

      console.log(
        `🎯 [${fase}] Moviendo a ${angulo}° (${index + 1}/${fase === "azimuth"
          ? azimuthAnglesRef.current.length
          : zenithAnglesRef.current.length
        })`
      );

      const fbRef = ref(db, "experiments/Exp2/communication/FrontToBack");
      await set(fbRef, comando);

      setTimeout(async () => {
        await set(fbRef, "x");
      }, 500);

      await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
        fase,
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error al mover panel Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== HANDSHAKE + EndMov ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/communication/BackToFront");

    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (!msg || msg === "x") return;

      const fase = faseBarridoRef.current;
      const indexActual = anguloActualIndexRef.current;
      const sweepId = sweepIdActualRef.current;
      if (!sweepId) return;

      // ---------- HANDSHAKE ----------
      if (msg === "PITCH:") {
        if (fase === "azimuth") {
          const azList = azimuthAnglesRef.current;
          const ang = azList[indexActual];
          console.log(`🟦 PITCH pedido -> envío p${ang}`);
          moverASiguienteAngulo("azimuth", ang, sweepId, indexActual);
        }

        if (fase === "zenith") {
          const fijoAz = azimuthEndRef.current; // ✅ ref actualizado
          console.log(`🟩 PITCH pedido (zenith fase) -> envío p${fijoAz} fijo`);
          moverASiguienteAngulo("azimuth", fijoAz, sweepId, indexActual);
        }
        return;
      }

      if (msg === "ROLL:") {
        if (fase === "azimuth") {
          const fijoZe = zenithStartRef.current; // ✅ ref actualizado
          console.log(`🟦 ROLL pedido -> envío r${fijoZe} fijo`);
          moverASiguienteAngulo("zenith", fijoZe, sweepId, indexActual);
        }

        if (fase === "zenith") {
          const zeList = zenithAnglesRef.current;
          const ang = zeList[indexActual];
          console.log(`🟩 ROLL pedido -> envío r${ang}`);
          moverASiguienteAngulo("zenith", ang, sweepId, indexActual);
        }
        return;
      }

      // ---------- FIN MOVIMIENTO ----------
      if (msg === "EndMov") {
        console.log("✅ EndMov recibido Exp2");

        const siguiente = indexActual + 1;

        if (fase === "azimuth") {
          const azList = azimuthAnglesRef.current;

          if (siguiente < azList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🔁 Azimuth terminado, iniciando Zenith...");
            setFaseBarrido("zenith");
            setAnguloActualIndex(0);
          }
          return;
        }

        if (fase === "zenith") {
          const zeList = zenithAnglesRef.current;

          if (siguiente < zeList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🎉 Barrido Exp2 completado!");
            setBarridoEnProgreso(false);
            setFaseBarrido("done");

            await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
              status: "completed",
              fase: "done",
              lastUpdated: Date.now(),
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ==================== MEDICIONES ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/measurements");
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

  // ==================== GUARDAR BARRIDO ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");
    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp2/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
        },
        data: datosTemporales,
      };

      localStorage.setItem(
        `historicalData_subsistema2_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido Exp2:", error);
    }
  };

  // ==================== BACK ====================
  const noEnviarNuevoAngulo = async () => {
    try {
      await set(ref(db, "Exp2/FrontToBack"), "n").catch(() => {});
      await set(ref(db, "experiments/Exp2/communication/FrontToBack"), "n").catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarDatos = async () => {
    try {
      await remove(ref(db, "Exp2/data")).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  // ==================== EXPORT TXT ====================
  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem2_all_data.txt",
      metadata: [
        { label: "Azimuth Sweep", value: `${azimuthStart}° → ${azimuthEnd}°` },
        { label: "Zenith Sweep", value: `${zenithStart}° → ${zenithEnd}°` },
      ],
      sections: [
        {
          title: "Measurements",
          headers: ["Angle", "Voltage", "Current"],
          data: datosTemporales.map((d) => [d.angle, d.voltage, d.current]),
        },
      ],
    });
  };

  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            🚀 Automatic sweeping control (2-axis)
          </Typography>

          <SliderComponent
            value={azimuthStart}
            label="Azimuth Start Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={azimuthStart}
            onChange={(e, v) => setAzimuthStart(v)}
            disabled={barridoEnProgreso}
          />
          <Box mt={2}>
            <SliderComponent
              value={azimuthEnd}
              label="Azimuth End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={azimuthEnd}
              onChange={(e, v) => setAzimuthEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={3}>
            <SliderComponent
              value={zenithStart}
              label="Zenith Start Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithStart}
              onChange={(e, v) => setZenithStart(v)}
              disabled={barridoEnProgreso}
            />
          </Box>
          <Box mt={2}>
            <SliderComponent
              value={zenithEnd}
              label="Zenith End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithEnd}
              onChange={(e, v) => setZenithEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={2}>
            {barridoEnProgreso && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnSweep2"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              align="right"
              disabled={barridoEnProgreso}
            >
              {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
            </Button>
          </Box>

          {barridoEnProgreso && (
            <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width:
                    faseBarrido === "azimuth"
                      ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
                      : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA2_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA2_COLUMNS[0]]: `${d.angle}°`,
                  [SUBSISTEMA2_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[3]]: (
                    ((d.voltage ?? 0) * (d.current ?? 0)) / 100
                  ).toFixed(2),
                  [SUBSISTEMA2_COLUMNS[4]]: "—",
                  [SUBSISTEMA2_COLUMNS[5]]: "—",
                }))}
              />
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay mediciones temporales del barrido.
                </Typography>
              </Paper>
            )}
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={guardarBarrido}
              align="right"
              disabled={datosTemporales.length === 0}
            >
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

        
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
                <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>
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
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={VOLTAGE_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={CURRENT_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME}
              />
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
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

export default Subsistema2;*/
























































// Version funcional sin usuarios
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

// UI antigua
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// Estilos antiguos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import app from "../../firebaseConfig.js";

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

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

  // ==================== ESTADOS (BARRIDO 2 EJES) ====================
  const [azimuthStart, setAzimuthStart] = useState(0);
  const [azimuthEnd, setAzimuthEnd] = useState(20);

  const [zenithStart, setZenithStart] = useState(0);
  const [zenithEnd, setZenithEnd] = useState(20);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);

  const [azimuthAngles, setAzimuthAngles] = useState([]);
  const [zenithAngles, setZenithAngles] = useState([]);

  const [faseBarrido, setFaseBarrido] = useState("azimuth");
  // "azimuth" -> "zenith" -> "done"

  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // refs para evitar closures viejos
  const azimuthAnglesRef = useRef([]);
  const zenithAnglesRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("azimuth");
  const sweepIdActualRef = useRef(null);
  const barridoEnProgresoRef = useRef(false);

  // ✅ NUEVO: para evitar procesar el mismo msg dos veces
  const lastMsgRef = useRef(null);

  useEffect(() => {
    azimuthAnglesRef.current = azimuthAngles;
    zenithAnglesRef.current = zenithAngles;
    anguloActualIndexRef.current = anguloActualIndex;
    faseBarridoRef.current = faseBarrido;
    sweepIdActualRef.current = sweepIdActual;
    barridoEnProgresoRef.current = barridoEnProgreso;
  }, [
    azimuthAngles,
    zenithAngles,
    anguloActualIndex,
    faseBarrido,
    sweepIdActual,
    barridoEnProgreso
  ]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () =>
      `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== AUXILIAR LISTA DE ÁNGULOS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== ENVIAR COMANDOS ====================
  const enviarComando = async (comando) => {
    const fbRef = ref(db, "experiments/Exp2/communication/FrontToBack");
    await set(fbRef, comando);
    console.log(`✅ Comando enviado: ${comando}`);

    // reset canal
    setTimeout(async () => {
      await set(fbRef, "x");
    }, 300);
  };

  // ==================== INICIAR BARRIDO ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgresoRef.current) return alert("Ya hay un barrido en progreso");

    if (azimuthStart === azimuthEnd)
      return alert("Azimuth Start y End deben ser diferentes");
    if (zenithStart === zenithEnd)
      return alert("Zenith Start y End deben ser diferentes");

    try {
      const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
      const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);

      setAzimuthAngles(azList);
      setZenithAngles(zeList);

      setBarridoEnProgreso(true);
      setFaseBarrido("azimuth");
      setAnguloActualIndex(0);
      setDatosTemporales([]);
      lastMsgRef.current = null; // ✅ limpia el último msg previo

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await Promise.all([
        set(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
          status: "in_progress",
          fase: "azimuth",
          timestamp: Date.now(),
          userSession,
        }),
        set(ref(db, "experiments/Exp2/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido Exp2 iniciado:", { azList, zeList });

      // No enviamos nada aquí: esperamos prompts PITCH/ROLL del Arduino
    } catch (error) {
      console.error("❌ Error al iniciar barrido Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR CANAL BackToFront ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/communication/BackToFront");

    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (!msg || msg === "x") return;

      // ✅ NUEVO: evita procesar el mismo mensaje repetido
      if (lastMsgRef.current === msg) return;
      lastMsgRef.current = msg;

      const fase = faseBarridoRef.current;
      const idx = anguloActualIndexRef.current;
      const sweepId = sweepIdActualRef.current;
      const enProgreso = barridoEnProgresoRef.current;

      if (!enProgreso || !sweepId) return;

      // ---------- PROMPT PITCH ----------
      if (msg === "PITCH:") {
        if (fase === "azimuth") {
          const azList = azimuthAnglesRef.current;
          const anguloPitch = azList[idx];

          console.log(`🟦 PITCH pedido -> envío p${anguloPitch}`);
          await enviarComando("p" + anguloPitch);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentPitch: anguloPitch,
            lastUpdated: Date.now(),
          });
        }

        if (fase === "zenith") {
          const pitchFijo = azimuthEnd;

          console.log(`🟩 PITCH pedido (zenith fase) -> envío p${pitchFijo} fijo`);
          await enviarComando("p" + pitchFijo);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentPitch: pitchFijo,
            lastUpdated: Date.now(),
          });
        }

        return;
      }

      // ---------- PROMPT ROLL ----------
      if (msg === "ROLL:") {
        if (fase === "azimuth") {
          const rollFijo = zenithStart;

          console.log(`🟦 ROLL pedido -> envío r${rollFijo} fijo`);
          await enviarComando("r" + rollFijo);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentRoll: rollFijo,
            lastUpdated: Date.now(),
          });
        }

        if (fase === "zenith") {
          const zeList = zenithAnglesRef.current;
          const anguloRoll = zeList[idx];

          console.log(`🟩 ROLL pedido -> envío r${anguloRoll}`);
          await enviarComando("r" + anguloRoll);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentRoll: anguloRoll,
            lastUpdated: Date.now(),
          });
        }

        return;
      }

      // ---------- FIN MOVIMIENTO ----------
      if (msg === "EndMov") {
        console.log("✅ EndMov recibido Exp2");

        const azList = azimuthAnglesRef.current;
        const zeList = zenithAnglesRef.current;

        if (fase === "azimuth") {
          const siguiente = idx + 1;

          if (siguiente < azList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🔁 Azimuth terminado, iniciando Zenith...");
            setFaseBarrido("zenith");
            setAnguloActualIndex(0);

            await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
              fase: "zenith",
              lastUpdated: Date.now(),
            });
          }
        }

        if (fase === "zenith") {
          const siguiente = idx + 1;

          if (siguiente < zeList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🎉 Barrido Exp2 completado!");
            setBarridoEnProgreso(false);
            setFaseBarrido("done");

            // ✅ NUEVO: marcar completo + limpiar currentSweepId
            await Promise.all([
              update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
                status: "completed",
                fase: "done",
                lastUpdated: Date.now(),
              }),
              set(ref(db, "experiments/Exp2/currentSweepId"), null),
            ]);
          }
        }

        return;
      }
    });

    return () => unsubscribe();
  }, [azimuthEnd, zenithStart, db]);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/measurements");

    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        console.log("📊 Nueva medición temporal Exp2:", data);

        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });

    return () => unsubscribe();
  }, [sweepIdActual, db]);

  // ==================== GUARDAR BARRIDO ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp2/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
        },
        data: datosTemporales,
      };

      localStorage.setItem(
        `historicalData_subsistema2_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido Exp2:", error);
    }
  };

  // ==================== BACK COMO ANTES ====================
  const noEnviarNuevoAngulo = async () => {
    try {
      await set(ref(db, "experiments/Exp2/communication/FrontToBack"), "n").catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ NUEVO: borrar datos en rutas correctas
  const eliminarDatos = async () => {
    try {
      await remove(ref(db, "experiments/Exp2/measurements")).catch(() => {});
      await remove(ref(db, "experiments/Exp2/sweeps")).catch(() => {});
      await set(ref(db, "experiments/Exp2/currentSweepId"), null).catch(() => {});
      console.log("🧹 Datos Exp2 eliminados");
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  // ==================== EXPORT TXT ====================
  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem2_all_data.txt",
      metadata: [
        { label: "Azimuth Sweep", value: `${azimuthStart}° → ${azimuthEnd}°` },
        { label: "Zenith Sweep", value: `${zenithStart}° → ${zenithEnd}°` },
      ],
      sections: [
        {
          title: "Measurements",
          headers: ["Pitch", "Roll", "Voltage", "Current"],
          data: datosTemporales.map((d) => [
            d.pitchAngle,
            d.rollAngle,
            d.voltage,
            d.current,
          ]),
        },
      ],
    });
  };

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
       
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            🚀 Automatic sweeping control (2-axis)
          </Typography>

          <SliderComponent
            value={azimuthStart}
            label="Azimuth Start Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={azimuthStart}
            onChange={(e, v) => setAzimuthStart(v)}
            disabled={barridoEnProgreso}
          />
          <Box mt={2}>
            <SliderComponent
              value={azimuthEnd}
              label="Azimuth End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={azimuthEnd}
              onChange={(e, v) => setAzimuthEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={3}>
            <SliderComponent
              value={zenithStart}
              label="Zenith Start Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithStart}
              onChange={(e, v) => setZenithStart(v)}
              disabled={barridoEnProgreso}
            />
          </Box>
          <Box mt={2}>
            <SliderComponent
              value={zenithEnd}
              label="Zenith End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithEnd}
              onChange={(e, v) => setZenithEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={2}>
            {barridoEnProgreso && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnSweep2"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              align="right"
              disabled={barridoEnProgreso}
            >
              {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
            </Button>
          </Box>

          {barridoEnProgreso && (
            <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width:
                    faseBarrido === "azimuth"
                      ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
                      : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA2_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA2_COLUMNS[0]]: `P:${d.pitchAngle ?? "-"}° / R:${d.rollAngle ?? "-"}°`,
                  [SUBSISTEMA2_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[3]]: (
                    ((d.voltage ?? 0) * (d.current ?? 0)) / 100
                  ).toFixed(2),
                  [SUBSISTEMA2_COLUMNS[4]]: "—",
                  [SUBSISTEMA2_COLUMNS[5]]: "—",
                }))}
              />
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay mediciones temporales del barrido.
                </Typography>
              </Paper>
            )}
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={guardarBarrido}
              align="right"
              disabled={datosTemporales.length === 0}
            >
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>

        
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
                  sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}
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
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={VOLTAGE_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />
            </Paper>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {}}
            align="right"
            marginTop={-1}
          >
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={CURRENT_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME}
              />
            </Paper>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {}}
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

export default Subsistema2;



*/



























// Usuarios
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

// UI antigua
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// Estilos antiguos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  remove,
} from "firebase/database";
import app from "../../firebaseConfig.js";

// exportacion de datos
import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

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

  // ==================== ESTADOS (BARRIDO 2 EJES) ====================
  const [azimuthStart, setAzimuthStart] = useState(0);
  const [azimuthEnd, setAzimuthEnd] = useState(20);

  const [zenithStart, setZenithStart] = useState(0);
  const [zenithEnd, setZenithEnd] = useState(20);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);

  const [azimuthAngles, setAzimuthAngles] = useState([]);
  const [zenithAngles, setZenithAngles] = useState([]);

  const [faseBarrido, setFaseBarrido] = useState("azimuth");
  // "azimuth" -> "zenith" -> "done"

  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // refs para evitar closures viejos
  const azimuthAnglesRef = useRef([]);
  const zenithAnglesRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("azimuth");
  const sweepIdActualRef = useRef(null);
  const barridoEnProgresoRef = useRef(false);

  // ✅ NUEVO: para evitar procesar el mismo msg dos veces
  const lastMsgRef = useRef(null);

  useEffect(() => {
    azimuthAnglesRef.current = azimuthAngles;
    zenithAnglesRef.current = zenithAngles;
    anguloActualIndexRef.current = anguloActualIndex;
    faseBarridoRef.current = faseBarrido;
    sweepIdActualRef.current = sweepIdActual;
    barridoEnProgresoRef.current = barridoEnProgreso;
  }, [
    azimuthAngles,
    zenithAngles,
    anguloActualIndex,
    faseBarrido,
    sweepIdActual,
    barridoEnProgreso
  ]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () =>
      `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== AUXILIAR LISTA DE ÁNGULOS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== ENVIAR COMANDOS ====================
  const enviarComando = async (comando) => {
    const fbRef = ref(db, "experiments/Exp2/communication/FrontToBack");
    await set(fbRef, comando);
    console.log(`✅ Comando enviado: ${comando}`);

    // reset canal
    setTimeout(async () => {
      await set(fbRef, "x");
    }, 300);
  };

  // ==================== INICIAR BARRIDO ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgresoRef.current) return alert("Ya hay un barrido en progreso");

    if (azimuthStart === azimuthEnd)
      return alert("Azimuth Start y End deben ser diferentes");
    if (zenithStart === zenithEnd)
      return alert("Zenith Start y End deben ser diferentes");

    try {
      const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
      const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);

      setAzimuthAngles(azList);
      setZenithAngles(zeList);

      setBarridoEnProgreso(true);
      setFaseBarrido("azimuth");
      setAnguloActualIndex(0);
      setDatosTemporales([]);
      lastMsgRef.current = null; // ✅ limpia el último msg previo

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await Promise.all([
        set(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
          status: "in_progress",
          fase: "azimuth",
          timestamp: Date.now(),
          userSession,
        }),
        set(ref(db, "experiments/Exp2/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido Exp2 iniciado:", { azList, zeList });

      // No enviamos nada aquí: esperamos prompts PITCH/ROLL del Arduino
    } catch (error) {
      console.error("❌ Error al iniciar barrido Exp2:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR CANAL BackToFront ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/communication/BackToFront");

    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (!msg || msg === "x") return;

      // ✅ evita procesar el mismo mensaje repetido
      if (lastMsgRef.current === msg) return;
      lastMsgRef.current = msg;

      const fase = faseBarridoRef.current;
      const idx = anguloActualIndexRef.current;
      const sweepId = sweepIdActualRef.current;
      const enProgreso = barridoEnProgresoRef.current;

      if (!enProgreso || !sweepId) return;

      // ---------- PROMPT PITCH ----------
      if (msg === "PITCH:") {
        if (fase === "azimuth") {
          const azList = azimuthAnglesRef.current;
          const anguloPitch = azList[idx];

          console.log(`🟦 PITCH pedido -> envío p${anguloPitch}`);
          await enviarComando("p" + anguloPitch);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentPitch: anguloPitch,
            lastUpdated: Date.now(),
          });
        }

        if (fase === "zenith") {
          const pitchFijo = azimuthEnd;

          console.log(`🟩 PITCH pedido (zenith fase) -> envío p${pitchFijo} fijo`);
          await enviarComando("p" + pitchFijo);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentPitch: pitchFijo,
            lastUpdated: Date.now(),
          });
        }

        return;
      }

      // ---------- PROMPT ROLL ----------
      if (msg === "ROLL:") {
        if (fase === "azimuth") {
          const rollFijo = zenithStart;

          console.log(`🟦 ROLL pedido -> envío r${rollFijo} fijo`);
          await enviarComando("r" + rollFijo);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentRoll: rollFijo,
            lastUpdated: Date.now(),
          });
        }

        if (fase === "zenith") {
          const zeList = zenithAnglesRef.current;
          const anguloRoll = zeList[idx];

          console.log(`🟩 ROLL pedido -> envío r${anguloRoll}`);
          await enviarComando("r" + anguloRoll);

          await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
            fase,
            currentRoll: anguloRoll,
            lastUpdated: Date.now(),
          });
        }

        return;
      }

      // ---------- FIN MOVIMIENTO ----------
      if (msg === "EndMov") {
        console.log("✅ EndMov recibido Exp2");

        const azList = azimuthAnglesRef.current;
        const zeList = zenithAnglesRef.current;

        if (fase === "azimuth") {
          const siguiente = idx + 1;

          if (siguiente < azList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🔁 Azimuth terminado, iniciando Zenith...");
            setFaseBarrido("zenith");
            setAnguloActualIndex(0);

            await update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
              fase: "zenith",
              lastUpdated: Date.now(),
            });
          }
        }

        if (fase === "zenith") {
          const siguiente = idx + 1;

          if (siguiente < zeList.length) {
            setAnguloActualIndex(siguiente);
          } else {
            console.log("🎉 Barrido Exp2 completado!");
            setBarridoEnProgreso(false);
            setFaseBarrido("done");

            // ✅ marcar completo + limpiar currentSweepId
            await Promise.all([
              update(ref(db, `experiments/Exp2/sweeps/${sweepId}`), {
                status: "completed",
                fase: "done",
                lastUpdated: Date.now(),
              }),
              set(ref(db, "experiments/Exp2/currentSweepId"), null),
            ]);
          }
        }

        return;
      }
    });

    return () => unsubscribe();
  }, [azimuthEnd, zenithStart, db]);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp2/measurements");

    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        console.log("📊 Nueva medición temporal Exp2:", data);

        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });

    return () => unsubscribe();
  }, [sweepIdActual, db]);

  // ==================== GUARDAR BARRIDO ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp2/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          azimuthStart,
          azimuthEnd,
          zenithStart,
          zenithEnd,
          step: 5,
        },
        data: datosTemporales,
      };

      localStorage.setItem(
        `historicalData_subsistema2_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido Exp2:", error);
    }
  };

  // ==================== BACK COMO ANTES ====================
  const noEnviarNuevoAngulo = async () => {
    try {
      await set(ref(db, "experiments/Exp2/communication/FrontToBack"), "n").catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  // borrar datos en rutas correctas
  const eliminarDatos = async () => {
    try {
      await remove(ref(db, "experiments/Exp2/measurements")).catch(() => {});
      await remove(ref(db, "experiments/Exp2/sweeps")).catch(() => {});
      await set(ref(db, "experiments/Exp2/currentSweepId"), null).catch(() => {});
      console.log("🧹 Datos Exp2 eliminados");
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  // ==================== EXPORT TXT ====================
  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem2_all_data.txt",
      metadata: [
        { label: "Azimuth Sweep", value: `${azimuthStart}° → ${azimuthEnd}°` },
        { label: "Zenith Sweep", value: `${zenithStart}° → ${zenithEnd}°` },
      ],
      sections: [
        {
          title: "Measurements",
          headers: ["Pitch", "Roll", "Voltage", "Current"],
          data: datosTemporales.map((d) => [
            d.pitchAngle,
            d.rollAngle,
            d.voltage,
            d.current,
          ]),
        },
      ],
    });
  };

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">*/
        {/* ===================== COLUMNA IZQUIERDA ===================== */}
       /* <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            🚀 Automatic sweeping control (2-axis)
          </Typography>

          <SliderComponent
            value={azimuthStart}
            label="Azimuth Start Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={azimuthStart}
            onChange={(e, v) => setAzimuthStart(v)}
            disabled={barridoEnProgreso}
          />
          <Box mt={2}>
            <SliderComponent
              value={azimuthEnd}
              label="Azimuth End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={azimuthEnd}
              onChange={(e, v) => setAzimuthEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={3}>
            <SliderComponent
              value={zenithStart}
              label="Zenith Start Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithStart}
              onChange={(e, v) => setZenithStart(v)}
              disabled={barridoEnProgreso}
            />
          </Box>
          <Box mt={2}>
            <SliderComponent
              value={zenithEnd}
              label="Zenith End Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={zenithEnd}
              onChange={(e, v) => setZenithEnd(v)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={2}>
            {barridoEnProgreso && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnSweep2"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              align="right"
              disabled={barridoEnProgreso}
            >
              {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
            </Button>
          </Box>

          {barridoEnProgreso && (
            <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width:
                    faseBarrido === "azimuth"
                      ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
                      : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA2_COLUMNS}
                data={datosTemporales.map((d) => ({
                  // ✅ Zenith Angle (°)  -> rollAngle
                  [SUBSISTEMA2_COLUMNS[0]]: `${d.rollAngle ?? "-"}°`,

                  // ✅ Azimuth Angle (°) -> pitchAngle
                  [SUBSISTEMA2_COLUMNS[1]]: `${d.pitchAngle ?? "-"}°`,

                  [SUBSISTEMA2_COLUMNS[2]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[3]]: d.current?.toFixed(2),
                  [SUBSISTEMA2_COLUMNS[4]]: (
                    ((d.voltage ?? 0) * (d.current ?? 0)) / 100
                  ).toFixed(2),
                  [SUBSISTEMA2_COLUMNS[5]]: "—",
                }))}
              />
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay mediciones temporales del barrido.
                </Typography>
              </Paper>
            )}
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={guardarBarrido}
              align="right"
              disabled={datosTemporales.length === 0}
            >
              {SAVE_BUTTON}
            </Button>
          </Box>
        </Grid>
*/
        {/* ===================== COLUMNA DERECHA ===================== */}
       /* <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
                  sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}
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
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={VOLTAGE_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME}
              />
            </Paper>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {}}
            align="right"
            marginTop={-1}
          >
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip
                title={CURRENT_VS_TIME_TITLE}
                description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME}
              />
            </Paper>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {}}
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

export default Subsistema2;
*/






























// Usuarios version final
// ozzyjames11: comentado por ozzy, la nueva versión incluye una similitud al subsistema1
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Grid from "@mui/material/Grid";
// import { useSelector } from "react-redux"; // ✅ UID real

// import SliderComponent from "../../components/Elements/SliderComponent";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// import {
//   SUBSISTEMA2_COLUMNS,
//   PAGE_TITLES,
//   GRAPH_DESCRIPTIONS,
// } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// import "../../assets/css/Elements/PaperStyles.css";

// import { getDatabase, ref, set, update, onValue, onChildAdded, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import { generateTXT } from "../../../src/components/Elements/generateTXT.jsx";

// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   // ✅ UID del usuario logeado
//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     SAVE_BUTTON,
//     MOVE_BUTTON,
//     DOWNLOAD_GRAPHS_BUTTON,
//     DOWNLOAD_1_GRAPH,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     VOLTAGE_VS_TIME_TITLE,
//     CURRENT_VS_TIME_TITLE,
//   } = PAGE_TITLES;

//   const [azimuthStart, setAzimuthStart] = useState(0);
//   const [azimuthEnd, setAzimuthEnd] = useState(20);
//   const [zenithStart, setZenithStart] = useState(0);
//   const [zenithEnd, setZenithEnd] = useState(20);

//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [azimuthAngles, setAzimuthAngles] = useState([]);
//   const [zenithAngles, setZenithAngles] = useState([]);
//   const [faseBarrido, setFaseBarrido] = useState("azimuth");
//   const [anguloActualIndex, setAnguloActualIndex] = useState(0);
//   const [sweepIdActual, setSweepIdActual] = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);

//   const azimuthAnglesRef = useRef([]);
//   const zenithAnglesRef = useRef([]);
//   const anguloActualIndexRef = useRef(0);
//   const faseBarridoRef = useRef("azimuth");
//   const sweepIdActualRef = useRef(null);
//   const barridoEnProgresoRef = useRef(false);
//   const lastMsgRef = useRef(null);

//   useEffect(() => {
//     azimuthAnglesRef.current = azimuthAngles;
//     zenithAnglesRef.current = zenithAngles;
//     anguloActualIndexRef.current = anguloActualIndex;
//     faseBarridoRef.current = faseBarrido;
//     sweepIdActualRef.current = sweepIdActual;
//     barridoEnProgresoRef.current = barridoEnProgreso;
//   }, [azimuthAngles, zenithAngles, anguloActualIndex, faseBarrido, sweepIdActual, barridoEnProgreso]);

//   // ✅ Guard: requiere login
//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para usar este experimento");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
//     const angulos = [];
//     if (inicio <= fin) for (let a = inicio; a <= fin; a += paso) angulos.push(a);
//     else for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
//     return angulos;
//   };

//   const enviarComando = async (comando) => {
//     if (!userId) return;
//     const fbRef = ref(db, `users/${userId}/Exp2/communication/FrontToBack`);
//     await set(fbRef, comando);
//     setTimeout(() => set(fbRef, "x").catch(() => {}), 300);
//   };

//   const iniciarBarrido = async () => {
//     if (!userId) return alert("Debes iniciar sesión");
//     if (barridoEnProgresoRef.current) return alert("Ya hay un barrido en progreso");
//     if (azimuthStart === azimuthEnd) return alert("Azimuth Start y End deben ser diferentes");
//     if (zenithStart === zenithEnd) return alert("Zenith Start y End deben ser diferentes");

//     const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
//     const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);

//     setAzimuthAngles(azList);
//     setZenithAngles(zeList);
//     setBarridoEnProgreso(true);
//     setFaseBarrido("azimuth");
//     setAnguloActualIndex(0);
//     setDatosTemporales([]);
//     lastMsgRef.current = null;

//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     await Promise.all([
//       set(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//         azimuthStart,
//         azimuthEnd,
//         zenithStart,
//         zenithEnd,
//         step: 5,
//         status: "in_progress",
//         fase: "azimuth",
//         timestamp: Date.now(),
//       }),
//       set(ref(db, `users/${userId}/Exp2/currentSweepId`), sweepId),
//     ]);
//   };

//   // Escuchar BackToFront (PITCH:, ROLL:, EndMov)
//   useEffect(() => {
//     if (!userId) return;

//     const dbRef = ref(db, `users/${userId}/Exp2/communication/BackToFront`);
//     const unsubscribe = onValue(dbRef, async (snapshot) => {
//       const msg = snapshot.val();
//       if (!msg || msg === "x") return;

//       if (lastMsgRef.current === msg) return;
//       lastMsgRef.current = msg;

//       const fase = faseBarridoRef.current;
//       const idx = anguloActualIndexRef.current;
//       const sweepId = sweepIdActualRef.current;
//       const enProgreso = barridoEnProgresoRef.current;

//       if (!enProgreso || !sweepId) return;

//       if (msg === "PITCH:") {
//         if (fase === "azimuth") {
//           const anguloPitch = azimuthAnglesRef.current[idx];
//           await enviarComando("p" + anguloPitch);
//           await update(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//             fase,
//             currentPitch: anguloPitch,
//             lastUpdated: Date.now(),
//           });
//         } else if (fase === "zenith") {
//           const pitchFijo = azimuthEnd;
//           await enviarComando("p" + pitchFijo);
//           await update(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//             fase,
//             currentPitch: pitchFijo,
//             lastUpdated: Date.now(),
//           });
//         }
//         return;
//       }

//       if (msg === "ROLL:") {
//         if (fase === "azimuth") {
//           const rollFijo = zenithStart;
//           await enviarComando("r" + rollFijo);
//           await update(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//             fase,
//             currentRoll: rollFijo,
//             lastUpdated: Date.now(),
//           });
//         } else if (fase === "zenith") {
//           const anguloRoll = zenithAnglesRef.current[idx];
//           await enviarComando("r" + anguloRoll);
//           await update(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//             fase,
//             currentRoll: anguloRoll,
//             lastUpdated: Date.now(),
//           });
//         }
//         return;
//       }

//       if (msg === "EndMov") {
//         const azList = azimuthAnglesRef.current;
//         const zeList = zenithAnglesRef.current;

//         if (fase === "azimuth") {
//           const siguiente = idx + 1;
//           if (siguiente < azList.length) setAnguloActualIndex(siguiente);
//           else {
//             setFaseBarrido("zenith");
//             setAnguloActualIndex(0);
//             await update(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//               fase: "zenith",
//               lastUpdated: Date.now(),
//             });
//           }
//         } else if (fase === "zenith") {
//           const siguiente = idx + 1;
//           if (siguiente < zeList.length) setAnguloActualIndex(siguiente);
//           else {
//             setBarridoEnProgreso(false);
//             setFaseBarrido("done");
//             await Promise.all([
//               update(ref(db, `users/${userId}/Exp2/sweeps/${sweepId}`), {
//                 status: "completed",
//                 fase: "done",
//                 lastUpdated: Date.now(),
//               }),
//               set(ref(db, `users/${userId}/Exp2/currentSweepId`), null),
//             ]);
//           }
//         }
//         return;
//       }
//     });

//     return () => unsubscribe();
//   }, [azimuthEnd, zenithStart, db, userId]);

//   // Escuchar measurements temporales del sweep actual
//   useEffect(() => {
//     if (!userId) return;

//     const dbRef = ref(db, `users/${userId}/Exp2/measurements`);
//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const data = snapshot.val();
//       if (!data) return;

//       if (data.sweepId === sweepIdActual && data.isSaved === false) {
//         setDatosTemporales((prev) => {
//           const existe = prev.some((d) => d.timestamp === data.timestamp);
//           return existe ? prev : [...prev, data];
//         });
//       }
//     });

//     return () => unsubscribe();
//   }, [sweepIdActual, db, userId]);

//   const guardarBarrido = async () => {
//     if (!userId) return alert("Debes iniciar sesión");
//     if (datosTemporales.length === 0) return alert("No hay datos para guardar");

//     const confirmar = window.confirm(`¿Guardar ${datosTemporales.length} mediciones del barrido?`);
//     if (!confirmar) return;

//     const updates = {};
//     datosTemporales.forEach((d) => {
//       updates[`users/${userId}/Exp2/measurements/meas_${d.timestamp}/isSaved`] = true;
//     });
//     await update(ref(db), updates);

//     alert("✅ Barrido guardado correctamente");
//     setDatosTemporales([]);
//   };

//   const noEnviarNuevoAngulo = async () => {
//     if (!userId) return;
//     await set(ref(db, `users/${userId}/Exp2/communication/FrontToBack`), "n").catch(() => {});
//     setTimeout(() => set(ref(db, `users/${userId}/Exp2/communication/FrontToBack`), "x").catch(() => {}), 200);
//   };

//   const eliminarDatos = async () => {
//     if (!userId) return;
//     await remove(ref(db, `users/${userId}/Exp2/measurements`)).catch(() => {});
//     await remove(ref(db, `users/${userId}/Exp2/sweeps`)).catch(() => {});
//     await set(ref(db, `users/${userId}/Exp2/currentSweepId`), null).catch(() => {});
//   };

//   const handleBack = () => {
//     noEnviarNuevoAngulo();
//     navigate("/experiments/experimentChooser");
//     eliminarDatos();
//   };

//   const [youtubeVideoId] = useState("nAQz4RMaHVA");

//   const handleDownloadBothData = () => {
//     generateTXT({
//       filename: "subsystem2_all_data.txt",
//       metadata: [
//         { label: "Azimuth Sweep", value: `${azimuthStart}° → ${azimuthEnd}°` },
//         { label: "Zenith Sweep", value: `${zenithStart}° → ${zenithEnd}°` },
//       ],
//       sections: [
//         {
//           title: "Measurements",
//           headers: ["Pitch", "Roll", "Voltage", "Current"],
//           data: datosTemporales.map((d) => [d.pitchAngle, d.rollAngle, d.voltage, d.current]),
//         },
//       ],
//     });
//   };

//   if (!userId) return <Typography>Cargando...</Typography>;

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Grid container spacing={4} alignItems="flex-start">
//         <Grid item xs={12} md={6}>
//           <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
//             🚀 Automatic sweeping control (2-axis)
//           </Typography>

//           <SliderComponent value={azimuthStart} label="Azimuth Start Angle" min={-30} max={30} step={5} actualAngle={azimuthStart} onChange={(e, v) => setAzimuthStart(v)} disabled={barridoEnProgreso} />
//           <Box mt={2}>
//             <SliderComponent value={azimuthEnd} label="Azimuth End Angle" min={-30} max={30} step={5} actualAngle={azimuthEnd} onChange={(e, v) => setAzimuthEnd(v)} disabled={barridoEnProgreso} />
//           </Box>

//           <Box mt={3}>
//             <SliderComponent value={zenithStart} label="Zenith Start Angle" min={-30} max={30} step={5} actualAngle={zenithStart} onChange={(e, v) => setZenithStart(v)} disabled={barridoEnProgreso} />
//           </Box>
//           <Box mt={2}>
//             <SliderComponent value={zenithEnd} label="Zenith End Angle" min={-30} max={30} step={5} actualAngle={zenithEnd} onChange={(e, v) => setZenithEnd(v)} disabled={barridoEnProgreso} />
//           </Box>

//           <Box mt={2}>
//             {barridoEnProgreso && <p style={{ color: "black" }}>El panel está en movimiento</p>}
//             <Button id="btnSweep2" variant="contained" color="primary" onClick={iniciarBarrido} align="right" disabled={barridoEnProgreso}>
//               {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
//             </Button>
//           </Box>

//           {barridoEnProgreso && (
//             <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
//               <Box
//                 sx={{
//                   height: "100%",
//                   borderRadius: 1,
//                   backgroundColor: "#2196f3",
//                   width:
//                     faseBarrido === "azimuth"
//                       ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
//                       : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
//                   transition: "width 0.3s",
//                 }}
//               />
//             </Box>
//           )}

//           <Box mt={3}>
//             {datosTemporales.length > 0 ? (
//               <DataTable
//                 columns={SUBSISTEMA2_COLUMNS}
//                 data={datosTemporales.map((d) => ({
//                   [SUBSISTEMA2_COLUMNS[0]]: `${d.rollAngle ?? "-"}°`,
//                   [SUBSISTEMA2_COLUMNS[1]]: `${d.pitchAngle ?? "-"}°`,
//                   [SUBSISTEMA2_COLUMNS[2]]: d.voltage?.toFixed(2),
//                   [SUBSISTEMA2_COLUMNS[3]]: d.current?.toFixed(2),
//                   [SUBSISTEMA2_COLUMNS[4]]: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                   [SUBSISTEMA2_COLUMNS[5]]: "—",
//                 }))}
//               />
//             ) : (
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Aún no hay mediciones temporales del barrido.
//                 </Typography>
//               </Paper>
//             )}
//           </Box>

//           <Box mt={2}>
//             <Button variant="contained" color="primary" onClick={guardarBarrido} align="right" disabled={datosTemporales.length === 0}>
//               {SAVE_BUTTON}
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//             <Paper
//               className="paper-camera"
//               sx={{
//                 p: 2,
//                 width: "100%",
//                 backgroundColor: "#121212",
//                 color: "#fff",
//                 borderRadius: "12px",
//                 boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
//               }}
//             >
//               <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
//                 {CAMERA_TITLE}
//                 <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>
//                   ● En vivo
//                 </Typography>
//               </Typography>

//               <Box sx={{ width: "100%", height: "400px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
//                 <iframe
//                   width="100%"
//                   height="400"
//                   src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
//                   title="Transmisión en vivo de YouTube"
//                   frameBorder="0"
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                   style={{ borderRadius: "8px" }}
//                 />
//               </Box>
//             </Paper>
//           </Box>

//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//             <Paper className="paper-graph">
//               <GraphTitleWithTooltip title={VOLTAGE_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME} />
//             </Paper>
//           </Box>

//           <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
//             {DOWNLOAD_1_GRAPH}
//           </Button>

//           <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//             <Paper className="paper-graph">
//               <GraphTitleWithTooltip title={CURRENT_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME} />
//             </Paper>
//           </Box>

//           <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
//             {DOWNLOAD_1_GRAPH}
//           </Button>

//           <Button variant="contained" color="pink" onClick={handleDownloadBothData} fullWidth align="center" marginTop={2}>
//             {DOWNLOAD_GRAPHS_BUTTON}
//           </Button>
//         </Grid>
//       </Grid>

//       <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
//         {BACK_BUTTON}
//       </Button>
//     </Box>
//   );
// };

// export default Subsistema2;





// ozzyjames11: nueva version, esto incluye apariencia similar al subsistema 1, slider dual, graficos en tiempo real implementados, tabla corregida
// codigo funcional, pero probaré la nueva version que mejora los graficos

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Grid from "@mui/material/Grid";
// import {useSelector} from "react-redux";

// // Componentes
// import DualAxisControl from "../../components/Elements/DualAxisControl";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";

// // Iconos
// import { 
//   PlayArrow, 
//   Save, 
//   CloudDone, 
//   Download, 
//   CropFree, 
//   SaveAlt, 
//   RocketLaunch 
// } from '@mui/icons-material';
// import CircularProgress from '@mui/material/CircularProgress';

// // Utilidades
// import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

// // Constantes
// import {
//   SUBSISTEMA2_COLUMNS,
//   PAGE_TITLES,
//   GRAPH_DESCRIPTIONS,
// } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// // Estilos
// import "../../assets/css/Elements/PaperStyles.css";

// // Firebase
// import {
//   getDatabase,
//   ref,
//   set,
//   update,
//   onValue,
//   onChildAdded,
//   remove,
//   get
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   // === CONFIGURACIÓN DE USUARIO Y RUTAS ===
//   // const UID_USUARIO = "8qb4yEqxXWcvdIEEXYBgANR57T12"; // Usuario quemado para pruebas
//   // Se obtiene el ID del usuario dinámicamente
//   const user = useSelector((state) => state.auth.user);
//   if(!user){
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }
//   const UID_USUARIO = user.uid;
//   const BASE_PATH = `users/${UID_USUARIO}/Exp2`; // Ruta base correcta

//   const {
//     MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, MOVE_BUTTON,
//     DOWNLOAD_GRAPHS_BUTTON, DOWNLOAD_1_GRAPH, BACK_BUTTON,
//     CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE,
//   } = PAGE_TITLES;

//   // ==================== ESTADOS ====================
//   const [azimuthStart, setAzimuthStart] = useState(0);
//   const [azimuthEnd, setAzimuthEnd] = useState(20);
//   const [zenithStart, setZenithStart] = useState(0);
//   const [zenithEnd, setZenithEnd] = useState(20);

//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [azimuthAngles, setAzimuthAngles] = useState([]);
//   const [zenithAngles, setZenithAngles] = useState([]);
  
//   const [faseBarrido, setFaseBarrido] = useState("azimuth"); 
//   const [anguloActualIndex, setAnguloActualIndex] = useState(0);

//   const [sweepIdActual, setSweepIdActual] = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [userSession, setUserSession] = useState(null);

//   const [activeTab, setActiveTab] = useState(0); // 0: Azimuth, 1: Zenith

//   // ==================== REFERENCIAS (CORREGIDO) ====================
//   const azimuthAnglesRef = useRef([]);
//   const zenithAnglesRef = useRef([]);
//   const anguloActualIndexRef = useRef(0);
//   const faseBarridoRef = useRef("azimuth");
//   const sweepIdActualRef = useRef(null);
//   const barridoEnProgresoRef = useRef(false);
//   const lastMsgRef = useRef(null);
  
//   // ✅ AQUÍ ESTABA EL ERROR: Faltaba definir esta referencia
//   const datosTemporalesRef = useRef([]); 

//   // Sincronización de Refs
//   useEffect(() => {
//     azimuthAnglesRef.current = azimuthAngles;
//     zenithAnglesRef.current = zenithAngles;
//     anguloActualIndexRef.current = anguloActualIndex;
//     faseBarridoRef.current = faseBarrido;
//     sweepIdActualRef.current = sweepIdActual;
//     barridoEnProgresoRef.current = barridoEnProgreso;
    
//     // ✅ Sincronizamos también los datos
//     datosTemporalesRef.current = datosTemporales; 
//   }, [azimuthAngles, zenithAngles, anguloActualIndex, faseBarrido, sweepIdActual, barridoEnProgreso, datosTemporales]);

//   // ==================== INICIALIZACIÓN ====================
//   useEffect(() => {
//     const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setUserSession(sessionId);

//     // Recuperar ID actual de Exp2
//     const currentSweepRef = ref(db, `${BASE_PATH}/currentSweepId`);
//     get(currentSweepRef).then((snapshot) => {
//         if (snapshot.exists()) {
//              setSweepIdActual(snapshot.val());
//              console.log("🆔 ID Exp2 recuperado:", snapshot.val());
//         }
//     });
    
//     // Cleanup
//     return () => {
//         // Detener hardware
//         // ozzyjames11: detenido momentáneamente
//         // update(ref(db), { [`${BASE_PATH}/communication/FrontToBack`]: "n" }).catch(() => {});
        
//         // ✅ AHORA SÍ FUNCIONA: Borrar datos no guardados al salir
//         const datos = datosTemporalesRef.current || []; 
//         const datosBasura = datos.filter(d => d.isSaved === false);
        
//         if (datosBasura.length > 0) {
//             console.log(`🗑️ Limpiando ${datosBasura.length} datos temporales de Exp2...`);
//             const updates = {};
//             datosBasura.forEach((d) => {
//                 updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//             });
//             update(ref(db), updates).catch((e) => console.error(e));
//         }
//     };
//   }, []);

//   // ==================== LÓGICA ====================
  
//   const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
//     const angulos = [];
//     if (inicio <= fin) for (let a = inicio; a <= fin; a += paso) angulos.push(a);
//     else for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
//     return angulos;
//   };

//   const enviarComando = async (comando) => {
//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     await set(fbRef, comando);
//     setTimeout(async () => await set(fbRef, "x"), 300);
//   };

//   const iniciarBarrido = async () => {
//     if (barridoEnProgresoRef.current) return alert("Ya hay un barrido en progreso");
//     if (azimuthStart === azimuthEnd) return alert("Azimuth Start y End deben ser diferentes");
//     if (zenithStart === zenithEnd) return alert("Zenith Start y End deben ser diferentes");

//     setDatosTemporales([]);
//     setActiveTab(0);
//     setBarridoEnProgreso(true);
//     setFaseBarrido("azimuth");
//     setAnguloActualIndex(0);
//     lastMsgRef.current = null;

//     const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
//     const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);
//     setAzimuthAngles(azList);
//     setZenithAngles(zeList);

//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     try {
//       await Promise.all([
//         set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//           azimuthStart, azimuthEnd, zenithStart, zenithEnd,
//           step: 5, status: "in_progress", fase: "azimuth",
//           timestamp: Date.now(), userSession,
//         }),
//         set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
//       ]);
//       console.log(`🚀 Barrido Exp2 iniciado: ${sweepId}`);
      
//       // Iniciar secuencia (Opcional: enviar primer comando o esperar Arduino)
//       setTimeout(() => enviarComando("p" + azList[0]), 500);

//     } catch (error) {
//       console.error("Error iniciando:", error);
//       setBarridoEnProgreso(false);
//     }
//   };

//   // Listener Comunicación (BackToFront)
//   useEffect(() => {
//     const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
//     const unsubscribe = onValue(dbRef, async (snapshot) => {
//       const msg = snapshot.val();
//       if (!msg || msg === "x") return;
//       if (lastMsgRef.current === msg) return;
//       lastMsgRef.current = msg;

//       const fase = faseBarridoRef.current;
//       const idx = anguloActualIndexRef.current;
//       const sweepId = sweepIdActualRef.current;
//       if (!barridoEnProgresoRef.current || !sweepId) return;

//       if (msg === "PITCH:") {
//          if (fase === "azimuth") {
//             const azList = azimuthAnglesRef.current;
//             await enviarComando("p" + azList[idx]);
//             await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { currentPitch: azList[idx], lastUpdated: Date.now() });
//          } else {
//             await enviarComando("p" + azimuthEnd); 
//          }
//       } 
//       else if (msg === "ROLL:") {
//          if (fase === "azimuth") {
//             await enviarComando("r" + zenithStart);
//          } else {
//             const zeList = zenithAnglesRef.current;
//             await enviarComando("r" + zeList[idx]);
//             await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { currentRoll: zeList[idx], lastUpdated: Date.now() });
//          }
//       }
//       else if (msg === "EndMov") {
//         const azList = azimuthAnglesRef.current;
//         const zeList = zenithAnglesRef.current;

//         if (fase === "azimuth") {
//           if (idx + 1 < azList.length) {
//             setAnguloActualIndex(idx + 1);
//             // Siguiente Azimuth
//             setTimeout(() => enviarComando("p" + azList[idx + 1]), 500); 
//           } else {
//             console.log("Cambio de fase a Zenith");
//             setFaseBarrido("zenith");
//             setAnguloActualIndex(0);
//             setActiveTab(1); 
//             await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { fase: "zenith" });
//             // Iniciar primer Zenith
//             setTimeout(() => enviarComando("r" + zeList[0]), 1000);
//           }
//         } else {
//           if (idx + 1 < zeList.length) {
//             setAnguloActualIndex(idx + 1);
//             // Siguiente Zenith
//             setTimeout(() => enviarComando("r" + zeList[idx + 1]), 500);
//           } else {
//             setBarridoEnProgreso(false);
//             setFaseBarrido("done");
//             await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { status: "completed", fase: "done" });
//             console.log("Fin Barrido Exp2");
//           }
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, [azimuthEnd, zenithStart]); 

//   // Listener Datos (Measurements)
//   useEffect(() => {
//     if (!sweepIdActual) return;
//     const dbRef = ref(db, `${BASE_PATH}/measurements`);
    
//     // Carga inicial
//     get(dbRef).then((snapshot) => {
//         if (snapshot.exists()) {
//             const allData = Object.values(snapshot.val());
//             const myData = allData.filter(d => d.sweepId === sweepIdActual);
//             // Inferencia simple de fase
//             const myDataWithPhase = myData.map(d => ({
//                 ...d,
//                 faseEstimada: (d.rollAngle === zenithStart && d.pitchAngle !== azimuthEnd) ? "azimuth" : "zenith"
//             }));
//             setDatosTemporales(myDataWithPhase);
//         }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data && data.sweepId === sweepIdActual) {
//         const datoConFase = { ...data, faseEstimada: faseBarridoRef.current }; 
//         setDatosTemporales((prev) => {
//            const existe = prev.some((d) => d.timestamp === data.timestamp);
//            return existe ? prev : [...prev, datoConFase];
//         });
//       }
//     });
//     return () => unsubscribe();
//   }, [sweepIdActual]);

//   // ==================== GUARDAR Y SALIDA ====================
//   const guardarBarrido = async () => {
//     const unsaved = datosTemporales.filter(d => !d.isSaved);
//     if (unsaved.length === 0) return alert("No hay nuevos datos para guardar.");
//     if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       unsaved.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });
//       await update(ref(db), updates);
//       setDatosTemporales(prev => prev.map(d => ({ ...d, isSaved: true })));
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("Error guardando:", error);
//     }
//   };

//   const handleBackSafe = () => {
//     const haySinGuardar = datosTemporales.some(d => !d.isSaved);
//     if (haySinGuardar) {
//         if (!window.confirm("⚠️ DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán.\n¿Salir?")) return;
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   // Simulación
//   const simularDatos = () => {
//       if(!sweepIdActual) return alert("Inicia barrido primero");
//       const timestamp = Date.now();
//       const fakeData = {
//           pitchAngle: faseBarrido === 'azimuth' ? -30 + anguloActualIndex*5 : azimuthEnd,
//           rollAngle: faseBarrido === 'zenith' ? -30 + anguloActualIndex*5 : zenithStart,
//           voltage: Number((10 + Math.random()).toFixed(2)),
//           current: Number((2 + Math.random()).toFixed(2)),
//           timestamp: timestamp,
//           sweepId: sweepIdActual,
//           isSaved: false
//       };
//       // Escribir en firebase
//       const updates = {};
//       updates[`${BASE_PATH}/measurements/meas_${timestamp}`] = fakeData;
//       update(ref(db), updates);
//   };

//   const hayDatosSinGuardar = datosTemporales.some(d => !d.isSaved);
//   const youtubeVideoId = "nAQz4RMaHVA";

//   // Filtro para gráficas según Tab
//   const chartData = datosTemporales.filter(d => {
//       if (activeTab === 0) return d.faseEstimada === "azimuth" || (!d.faseEstimada && d.rollAngle === zenithStart);
//       if (activeTab === 1) return d.faseEstimada === "zenith" || (!d.faseEstimada && d.pitchAngle === azimuthEnd);
//       return true;
//   });

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4} alignItems="flex-start">
        
//         {/* === IZQUIERDA: CONTROLES === */}
//         <Grid item xs={12} md={6}>
//             <Box display="flex" alignItems="center" mb={2}>
//                 <RocketLaunch color="primary" sx={{ mr: 1 }} />
//                 <Typography variant="h5">Automatic sweeping control (2-Axis)</Typography>
//             </Box>

//             <DualAxisControl 
//                 axisName="Azimuth Control"
//                 startValue={azimuthStart}
//                 endValue={azimuthEnd}
//                 setStart={setAzimuthStart}
//                 setEnd={setAzimuthEnd}
//                 disabled={barridoEnProgreso}
//             />

//             <DualAxisControl 
//                 axisName="Zenith Control"
//                 startValue={zenithStart}
//                 endValue={zenithEnd}
//                 setStart={setZenithStart}
//                 setEnd={setZenithEnd}
//                 disabled={barridoEnProgreso}
//             />

//             <Box mt={3} mb={2}>
//                 <Button 
//                     variant="contained" 
//                     color="primary" 
//                     size="large" 
//                     fullWidth 
//                     onClick={iniciarBarrido} 
//                     disabled={barridoEnProgreso}
//                     startIcon={barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
//                 >
//                     {barridoEnProgreso ? `Scanning ${faseBarrido.toUpperCase()}...` : "START DUAL AXIS SWEEP"}
//                 </Button>
//             </Box>

//             {/* Test Button */}
//             <Box mb={2}>
//                 <Button variant="outlined" color="warning" onClick={simularDatos} disabled={!barridoEnProgreso}>
//                     🛠️ Test Point
//                 </Button>
//             </Box>

//             {/* Progress Bar */}
//             {barridoEnProgreso && (
//                 <Box sx={{ mb: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
//                     <Box sx={{
//                         height: "100%", borderRadius: 1, backgroundColor: "#2196f3",
//                         width: faseBarrido === "azimuth"
//                             ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
//                             : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
//                         transition: "width 0.3s",
//                     }} />
//                 </Box>
//             )}

//             {/* TABLA DE MEDIDAS */}
//             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                 <Typography variant="h5">Measurements Table</Typography>
//                 <Button
//                     variant={hayDatosSinGuardar ? "contained" : "outlined"}
//                     color="primary"
//                     onClick={guardarBarrido}
//                     disabled={datosTemporales.length === 0}
//                     startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
//                     size="medium"
//                 >
//                     {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
//                 </Button>
//             </Box>

//             <Box mt={3}>
//                 {datosTemporales.length > 0 ? (
//                     <DataTable
//                         columns={SUBSISTEMA2_COLUMNS}
//                         data={datosTemporales.map((d) => ({
//                              [SUBSISTEMA2_COLUMNS[0]]: `${d.pitchAngle ?? "-"}°`,
//                              [SUBSISTEMA2_COLUMNS[1]]: `${d.rollAngle ?? "-"}°`,
//                              [SUBSISTEMA2_COLUMNS[2]]: d.voltage?.toFixed(2),
//                              [SUBSISTEMA2_COLUMNS[3]]: d.current?.toFixed(2),
//                              [SUBSISTEMA2_COLUMNS[4]]: ((d.voltage * d.current)/100).toFixed(2),
//                              [SUBSISTEMA2_COLUMNS[5]]: "0.75"
//                         }))}
//                         onDelete={() => {}} // Lógica delete
//                         maxHeight="550px"
//                         disableHorizontalScroll={true}
//                     />
//                  ) : (
//                     <Paper sx={{ p: 2, textAlign: 'center', color: '#666' }}>
//                         Waiting for sweep data...
//                     </Paper>
//                  )}
//             </Box>
//         </Grid>

//         {/* === DERECHA: CÁMARA Y GRÁFICOS === */}
//         <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
             
//              {/* CÁMARA */}
//              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
//                 <Paper className="paper-camera" sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
//                     <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center", fontFamily: '"Poppins", sans-serif' }}>
//                         {CAMERA_TITLE} <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1, fontFamily: '"Poppins", sans-serif' }}>● En vivo</Typography>
//                     </Typography>
//                     <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
//                         <iframe width="100%" height="100%" src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1" title="Cam" frameBorder="0" allowFullScreen />
//                     </Box>
//                 </Paper>
//              </Box>

//              {/* TABS */}
//              <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
//                  <Tabs 
//                     value={activeTab} 
//                     onChange={(e, v) => setActiveTab(v)} 
//                     variant="fullWidth" 
//                     indicatorColor="primary"
//                     textColor="primary"
//                     sx={{ '& .MuiTab-root': { fontFamily: '"Poppins", sans-serif', textTransform: 'none', fontWeight: 600 } }}
//                  >
//                      <Tab label="Axis 1: Azimuth" />
//                      <Tab label="Axis 2: Zenith" />
//                  </Tabs>
//              </Paper>

//              {/* GRÁFICOS */}
//              {/* Voltaje */}
//              <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//                 <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//                     <GraphTitleWithTooltip 
//                         title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? 'Azimuth' : 'Zenith'})`} 
//                         description="Real-time voltage measurements." 
//                     />
//                     <Box mt={2}>
//                         <RealTimeChart
//                             chartId="chart-voltage-2"
//                             data={chartData} 
//                             dataKey="voltage"
//                             color="#2196f3"
//                             yLabel="Voltage (V)"
//                             unit="V"
//                         />
//                     </Box>
//                 </Paper>
//              </Box>
//              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -1, mb: 3, position: 'relative', top: 10 }}>
//                 <Button variant="outlined" size="small" color="primary" onClick={() => exportData(chartData, 'volt', 'Exp2', 'csv')} startIcon={<Download fontSize="small" />}>CSV</Button>
//                 <Button variant="outlined" size="small" color="primary" onClick={() => downloadChartAsImage("chart-voltage-2", "Volt")} startIcon={<CropFree fontSize="small" />}>IMG</Button>
//              </Box>

//              {/* Corriente */}
//              <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//                 <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//                     <GraphTitleWithTooltip 
//                         title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? 'Azimuth' : 'Zenith'})`} 
//                         description="Real-time current measurements." 
//                     />
//                     <Box mt={2}>
//                         <RealTimeChart
//                             chartId="chart-current-2"
//                             data={chartData}
//                             dataKey="current"
//                             color="#4caf50"
//                             yLabel="Current (A)"
//                             unit="A"
//                         />
//                     </Box>
//                 </Paper>
//              </Box>
//              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -1, position: 'relative', top: 10 }}>
//                 <Button variant="outlined" size="small" color="primary" onClick={() => exportData(chartData, 'curr', 'Exp2', 'csv')} startIcon={<Download fontSize="small" />}>CSV</Button>
//                 <Button variant="outlined" size="small" color="primary" onClick={() => downloadChartAsImage("chart-current-2", "Curr")} startIcon={<CropFree fontSize="small" />}>IMG</Button>
//              </Box>

//              {/* Descarga Total */}
//              <Box mt={5}>
//                 <Button 
//                     variant="contained" 
//                     color="pink" 
//                     onClick={() => exportData(datosTemporales, 'full_report_exp2', 'Exp2', 'csv')}
//                     fullWidth 
//                     marginTop={2}
//                     startIcon={<SaveAlt />}
//                 >
//                     {DOWNLOAD_GRAPHS_BUTTON}
//                 </Button>
//              </Box>

//         </Grid>
//       </Grid>

//       {/* FOOTER */}
//       <Box mt={6} mb={4} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
//           <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
//             {BACK_BUTTON}
//           </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Subsistema2;





/*
ozzyjames11: código corregido
- Los gráficos se ven bien: se ajustó los títulos de los ejes y espaciados
- Los gráficos tienen una secuencia temporal: el gráfico del Axis 2 empieza desde la cantidad de segundos que terminó el gráfico del Axis 1.
- Se reintrodujo los datos repetidos: en tablas y gráficos, no tenía sentido eliminarlos.
- Se creó nuevamente RealTimeChart.jsx, con sus dependencias.
- Se corrigíó los títulos de la tabla.
- Se acctualizó la lógica de descarga de archivos .csv
*/
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {useSelector} from "react-redux";

// estilos
import styles from "../../assets/css/Elements/RealTimeChart.module.css";

// Componentes
import DualAxisControl from "../../components/Elements/DualAxisControl";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import RealTimeChart from "../../components/Elements/RealTimeChart";

// Iconos
import { 
  PlayArrow, 
  Save, 
  CloudDone, 
  Download, 
  CropFree, 
  SaveAlt, 
  RocketLaunch 
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

// Utilidades
import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

// Constantes
import {
  SUBSISTEMA2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// Estilos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  remove,
  get
} from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  // === CONFIGURACIÓN DE USUARIO Y RUTAS ===
  // const UID_USUARIO = "8qb4yEqxXWcvdIEEXYBgANR57T12"; // Usuario quemado para pruebas
  // Se obtiene el ID del usuario dinámicamente
  const user = useSelector((state) => state.auth.user);
  if(!user){
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  const UID_USUARIO = user.uid;
  const BASE_PATH = `users/${UID_USUARIO}/Exp2`; // Ruta base correcta

  const {
    MAIN_TITLE, DESCRIPTION, SAVE_BUTTON, MOVE_BUTTON,
    DOWNLOAD_GRAPHS_BUTTON, DOWNLOAD_1_GRAPH, BACK_BUTTON,
    CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE,
  } = PAGE_TITLES;

  // ==================== ESTADOS ====================
  const [azimuthStart, setAzimuthStart] = useState(0);
  const [azimuthEnd, setAzimuthEnd] = useState(20);
  const [zenithStart, setZenithStart] = useState(0);
  const [zenithEnd, setZenithEnd] = useState(20);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [azimuthAngles, setAzimuthAngles] = useState([]);
  const [zenithAngles, setZenithAngles] = useState([]);
  
  const [faseBarrido, setFaseBarrido] = useState("azimuth"); 
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);

  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  const [activeTab, setActiveTab] = useState(0); // 0: Azimuth, 1: Zenith

  // ==================== REFERENCIAS (CORREGIDO) ====================
  const azimuthAnglesRef = useRef([]);
  const zenithAnglesRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("azimuth");
  const sweepIdActualRef = useRef(null);
  const barridoEnProgresoRef = useRef(false);
  const lastMsgRef = useRef(null);
  
  // ✅ AQUÍ ESTABA EL ERROR: Faltaba definir esta referencia
  const datosTemporalesRef = useRef([]); 

  // Sincronización de Refs
  useEffect(() => {
    azimuthAnglesRef.current = azimuthAngles;
    zenithAnglesRef.current = zenithAngles;
    anguloActualIndexRef.current = anguloActualIndex;
    faseBarridoRef.current = faseBarrido;
    sweepIdActualRef.current = sweepIdActual;
    barridoEnProgresoRef.current = barridoEnProgreso;
    
    // ✅ Sincronizamos también los datos
    datosTemporalesRef.current = datosTemporales; 
  }, [azimuthAngles, zenithAngles, anguloActualIndex, faseBarrido, sweepIdActual, barridoEnProgreso, datosTemporales]);

  // ==================== INICIALIZACIÓN ====================
  useEffect(() => {
    const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserSession(sessionId);

    // Recuperar ID actual de Exp2
    const currentSweepRef = ref(db, `${BASE_PATH}/currentSweepId`);
    get(currentSweepRef).then((snapshot) => {
        if (snapshot.exists()) {
             setSweepIdActual(snapshot.val());
             console.log("🆔 ID Exp2 recuperado:", snapshot.val());
        }
    });
    
    // Cleanup
    return () => {
        // Detener hardware
        // ozzyjames11: detenido momentáneamente
        // update(ref(db), { [`${BASE_PATH}/communication/FrontToBack`]: "n" }).catch(() => {});
        
        // ✅ AHORA SÍ FUNCIONA: Borrar datos no guardados al salir
        const datos = datosTemporalesRef.current || []; 
        const datosBasura = datos.filter(d => d.isSaved === false);
        
        if (datosBasura.length > 0) {
            console.log(`🗑️ Limpiando ${datosBasura.length} datos temporales de Exp2...`);
            const updates = {};
            datosBasura.forEach((d) => {
                updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
            });
            update(ref(db), updates).catch((e) => console.error(e));
        }
    };
  }, [UID_USUARIO]); // Agregamos UID_USUARIO como dependencia

  // ==================== LÓGICA ====================
  
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    else for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    return angulos;
  };

  const enviarComando = async (comando) => {
    const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
    await set(fbRef, comando);
    setTimeout(async () => await set(fbRef, "x"), 300);
  };

  const iniciarBarrido = async () => {
    if (barridoEnProgresoRef.current) return alert("Ya hay un barrido en progreso");
    if (azimuthStart === azimuthEnd) return alert("Azimuth Start y End deben ser diferentes");
    if (zenithStart === zenithEnd) return alert("Zenith Start y End deben ser diferentes");

    setDatosTemporales([]);
    setActiveTab(0);
    setBarridoEnProgreso(true);
    setFaseBarrido("azimuth");
    setAnguloActualIndex(0);
    lastMsgRef.current = null;

    const azList = calcularAngulosBarrido(azimuthStart, azimuthEnd, 5);
    const zeList = calcularAngulosBarrido(zenithStart, zenithEnd, 5);
    setAzimuthAngles(azList);
    setZenithAngles(zeList);

    const sweepId = `sweep_${Date.now()}`;
    setSweepIdActual(sweepId);

    try {
      await Promise.all([
        set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
          azimuthStart, azimuthEnd, zenithStart, zenithEnd,
          step: 5, status: "in_progress", fase: "azimuth",
          timestamp: Date.now(), userSession,
        }),
        set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
      ]);
      console.log(`🚀 Barrido Exp2 iniciado: ${sweepId}`);
      
      // Iniciar secuencia (Opcional: enviar primer comando o esperar Arduino)
      setTimeout(() => enviarComando("p" + azList[0]), 500);

    } catch (error) {
      console.error("Error iniciando:", error);
      setBarridoEnProgreso(false);
    }
  };

  // Listener Comunicación (BackToFront)
  useEffect(() => {
    const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (!msg || msg === "x") return;
      if (lastMsgRef.current === msg) return;
      lastMsgRef.current = msg;

      const fase = faseBarridoRef.current;
      const idx = anguloActualIndexRef.current;
      const sweepId = sweepIdActualRef.current;
      if (!barridoEnProgresoRef.current || !sweepId) return;

      if (msg === "PITCH:") {
         if (fase === "azimuth") {
            const azList = azimuthAnglesRef.current;
            await enviarComando("p" + azList[idx]);
            await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { currentPitch: azList[idx], lastUpdated: Date.now() });
         } else {
            await enviarComando("p" + azimuthEnd); 
         }
      } 
      else if (msg === "ROLL:") {
         if (fase === "azimuth") {
            await enviarComando("r" + zenithStart);
         } else {
            const zeList = zenithAnglesRef.current;
            await enviarComando("r" + zeList[idx]);
            await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { currentRoll: zeList[idx], lastUpdated: Date.now() });
         }
      }
      else if (msg === "EndMov") {
        const azList = azimuthAnglesRef.current;
        const zeList = zenithAnglesRef.current;

        if (fase === "azimuth") {
          if (idx + 1 < azList.length) {
            setAnguloActualIndex(idx + 1);
            // Siguiente Azimuth
            setTimeout(() => enviarComando("p" + azList[idx + 1]), 500); 
          } else {
            console.log("Cambio de fase a Zenith");
            setFaseBarrido("zenith");
            setAnguloActualIndex(0);
            // setActiveTab(1); 
            await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { fase: "zenith" });
            // Iniciar primer Zenith
            setTimeout(() => enviarComando("r" + zeList[0]), 1000);
          }
        } else {
          if (idx + 1 < zeList.length) {
            setAnguloActualIndex(idx + 1);
            // Siguiente Zenith
            setTimeout(() => enviarComando("r" + zeList[idx + 1]), 500);
          } else {
            setBarridoEnProgreso(false);
            setFaseBarrido("done");
            await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { status: "completed", fase: "done" });
            console.log("Fin Barrido Exp2");
          }
        }
      }
    });
    return () => unsubscribe();
  }, [azimuthEnd, zenithStart, BASE_PATH]); 

  // Listener Datos (Guardamos todo sin filtrar)
  useEffect(() => {
    if (!sweepIdActual) return;
    const dbRef = ref(db, `${BASE_PATH}/measurements`);
    
    // Carga inicial
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const allData = Object.values(snapshot.val());
            const myData = allData.filter(d => d.sweepId === sweepIdActual);
            // Ordenar por tiempo para asegurar consistencia
            myData.sort((a,b) => a.timestamp - b.timestamp);
            setDatosTemporales(myData);
        }
    });

    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.sweepId === sweepIdActual) {
        setDatosTemporales((prev) => {
           if (prev.some((d) => d.timestamp === data.timestamp)) return prev;
           return [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual, BASE_PATH]);

  // ==================== GUARDAR Y SALIDA ====================
  const guardarBarrido = async () => {
    const unsaved = datosTemporales.filter(d => !d.isSaved);
    if (unsaved.length === 0) return alert("No hay nuevos datos para guardar.");
    if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;

    try {
      const updates = {};
      unsaved.forEach((d) => {
        updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);
      setDatosTemporales(prev => prev.map(d => ({ ...d, isSaved: true })));
      alert("✅ Datos guardados con éxito.");
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const handleBackSafe = () => {
    const haySinGuardar = datosTemporales.some(d => !d.isSaved);
    if (haySinGuardar) {
        if (!window.confirm("⚠️ DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán.\n¿Salir?")) return;
    }
    navigate("/experiments/experimentChooser");
  };

  // Simulación
  const simularDatos = () => {
      if(!sweepIdActual) return alert("Inicia barrido primero");
      const timestamp = Date.now();
      const fakeData = {
          pitchAngle: faseBarrido === 'azimuth' ? -30 + anguloActualIndex*5 : azimuthEnd,
          rollAngle: faseBarrido === 'zenith' ? -30 + anguloActualIndex*5 : zenithStart,
          voltage: Number((10 + Math.random()).toFixed(2)),
          current: Number((2 + Math.random()).toFixed(2)),
          timestamp: timestamp,
          sweepId: sweepIdActual,
          isSaved: false
      };
      // Escribir en firebase
      const updates = {};
      updates[`${BASE_PATH}/measurements/meas_${timestamp}`] = fakeData;
      update(ref(db), updates);
  };

  const hayDatosSinGuardar = datosTemporales.some(d => !d.isSaved);
  const youtubeVideoId = "nAQz4RMaHVA";

  // =====================================================================
  // 🧠 LÓGICA DE GRÁFICOS (SPLIT BY DUPLICATE)
  // =====================================================================
  const getDataByAxis = () => {
      if (datosTemporales.length === 0) return { axis1: [], axis2: [] };

      let splitIndex = -1;
      
      // Buscamos el punto de transición (el duplicado de ángulos)
      for (let i = 0; i < datosTemporales.length - 1; i++) {
          const current = datosTemporales[i];
          const next = datosTemporales[i + 1];

          // 1. Detección por ÁNGULOS IDÉNTICOS (Transición Real)
          // Si PITCH y ROLL son iguales en 'current' y 'next', 'current' es el final del Axis 1.
          // 'next' será el inicio del Axis 2.
          if (Math.abs(current.pitchAngle - next.pitchAngle) < 0.1 && 
              Math.abs(current.rollAngle - next.rollAngle) < 0.1) {
              splitIndex = i;
              break;
          }

          // 2. Fallback: Si el Zenith cambia, asumimos transición.
          if (Math.abs(current.rollAngle - next.rollAngle) > 0.1) {
              splitIndex = i;
              break;
          }
      }

      // Si no encontramos quiebre (solo fase 1), devolvemos todo en Axis 1
      if (splitIndex === -1) {
          return { axis1: datosTemporales, axis2: [] };
      }

      // Axis 1: Incluye hasta el punto de quiebre
      const axis1 = datosTemporales.slice(0, splitIndex + 1);
      
      // Axis 2: Incluye desde el punto SIGUIENTE al quiebre
      const axis2 = datosTemporales.slice(splitIndex + 1);

      return { axis1, axis2 };
  };

  const { axis1: dataAxis1, axis2: dataAxis2 } = getDataByAxis();
  const globalStartTime = datosTemporales.length > 0 ? datosTemporales[0].timestamp : 0;

  // Estilos "Celestes" para Tabs (Sin CSS externo)
  const tabStyles = {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      borderRadius: '8px',
      margin: '0 4px',
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
          backgroundColor: '#e3f2fd', // Celeste muy claro
          color: '#1565c0', // Azul fuerte
          boxShadow: '0 2px 4px rgba(25, 118, 210, 0.15)'
      },
      '&:hover': {
          backgroundColor: '#f5f5f5'
      }
  };


    // AUTO-SWITCH DE TABS (NUEVO)
  useEffect(() => {
      if (faseBarrido === "zenith") {
          setActiveTab(1); 
      } else if (faseBarrido === "azimuth" && datosTemporales.length === 0) {
          setActiveTab(0); 
      }
  }, [faseBarrido, datosTemporales.length]);

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4} alignItems="flex-start">
        */
        {/* === IZQUIERDA: CONTROLES === */}
      /*  <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
                <RocketLaunch color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">Automatic sweeping control (2-Axis)</Typography>
            </Box>

            <DualAxisControl 
                axisName="Azimuth Control"
                startValue={azimuthStart}
                endValue={azimuthEnd}
                setStart={setAzimuthStart}
                setEnd={setAzimuthEnd}
                disabled={barridoEnProgreso}
            />

            <DualAxisControl 
                axisName="Zenith Control"
                startValue={zenithStart}
                endValue={zenithEnd}
                setStart={setZenithStart}
                setEnd={setZenithEnd}
                disabled={barridoEnProgreso}
            />

            <Box mt={3} mb={2}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    fullWidth 
                    onClick={iniciarBarrido} 
                    disabled={barridoEnProgreso}
                    startIcon={barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                >
                    {barridoEnProgreso ? `Scanning ${faseBarrido.toUpperCase()}...` : "START DUAL AXIS SWEEP"}
                </Button>
            </Box>
*/
            {/* Test Button */}
          /*  <Box mb={2}>
                <Button variant="outlined" color="warning" onClick={simularDatos} disabled={!barridoEnProgreso}>
                    🛠️ Test Point
                </Button>
            </Box>
*/
            {/* Progress Bar */}
          /*  {barridoEnProgreso && (
                <Box sx={{ mb: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
                    <Box sx={{
                        height: "100%", borderRadius: 1, backgroundColor: "#2196f3",
                        width: faseBarrido === "azimuth"
                            ? `${((anguloActualIndex + 1) / (azimuthAngles.length || 1)) * 50}%`
                            : `${50 + ((anguloActualIndex + 1) / (zenithAngles.length || 1)) * 50}%`,
                        transition: "width 0.3s",
                    }} />
                </Box>
            )}
*/
            {/* TABLA DE MEDIDAS */}
           /* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">Measurements Table</Typography>
                <Button
                    variant={hayDatosSinGuardar ? "contained" : "outlined"}
                    color="primary"
                    onClick={guardarBarrido}
                    disabled={datosTemporales.length === 0}
                    startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
                    size="medium"
                >
                    {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
                </Button>
            </Box>

            <Box mt={3}>
                {datosTemporales.length > 0 ? (
                    <DataTable
                        columns={SUBSISTEMA2_COLUMNS}
                        data={datosTemporales.map((d) => ({
                             [SUBSISTEMA2_COLUMNS[0]]: `${d.pitchAngle ?? "-"}°`,
                             [SUBSISTEMA2_COLUMNS[1]]: `${d.rollAngle ?? "-"}°`,
                             [SUBSISTEMA2_COLUMNS[2]]: d.voltage?.toFixed(2),
                             [SUBSISTEMA2_COLUMNS[3]]: d.current?.toFixed(2),
                             [SUBSISTEMA2_COLUMNS[4]]: ((d.voltage * d.current)/100).toFixed(2),
                             [SUBSISTEMA2_COLUMNS[5]]: "0.75"
                        }))}
                        onDelete={() => {}} // Lógica delete
                        maxHeight="550px"
                        disableHorizontalScroll={true}
                    />
                 ) : (
                    <Paper sx={{ p: 2, textAlign: 'center', color: '#666' }}>
                        Waiting for sweep data...
                    </Paper>
                 )}
            </Box>
        </Grid>
*/
        {/* === DERECHA: CÁMARA Y GRÁFICOS === */}
      /*  <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          */   
             {/* CÁMARA */}
            /* <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
                <Paper className="paper-camera" sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center", fontFamily: '"Poppins", sans-serif' }}>
                        {CAMERA_TITLE} <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1, fontFamily: '"Poppins", sans-serif' }}>● En vivo</Typography>
                    </Typography>
                    <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1" title="Cam" frameBorder="0" allowFullScreen />
                    </Box>
                </Paper>
             </Box>
*/
             {/* TABS ESTILIZADAS (Sin CSS externo) */}
            /* <Box sx={{ 
                 backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", 
                 p: "6px", mb: 2, border: "1px solid #e0e0e0" 
             }}>
                 <Tabs 
                    value={activeTab} 
                    onChange={(e, v) => setActiveTab(v)} 
                    variant="fullWidth" 
                    TabIndicatorProps={{ style: { display: "none" } }} // Sin línea
                 >
                     <Tab label="Axis 1: Azimuth" sx={tabStyles} />
                     <Tab label="Axis 2: Zenith" sx={tabStyles} />
                 </Tabs>
             </Box>
*/
             {/* GRÁFICO VOLTAJE */}
            /* <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
                    <GraphTitleWithTooltip 
                        title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? 'Azimuth' : 'Zenith'})`} 
                        description="Real-time voltage measurements." 
                    />
                    <Box mt={2}>
                        <RealTimeChart
                            chartId="chart-voltage-2"
                            data={activeTab === 0 ? dataAxis1 : dataAxis2} 
                            customStartTime={globalStartTime}
                            
                            dataKey="voltage"
                            color="#2196f3"
                            yLabel="Voltage (V)"
                            unit="V"
                            // Props dinámicas para el Tooltip mejorado
                            angleKey={activeTab === 0 ? "pitchAngle" : "rollAngle"}
                            angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
                        />
                    </Box>
                </Paper>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -2, mb: 3, position: 'relative', top: 10 }}>
                <Button variant="outlined" size="small" color="primary" onClick={() => exportData(activeTab === 0 ? dataAxis1 : dataAxis2, 'volt', 'Exp2', 'csv', globalStartTime)} startIcon={<Download fontSize="small" />}>CSV</Button>
                <Button variant="outlined" size="small" color="primary" onClick={() => downloadChartAsImage("chart-voltage-2", "Volt")} startIcon={<CropFree fontSize="small" />}>IMG</Button>
             </Box>
*/
             {/* GRÁFICO CORRIENTE */}
             /*<Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
                <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
                    <GraphTitleWithTooltip 
                        title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? 'Azimuth' : 'Zenith'})`} 
                        description="Real-time current measurements." 
                    />
                    <Box mt={2}>
                        <RealTimeChart
                            chartId="chart-current-2"
                            data={activeTab === 0 ? dataAxis1 : dataAxis2}
                            customStartTime={globalStartTime}

                            dataKey="current"
                            color="#4caf50"
                            yLabel="Current (A)"
                            unit="A"
                            // Props dinámicas
                            angleKey={activeTab === 0 ? "pitchAngle" : "rollAngle"}
                            angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
                        />
                    </Box>
                </Paper>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -2, position: 'relative', top: 10 }}>
                <Button variant="outlined" size="small" color="primary" onClick={() => exportData(activeTab === 0 ? dataAxis1 : dataAxis2, 'curr', 'Exp2', 'csv', globalStartTime)} startIcon={<Download fontSize="small" />}>CSV</Button>
                <Button variant="outlined" size="small" color="primary" onClick={() => downloadChartAsImage("chart-current-2", "Curr")} startIcon={<CropFree fontSize="small" />}>IMG</Button>
             </Box>
*/
             {/* Descarga Total */}
            /* <Box mt={5}>
                <Button 
                    variant="contained" 
                    color="pink" 
                    onClick={() => exportData(datosTemporales, 'full_report_exp2', 'Exp2', 'csv')}
                    fullWidth 
                    marginTop={2}
                    startIcon={<SaveAlt />}
                >
                    {DOWNLOAD_GRAPHS_BUTTON}
                </Button>
             </Box>

        </Grid>
      </Grid>
*/
      {/* FOOTER */}
     /* <Box mt={6} mb={4} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
            {BACK_BUTTON}
          </Button>
      </Box>
    </Box>
  );
};

export default Subsistema2;*/




//nueva version
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Grid from "@mui/material/Grid";
// import { useSelector } from "react-redux";

// // Componentes
// import DualAxisControl from "../../components/Elements/DualAxisControl";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";
// import CircularProgress from '@mui/material/CircularProgress';

// // Iconos
// import { PlayArrow, Save, CloudDone, Download, CropFree, SaveAlt, RocketLaunch } from '@mui/icons-material';

// // Utilidades y Firebase
// import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";
// import { getDatabase, ref, set, update, onValue, onChildAdded, get, onDisconnect } from "firebase/database";
// import app from "../../firebaseConfig.js";

// // Constantes
// import { SUBSYSTEM2_COLUMNS, PAGE_TITLES, GRAPH_DESCRIPTIONS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // ==================== 1. ESTADOS (REGLA ESTRICTA: AL INICIO) ====================
//   const [pitchStart, setPitchStart] = useState(0);
//   const [pitchEnd, setPitchEnd] = useState(15);
//   const [rollStart, setRollStart] = useState(0);
//   const [rollEnd, setRollEnd] = useState(15);

//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [pasosBarrido, setPasosBarrido] = useState([]);
//   const [indicePaso, setIndicePaso] = useState(0);
  
//   const [sweepIdActual, setSweepIdActual] = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [activeTab, setActiveTab] = useState(0); // 0: Pitch, 1: Roll

//   // ==================== 2. REFERENCIAS PARA LIMPIEZA Y BARRIDO ====================
//   const pasosBarridoRef = useRef([]);
//   const indicePasoRef = useRef(0);
//   const sweepIdActualRef = useRef(null);
//   const datosTemporalesRef = useRef([]);
//   const isHardwareReadyRef = useRef(false);

//   useEffect(() => {
//     pasosBarridoRef.current = pasosBarrido;
//     indicePasoRef.current = indicePaso;
//     sweepIdActualRef.current = sweepIdActual;
//     datosTemporalesRef.current = datosTemporales;
//     isHardwareReadyRef.current = isHardwareReady;
//     window.datosEnPeligro = datosTemporales.some(d => !d.isSaved);
//   }, [pasosBarrido, indicePaso, sweepIdActual, datosTemporales, isHardwareReady]);

//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp2`;

//   // ==================== 3. SEGURIDAD DE NAVEGACIÓN Y HARDWARE ====================
//   useEffect(() => {
//     if (!user) return;
//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
    
//     // Capa 1: Firebase OnDisconnect (Cierre súbito)
//     onDisconnect(fbRef).set("n");
    
//     // Despertar Arduino
//     set(fbRef, "y").catch(err => console.error(err));

//     // Capa 2: F5 / Cerrar Pestaña
//     const handleBeforeUnload = (e) => {
//       if (window.datosEnPeligro) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);

//     // Capa 3: Flecha Atrás (Trampa de Historial)
//     window.history.pushState(null, null, window.location.pathname);
//     const handlePopState = () => {
//       if (window.datosEnPeligro) {
//         if (!window.confirm("⚠️ DATOS SIN GUARDAR. ¿Estás seguro de salir?")) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }
//       window.removeEventListener("popstate", handlePopState);
//       setTimeout(() => navigate("/experiments/experimentChooser", { replace: true }), 10);
//     };
//     window.addEventListener("popstate", handlePopState);

//     // Escuchar Hardware Ready
//     const statusRef = ref(db, 'estado_general/Exp2/hardwareStatus');
//     onValue(statusRef, (snap) => setIsHardwareReady(snap.val() === 'READY'));

//     return () => {
//       set(fbRef, "n").catch(() => {});
//       onDisconnect(fbRef).cancel();
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//       window.removeEventListener("popstate", handlePopState);
      
//       // Limpieza de datos basura
//       const datosBasura = datosTemporalesRef.current.filter(d => !d.isSaved);
//       if (datosBasura.length > 0) {
//         console.log(`🗑️ Eliminando ${datosBasura.length} datos no guardados de Exp2.`);
//         const updates = {};
//         datosBasura.forEach(d => updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null);
//         update(ref(db), updates);
//       }
//     };
//   }, [user]);

//   // ==================== 4. LÓGICA DE BARRIDO EN L ====================
//   const iniciarBarridoL = async () => {
//     if (barridoEnProgreso || !isHardwareReady) return;
    
//     setDatosTemporales([]);
//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     // Generar secuencia en L: (0,0) -> (5,0) -> (10,0) -> (15,0) -> (15,5) -> (15,10) -> (15,15)
//     let secuencia = [];
//     for (let p = pitchStart; p <= pitchEnd; p += 5) secuencia.push({ t: 'p', v: p });
//     for (let r = rollStart + 5; r <= rollEnd; r += 5) secuencia.push({ t: 'r', v: r });

//     setPasosBarrido(secuencia);
//     setIndicePaso(0);
//     setBarridoEnProgreso(true);
//     setActiveTab(0);

//     await set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId);
//     enviarPaso(secuencia[0]);
//   };

//   const enviarPaso = async (paso) => {
//     await set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `${paso.t}${paso.v}`);
//   };

//   useEffect(() => {
//     const btfRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
//     const unsub = onValue(btfRef, (snap) => {
//       if (snap.val() === "EndMov") {
//         const siguiente = indicePasoRef.current + 1;
//         const pasos = pasosBarridoRef.current;
//         if (siguiente < pasos.length) {
//           if (pasos[siguiente].t === 'r') setActiveTab(1);
//           setIndicePaso(siguiente);
//           setTimeout(() => enviarPaso(pasos[siguiente]), 1500);
//         } else {
//           setBarridoEnProgreso(false);
//           update(ref(db, `${BASE_PATH}/sweeps/${sweepIdActualRef.current}`), { status: "completed" });
//         }
//       }
//     });
//     return () => unsub();
//   }, [BASE_PATH]);

//   // Listener de Mediciones
//   useEffect(() => {
//     if (!sweepIdActual) return;
//     const mRef = ref(db, `${BASE_PATH}/measurements`);
//     return onChildAdded(mRef, (snap) => {
//       const d = snap.val();
//       if (d.sweepId === sweepIdActual) {
//         setDatosTemporales(prev => prev.some(x => x.timestamp === d.timestamp) ? prev : [...prev, d]);
//       }
//     });
//   }, [sweepIdActual]);

//   // ==================== 5. HELPERS Y UI ====================
//   const guardarBarrido = async () => {
//     const unsaved = datosTemporales.filter(d => !d.isSaved);
//     if (unsaved.length === 0 || !window.confirm(`¿Guardar ${unsaved.length} datos?`)) return;
//     const updates = {};
//     unsaved.forEach(d => updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true);
//     await update(ref(db), updates);
//     setDatosTemporales(prev => prev.map(d => ({ ...d, isSaved: true })));
//   };

//   const handleBackSafe = () => {
//     if (window.datosEnPeligro && !window.confirm("⚠️ DATOS SIN GUARDAR. ¿Salir?")) return;
//     navigate("/experiments/experimentChooser");
//   };

//   const getDataByAxis = () => {
//     const axis1 = datosTemporales.filter(d => d.roll === pasosBarrido[0]?.v || d.roll === rollStart);
//     const axis2 = datosTemporales.filter(d => d.pitch === pitchEnd && d.roll > rollStart);
//     return { axis1, axis2 };
//   };

//   const { axis1, axis2 } = getDataByAxis();

//   if (!user) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{PAGE_TITLES.MAIN_TITLE}</Typography>
//       <Typography variant="body1" mb={3}>{PAGE_TITLES.DESCRIPTION}</Typography>

//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Box display="flex" alignItems="center" mb={2}>
//             <RocketLaunch color="primary" sx={{ mr: 1 }} />
//             <Typography variant="h5">Control de Barrido en L (2 Ejes)</Typography>
//           </Box>

//           {/* Sliders con bloqueo visual */}
//           <Box sx={{ '& .MuiSlider-root.Mui-disabled': { color: '#9e9e9e' } }}>
//             <DualAxisControl 
//                 axisName="Eje Pitch (Inclinación)" startValue={pitchStart} endValue={pitchEnd}
//                 setStart={setPitchStart} setEnd={setPitchEnd} disabled={barridoEnProgreso || !isHardwareReady}
//             />
//             <DualAxisControl 
//                 axisName="Eje Roll (Rotación)" startValue={rollStart} endValue={rollEnd}
//                 setStart={setRollStart} setEnd={setRollEnd} disabled={barridoEnProgreso || !isHardwareReady}
//             />
//           </Box>

//           <Button 
//             variant="contained" color="primary" fullWidth size="large" onClick={iniciarBarridoL}
//             disabled={barridoEnProgreso || !isHardwareReady}
//             startIcon={barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
//             sx={{ mt: 2, mb: 2 }}
//           >
//             {!isHardwareReady ? "CALIBRANDO PANEL..." : barridoEnProgreso ? "EJECUTANDO BARRIDO EN L..." : "INICIAR BARRIDO EN L"}
//           </Button>

//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, mb: 2 }}>
//             <Typography variant="h5">Tabla de Mediciones</Typography>
//             <Button variant={window.datosEnPeligro ? "contained" : "outlined"} color="primary" onClick={guardarBarrido} startIcon={window.datosEnPeligro ? <Save /> : <CloudDone />}>
//               {window.datosEnPeligro ? "GUARDAR DATOS" : "DATOS SEGUROS"}
//             </Button>
//           </Box>

//           <DataTable
//             columns={SUBSYSTEM2_COLUMNS}
//             data={datosTemporales.map(d => ({
//               [SUBSYSTEM2_COLUMNS[0]]: `${d.pitch}°`, [SUBSYSTEM2_COLUMNS[1]]: `${d.roll}°`,
//               [SUBSYSTEM2_COLUMNS[2]]: d.voltage?.toFixed(2), [SUBSYSTEM2_COLUMNS[3]]: d.current?.toFixed(2),
//               [SUBSYSTEM2_COLUMNS[4]]: (d.voltage * d.current).toFixed(2), [SUBSYSTEM2_COLUMNS[5]]: "0.82"
//             }))}
//             maxHeight="500px"
//           />
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 2, bgcolor: "#121212", color: "#fff", borderRadius: "12px", mb: 3 }}>
//             <Typography variant="h5">{PAGE_TITLES.CAMERA_TITLE} <Typography component="span" color="error">● EN VIVO</Typography></Typography>
//             <Box height="300px" mt={1} bgcolor="#000" borderRadius="8px" overflow="hidden">
//               <iframe width="100%" height="100%" src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1" title="Live" frameBorder="0" />
//             </Box>
//           </Paper>

//           <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ mb: 2, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
//             <Tab label="Gráficos Pitch" />
//             <Tab label="Gráficos Roll" />
//           </Tabs>

//           <Paper sx={{ p: 2, mb: 2 }}>
//             <GraphTitleWithTooltip title={PAGE_TITLES.VOLTAGE_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME} />
//             <RealTimeChart chartId="v-chart" data={activeTab === 0 ? axis1 : axis2} dataKey="voltage" color="#2196f3" yLabel="Voltaje (V)" unit="V" />
//           </Paper>

//           <Paper sx={{ p: 2 }}>
//             <GraphTitleWithTooltip title={PAGE_TITLES.CURRENT_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME} />
//             <RealTimeChart chartId="i-chart" data={activeTab === 0 ? axis1 : axis2} dataKey="current" color="#4caf50" yLabel="Corriente (A)" unit="A" />
//           </Paper>

//           <Button variant="contained" color="pink" fullWidth startIcon={<SaveAlt />} onClick={() => exportData(datosTemporales, 'reporte_exp2', 'Exp2', 'csv')} sx={{ mt: 3 }}>
//             {PAGE_TITLES.DOWNLOAD_GRAPHS_BUTTON}
//           </Button>
//         </Grid>
//       </Grid>
//       <Box mt={4} textAlign="center"><Button variant="outlined" color="secondary" onClick={handleBackSafe}>{PAGE_TITLES.BACK_BUTTON}</Button></Box>
//     </Box>
//   );
// };

// export default Subsistema2;






//version claude

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Grid from "@mui/material/Grid";
// import { useSelector } from "react-redux";

// // Estilos
// import styles from "../../assets/css/Elements/RealTimeChart.module.css";
// import "../../assets/css/Elements/PaperStyles.css";

// // Componentes
// import DualAxisControl from "../../components/Elements/DualAxisControl";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";

// // Iconos
// import { PlayArrow, Save, CloudDone, Download, CropFree, SaveAlt, RocketLaunch } from "@mui/icons-material";
// import CircularProgress from "@mui/material/CircularProgress";

// // Utilidades
// import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

// // Constantes de strings
// import {
//   SUBSYSTEM2_COLUMNS,
//   PAGE_TITLES,
//   GRAPH_DESCRIPTIONS,
// } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// // Firebase
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

// // =============================================================
// // COMPONENTE PRINCIPAL
// // =============================================================
// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // Manejo seguro: si no hay usuario los hooks igualmente se ejecutan (regla de Hooks)
//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp2`;

//   const {
//     MAIN_TITLE, DESCRIPTION, MOVE_BUTTON,
//     DOWNLOAD_GRAPHS_BUTTON, BACK_BUTTON,
//     CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE,
//   } = PAGE_TITLES;

//   // ==================== ESTADOS ====================
//   // Azimuth = Pitch (eje vertical), Zenith = Roll (eje horizontal)
//   const [azimuthStart, setAzimuthStart] = useState(0);
//   const [azimuthEnd,   setAzimuthEnd]   = useState(20);
//   const [zenithStart,  setZenithStart]  = useState(0);
//   const [zenithEnd,    setZenithEnd]    = useState(20);

//   // Control del barrido
//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [combinaciones,     setCombinaciones]     = useState([]);
//   const [indexActual,       setIndexActual]        = useState(0);
//   const [faseBarrido,       setFaseBarrido]        = useState("azimuth"); // "azimuth" | "roll" | "done"

//   // Datos y sesion
//   const [sweepIdActual,   setSweepIdActual]   = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [userSession,     setUserSession]     = useState(null);

//   // Estado del hardware (bloqueo visual mientras calibra)
//   const [isHardwareReady, setIsHardwareReady] = useState(false);

//   // Tabs de graficos
//   const [activeTab, setActiveTab] = useState(0); // 0: Axis1-Azimuth, 1: Axis2-Zenith

//   // ==================== REFERENCIAS ====================
//   const sweepIdRef       = useRef(null);
//   const datosRef         = useRef([]);
//   const combinacionesRef = useRef([]);
//   const indexRef         = useRef(0);
//   const faseRef          = useRef("azimuth");
//   const barridoRef       = useRef(false);
//   const lastMsgRef       = useRef(null);

//   // Sincronizar referencias con estado
//   useEffect(() => {
//     sweepIdRef.current       = sweepIdActual;
//     datosRef.current         = datosTemporales;
//     combinacionesRef.current = combinaciones;
//     indexRef.current         = indexActual;
//     faseRef.current          = faseBarrido;
//     barridoRef.current       = barridoEnProgreso;
//   }, [sweepIdActual, datosTemporales, combinaciones, indexActual, faseBarrido, barridoEnProgreso]);

//   // ==================== HARDWARE READY ====================
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp2/hardwareStatus");
//     const unsub = onValue(statusRef, (snap) => {
//       if (snap.exists()) setIsHardwareReady(snap.val() === "READY");
//     });
//     return () => unsub();
//   }, [db]);

//   // ==================== INICIALIZACION Y LIMPIEZA ====================
//   useEffect(() => {
//     if (!user) return;

//     const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setUserSession(sessionId);

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

//     // CAPA 1: Si el usuario cierra la pestana a la fuerza,
//     // el servidor de Google escribe 'n' para apagar el motor automaticamente.
//     onDisconnect(fbRef).set("n");

//     // Despertar el Arduino
//     set(fbRef, "y").catch(console.error);

//     // Recuperar ID del ultimo barrido activo
//     get(ref(db, `${BASE_PATH}/currentSweepId`)).then((snap) => {
//       if (snap.exists()) setSweepIdActual(snap.val());
//     });

//     // Cleanup al navegar internamente (React Router)
//     return () => {
//       set(fbRef, "n").catch(() => {});
//       onDisconnect(fbRef).cancel();

//       const basura = datosRef.current.filter((d) => !d.isSaved);
//       if (basura.length > 0) {
//         console.log(`Eliminando ${basura.length} datos no guardados de Exp2.`);
//         const updates = {};
//         basura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });
//         update(ref(db), updates).catch(console.error);
//       }
//     };
//   }, [user]);

//   // ==================== CAPA 2: F5 / CERRAR PESTANA ====================
//   useEffect(() => {
//     const handler = (e) => {
//       if (datosTemporales.some((d) => !d.isSaved)) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };
//     window.addEventListener("beforeunload", handler);
//     return () => window.removeEventListener("beforeunload", handler);
//   }, [datosTemporales]);

//   // Senal global para que el Header intercepte la navegacion
//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);
//   useEffect(() => {
//     window.datosEnPeligro = hayDatosSinGuardar;
//     return () => { window.datosEnPeligro = false; };
//   }, [hayDatosSinGuardar]);

//   // ==================== CAPA 3: FLECHA ATRAS DEL NAVEGADOR ====================
//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);
//     const handler = () => {
//       if (window.datosEnPeligro) {
//         const ok = window.confirm(
//           "TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borraran permanentemente.\n¿Estas seguro de salir?"
//         );
//         if (!ok) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }
//       window.datosEnPeligro = false;
//       window.removeEventListener("popstate", handler);
//       setTimeout(() => navigate("/experiments/experimentChooser", { replace: true }), 10);
//     };
//     window.addEventListener("popstate", handler);
//     return () => window.removeEventListener("popstate", handler);
//   }, [navigate]);

//   // ==================== LECTURA DE DATOS ====================
//   useEffect(() => {
//     if (!sweepIdActual) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     // Carga inicial del barrido activo
//     get(dbRef).then((snap) => {
//       if (snap.exists()) {
//         const cargados = Object.values(snap.val())
//           .filter((d) => d.sweepId === sweepIdActual)
//           .sort((a, b) => a.timestamp - b.timestamp);
//         if (cargados.length > 0) setDatosTemporales(cargados);
//       }
//     });

//     // Escucha activa para nuevos datos en tiempo real
//     const unsub = onChildAdded(dbRef, (snap) => {
//       const d = snap.val();
//       if (d.sweepId === sweepIdActual) {
//         setDatosTemporales((prev) => {
//           const existe = prev.some((x) => x.timestamp === d.timestamp);
//           return existe ? prev : [...prev, d];
//         });
//       }
//     });

//     return () => unsub();
//   }, [sweepIdActual]);

//   // ==================== LISTENER BackToFront (FIN DE MOVIMIENTO) ====================
//   useEffect(() => {
//     const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
//     const unsub = onValue(dbRef, (snap) => {
//       const msg = snap.val();
//       if (!msg || msg === "x") return;
//       if (lastMsgRef.current === msg) return;
//       lastMsgRef.current = msg;

//       if (msg !== "EndMov") return;
//       if (!barridoRef.current || !sweepIdRef.current) return;

//       const siguiente = indexRef.current + 1;
//       const combs     = combinacionesRef.current;
//       const sweepId   = sweepIdRef.current;

//       if (siguiente < combs.length) {
//         // Detectar cambio de fase (azimuth -> roll)
//         const puntoActual    = combs[indexRef.current];
//         const puntoSiguiente = combs[siguiente];
//         if (Math.abs(puntoSiguiente.roll - puntoActual.roll) > 0.1) {
//           setFaseBarrido("roll");
//         }
//         setIndexActual(siguiente);
//         setTimeout(() => enviarPunto(combs[siguiente], sweepId, siguiente), 2000);
//       } else {
//         // Barrido completo
//         setBarridoEnProgreso(false);
//         setFaseBarrido("done");
//         update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { status: "completed" }).catch(console.error);
//         console.log("Barrido 2D completado.");
//       }
//     });
//     return () => unsub();
//   }, [BASE_PATH]);

//   // ==================== AUTO-SWITCH DE TABS ====================
//   useEffect(() => {
//     if (faseBarrido === "roll") setActiveTab(1);
//     else if (faseBarrido === "azimuth" && datosTemporales.length === 0) setActiveTab(0);
//   }, [faseBarrido, datosTemporales.length]);

//   // ==================== HELPERS ====================

//   const generarAngulos = (inicio, fin, paso = 5) => {
//     const arr = [];
//     if (inicio <= fin) {
//       for (let a = inicio; a <= fin; a += paso) arr.push(a);
//     } else {
//       for (let a = inicio; a >= fin; a -= paso) arr.push(a);
//     }
//     return arr;
//   };

//   /**
//    * Barrido en forma de "L":
//    *
//    * Fase 1 - Azimuth (pitch cambia, roll fijo en zenithStart):
//    *   (azimuthStart, zenithStart) -> ... -> (azimuthEnd, zenithStart)
//    *
//    * Fase 2 - Zenith (roll cambia, pitch fijo en azimuthEnd):
//    *   (azimuthEnd, zenithStart+paso) -> ... -> (azimuthEnd, zenithEnd)
//    *
//    * Ejemplo Start=0, End=15 en ambos ejes:
//    *   (0,0) (5,0) (10,0) (15,0) (15,5) (15,10) (15,15)
//    */
//   const generarCombinaciones = (azI, azF, zeI, zeF, paso = 5) => {
//     const combs = [];

//     // Fase 1: pitch cambia, roll fijo
//     for (const p of generarAngulos(azI, azF, paso)) {
//       combs.push({ pitch: p, roll: zeI });
//     }

//     // Fase 2: roll cambia, pitch fijo en azF
//     // slice(1) para no repetir el punto de esquina (azF, zeI) ya registrado
//     for (const r of generarAngulos(zeI, zeF, paso).slice(1)) {
//       combs.push({ pitch: azF, roll: r });
//     }

//     return combs;
//   };

//   /**
//    * Divide los datos para los dos graficos:
//    * - Axis 1 (Azimuth): puntos donde roll === valor inicial (zenithStart del barrido)
//    * - Axis 2 (Zenith):  puntos donde roll ya cambio
//    */
//   const getDataByAxis = () => {
//     if (datosTemporales.length === 0) return { axis1: [], axis2: [] };

//     const rollBase = datosTemporales[0].roll;
//     const splitIdx = datosTemporales.findIndex(
//       (d) => Math.abs(d.roll - rollBase) > 0.1
//     );

//     if (splitIdx === -1) return { axis1: datosTemporales, axis2: [] };

//     return {
//       axis1: datosTemporales.slice(0, splitIdx),
//       axis2: datosTemporales.slice(splitIdx),
//     };
//   };

//   // ==================== LOGICA DE BARRIDO ====================

//   /**
//    * Envia un punto del barrido al backend via Firebase.
//    * Formato: "p<pitch>r<roll>" -> el backend (subsistema2.js) separa y envia al Arduino en secuencia.
//    */
//   const enviarPunto = async (punto, sweepId, index) => {
//     try {
//       const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//       await set(fbRef, `p${punto.pitch}r${punto.roll}`);
//       await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//         currentPitch: punto.pitch,
//         currentRoll:  punto.roll,
//         currentIndex: index,
//         lastUpdated:  Date.now(),
//       });
//     } catch (err) {
//       console.error("Error enviando punto al Arduino:", err);
//       setBarridoEnProgreso(false);
//     }
//   };

//   const iniciarBarrido = async () => {
//     if (barridoRef.current) return alert("Ya hay un barrido en progreso.");
//     if (azimuthStart === azimuthEnd && zenithStart === zenithEnd)
//       return alert("Al menos un eje debe tener un rango de angulos diferente.");

//     setDatosTemporales([]);
//     setActiveTab(0);
//     setFaseBarrido("azimuth");
//     setIndexActual(0);
//     lastMsgRef.current = null;

//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     const combs = generarCombinaciones(azimuthStart, azimuthEnd, zenithStart, zenithEnd);
//     setCombinaciones(combs);
//     setBarridoEnProgreso(true);

//     try {
//       await Promise.all([
//         set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//           azimuthStart, azimuthEnd, zenithStart, zenithEnd,
//           step: 5, totalPoints: combs.length,
//           status: "in_progress", fase: "azimuth",
//           timestamp: Date.now(), userSession,
//         }),
//         set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
//       ]);

//       console.log(`Barrido L-Shape iniciado: ${combs.length} puntos. ID: ${sweepId}`);
//       console.log("Secuencia:", combs.map(c => `(${c.pitch},${c.roll})`).join(" -> "));
//       setTimeout(() => enviarPunto(combs[0], sweepId, 0), 1000);
//     } catch (err) {
//       console.error("Error al iniciar barrido:", err);
//       setBarridoEnProgreso(false);
//     }
//   };

//   // ==================== GUARDAR DATOS ====================
//   const guardarBarrido = async () => {
//     const nuevos = datosTemporales.filter((d) => !d.isSaved);
//     if (nuevos.length === 0) return alert("No hay nuevos datos para guardar.");
//     if (!window.confirm(`Guardar ${nuevos.length} mediciones permanentemente?`)) return;

//     try {
//       const updates = {};
//       nuevos.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });
//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));
//       alert("Datos guardados con exito.");
//     } catch (err) {
//       console.error("Error al guardar:", err);
//     }
//   };

//   // ==================== BORRAR MEDICION INDIVIDUAL ====================
//   const handleDeleteMeasurement = async (timestamp) => {
//     if (!timestamp) return;
//     if (!window.confirm("Eliminar este registro permanentemente de la base de datos?")) return;
//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== timestamp));
//     } catch (err) {
//       console.error("Error eliminando registro:", err);
//     }
//   };

//   // ==================== NAVEGACION SEGURA (boton GO BACK) ====================
//   const handleBackSafe = () => {
//     if (window.datosEnPeligro) {
//       const ok = window.confirm(
//         "TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borraran permanentemente.\n¿Estas seguro de salir?"
//       );
//       if (!ok) return;
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   // ==================== VALORES DERIVADOS ====================
//   const { axis1: dataAxis1, axis2: dataAxis2 } = getDataByAxis();
//   const globalStartTime = datosTemporales.length > 0 ? datosTemporales[0].timestamp : 0;
//   const totalPuntos    = combinaciones.length;
//   const puntoActual    = combinaciones[indexActual];

//   // Barra de progreso: 0-50% fase azimuth, 50-100% fase roll
//   const azimuthPoints  = generarAngulos(azimuthStart, azimuthEnd).length;
//   const rollPoints     = generarAngulos(zenithStart, zenithEnd).length - 1; // slice(1)
//   const progresoWidth  = barridoEnProgreso
//     ? faseBarrido === "azimuth"
//       ? `${((indexActual + 1) / (azimuthPoints || 1)) * 50}%`
//       : `${50 + ((indexActual - azimuthPoints + 2) / (rollPoints || 1)) * 50}%`
//     : "0%";

//   // Estilos de Tabs
//   const tabStyles = {
//     textTransform: "none",
//     fontWeight: 600,
//     fontSize: "1rem",
//     borderRadius: "8px",
//     margin: "0 4px",
//     transition: "all 0.3s ease",
//     "&.Mui-selected": {
//       backgroundColor: "#e3f2fd",
//       color: "#1565c0",
//       boxShadow: "0 2px 4px rgba(25, 118, 210, 0.15)",
//     },
//     "&:hover": { backgroundColor: "#f5f5f5" },
//   };

//   // ==================== RETORNO CONDICIONAL (DESPUES DE TODOS LOS HOOKS) ====================
//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // ==================== RENDER ====================
//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Grid container spacing={4} alignItems="flex-start">

//         {/* ===================================================
//             COLUMNA IZQUIERDA: controles y tabla
//         ==================================================== */}
//         <Grid item xs={12} md={6}>

//           <Box display="flex" alignItems="center" mb={2}>
//             <RocketLaunch color="primary" sx={{ mr: 1 }} />
//             <Typography variant="h5">Automatic sweeping control (2-Axis)</Typography>
//           </Box>

//           {/* Control Azimuth (Pitch) */}
//           <DualAxisControl
//             axisName="Azimuth Control (Pitch)"
//             startValue={azimuthStart}
//             endValue={azimuthEnd}
//             setStart={setAzimuthStart}
//             setEnd={setAzimuthEnd}
//             disabled={barridoEnProgreso || !isHardwareReady}
//           />

//           {/* Control Zenith (Roll) */}
//           <DualAxisControl
//             axisName="Zenith Control (Roll)"
//             startValue={zenithStart}
//             endValue={zenithEnd}
//             setStart={setZenithStart}
//             setEnd={setZenithEnd}
//             disabled={barridoEnProgreso || !isHardwareReady}
//           />

//           {/* Boton de inicio */}
//           <Box mt={3} mb={2}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="large"
//               fullWidth
//               onClick={iniciarBarrido}
//               disabled={barridoEnProgreso || !isHardwareReady}
//               startIcon={
//                 !isHardwareReady || barridoEnProgreso
//                   ? <CircularProgress size={20} color="inherit" />
//                   : <PlayArrow />
//               }
//             >
//               {!isHardwareReady
//                 ? "Calibrating Panel..."
//                 : barridoEnProgreso
//                   ? `Scanning ${faseBarrido === "azimuth" ? "AZIMUTH" : "ZENITH"}... (${indexActual + 1}/${totalPuntos})`
//                   : (MOVE_BUTTON || "START DUAL AXIS SWEEP")}
//             </Button>
//           </Box>

//           {/* Barra de progreso en dos fases */}
//           {barridoEnProgreso && (
//             <Box sx={{ mb: 2 }}>
//               <Box sx={{ backgroundColor: "#eee", borderRadius: 1, height: 10, mb: 0.5 }}>
//                 <Box
//                   sx={{
//                     height: "100%", borderRadius: 1,
//                     backgroundColor: "#2196f3",
//                     width: progresoWidth,
//                     transition: "width 0.4s ease",
//                   }}
//                 />
//               </Box>
//               <Typography variant="caption" color="text.secondary">
//                 {puntoActual
//                   ? `Point ${indexActual + 1}/${totalPuntos} — Pitch: ${puntoActual.pitch}° | Roll: ${puntoActual.roll}°`
//                   : "Initializing..."}
//               </Typography>
//             </Box>
//           )}

//           {/* Header tabla con boton guardar */}
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, mb: 2 }}>
//             <Typography variant="h5">Measurements Table</Typography>
//             <Button
//               variant={hayDatosSinGuardar ? "contained" : "outlined"}
//               color="primary"
//               onClick={guardarBarrido}
//               disabled={datosTemporales.length === 0}
//               startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
//               size="medium"
//             >
//               {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
//             </Button>
//           </Box>

//           {/* Tabla de mediciones */}
//           <Box mt={1}>
//             {datosTemporales.length > 0 ? (
//               <DataTable
//                 columns={SUBSYSTEM2_COLUMNS}
//                 data={datosTemporales.map((d) => ({
//                   [SUBSYSTEM2_COLUMNS[0]]: `${d.pitch ?? "-"}°`,
//                   [SUBSYSTEM2_COLUMNS[1]]: `${d.roll ?? "-"}°`,
//                   [SUBSYSTEM2_COLUMNS[2]]: d.voltage?.toFixed(2),
//                   [SUBSYSTEM2_COLUMNS[3]]: d.current?.toFixed(4),
//                   [SUBSYSTEM2_COLUMNS[4]]: ((d.voltage ?? 0) * (d.current ?? 0)).toFixed(4),
//                   ...(SUBSISTEMA2_COLUMNS[5] ? { [SUBSYSTEM2_COLUMNS[5]]: "0.75" } : {}),
//                 }))}
//                 onDelete={(index) => {
//                   const orig = datosTemporales[index];
//                   if (orig?.timestamp) handleDeleteMeasurement(orig.timestamp);
//                 }}
//                 maxHeight="550px"
//                 disableHorizontalScroll={true}
//               />
//             ) : (
//               <Paper sx={{ p: 2, textAlign: "center", color: "#666" }}>
//                 Waiting for sweep data...
//               </Paper>
//             )}
//           </Box>
//         </Grid>

//         {/* ===================================================
//             COLUMNA DERECHA: camara y graficos por eje
//         ==================================================== */}
//         <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>

//           {/* Camara en vivo */}
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
//             <Paper
//               className="paper-camera"
//               sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}
//             >
//               <Typography
//                 variant="h5"
//                 gutterBottom
//                 sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
//               >
//                 {CAMERA_TITLE}
//                 <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>
//                   En vivo
//                 </Typography>
//               </Typography>
//               <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
//                 <iframe
//                   width="100%" height="100%"
//                   src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                   title="Live Camera Exp2"
//                   frameBorder="0"
//                   allowFullScreen
//                 />
//               </Box>
//             </Paper>
//           </Box>

//           {/* Tabs de eje */}
//           <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", p: "6px", mb: 2, border: "1px solid #e0e0e0" }}>
//             <Tabs
//               value={activeTab}
//               onChange={(e, v) => setActiveTab(v)}
//               variant="fullWidth"
//               TabIndicatorProps={{ style: { display: "none" } }}
//             >
//               <Tab label="Axis 1: Azimuth" sx={tabStyles} />
//               <Tab label="Axis 2: Zenith"  sx={tabStyles} />
//             </Tabs>
//           </Box>

//           {/* Grafico Voltaje */}
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//             <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//               <GraphTitleWithTooltip
//                 title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
//                 description={GRAPH_DESCRIPTIONS?.VOLTAGE_VS_TIME || "Real-time voltage measurements."}
//               />
//               <Box mt={2}>
//                 <RealTimeChart
//                   chartId="chart-voltage-2"
//                   data={activeTab === 0 ? dataAxis1 : dataAxis2}
//                   customStartTime={globalStartTime}
//                   dataKey="voltage"
//                   color="#2196f3"
//                   yLabel="Voltage (V)"
//                   unit="V"
//                   angleKey={activeTab === 0 ? "pitch" : "roll"}
//                   angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
//                 />
//               </Box>
//             </Paper>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, mb: 3, position: "relative", top: 10 }}>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "chart_voltage", "Exp2", "csv", globalStartTime)}
//               startIcon={<Download fontSize="small" />}>CSV</Button>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => downloadChartAsImage("chart-voltage-2", "Voltage_Exp2")}
//               startIcon={<CropFree fontSize="small" />}>IMG</Button>
//           </Box>

//           {/* Grafico Corriente */}
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
//             <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//               <GraphTitleWithTooltip
//                 title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
//                 description={GRAPH_DESCRIPTIONS?.CURRENT_VS_TIME || "Real-time current measurements."}
//               />
//               <Box mt={2}>
//                 <RealTimeChart
//                   chartId="chart-current-2"
//                   data={activeTab === 0 ? dataAxis1 : dataAxis2}
//                   customStartTime={globalStartTime}
//                   dataKey="current"
//                   color="#4caf50"
//                   yLabel="Current (A)"
//                   unit="A"
//                   angleKey={activeTab === 0 ? "pitch" : "roll"}
//                   angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
//                 />
//               </Box>
//             </Paper>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, position: "relative", top: 10 }}>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "chart_current", "Exp2", "csv", globalStartTime)}
//               startIcon={<Download fontSize="small" />}>CSV</Button>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => downloadChartAsImage("chart-current-2", "Current_Exp2")}
//               startIcon={<CropFree fontSize="small" />}>IMG</Button>
//           </Box>

//           {/* Descarga total */}
//           <Box mt={5}>
//             <Button variant="contained" color="pink"
//               onClick={() => exportData(datosTemporales, "full_report_exp2", "Exp2", "csv")}
//               fullWidth marginTop={2} startIcon={<SaveAlt />}>
//               {DOWNLOAD_GRAPHS_BUTTON}
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>

//       {/* Footer */}
//       <Box mt={6} mb={4} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//         <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
//           {BACK_BUTTON}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Subsistema2;




//version gemini

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Tabs, Tab, CircularProgress, Grid } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// // Iconos e Interfaz
// import { PlayArrow, Save, CloudDone, Download, RocketLaunch, SaveAlt } from '@mui/icons-material';
// import DualAxisControl from "../../components/Elements/DualAxisControl";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";

// // Firebase y Utils
// import { getDatabase, ref, set, update, onValue, onChildAdded, onDisconnect } from "firebase/database";
// import app from "../../firebaseConfig.js";
// import { exportData } from "../../../src/utils/ExportUtils";
// import { SUBSYSTEM2_COLUMNS, PAGE_TITLES, GRAPH_DESCRIPTIONS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // Estados de control de ángulos
//   const [pitchStart, setPitchStart] = useState(0);
//   const [pitchEnd, setPitchEnd] = useState(15);
//   const [rollStart, setRollStart] = useState(0);
//   const [rollEnd, setRollEnd] = useState(15);

//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [pasosBarrido, setPasosBarrido] = useState([]);
//   const [indicePaso, setIndicePaso] = useState(0);
//   const [sweepIdActual, setSweepIdActual] = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);

//   // Referencias para evitar problemas de cierre de sesión
//   const pasosBarridoRef = useRef([]);
//   const indicePasoRef = useRef(0);
//   const sweepIdActualRef = useRef(null);
//   const datosTemporalesRef = useRef([]);

//   useEffect(() => {
//     pasosBarridoRef.current = pasosBarrido;
//     indicePasoRef.current = indicePaso;
//     sweepIdActualRef.current = sweepIdActual;
//     datosTemporalesRef.current = datosTemporales;
//     window.datosEnPeligro = datosTemporales.some(d => !d.isSaved);
//   }, [pasosBarrido, indicePaso, sweepIdActual, datosTemporales]);

//   const BASE_PATH = `users/${user?.uid}/Exp2`;

//   // 1. Manejo de Hardware y Seguridad
//   useEffect(() => {
//     if (!user) return;
//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     onDisconnect(fbRef).set("n");
//     set(fbRef, "y");

//     const statusRef = ref(db, 'estado_general/Exp2/hardwareStatus');
//     onValue(statusRef, (snap) => setIsHardwareReady(snap.val() === 'READY'));

//     return () => {
//       set(fbRef, "n");
//       onDisconnect(fbRef).cancel();
//     };
//   }, [user]);

//   // 2. Lógica de Barrido en L (Actualizada Dinámicamente)
//   const iniciarBarridoL = async () => {
//     if (barridoEnProgreso || !isHardwareReady) return;
    
//     setDatosTemporales([]);
//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     let secuencia = [];
//     // Fase Pitch: desde el inicio al fin seleccionado
//     for (let p = pitchStart; p <= pitchEnd; p += 5) {
//       secuencia.push({ t: 'p', v: p });
//     }
//     // Fase Roll: desde inicio + 5
//     for (let r = rollStart + 5; r <= rollEnd; r += 5) {
//       secuencia.push({ t: 'r', v: r });
//     }

//     setPasosBarrido(secuencia);
//     setIndicePaso(0);
//     setBarridoEnProgreso(true);
//     setActiveTab(0);

//     await set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId);

//     // ✅ ENVÍO DINÁMICO: Inicia con el primer valor real del slider
//     const primerPaso = secuencia[0];
//     await set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `${primerPaso.t}${primerPaso.v}`);
//   };

//   // 3. Escucha de BackToFront (EndMov)
//   useEffect(() => {
//     const btfRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
//     const unsub = onValue(btfRef, (snap) => {
//       if (snap.val() === "EndMov") {
//         const siguienteIdx = indicePasoRef.current + 1;
//         const pasos = pasosBarridoRef.current;

//         if (siguienteIdx < pasos.length) {
//           const proximoPaso = pasos[siguienteIdx];
//           if (proximoPaso.t === 'r') setActiveTab(1);
//           setIndicePaso(siguienteIdx);
//           set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `${proximoPaso.t}${proximoPaso.v}`);
//         } else {
//           setBarridoEnProgreso(false);
//           update(ref(db, `${BASE_PATH}/sweeps/${sweepIdActualRef.current}`), { status: "completed" });
//         }
//       }
//     });
//     return () => unsub();
//   }, [BASE_PATH]);

//   // Mediciones en tiempo real
//   useEffect(() => {
//     if (!sweepIdActual) return;
//     return onChildAdded(ref(db, `${BASE_PATH}/measurements`), (snap) => {
//       const d = snap.val();
//       if (d.sweepId === sweepIdActual) {
//         setDatosTemporales(prev => prev.some(x => x.timestamp === d.timestamp) ? prev : [...prev, d]);
//       }
//     });
//   }, [sweepIdActual]);

//   const axisData = {
//     axis1: datosTemporales.filter(d => d.roll <= rollStart),
//     axis2: datosTemporales.filter(d => d.roll > rollStart)
//   };

//   if (!user) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{PAGE_TITLES.MAIN_TITLE}</Typography>
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//             <Box sx={{ '& .MuiSlider-root.Mui-disabled': { color: '#9e9e9e' } }}>
//                 <DualAxisControl axisName="Pitch" startValue={pitchStart} endValue={pitchEnd} setStart={setPitchStart} setEnd={setPitchEnd} disabled={barridoEnProgreso || !isHardwareReady} />
//                 <DualAxisControl axisName="Roll" startValue={rollStart} endValue={rollEnd} setStart={setRollStart} setEnd={setRollEnd} disabled={barridoEnProgreso || !isHardwareReady} />
//             </Box>
//             <Button variant="contained" fullWidth size="large" onClick={iniciarBarridoL} disabled={barridoEnProgreso || !isHardwareReady} startIcon={barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />} sx={{ mt: 2, mb: 2 }}>
//                 {!isHardwareReady ? "CALIBRANDO..." : barridoEnProgreso ? "EN PROGRESO..." : "INICIAR BARRIDO EN L"}
//             </Button>
//             <DataTable columns={SUBSYSTEM2_COLUMNS} data={datosTemporales.map(d => ({ [SUBSYSTEM2_COLUMNS[0]]: `${d.pitch}°`, [SUBSYSTEM2_COLUMNS[1]]: `${d.roll}°`, [SUBSYSTEM2_COLUMNS[2]]: d.voltage?.toFixed(2), [SUBSYSTEM2_COLUMNS[3]]: d.current?.toFixed(2) }))} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//             <Paper sx={{ p: 2, bgcolor: "#121212", color: "#fff", mb: 3 }}>
//                 <Typography variant="h5">{PAGE_TITLES.CAMERA_TITLE}</Typography>
//                 <Box height="300px" mt={1} bgcolor="#000">
//                     <iframe width="100%" height="100%" src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1" frameBorder="0" />
//                 </Box>
//             </Paper>
//             <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ mb: 2 }}><Tab label="Gráficos Pitch" /><Tab label="Gráficos Roll" /></Tabs>
//             <RealTimeChart chartId="v-chart" data={activeTab === 0 ? axisData.axis1 : axisData.axis2} dataKey="voltage" color="#2196f3" yLabel="Voltaje (V)" />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default Subsistema2;







//version gemini final
// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Tabs, Tab, CircularProgress, Grid } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// // Iconos e Interfaz
// import { PlayArrow, CloudDone, RocketLaunch, SaveAlt } from '@mui/icons-material';
// import DualAxisControl from "../../components/Elements/DualAxisControl";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";

// // Firebase y Utils
// import { getDatabase, ref, set, update, onValue, onChildAdded, onDisconnect } from "firebase/database";
// import app from "../../firebaseConfig.js";
// import { exportData } from "../../../src/utils/ExportUtils";
// import { SUBSYSTEM2_COLUMNS, PAGE_TITLES, GRAPH_DESCRIPTIONS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   // Estados de control de ángulos (Slidres)
//   const [pitchStart, setPitchStart] = useState(0);
//   const [pitchEnd, setPitchEnd] = useState(15);
//   const [rollStart, setRollStart] = useState(0);
//   const [rollEnd, setRollEnd] = useState(15);

//   // Estados de control de experimento
//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [pasosBarrido, setPasosBarrido] = useState([]);
//   const [indicePaso, setIndicePaso] = useState(0);
//   const [sweepIdActual, setSweepIdActual] = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);

//   // Referencias para persistencia en callbacks de Firebase
//   const pasosBarridoRef = useRef([]);
//   const indicePasoRef = useRef(0);
//   const sweepIdActualRef = useRef(null);

//   useEffect(() => {
//     pasosBarridoRef.current = pasosBarrido;
//     indicePasoRef.current = indicePaso;
//     sweepIdActualRef.current = sweepIdActual;
//   }, [pasosBarrido, indicePaso, sweepIdActual]);

//   const BASE_PATH = `users/${user?.uid}/Exp2`;

//   // 1. CICLO DE VIDA: Conexión inicial y seguridad
//   useEffect(() => {
//     if (!user) return;
//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
    
//     onDisconnect(fbRef).set("n");
//     set(fbRef, "y"); // "Despertar" al Arduino

//     // Escuchar si el hardware está READY (gracias al mensaje "Sistema finalizado..." del Back)
//     const statusRef = ref(db, 'estado_general/Exp2/hardwareStatus');
//     const unsubStatus = onValue(statusRef, (snap) => {
//       setIsHardwareReady(snap.val() === 'READY');
//     });

//     return () => {
//       set(fbRef, "n");
//       onDisconnect(fbRef).cancel();
//       unsubStatus();
//     };
//   }, [user]);

//   // 2. LÓGICA DE BARRIDO EN L (Generación de pasos)
//   const iniciarBarridoL = async () => {
//     if (barridoEnProgreso || !isHardwareReady) return;
    
//     setDatosTemporales([]);
//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     let secuencia = [];
//     // Fase 1: Recorrido Pitch (Roll fijo en el inicio)
//     for (let p = pitchStart; p <= pitchEnd; p += 5) {
//       secuencia.push({ t: 'p', v: p });
//     }
//     // Fase 2: Recorrido Roll (Pitch fijo en el final)
//     for (let r = rollStart + 5; r <= rollEnd; r += 5) {
//       secuencia.push({ t: 'r', v: r });
//     }

//     setPasosBarrido(secuencia);
//     setIndicePaso(0);
//     setBarridoEnProgreso(true);
//     setActiveTab(0);

//     await set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId);

//     // ✅ ENVIAR PRIMER PASO: El Back recibirá "p0" (o similar) y gestionará el PITCH: con el Arduino
//     const primerPaso = secuencia[0];
//     await set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `${primerPaso.t}${primerPaso.v}`);
//   };

//   // 3. ESCUCHA DE RESPUESTA DEL BACKEND (EndMov)
//   useEffect(() => {
//     const btfRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
    
//     const unsubBTF = onValue(btfRef, (snap) => {
//       if (snap.val() === "EndMov") {
//         const siguienteIdx = indicePasoRef.current + 1;
//         const pasos = pasosBarridoRef.current;

//         if (siguienteIdx < pasos.length) {
//           const proximoPaso = pasos[siguienteIdx];
          
//           // Cambio visual de pestaña según el eje que se mueva
//           if (proximoPaso.t === 'r') setActiveTab(1);
          
//           setIndicePaso(siguienteIdx);

//           // ENVIAR SIGUIENTE PASO AL BACKEND
//           set(ref(db, `${BASE_PATH}/communication/FrontToBack`), `${proximoPaso.t}${proximoPaso.v}`);
//           console.log(`Moviendo a: ${proximoPaso.t}${proximoPaso.v}`);
//         } else {
//           // FINALIZAR BARRIDO
//           setBarridoEnProgreso(false);
//           update(ref(db, `${BASE_PATH}/sweeps/${sweepIdActualRef.current}`), { status: "completed" });
//           console.log("✅ Barrido en L completado");
//         }
//       }
//     });

//     return () => unsubBTF();
//   }, [BASE_PATH]);

//   // 4. ESCUCHA DE MEDICIONES (Desde el nodo measurements del Back)
//   useEffect(() => {
//     if (!sweepIdActual) return;
//     const mRef = ref(db, `${BASE_PATH}/measurements`);
//     const unsubMeas = onChildAdded(mRef, (snap) => {
//       const d = snap.val();
//       if (d.sweepId === sweepIdActual) {
//         setDatosTemporales(prev => {
//           if (prev.some(x => x.timestamp === d.timestamp)) return prev;
//           return [...prev, d];
//         });
//       }
//     });
//     return () => unsubMeas();
//   }, [sweepIdActual]);

//   // Filtrado de datos para gráficos
//   const axisData = {
//     pitchPhase: datosTemporales.filter(d => d.roll <= rollStart),
//     rollPhase: datosTemporales.filter(d => d.roll > rollStart)
//   };

//   if (!user) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom>{PAGE_TITLES.MAIN_TITLE}</Typography>
      
//       <Grid container spacing={4}>
//         {/* COLUMNA IZQUIERDA: CONTROLES Y TABLA */}
//         <Grid item xs={12} md={6}>
//             <Box sx={{ '& .MuiSlider-root.Mui-disabled': { color: '#9e9e9e' } }}>
//                 <DualAxisControl axisName="Pitch" startValue={pitchStart} endValue={pitchEnd} setStart={setPitchStart} setEnd={setPitchEnd} disabled={barridoEnProgreso || !isHardwareReady} />
//                 <DualAxisControl axisName="Roll" startValue={rollStart} endValue={rollEnd} setStart={setRollStart} setEnd={setRollEnd} disabled={barridoEnProgreso || !isHardwareReady} />
//             </Box>

//             <Button 
//                 variant="contained" fullWidth size="large" onClick={iniciarBarridoL} 
//                 disabled={barridoEnProgreso || !isHardwareReady} 
//                 startIcon={barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />} 
//                 sx={{ mt: 2, mb: 2 }}
//             >
//                 {!isHardwareReady ? "CALIBRANDO..." : barridoEnProgreso ? "BARRIDO EN CURSO..." : "INICIAR BARRIDO EN L"}
//             </Button>

//             <DataTable 
//                 columns={SUBSYSTEM2_COLUMNS} 
//                 data={datosTemporales.map(d => ({ 
//                     [SUBSYSTEM2_COLUMNS[0]]: `${d.pitch}°`, 
//                     [SUBSYSTEM2_COLUMNS[1]]: `${d.roll}°`, 
//                     [SUBSYSTEM2_COLUMNS[2]]: d.voltage?.toFixed(2), 
//                     [SUBSYSTEM2_COLUMNS[3]]: d.current?.toFixed(2) 
//                 }))} 
//             />
//         </Grid>

//         {/* COLUMNA DERECHA: CÁMARA Y GRÁFICOS */}
//         <Grid item xs={12} md={6}>
//             <Paper sx={{ p: 2, bgcolor: "#121212", color: "#fff", mb: 3 }}>
//                 <Typography variant="h6">{PAGE_TITLES.CAMERA_TITLE}</Typography>
//                 <Box height="300px" mt={1} bgcolor="#000">
//                     <iframe width="100%" height="100%" src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1" frameBorder="0" />
//                 </Box>
//             </Paper>

//             <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
//                 <Tab label="Gráficos Pitch" />
//                 <Tab label="Gráficos Roll" />
//             </Tabs>

//             <Paper sx={{ p: 2, mb: 2 }}>
//                 <GraphTitleWithTooltip title={PAGE_TITLES.VOLTAGE_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME} />
//                 <RealTimeChart 
//                     chartId="v-chart" 
//                     data={activeTab === 0 ? axisData.pitchPhase : axisData.rollPhase} 
//                     dataKey="voltage" color="#2196f3" yLabel="Voltaje (V)" 
//                 />
//             </Paper>

//             <Button 
//                 variant="contained" color="secondary" fullWidth startIcon={<SaveAlt />} 
//                 onClick={() => exportData(datosTemporales, 'barrido_subsistema2', 'Exp2', 'csv')}
//             >
//                 {PAGE_TITLES.DOWNLOAD_GRAPHS_BUTTON}
//             </Button>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default Subsistema2;


//version claude final

// import React, { useState, useEffect, useRef } from "react";
// import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Grid from "@mui/material/Grid";
// import { useSelector } from "react-redux";

// // Estilos
// import "../../assets/css/Elements/PaperStyles.css";

// // Componentes
// import DualAxisControl from "../../components/Elements/DualAxisControl";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";

// // Iconos
// import { PlayArrow, Save, CloudDone, Download, CropFree, SaveAlt, RocketLaunch } from "@mui/icons-material";
// import CircularProgress from "@mui/material/CircularProgress";

// // Utilidades
// import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

// // Constantes de strings
// import {
//   SUBSYSTEM2_COLUMNS,
//   PAGE_TITLES,
//   GRAPH_DESCRIPTIONS,
// } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// // Firebase
// import {
//   getDatabase, ref, set, update,
//   onValue, onChildAdded, get, onDisconnect,
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

// // =============================================================
// // COMPONENTE PRINCIPAL
// // =============================================================
// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db       = getDatabase(app);
//   const user     = useSelector((state) => state.auth.user);

//   // Manejo seguro: UID y ruta base
//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH   = `users/${UID_USUARIO}/Exp2`;

//   const {
//     MAIN_TITLE, DESCRIPTION, MOVE_BUTTON,
//     DOWNLOAD_GRAPHS_BUTTON, BACK_BUTTON,
//     CAMERA_TITLE, VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE,
//   } = PAGE_TITLES;

//   // ==================== ESTADOS ====================
//   // Azimuth = Pitch (eje vertical), Zenith = Roll (eje horizontal)
//   const [azimuthStart, setAzimuthStart] = useState(0);
//   const [azimuthEnd,   setAzimuthEnd]   = useState(20);
//   const [zenithStart,  setZenithStart]  = useState(0);
//   const [zenithEnd,    setZenithEnd]    = useState(20);

//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [combinaciones,     setCombinaciones]     = useState([]);
//   const [indexActual,       setIndexActual]        = useState(0);
//   const [faseBarrido,       setFaseBarrido]        = useState("azimuth");

//   const [sweepIdActual,   setSweepIdActual]   = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [userSession,     setUserSession]     = useState(null);

//   // Bloqueo visual mientras el hardware calibra
//   const [isHardwareReady, setIsHardwareReady] = useState(false);

//   // Tabs de gráficos
//   const [activeTab, setActiveTab] = useState(0);

//   // ==================== REFERENCIAS (para closures en listeners) ====================
//   const sweepIdRef       = useRef(null);
//   const datosRef         = useRef([]);
//   const combinacionesRef = useRef([]);
//   const indexRef         = useRef(0);
//   const faseRef          = useRef("azimuth");
//   const barridoRef       = useRef(false);
//   const lastMsgRef       = useRef(null);

//   useEffect(() => {
//     sweepIdRef.current       = sweepIdActual;
//     datosRef.current         = datosTemporales;
//     combinacionesRef.current = combinaciones;
//     indexRef.current         = indexActual;
//     faseRef.current          = faseBarrido;
//     barridoRef.current       = barridoEnProgreso;
//   }, [sweepIdActual, datosTemporales, combinaciones, indexActual, faseBarrido, barridoEnProgreso]);

//   // ==================== ESCUCHAR HARDWARE STATUS ====================
//   // Flujo del backend:
//   //   Encendido → "Sistema iniciado..." → 'n' → "Sistema finalizado..." → READY
//   //   Usuario entra ('y') → CALIBRATING → Arduino calibra → "Calibración completada" → READY
//   //   Usuario sale ('n') → CALIBRATING → "Sistema finalizado..." → READY
//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp2/hardwareStatus");
//     const unsub = onValue(statusRef, (snap) => {
//       if (snap.exists()) setIsHardwareReady(snap.val() === "READY");
//     });
//     return () => unsub();
//   }, [db]);

//   // ==================== INICIALIZACIÓN Y LIMPIEZA ====================
//   useEffect(() => {
//     if (!user) return;

//     const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setUserSession(sessionId);

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

//     // CAPA 1: Si el usuario cierra la pestaña a la fuerza,
//     // Firebase escribe 'n' automáticamente para proteger el hardware.
//     onDisconnect(fbRef).set("n");

//     // Despertar el Arduino (recalibra y queda listo para barridos)
//     set(fbRef, "y").catch(console.error);

//     // Recuperar ID del último barrido activo
//     get(ref(db, `${BASE_PATH}/currentSweepId`)).then((snap) => {
//       if (snap.exists()) setSweepIdActual(snap.val());
//     });

//     // Cleanup al navegar internamente
//     return () => {
//       set(fbRef, "n").catch(() => {});
//       onDisconnect(fbRef).cancel();

//       const basura = datosRef.current.filter((d) => !d.isSaved);
//       if (basura.length > 0) {
//         console.log(`🗑️ Eliminando ${basura.length} datos no guardados de Exp2.`);
//         const updates = {};
//         basura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });
//         update(ref(db), updates).catch(console.error);
//       }
//     };
//   }, [user]);

//   // ==================== CAPA 2: F5 / CERRAR PESTAÑA ====================
//   useEffect(() => {
//     const handler = (e) => {
//       if (datosTemporales.some((d) => !d.isSaved)) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };
//     window.addEventListener("beforeunload", handler);
//     return () => window.removeEventListener("beforeunload", handler);
//   }, [datosTemporales]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   // Señal global para que el Header intercepte la navegación
//   useEffect(() => {
//     window.datosEnPeligro = hayDatosSinGuardar;
//     return () => { window.datosEnPeligro = false; };
//   }, [hayDatosSinGuardar]);

//   // ==================== CAPA 3: FLECHA ATRÁS DEL NAVEGADOR ====================
//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);
//     const handler = () => {
//       if (window.datosEnPeligro) {
//         const ok = window.confirm(
//           "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//         );
//         if (!ok) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }
//       window.datosEnPeligro = false;
//       window.removeEventListener("popstate", handler);
//       setTimeout(() => navigate("/experiments/experimentChooser", { replace: true }), 10);
//     };
//     window.addEventListener("popstate", handler);
//     return () => window.removeEventListener("popstate", handler);
//   }, [navigate]);

//   // ==================== LECTURA DE DATOS EN TIEMPO REAL ====================
//   useEffect(() => {
//     if (!sweepIdActual) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snap) => {
//       if (snap.exists()) {
//         const cargados = Object.values(snap.val())
//           .filter((d) => d.sweepId === sweepIdActual)
//           .sort((a, b) => a.timestamp - b.timestamp);
//         if (cargados.length > 0) setDatosTemporales(cargados);
//       }
//     });

//     const unsub = onChildAdded(dbRef, (snap) => {
//       const d = snap.val();
//       if (d.sweepId === sweepIdActual) {
//         setDatosTemporales((prev) => {
//           const existe = prev.some((x) => x.timestamp === d.timestamp);
//           return existe ? prev : [...prev, d];
//         });
//       }
//     });

//     return () => unsub();
//   }, [sweepIdActual]);

//   // ==================== LISTENER BackToFront (FIN DE PUNTO) ====================
//   useEffect(() => {
//     const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
//     const unsub = onValue(dbRef, (snap) => {
//       const msg = snap.val();
//       if (!msg || msg === "x") return;
//       if (lastMsgRef.current === msg) return;
//       lastMsgRef.current = msg;
//       if (msg !== "EndMov") return;
//       if (!barridoRef.current || !sweepIdRef.current) return;

//       const siguiente = indexRef.current + 1;
//       const combs     = combinacionesRef.current;
//       const sweepId   = sweepIdRef.current;

//       if (siguiente < combs.length) {
//         // Detectar cambio de fase azimuth → zenith
//         const actual    = combs[indexRef.current];
//         const siguiente_ = combs[siguiente];
//         if (Math.abs(siguiente_.roll - actual.roll) > 0.1) setFaseBarrido("zenith");

//         setIndexActual(siguiente);
//         setTimeout(() => enviarPunto(combs[siguiente], sweepId, siguiente), 2000);
//       } else {
//         setBarridoEnProgreso(false);
//         setFaseBarrido("done");
//         update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { status: "completed" }).catch(console.error);
//         console.log("🏁 Barrido 2D completado.");
//       }
//     });
//     return () => unsub();
//   }, [BASE_PATH]);

//   // ==================== AUTO-SWITCH DE TABS ====================
//   useEffect(() => {
//     if (faseBarrido === "zenith") setActiveTab(1);
//     else if (faseBarrido === "azimuth" && datosTemporales.length === 0) setActiveTab(0);
//   }, [faseBarrido, datosTemporales.length]);

//   // ==================== HELPERS ====================

//   const generarAngulos = (inicio, fin, paso = 5) => {
//     const arr = [];
//     if (inicio <= fin) {
//       for (let a = inicio; a <= fin; a += paso) arr.push(a);
//     } else {
//       for (let a = inicio; a >= fin; a -= paso) arr.push(a);
//     }
//     return arr;
//   };

//   /**
//    * Barrido en "L":
//    * Fase 1 – Azimuth (pitch cambia, roll fijo en zenithStart):
//    *   (azimuthStart, zenithStart) → … → (azimuthEnd, zenithStart)
//    * Fase 2 – Zenith (roll cambia, pitch fijo en azimuthEnd):
//    *   (azimuthEnd, zenithStart+paso) → … → (azimuthEnd, zenithEnd)
//    *
//    * Ejemplo Start=0, End=15 en ambos ejes:
//    *   (0,0) (5,0) (10,0) (15,0) (15,5) (15,10) (15,15)
//    */
//   const generarCombinaciones = (azI, azF, zeI, zeF, paso = 5) => {
//     const combs = [];
//     for (const p of generarAngulos(azI, azF, paso)) {
//       combs.push({ pitch: p, roll: zeI });
//     }
//     // slice(1): no repetir el punto de esquina (azF, zeI) ya registrado en fase 1
//     for (const r of generarAngulos(zeI, zeF, paso).slice(1)) {
//       combs.push({ pitch: azF, roll: r });
//     }
//     return combs;
//   };

//   /**
//    * Divide los datos para los dos gráficos:
//    * - Axis 1 (Azimuth): puntos donde roll es igual al valor inicial del roll
//    * - Axis 2 (Zenith):  puntos donde roll ya cambió
//    */
//   const getDataByAxis = () => {
//     if (datosTemporales.length === 0) return { axis1: [], axis2: [] };
//     const rollBase = datosTemporales[0].roll;
//     const splitIdx = datosTemporales.findIndex((d) => Math.abs(d.roll - rollBase) > 0.1);
//     if (splitIdx === -1) return { axis1: datosTemporales, axis2: [] };
//     return {
//       axis1: datosTemporales.slice(0, splitIdx),
//       axis2: datosTemporales.slice(splitIdx),
//     };
//   };

//   // ==================== LÓGICA DE BARRIDO ====================

//   /**
//    * Envía un punto al backend vía Firebase.
//    * Formato: "p<pitch>r<roll>" → el backend separa y envía al Arduino en secuencia.
//    */
//   const enviarPunto = async (punto, sweepId, index) => {
//     try {
//       const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//       await set(fbRef, `p${punto.pitch}r${punto.roll}`);
//       await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//         currentPitch: punto.pitch,
//         currentRoll:  punto.roll,
//         currentIndex: index,
//         lastUpdated:  Date.now(),
//       });
//     } catch (err) {
//       console.error("Error enviando punto:", err);
//       setBarridoEnProgreso(false);
//     }
//   };

//   const iniciarBarrido = async () => {
//     if (barridoRef.current) return alert("Ya hay un barrido en progreso.");
//     if (azimuthStart === azimuthEnd && zenithStart === zenithEnd)
//       return alert("Al menos un eje debe tener un rango de ángulos diferente.");

//     setDatosTemporales([]);
//     setActiveTab(0);
//     setFaseBarrido("azimuth");
//     setIndexActual(0);
//     lastMsgRef.current = null;

//     const sweepId = `sweep_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     const combs = generarCombinaciones(azimuthStart, azimuthEnd, zenithStart, zenithEnd);
//     setCombinaciones(combs);
//     setBarridoEnProgreso(true);

//     try {
//       await Promise.all([
//         set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//           azimuthStart, azimuthEnd, zenithStart, zenithEnd,
//           step: 5, totalPoints: combs.length,
//           status: "in_progress", fase: "azimuth",
//           timestamp: Date.now(), userSession,
//         }),
//         set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
//       ]);

//       console.log(`🚀 Barrido L-Shape: ${combs.length} puntos.`);
//       console.log("Secuencia:", combs.map(c => `(${c.pitch},${c.roll})`).join(" → "));
//       setTimeout(() => enviarPunto(combs[0], sweepId, 0), 1000);
//     } catch (err) {
//       console.error("Error iniciando barrido:", err);
//       setBarridoEnProgreso(false);
//     }
//   };

//   // ==================== GUARDAR DATOS ====================
//   const guardarBarrido = async () => {
//     const nuevos = datosTemporales.filter((d) => !d.isSaved);
//     if (nuevos.length === 0) return alert("No hay nuevos datos para guardar.");
//     if (!window.confirm(`¿Guardar ${nuevos.length} mediciones permanentemente?`)) return;
//     try {
//       const updates = {};
//       nuevos.forEach((d) => {
//         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
//       });
//       await update(ref(db), updates);
//       setDatosTemporales((prev) => prev.map((d) => ({ ...d, isSaved: true })));
//       alert("✅ Datos guardados con éxito.");
//     } catch (err) {
//       console.error("Error al guardar:", err);
//     }
//   };

//   // ==================== BORRAR MEDICIÓN INDIVIDUAL ====================
//   const handleDeleteMeasurement = async (timestamp) => {
//     if (!timestamp) return;
//     if (!window.confirm("¿Eliminar este registro permanentemente?")) return;
//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== timestamp));
//     } catch (err) {
//       console.error("Error eliminando registro:", err);
//     }
//   };

//   // ==================== NAVEGACIÓN SEGURA (botón GO BACK) ====================
//   const handleBackSafe = () => {
//     if (window.datosEnPeligro) {
//       const ok = window.confirm(
//         "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//       );
//       if (!ok) return;
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   // ==================== VALORES DERIVADOS ====================
//   const { axis1: dataAxis1, axis2: dataAxis2 } = getDataByAxis();
//   const globalStartTime = datosTemporales.length > 0 ? datosTemporales[0].timestamp : 0;
//   const totalPuntos     = combinaciones.length;
//   const puntoActual     = combinaciones[indexActual];

//   // Barra de progreso en dos fases: 0-50% azimuth, 50-100% zenith
//   const azimuthPoints = generarAngulos(azimuthStart, azimuthEnd).length;
//   const rollPoints    = Math.max(generarAngulos(zenithStart, zenithEnd).length - 1, 1);
//   const progresoWidth = barridoEnProgreso
//     ? faseBarrido === "azimuth"
//       ? `${((indexActual + 1) / (azimuthPoints || 1)) * 50}%`
//       : `${50 + ((indexActual - azimuthPoints + 2) / rollPoints) * 50}%`
//     : "0%";

//   // Estilos de Tabs
//   const tabStyles = {
//     textTransform: "none", fontWeight: 600, fontSize: "1rem",
//     borderRadius: "8px", margin: "0 4px", transition: "all 0.3s ease",
//     "&.Mui-selected": { backgroundColor: "#e3f2fd", color: "#1565c0", boxShadow: "0 2px 4px rgba(25,118,210,0.15)" },
//     "&:hover": { backgroundColor: "#f5f5f5" },
//   };

//   // ==================== RETORNO CONDICIONAL (DESPUÉS DE TODOS LOS HOOKS) ====================
//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // ==================== RENDER ====================
//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>{MAIN_TITLE}</Typography>
//       <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>{DESCRIPTION}</Typography>

//       <Grid container spacing={4} alignItems="flex-start">

//         {/* ===================================================
//             COLUMNA IZQUIERDA: controles y tabla
//         ==================================================== */}
//         <Grid item xs={12} md={6}>

//           <Box display="flex" alignItems="center" mb={2}>
//             <RocketLaunch color="primary" sx={{ mr: 1 }} />
//             <Typography variant="h5">Automatic sweeping control (2-Axis)</Typography>
//           </Box>

//           {/* Control Azimuth (Pitch) */}
//           <DualAxisControl
//             axisName="Azimuth Control (Pitch)"
//             startValue={azimuthStart}
//             endValue={azimuthEnd}
//             setStart={setAzimuthStart}
//             setEnd={setAzimuthEnd}
//             disabled={barridoEnProgreso || !isHardwareReady}
//           />

//           {/* Control Zenith (Roll) */}
//           <DualAxisControl
//             axisName="Zenith Control (Roll)"
//             startValue={zenithStart}
//             endValue={zenithEnd}
//             setStart={setZenithStart}
//             setEnd={setZenithEnd}
//             disabled={barridoEnProgreso || !isHardwareReady}
//           />

//           {/* Botón de inicio */}
//           <Box mt={3} mb={2}>
//             <Button
//               variant="contained" color="primary" size="large" fullWidth
//               onClick={iniciarBarrido}
//               disabled={barridoEnProgreso || !isHardwareReady}
//               startIcon={
//                 !isHardwareReady || barridoEnProgreso
//                   ? <CircularProgress size={20} color="inherit" />
//                   : <PlayArrow />
//               }
//             >
//               {!isHardwareReady
//                 ? "Calibrating Panel..."
//                 : barridoEnProgreso
//                   ? `Scanning ${faseBarrido === "azimuth" ? "AZIMUTH" : "ZENITH"}... (${indexActual + 1}/${totalPuntos})`
//                   : (MOVE_BUTTON || "START DUAL AXIS SWEEP")}
//             </Button>
//           </Box>

//           {/* Barra de progreso en dos fases */}
//           {barridoEnProgreso && (
//             <Box sx={{ mb: 2 }}>
//               <Box sx={{ backgroundColor: "#eee", borderRadius: 1, height: 10, mb: 0.5 }}>
//                 <Box sx={{
//                   height: "100%", borderRadius: 1, backgroundColor: "#2196f3",
//                   width: progresoWidth, transition: "width 0.4s ease",
//                 }} />
//               </Box>
//               <Typography variant="caption" color="text.secondary">
//                 {puntoActual
//                   ? `Point ${indexActual + 1}/${totalPuntos} — Pitch: ${puntoActual.pitch}° | Roll: ${puntoActual.roll}°`
//                   : "Initializing..."}
//               </Typography>
//             </Box>
//           )}

//           {/* Header tabla con botón guardar */}
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, mb: 2 }}>
//             <Typography variant="h5">Measurements Table</Typography>
//             <Button
//               variant={hayDatosSinGuardar ? "contained" : "outlined"}
//               color="primary"
//               onClick={guardarBarrido}
//               disabled={datosTemporales.length === 0}
//               startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
//               size="medium"
//             >
//               {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
//             </Button>
//           </Box>

//           {/* Tabla */}
//           <Box mt={1}>
//             {datosTemporales.length > 0 ? (
//               <DataTable
//                 columns={SUBSYSTEM2_COLUMNS}
//                 data={datosTemporales.map((d) => ({
//                   [SUBSYSTEM2_COLUMNS[0]]: `${d.pitch ?? "-"}°`,
//                   [SUBSYSTEM2_COLUMNS[1]]: `${d.roll ?? "-"}°`,
//                   [SUBSYSTEM2_COLUMNS[2]]: d.voltage?.toFixed(2),
//                   [SUBSYSTEM2_COLUMNS[3]]: d.current?.toFixed(4),
//                   [SUBSYSTEM2_COLUMNS[4]]: ((d.voltage ?? 0) * (d.current ?? 0)).toFixed(4),
//                   ...(SUBSYSTEM2_COLUMNS[5] ? { [SUBSYSTEM2_COLUMNS[5]]: "0.75" } : {}),
//                 }))}
//                 onDelete={(index) => {
//                   const orig = datosTemporales[index];
//                   if (orig?.timestamp) handleDeleteMeasurement(orig.timestamp);
//                 }}
//                 maxHeight="550px"
//                 disableHorizontalScroll={true}
//               />
//             ) : (
//               <Paper sx={{ p: 2, textAlign: "center", color: "#666" }}>
//                 Waiting for sweep data...
//               </Paper>
//             )}
//           </Box>
//         </Grid>

//         {/* ===================================================
//             COLUMNA DERECHA: cámara y gráficos por eje
//         ==================================================== */}
//         <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>

//           {/* Cámara en vivo */}
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
//             <Paper className="paper-camera" sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
//               <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
//                 {CAMERA_TITLE}
//                 <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>
//                   ● En vivo
//                 </Typography>
//               </Typography>
//               <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
//                 <iframe
//                   width="100%" height="100%"
//                   src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                   title="Live Camera Exp2" frameBorder="0" allowFullScreen
//                 />
//               </Box>
//             </Paper>
//           </Box>

//           {/* Tabs de eje */}
//           <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", p: "6px", mb: 2, border: "1px solid #e0e0e0" }}>
//             <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" TabIndicatorProps={{ style: { display: "none" } }}>
//               <Tab label="Axis 1: Azimuth" sx={tabStyles} />
//               <Tab label="Axis 2: Zenith"  sx={tabStyles} />
//             </Tabs>
//           </Box>

//           {/* Gráfico Voltaje */}
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//             <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//               <GraphTitleWithTooltip
//                 title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
//                 description={GRAPH_DESCRIPTIONS?.VOLTAGE_VS_TIME || "Real-time voltage measurements."}
//               />
//               <Box mt={2}>
//                 <RealTimeChart
//                   chartId="chart-voltage-2"
//                   data={activeTab === 0 ? dataAxis1 : dataAxis2}
//                   customStartTime={globalStartTime}
//                   dataKey="voltage" color="#2196f3" yLabel="Voltage (V)" unit="V"
//                   angleKey={activeTab === 0 ? "pitch" : "roll"}
//                   angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
//                 />
//               </Box>
//             </Paper>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, mb: 3, position: "relative", top: 10 }}>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "chart_voltage", "Exp2", "csv", globalStartTime)}
//               startIcon={<Download fontSize="small" />}>CSV</Button>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => downloadChartAsImage("chart-voltage-2", "Voltage_Exp2")}
//               startIcon={<CropFree fontSize="small" />}>IMG</Button>
//           </Box>

//           {/* Gráfico Corriente */}
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
//             <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//               <GraphTitleWithTooltip
//                 title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
//                 description={GRAPH_DESCRIPTIONS?.CURRENT_VS_TIME || "Real-time current measurements."}
//               />
//               <Box mt={2}>
//                 <RealTimeChart
//                   chartId="chart-current-2"
//                   data={activeTab === 0 ? dataAxis1 : dataAxis2}
//                   customStartTime={globalStartTime}
//                   dataKey="current" color="#4caf50" yLabel="Current (A)" unit="A"
//                   angleKey={activeTab === 0 ? "pitch" : "roll"}
//                   angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
//                 />
//               </Box>
//             </Paper>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, position: "relative", top: 10 }}>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "chart_current", "Exp2", "csv", globalStartTime)}
//               startIcon={<Download fontSize="small" />}>CSV</Button>
//             <Button variant="outlined" size="small" color="primary"
//               onClick={() => downloadChartAsImage("chart-current-2", "Current_Exp2")}
//               startIcon={<CropFree fontSize="small" />}>IMG</Button>
//           </Box>

//           {/* Descarga total */}
//           <Box mt={5}>
//             <Button variant="contained" color="pink" fullWidth marginTop={2} startIcon={<SaveAlt />}
//               onClick={() => exportData(datosTemporales, "full_report_exp2", "Exp2", "csv")}>
//               {DOWNLOAD_GRAPHS_BUTTON}
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>

//       {/* Footer */}
//       <Box mt={6} mb={4} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//         <Button variant="outlined" color="secondary" onClick={handleBackSafe}>{BACK_BUTTON}</Button>
//       </Box>
//     </Box>
//   );
// };

// export default Subsistema2;






//version final
// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Grid from "@mui/material/Grid";
// import { useSelector } from "react-redux";

// import SliderComponent from "../../components/Elements/SliderComponent";
// import DataTable from "../../components/Elements/DataTable";
// import Button from "../../components/Elements/Button.jsx";
// import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
// import RealTimeChart from "../../components/Elements/RealTimeChart";

// import {
//   PlayArrow,
//   Save,
//   CloudDone,
//   Download,
//   CropFree,
//   SaveAlt,
//   RocketLaunch
// } from "@mui/icons-material";
// import CircularProgress from "@mui/material/CircularProgress";

// import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

// import {
//   SUBSYSTEM2_COLUMNS,
//   PAGE_TITLES,
//   GRAPH_DESCRIPTIONS,
// } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// import "../../assets/css/Elements/PaperStyles.css";

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

// const Subsistema2 = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);
//   const user = useSelector((state) => state.auth.user);

//   const UID_USUARIO = user?.uid || "invitado";
//   const BASE_PATH = `users/${UID_USUARIO}/Exp2`;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     MOVE_BUTTON,
//     DOWNLOAD_GRAPHS_BUTTON,
//     BACK_BUTTON,
//     CAMERA_TITLE,
//     VOLTAGE_VS_TIME_TITLE,
//     CURRENT_VS_TIME_TITLE,
//   } = PAGE_TITLES;

//   const [pitchInicial, setPitchInicial] = useState(0);
//   const [pitchFinal, setPitchFinal] = useState(15);
//   const [rollInicial, setRollInicial] = useState(0);
//   const [rollFinal, setRollFinal] = useState(15);

//   const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
//   const [puntosBarrido, setPuntosBarrido] = useState([]);
//   const [puntoActualIndex, setPuntoActualIndex] = useState(0);

//   const [sweepIdActual, setSweepIdActual] = useState(null);
//   const [datosTemporales, setDatosTemporales] = useState([]);
//   const [userSession, setUserSession] = useState(null);

//   const [isHardwareReady, setIsHardwareReady] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);
//   const [faseBarrido, setFaseBarrido] = useState("pitch");

//   const sweepIdActualRef = useRef(null);
//   const datosTemporalesRef = useRef([]);
//   const puntosBarridoRef = useRef([]);
//   const puntoActualIndexRef = useRef(0);
//   const faseBarridoRef = useRef("pitch");

//   // NUEVO: refs de control para evitar y->n->y en desarrollo
//   const shouldSendNOnUnmountRef = useRef(false);
//   const initKeyRef = useRef(`exp2_init_${UID_USUARIO}`);

//   useEffect(() => {
//     sweepIdActualRef.current = sweepIdActual;
//     datosTemporalesRef.current = datosTemporales;
//     puntosBarridoRef.current = puntosBarrido;
//     puntoActualIndexRef.current = puntoActualIndex;
//     faseBarridoRef.current = faseBarrido;
//   }, [sweepIdActual, datosTemporales, puntosBarrido, puntoActualIndex, faseBarrido]);

//   useEffect(() => {
//     const statusRef = ref(db, "estado_general/Exp2/hardwareStatus");
//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setIsHardwareReady(snapshot.val() === "READY");
//       }
//     });
//     return () => unsubscribe();
//   }, [db]);

//   useEffect(() => {
//     if (!user) return;

//     const sessionId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
//     setUserSession(sessionId);

//     const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
//     const initKey = initKeyRef.current;

//     onDisconnect(fbRef).set("n");

//     const inicializar = async () => {
//       try {
//         const yaInicializado = sessionStorage.getItem(initKey) === "1";

//         // Solo enviar 'y' una vez por sesión de esta pestaña
//         if (!yaInicializado) {
//           console.log("🟢 Exp2: enviando 'y' inicial único.");
//           await set(fbRef, "y");
//           sessionStorage.setItem(initKey, "1");
//         } else {
//           console.log("🟡 Exp2: 'y' inicial omitido para evitar duplicado.");
//         }

//         shouldSendNOnUnmountRef.current = true;

//         const currentSweepRef = ref(db, `${BASE_PATH}/currentSweepId`);
//         const snapshot = await get(currentSweepRef);
//         if (snapshot.exists()) {
//           setSweepIdActual(snapshot.val());
//           console.log("🆔 ID Exp2 recuperado:", snapshot.val());
//         }
//       } catch (err) {
//         console.error("Error en inicialización Exp2:", err);
//       }
//     };

//     inicializar();

//     return () => {
//       console.log("🧹 Desmontando Subsistema2...");
    
//       onDisconnect(fbRef).cancel().catch(() => {});
    
//       if (shouldSendNOnUnmountRef.current) {
//         set(fbRef, "n").catch(() => {});
//         sessionStorage.removeItem(initKey);
//       }
    
//       const datos = datosTemporalesRef.current || [];
//       const datosBasura = datos.filter((d) => d.isSaved === false);
//       const sweepId = sweepIdActualRef.current;
    
//       if (datosBasura.length > 0) {
//         console.log(`🗑️ Eliminando ${datosBasura.length} datos no guardados de Exp2...`);
    
//         const updates = {};
    
//         // borrar mediciones no guardadas
//         datosBasura.forEach((d) => {
//           updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
//         });
    
//         // opcional pero recomendado: borrar también el sweep si el usuario salió sin guardar
//         if (sweepId) {
//           updates[`${BASE_PATH}/sweeps/${sweepId}`] = null;
    
//           // si currentSweepId apunta a este sweep, también se limpia
//           updates[`${BASE_PATH}/currentSweepId`] = null;
//         }
    
//         update(ref(db), updates)
//           .then(() => {
//             console.log(`✅ Se eliminaron ${datosBasura.length} mediciones no guardadas de Exp2.`);
//             if (sweepId) {
//               console.log(`✅ También se eliminó el barrido temporal ${sweepId}.`);
//             }
//           })
//           .catch((e) => {
//             console.error("❌ Error eliminando datos temporales de Exp2:", e);
//           });
//       } else {
//         console.log("ℹ️ No había datos no guardados para eliminar en Exp2.");
//       }
//     };
//   }, [user, db, BASE_PATH, UID_USUARIO]);

//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const datosBasura = datosTemporales.some((d) => !d.isSaved);
//       if (datosBasura) {
//         console.log("⚠️ Intento de cierre/recarga con datos sin guardar.");
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [datosTemporales]);

//   const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

//   useEffect(() => {
//     window.datosEnPeligro = hayDatosSinGuardar;
//     return () => {
//       window.datosEnPeligro = false;
//     };
//   }, [hayDatosSinGuardar]);

//   useEffect(() => {
//     window.history.pushState(null, null, window.location.pathname);

//     const handlePopState = () => {
//       if (window.datosEnPeligro) {
//         const confirmar = window.confirm(
//           "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//         );
//         if (!confirmar) {
//           window.history.pushState(null, null, window.location.pathname);
//           return;
//         }
//       }

//       window.datosEnPeligro = false;
//       window.removeEventListener("popstate", handlePopState);

//       setTimeout(() => {
//         navigate("/experiments/experimentChooser", { replace: true });
//       }, 10);
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [navigate]);

//   const handleBackSafe = () => {
//     if (window.datosEnPeligro) {
//       const confirmar = window.confirm(
//         "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
//       );
//       if (!confirmar) return;
//     }
//     navigate("/experiments/experimentChooser");
//   };

//   useEffect(() => {
//     if (!sweepIdActual) return;

//     const dbRef = ref(db, `${BASE_PATH}/measurements`);

//     get(dbRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const rawData = snapshot.val();
//         const loadedData = Object.values(rawData).filter((d) => d.sweepId === sweepIdActual);

//         if (loadedData.length > 0) {
//           loadedData.sort((a, b) => a.timestamp - b.timestamp);
//           setDatosTemporales(loadedData);
//         }
//       }
//     });

//     const unsubscribe = onChildAdded(dbRef, (snapshot) => {
//       const newData = snapshot.val();
//       if (newData?.sweepId === sweepIdActual) {
//         setDatosTemporales((prev) => {
//           const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
//           return yaExiste ? prev : [...prev, newData];
//         });
//       }
//     });

//     return () => unsubscribe();
//   }, [sweepIdActual, db, BASE_PATH]);

//   const generarRango = (inicio, fin, paso = 5) => {
//     const valores = [];
//     if (inicio <= fin) {
//       for (let v = inicio; v <= fin; v += paso) valores.push(v);
//     } else {
//       for (let v = inicio; v >= fin; v -= paso) valores.push(v);
//     }
//     return valores;
//   };

//   const calcularSecuenciaBarridoL = (pIni, pFin, rIni, rFin, paso = 5) => {
//     const puntos = [];
//     const pitches = generarRango(pIni, pFin, paso);
//     const rolls = generarRango(rIni, rFin, paso);

//     pitches.forEach((pitch) => {
//       puntos.push({ pitch, roll: rIni, fase: "pitch" });
//     });
    
//     // rolls.forEach((roll, index) => {
//     //   if (index === 0) return;
//     //   puntos.push({ pitch: pFin, roll, fase: "roll" });
//     // });

//     // Segunda secuencia: cambia roll, pitch fijo
//     // Aquí YA NO omitimos el primer roll, para repetir la esquina
//     rolls.forEach((roll) => {
//       puntos.push({ pitch: pFin, roll, fase: "roll" });
//     });

//     return puntos;
//   };

//   const iniciarBarrido = async () => {
//     if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");

//     if (pitchInicial === pitchFinal && rollInicial === rollFinal) {
//       return alert("Debes variar al menos uno de los dos ejes.");
//     }

//     setDatosTemporales([]);
//     setActiveTab(0);
//     setFaseBarrido("pitch");
//     setBarridoEnProgreso(true);
//     setPuntoActualIndex(0);

//     const sweepId = `sweep2_${Date.now()}`;
//     setSweepIdActual(sweepId);

//     const puntos = calcularSecuenciaBarridoL(
//       pitchInicial,
//       pitchFinal,
//       rollInicial,
//       rollFinal,
//       5
//     );
//     setPuntosBarrido(puntos);

//     try {
//       await Promise.all([
//         set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//           pitchStart: pitchInicial,
//           pitchEnd: pitchFinal,
//           rollStart: rollInicial,
//           rollEnd: rollFinal,
//           step: 5,
//           totalPoints: puntos.length,
//           type: "L_sweep",
//           status: "in_progress",
//           fase: "pitch",
//           timestamp: Date.now(),
//           userSession,
//         }),
//         set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
//       ]);

//       console.log(`🚀 Barrido Exp2 iniciado: ${sweepId}`);
//       setTimeout(() => moverASiguientePunto(puntos[0], sweepId, 0), 1000);
//     } catch (error) {
//       console.error("Error iniciando barrido:", error);
//       setBarridoEnProgreso(false);
//     }
//   };

//   const moverASiguientePunto = async (punto, sweepId, index) => {
//     try {
//       const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

//       await set(fbRef, `p${punto.pitch}|r${punto.roll}`);

//       await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//         currentPointIndex: index,
//         currentPitch: punto.pitch,
//         currentRoll: punto.roll,
//         fase: punto.fase,
//         lastUpdated: Date.now(),
//       });

//       setFaseBarrido(punto.fase);
//       setActiveTab(punto.fase === "pitch" ? 0 : 1);
//     } catch (error) {
//       console.error("Error moviendo panel:", error);
//       setBarridoEnProgreso(false);
//     }
//   };

//   useEffect(() => {
//     const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);

//     const unsubscribe = onValue(dbRef, async (snapshot) => {
//       const msg = snapshot.val();
//       if (msg !== "EndMov") return;

//       const siguiente = puntoActualIndexRef.current + 1;
//       const puntos = puntosBarridoRef.current;
//       const sweepId = sweepIdActualRef.current;

//       if (!sweepId) return;

//       if (siguiente < puntos.length) {
//         setPuntoActualIndex(siguiente);
//         setTimeout(() => moverASiguientePunto(puntos[siguiente], sweepId, siguiente), 1500);
//       } else {
//         setBarridoEnProgreso(false);
//         setFaseBarrido("done");
//         await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
//           status: "completed",
//           fase: "done",
//           completedAt: Date.now(),
//         });
//         console.log("✅ Fin Barrido Exp2");
//       }
//     });

//     return () => unsubscribe();
//   }, [db, BASE_PATH]);

//   const guardarBarrido = async () => {
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
  
//       setDatosTemporales((prev) =>
//         prev.map((d) => ({ ...d, isSaved: true }))
//       );
  
//       console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp2 correctamente.`);
//       alert("✅ Datos guardados con éxito.");
//     } catch (error) {
//       console.error("❌ Error guardando datos de Exp2:", error);
//       alert("❌ Hubo un error al guardar los datos.");
//     }
//   };

//   const handleDeleteMeasurement = async (timestamp) => {
//     if (!timestamp) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
//     );
//     if (!confirmar) return;

//     try {
//       await set(ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`), null);
//       setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== timestamp));
//       console.log(`🗑️ Registro eliminado: ${timestamp}`);
//     } catch (error) {
//       console.error("Error eliminando registro:", error);
//       alert("Hubo un error al intentar eliminar el registro.");
//     }
//   };

//   const datosNormalizados = useMemo(() => {
//     return datosTemporales.map((d) => ({
//       ...d,
//       pitchAngle: d.pitchAngle ?? d.pitch ?? 0,
//       rollAngle: d.rollAngle ?? d.roll ?? 0,
//     }));
//   }, [datosTemporales]);

//   const dataAxis1 = useMemo(() => {
//     return datosNormalizados.filter((d) => d.rollAngle === rollInicial);
//   }, [datosNormalizados, rollInicial]);

//   const dataAxis2 = useMemo(() => {
//     return datosNormalizados.filter((d) => d.pitchAngle === pitchFinal);
//   }, [datosNormalizados, pitchFinal]);

//   const globalStartTime = datosNormalizados.length > 0 ? datosNormalizados[0].timestamp : 0;

//   useEffect(() => {
//     if (faseBarrido === "roll") {
//       setActiveTab(1);
//     } else if (faseBarrido === "pitch" && datosTemporales.length === 0) {
//       setActiveTab(0);
//     }
//   }, [faseBarrido, datosTemporales.length]);

//   const tabStyles = {
//     textTransform: "none",
//     fontWeight: 600,
//     fontSize: "1rem",
//     borderRadius: "8px",
//     margin: "0 4px",
//     transition: "all 0.3s ease",
//     "&.Mui-selected": {
//       backgroundColor: "#e3f2fd",
//       color: "#1565c0",
//       boxShadow: "0 2px 4px rgba(25, 118, 210, 0.15)"
//     },
//     "&:hover": {
//       backgroundColor: "#f5f5f5"
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
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
//       <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Grid container spacing={4} alignItems="flex-start">
//         <Grid item xs={12} md={6}>
//           <Box display="flex" alignItems="center" mb={2}>
//             <RocketLaunch color="primary" sx={{ mr: 1 }} />
//             <Typography variant="h5">Automatic sweeping control (2-Axis)</Typography>
//           </Box>

//           <Box
//             sx={{
//               "& .MuiSlider-root.Mui-disabled": {
//                 color: "#9e9e9e",
//                 "& .MuiSlider-thumb": {
//                   backgroundColor: "#f5f5f5",
//                   borderColor: "#9e9e9e",
//                 },
//                 "& .MuiSlider-track": {
//                   backgroundColor: "#9e9e9e",
//                   borderColor: "#9e9e9e",
//                 },
//                 "& .MuiSlider-rail": {
//                   backgroundColor: "#e0e0e0",
//                 },
//                 "& .MuiSlider-mark": {
//                   backgroundColor: "#9e9e9e",
//                 },
//                 "& .MuiSlider-markLabel": {
//                   color: "#9e9e9e",
//                 }
//               }
//             }}
//           >
//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Azimuth Axis
//             </Typography>

//             <SliderComponent
//               value={pitchInicial}
//               label="Initial Azimuth"
//               min={-30}
//               max={30}
//               step={5}
//               actualAngle={pitchInicial}
//               onChange={(e, v) => setPitchInicial(v)}
//               disabled={barridoEnProgreso || !isHardwareReady}
//             />

//             <Box mt={2}>
//               <SliderComponent
//                 value={pitchFinal}
//                 label="Final Azimuth"
//                 min={-30}
//                 max={30}
//                 step={5}
//                 actualAngle={pitchFinal}
//                 onChange={(e, v) => setPitchFinal(v)}
//                 disabled={barridoEnProgreso || !isHardwareReady}
//               />
//             </Box>

//             <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
//               Zenith Axis
//             </Typography>

//             <SliderComponent
//               value={rollInicial}
//               label="Initial Zenith"
//               min={-30}
//               max={30}
//               step={5}
//               actualAngle={rollInicial}
//               onChange={(e, v) => setRollInicial(v)}
//               disabled={barridoEnProgreso || !isHardwareReady}
//             />

//             <Box mt={2}>
//               <SliderComponent
//                 value={rollFinal}
//                 label="Final Zenith"
//                 min={-30}
//                 max={30}
//                 step={5}
//                 actualAngle={rollFinal}
//                 onChange={(e, v) => setRollFinal(v)}
//                 disabled={barridoEnProgreso || !isHardwareReady}
//               />
//             </Box>
//           </Box>

//           <Box mt={3} mb={2}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="large"
//               fullWidth
//               onClick={iniciarBarrido}
//               disabled={barridoEnProgreso || !isHardwareReady}
//               startIcon={
//                 !isHardwareReady ? (
//                   <CircularProgress size={20} color="inherit" />
//                 ) : barridoEnProgreso ? (
//                   <CircularProgress size={20} color="inherit" />
//                 ) : (
//                   <PlayArrow />
//                 )
//               }
//             >
//               {!isHardwareReady
//                 ? "Calibrating Panel..."
//                 : barridoEnProgreso
//                 ? `Scanning ${faseBarrido.toUpperCase()}...`
//                 : MOVE_BUTTON}
//             </Button>
//           </Box>

//           {barridoEnProgreso && puntosBarrido.length > 0 && (
//             <Box sx={{ mb: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
//               <Box
//                 sx={{
//                   height: "100%",
//                   borderRadius: 1,
//                   backgroundColor: "#2196f3",
//                   width: `${((puntoActualIndex + 1) / puntosBarrido.length) * 100}%`,
//                   transition: "width 0.3s",
//                 }}
//               />
//             </Box>
//           )}

//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//             <Typography variant="h5">Measurements Table</Typography>
//             <Button
//               variant={hayDatosSinGuardar ? "contained" : "outlined"}
//               color="primary"
//               onClick={guardarBarrido}
//               disabled={datosTemporales.length === 0}
//               startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
//               size="medium"
//             >
//               {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
//             </Button>
//           </Box>

//           <Box mt={3}>
//             {datosTemporales.length > 0 ? (
//               <DataTable
//                 columns={SUBSYSTEM2_COLUMNS}
//                 data={datosNormalizados.map((d) => {
//                   const voltage = Number(d.voltage ?? 0);
//                   const current = Number(d.current ?? 0);
              
//                   // Igual que en Subsistema1: valores numéricos simulados para la vista
//                   const efficiency = (15 + Math.random() * 7).toFixed(2);
//                   const fillFactor = (0.70 + Math.random() * 0.15).toFixed(2);
              
//                   return {
//                     [SUBSYSTEM2_COLUMNS[0]]: `${d.pitchAngle}°`,
//                     [SUBSYSTEM2_COLUMNS[1]]: `${d.rollAngle}°`,
//                     [SUBSYSTEM2_COLUMNS[2]]: voltage.toFixed(2),
//                     [SUBSYSTEM2_COLUMNS[3]]: current.toFixed(2),
//                     [SUBSYSTEM2_COLUMNS[4]]: efficiency,
//                     [SUBSYSTEM2_COLUMNS[5]]: fillFactor,
//                   };
//                 })}
//                 onDelete={(index) => {
//                   const datoOriginal = datosTemporales[index];
//                   if (datoOriginal?.timestamp) {
//                     handleDeleteMeasurement(datoOriginal.timestamp);
//                   }
//                 }}
//                 maxHeight="550px"
//                 disableHorizontalScroll={true}
//               />
//             ) : (
//               <Paper sx={{ p: 2, textAlign: "center", color: "#666" }}>
//                 Waiting for sweep data...
//               </Paper>
//             )}
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
//             <Paper
//               className="paper-camera"
//               sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}
//             >
//               <Typography
//                 variant="h5"
//                 gutterBottom
//                 sx={{ fontWeight: "bold", display: "flex", alignItems: "center", fontFamily: '"Poppins", sans-serif' }}
//               >
//                 {CAMERA_TITLE}
//                 <Typography
//                   component="span"
//                   variant="caption"
//                   sx={{ color: "#e53935", fontWeight: "bold", ml: 1, fontFamily: '"Poppins", sans-serif' }}
//                 >
//                   ● En vivo
//                 </Typography>
//               </Typography>
//               <Box
//                 sx={{
//                   width: "100%",
//                   height: "300px",
//                   mt: 1,
//                   borderRadius: "8px",
//                   overflow: "hidden",
//                   backgroundColor: "#000"
//                 }}
//               >
//                 <iframe
//                   width="100%"
//                   height="100%"
//                   src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
//                   title="Cam"
//                   frameBorder="0"
//                   allowFullScreen
//                 />
//               </Box>
//             </Paper>
//           </Box>

//           <Box
//             sx={{
//               backgroundColor: "#fff",
//               borderRadius: "12px",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//               p: "6px",
//               mb: 2,
//               border: "1px solid #e0e0e0"
//             }}
//           >
//             <Tabs
//               value={activeTab}
//               onChange={(e, v) => setActiveTab(v)}
//               variant="fullWidth"
//               TabIndicatorProps={{ style: { display: "none" } }}
//             >
//               <Tab label="Axis 1: Azimuth" sx={tabStyles} />
//               <Tab label="Axis 2: Zenith" sx={tabStyles} />
//             </Tabs>
//           </Box>

//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//             <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//               <GraphTitleWithTooltip
//                 title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
//                 description={GRAPH_DESCRIPTIONS?.VOLTAGE_VS_TIME || "Real-time voltage measurements."}
//               />
//               <Box mt={2}>
//                 <RealTimeChart
//                   chartId="chart-voltage-2"
//                   data={activeTab === 0 ? dataAxis1 : dataAxis2}
//                   customStartTime={globalStartTime}
//                   dataKey="voltage"
//                   color="#2196f3"
//                   yLabel="Voltage (V)"
//                   unit="V"
//                   angleKey={activeTab === 0 ? "pitchAngle" : "rollAngle"}
//                   angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
//                 />
//               </Box>
//             </Paper>
//           </Box>

//           <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, mb: 3, position: "relative", top: 10 }}>
//             <Button
//               variant="outlined"
//               size="small"
//               color="primary"
//               onClick={() =>
//                 exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "volt", "Exp2", "csv", globalStartTime)
//               }
//               startIcon={<Download fontSize="small" />}
//             >
//               CSV
//             </Button>
//             <Button
//               variant="outlined"
//               size="small"
//               color="primary"
//               onClick={() => downloadChartAsImage("chart-voltage-2", "Volt")}
//               startIcon={<CropFree fontSize="small" />}
//             >
//               IMG
//             </Button>
//           </Box>

//           <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
//             <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
//               <GraphTitleWithTooltip
//                 title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
//                 description={GRAPH_DESCRIPTIONS?.CURRENT_VS_TIME || "Real-time current measurements."}
//               />
//               <Box mt={2}>
//                 <RealTimeChart
//                   chartId="chart-current-2"
//                   data={activeTab === 0 ? dataAxis1 : dataAxis2}
//                   customStartTime={globalStartTime}
//                   dataKey="current"
//                   color="#4caf50"
//                   yLabel="Current (A)"
//                   unit="A"
//                   angleKey={activeTab === 0 ? "pitchAngle" : "rollAngle"}
//                   angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
//                 />
//               </Box>
//             </Paper>
//           </Box>

//           <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, position: "relative", top: 10 }}>
//             <Button
//               variant="outlined"
//               size="small"
//               color="primary"
//               onClick={() =>
//                 exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "curr", "Exp2", "csv", globalStartTime)
//               }
//               startIcon={<Download fontSize="small" />}
//             >
//               CSV
//             </Button>
//             <Button
//               variant="outlined"
//               size="small"
//               color="primary"
//               onClick={() => downloadChartAsImage("chart-current-2", "Curr")}
//               startIcon={<CropFree fontSize="small" />}
//             >
//               IMG
//             </Button>
//           </Box>

//           <Box mt={5}>
//             <Button
//               variant="contained"
//               color="pink"
//               onClick={() => exportData(datosNormalizados, "full_report_exp2", "Exp2", "csv")}
//               fullWidth
//               marginTop={2}
//               startIcon={<SaveAlt />}
//             >
//               {DOWNLOAD_GRAPHS_BUTTON}
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>

//       <Box mt={6} mb={4} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
//         <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
//           {BACK_BUTTON}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Subsistema2;



import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { useSelector } from "react-redux";

// import SliderComponent from "../../components/Elements/SliderComponent";
import DualAxisControl from "../../components/Elements/DualAxisControl";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import RealTimeChart from "../../components/Elements/RealTimeChart";

import {
  PlayArrow,
  Save,
  CloudDone,
  Download,
  CropFree,
  SaveAlt,
  RocketLaunch
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

import {
  SUBSYSTEM2_COLUMNS,
  PAGE_TITLES,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

import "../../assets/css/Elements/PaperStyles.css";

import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  get,
  onDisconnect,
} from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema2 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const user = useSelector((state) => state.auth.user);

  const UID_USUARIO = user?.uid || "invitado";
  const BASE_PATH = `users/${UID_USUARIO}/Exp2`;

  const {
    MAIN_TITLE,
    DESCRIPTION,
    MOVE_BUTTON,
    DOWNLOAD_GRAPHS_BUTTON,
    BACK_BUTTON,
    CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE,
  } = PAGE_TITLES;

  const [pitchInicial, setPitchInicial] = useState(0);
  const [pitchFinal, setPitchFinal] = useState(15);
  const [rollInicial, setRollInicial] = useState(0);
  const [rollFinal, setRollFinal] = useState(15);

  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [puntosBarrido, setPuntosBarrido] = useState([]);
  const [puntoActualIndex, setPuntoActualIndex] = useState(0);

  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  const [isHardwareReady, setIsHardwareReady] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [faseBarrido, setFaseBarrido] = useState("pitch");

  const sweepIdActualRef = useRef(null);
  const datosTemporalesRef = useRef([]);
  const puntosBarridoRef = useRef([]);
  const puntoActualIndexRef = useRef(0);
  const faseBarridoRef = useRef("pitch");

  // NUEVO: refs de control para evitar y->n->y en desarrollo
  const shouldSendNOnUnmountRef = useRef(false);
  const initKeyRef = useRef(`exp2_init_${UID_USUARIO}`);

  useEffect(() => {
    sweepIdActualRef.current = sweepIdActual;
    datosTemporalesRef.current = datosTemporales;
    puntosBarridoRef.current = puntosBarrido;
    puntoActualIndexRef.current = puntoActualIndex;
    faseBarridoRef.current = faseBarrido;
  }, [sweepIdActual, datosTemporales, puntosBarrido, puntoActualIndex, faseBarrido]);

  useEffect(() => {
    const statusRef = ref(db, "estado_general/Exp2/hardwareStatus");
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsHardwareReady(snapshot.val() === "READY");
      }
    });
    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!user) return;

    const sessionId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    setUserSession(sessionId);

    const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
    const initKey = initKeyRef.current;

    onDisconnect(fbRef).set("n");

    const inicializar = async () => {
      try {
        const yaInicializado = sessionStorage.getItem(initKey) === "1";

        // Solo enviar 'y' una vez por sesión de esta pestaña
        if (!yaInicializado) {
          console.log("🟢 Exp2: enviando 'y' inicial único.");
          await set(fbRef, "y");
          sessionStorage.setItem(initKey, "1");
        } else {
          console.log("🟡 Exp2: 'y' inicial omitido para evitar duplicado.");
        }

        shouldSendNOnUnmountRef.current = true;

        const currentSweepRef = ref(db, `${BASE_PATH}/currentSweepId`);
        const snapshot = await get(currentSweepRef);
        if (snapshot.exists()) {
          setSweepIdActual(snapshot.val());
          console.log("🆔 ID Exp2 recuperado:", snapshot.val());
        }
      } catch (err) {
        console.error("Error en inicialización Exp2:", err);
      }
    };

    inicializar();

    return () => {
      console.log("🧹 Desmontando Subsistema2...");
    
      onDisconnect(fbRef).cancel().catch(() => {});
    
      if (shouldSendNOnUnmountRef.current) {
        set(fbRef, "n").catch(() => {});
        sessionStorage.removeItem(initKey);
      }
    
      const datos = datosTemporalesRef.current || [];
      const datosBasura = datos.filter((d) => d.isSaved === false);
      const sweepId = sweepIdActualRef.current;
    
      if (datosBasura.length > 0) {
        console.log(`🗑️ Eliminando ${datosBasura.length} datos no guardados de Exp2...`);
    
        const updates = {};
    
        // borrar mediciones no guardadas
        datosBasura.forEach((d) => {
          updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
        });
    
        // opcional pero recomendado: borrar también el sweep si el usuario salió sin guardar
        if (sweepId) {
          updates[`${BASE_PATH}/sweeps/${sweepId}`] = null;
    
          // si currentSweepId apunta a este sweep, también se limpia
          updates[`${BASE_PATH}/currentSweepId`] = null;
        }
    
        update(ref(db), updates)
          .then(() => {
            console.log(`✅ Se eliminaron ${datosBasura.length} mediciones no guardadas de Exp2.`);
            if (sweepId) {
              console.log(`✅ También se eliminó el barrido temporal ${sweepId}.`);
            }
          })
          .catch((e) => {
            console.error("❌ Error eliminando datos temporales de Exp2:", e);
          });
      } else {
        console.log("ℹ️ No había datos no guardados para eliminar en Exp2.");
      }
    };
  }, [user, db, BASE_PATH, UID_USUARIO]);

  // // ozzyjames11: asdf
  // // useEffect(() => {
  // //   const handleBeforeUnload = (e) => {
  // //     const datosBasura = datosTemporales.some((d) => !d.isSaved);
  // //     if (datosBasura) {
  // //       console.log("⚠️ Intento de cierre/recarga con datos sin guardar.");
  // //       e.preventDefault();
  // //       e.returnValue = "";
  // //     }
  // //   };

  // //   window.addEventListener("beforeunload", handleBeforeUnload);
  // //   return () => {
  // //     window.removeEventListener("beforeunload", handleBeforeUnload);
  // //   };
  // // }, [datosTemporales]);
  // // ==================== PROTECCIÓN F5 / CERRAR PESTAÑA ====================
  // useEffect(() => {
  //   const handleBeforeUnload = (e) => {
  //     // Si el barrido está corriendo o hay datos sin guardar, activamos la alerta del navegador
  //     if (barridoEnProgreso || hayDatosSinGuardar) {
  //       e.preventDefault();
  //       e.returnValue = ""; 
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [hayDatosSinGuardar, barridoEnProgreso]);


  // // ozzyjames11: asdf 
  // // const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

  // // useEffect(() => {
  // //   window.datosEnPeligro = hayDatosSinGuardar;
  // //   return () => {
  // //     window.datosEnPeligro = false;
  // //   };
  // // }, [hayDatosSinGuardar]);
  // // ==================== VARIABLES GLOBALES PARA EL HEADER ====================
  // const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

  // useEffect(() => {
  //   window.barridoEnProgreso = barridoEnProgreso;
  //   window.datosEnPeligro = hayDatosSinGuardar;
    
  //   return () => {
  //     window.barridoEnProgreso = false;
  //     window.datosEnPeligro = false;
  //   };
  // }, [barridoEnProgreso, hayDatosSinGuardar]);


  // // ozzyjames11: asdf
  // // useEffect(() => {
  // //   window.history.pushState(null, null, window.location.pathname);

  // //   const handlePopState = () => {
  // //     if (window.datosEnPeligro) {
  // //       const confirmar = window.confirm(
  // //         "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
  // //       );
  // //       if (!confirmar) {
  // //         window.history.pushState(null, null, window.location.pathname);
  // //         return;
  // //       }
  // //     }

  // //     window.datosEnPeligro = false;
  // //     window.removeEventListener("popstate", handlePopState);

  // //     setTimeout(() => {
  // //       navigate("/experiments/experimentChooser", { replace: true });
  // //     }, 10);
  // //   };

  // //   window.addEventListener("popstate", handlePopState);
  // //   return () => {
  // //     window.removeEventListener("popstate", handlePopState);
  // //   };
  // // }, [navigate]);
  // // ==================== TRAMPA PARA LA FLECHA DE ATRÁS DEL NAVEGADOR ====================
  // useEffect(() => {
  //   window.history.pushState(null, null, window.location.pathname);

  //   const handlePopState = () => {
  //     // 🛑 PRIORIDAD 1: BARRIDO EN PROGRESO (Bloqueo Total)
  //     if (window.barridoEnProgreso) {
  //       window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the sweeping is finished before leaving the page.");
  //       window.history.pushState(null, null, window.location.pathname); // Restaura la trampa
  //       return;
  //     }

  //     // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR (Pregunta)
  //     if (window.datosEnPeligro) {
  //       const confirmar = window.confirm(
  //         "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
  //       );
  //       if (!confirmar) {
  //         window.history.pushState(null, null, window.location.pathname);
  //         return;
  //       }
  //     }

  //     // Si todo está bien o aceptó salir:
  //     window.datosEnPeligro = false;
  //     window.removeEventListener("popstate", handlePopState);

  //     setTimeout(() => {
  //       navigate("/experiments/experimentChooser", { replace: true });
  //     }, 10);
  //   };

  //   window.addEventListener("popstate", handlePopState);
  //   return () => {
  //     window.removeEventListener("popstate", handlePopState);
  //   };
  // }, [navigate]);


  // // ozzyjames11: asdf
  // // const handleBackSafe = () => {
  // //   if (window.datosEnPeligro) {
  // //     const confirmar = window.confirm(
  // //       "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
  // //     );
  // //     if (!confirmar) return;
  // //   }
  // //   navigate("/experiments/experimentChooser");
  // // };
  // // ==================== BOTÓN GO BACK ====================
  // const handleBackSafe = () => {
  //   // 🛑 PRIORIDAD 1: BARRIDO EN PROGRESO (Bloqueo Total)
  //   if (window.barridoEnProgreso) {
  //     window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the sweeping is finished before leaving the page.");
  //     return;
  //   }

  //   // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR (Pregunta)
  //   if (window.datosEnPeligro) {
  //     const confirmar = window.confirm(
  //       "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
  //     );
  //     if (!confirmar) return; 
  //   }
    
  //   navigate("/experiments/experimentChooser");
  // };
  // ==================== 1. VARIABLES GLOBALES PARA EL HEADER ====================
  // (Esto DEBE ir primero para que los useEffect de abajo no exploten)
  const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

  useEffect(() => {
    window.barridoEnProgreso = barridoEnProgreso;
    window.datosEnPeligro = hayDatosSinGuardar;
    
    return () => {
      window.barridoEnProgreso = false;
      window.datosEnPeligro = false;
    };
  }, [barridoEnProgreso, hayDatosSinGuardar]);

  // ==================== 2. PROTECCIÓN F5 / CERRAR PESTAÑA ====================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Si el barrido está corriendo o hay datos sin guardar, activamos la alerta del navegador
      if (barridoEnProgreso || hayDatosSinGuardar) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hayDatosSinGuardar, barridoEnProgreso]);

  // ==================== 3. TRAMPA PARA LA FLECHA DE ATRÁS DEL NAVEGADOR ====================
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = () => {
      // 🛑 PRIORIDAD 1: BARRIDO EN PROGRESO (Bloqueo Total)
      if (window.barridoEnProgreso) {
        window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the sweeping is finished before leaving the page.");
        window.history.pushState(null, null, window.location.pathname); // Restaura la trampa
        return;
      }

      // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR (Pregunta)
      if (window.datosEnPeligro) {
        const confirmar = window.confirm(
          "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
        );
        if (!confirmar) {
          window.history.pushState(null, null, window.location.pathname);
          return;
        }
      }

      // Si todo está bien o aceptó salir:
      window.datosEnPeligro = false;
      window.removeEventListener("popstate", handlePopState);

      setTimeout(() => {
        navigate("/experiments/experimentChooser", { replace: true });
      }, 10);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // ==================== 4. BOTÓN GO BACK ====================
  const handleBackSafe = () => {
    // 🛑 PRIORIDAD 1: BARRIDO EN PROGRESO (Bloqueo Total)
    if (window.barridoEnProgreso) {
      window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the sweeping is finished before leaving the page.");
      return;
    }

    // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR (Pregunta)
    if (window.datosEnPeligro) {
      const confirmar = window.confirm(
        "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
      );
      if (!confirmar) return; 
    }
    
    navigate("/experiments/experimentChooser");
  };



  useEffect(() => {
    if (!sweepIdActual) return;

    const dbRef = ref(db, `${BASE_PATH}/measurements`);

    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const loadedData = Object.values(rawData).filter((d) => d.sweepId === sweepIdActual);

        if (loadedData.length > 0) {
          loadedData.sort((a, b) => a.timestamp - b.timestamp);
          setDatosTemporales(loadedData);
        }
      }
    });

    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const newData = snapshot.val();
      if (newData?.sweepId === sweepIdActual) {
        setDatosTemporales((prev) => {
          const yaExiste = prev.some((d) => d.timestamp === newData.timestamp);
          return yaExiste ? prev : [...prev, newData];
        });
      }
    });

    return () => unsubscribe();
  }, [sweepIdActual, db, BASE_PATH]);

  const generarRango = (inicio, fin, paso = 5) => {
    const valores = [];
    if (inicio <= fin) {
      for (let v = inicio; v <= fin; v += paso) valores.push(v);
    } else {
      for (let v = inicio; v >= fin; v -= paso) valores.push(v);
    }
    return valores;
  };

  const calcularSecuenciaBarridoL = (pIni, pFin, rIni, rFin, paso = 5) => {
    const puntos = [];
    const pitches = generarRango(pIni, pFin, paso);
    const rolls = generarRango(rIni, rFin, paso);

    pitches.forEach((pitch) => {
      puntos.push({ pitch, roll: rIni, fase: "pitch" });
    });
    
    // rolls.forEach((roll, index) => {
    //   if (index === 0) return;
    //   puntos.push({ pitch: pFin, roll, fase: "roll" });
    // });

    // Segunda secuencia: cambia roll, pitch fijo
    // Aquí YA NO omitimos el primer roll, para repetir la esquina
    rolls.forEach((roll) => {
      puntos.push({ pitch: pFin, roll, fase: "roll" });
    });

    return puntos;
  };

  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");

    if (pitchInicial === pitchFinal && rollInicial === rollFinal) {
      return alert("Debes variar al menos uno de los dos ejes.");
    }

    setDatosTemporales([]);
    setActiveTab(0);
    setFaseBarrido("pitch");
    setBarridoEnProgreso(true);
    setPuntoActualIndex(0);

    const sweepId = `sweep2_${Date.now()}`;
    setSweepIdActual(sweepId);

    const puntos = calcularSecuenciaBarridoL(
      pitchInicial,
      pitchFinal,
      rollInicial,
      rollFinal,
      5
    );
    setPuntosBarrido(puntos);

    try {
      await Promise.all([
        set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
          pitchStart: pitchInicial,
          pitchEnd: pitchFinal,
          rollStart: rollInicial,
          rollEnd: rollFinal,
          step: 5,
          totalPoints: puntos.length,
          type: "L_sweep",
          status: "in_progress",
          fase: "pitch",
          timestamp: Date.now(),
          userSession,
        }),
        set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
      ]);

      console.log(`🚀 Barrido Exp2 iniciado: ${sweepId}`);
      setTimeout(() => moverASiguientePunto(puntos[0], sweepId, 0), 1000);
    } catch (error) {
      console.error("Error iniciando barrido:", error);
      setBarridoEnProgreso(false);
    }
  };

  const moverASiguientePunto = async (punto, sweepId, index) => {
    try {
      const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

      await set(fbRef, `p${punto.pitch}|r${punto.roll}`);

      await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
        currentPointIndex: index,
        currentPitch: punto.pitch,
        currentRoll: punto.roll,
        fase: punto.fase,
        lastUpdated: Date.now(),
      });

      setFaseBarrido(punto.fase);
      setActiveTab(punto.fase === "pitch" ? 0 : 1);
    } catch (error) {
      console.error("Error moviendo panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  useEffect(() => {
    const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);

    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (msg !== "EndMov") return;

      const siguiente = puntoActualIndexRef.current + 1;
      const puntos = puntosBarridoRef.current;
      const sweepId = sweepIdActualRef.current;

      if (!sweepId) return;

      if (siguiente < puntos.length) {
        setPuntoActualIndex(siguiente);
        setTimeout(() => moverASiguientePunto(puntos[siguiente], sweepId, siguiente), 1500);
      } else {
        setBarridoEnProgreso(false);
        setFaseBarrido("done");
        await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
          status: "completed",
          fase: "done",
          completedAt: Date.now(),
        });
        console.log("✅ Fin Barrido Exp2");
      }
    });

    return () => unsubscribe();
  }, [db, BASE_PATH]);

  const guardarBarrido = async () => {
    const unsaved = datosTemporales.filter((d) => !d.isSaved);
    if (unsaved.length === 0) {
      alert("No hay nuevos datos para guardar.");
      return;
    }
  
    if (!window.confirm(`¿Guardar ${unsaved.length} mediciones permanentemente?`)) return;
  
    try {
      const updates = {};
      unsaved.forEach((d) => {
        updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
  
      await update(ref(db), updates);
  
      setDatosTemporales((prev) =>
        prev.map((d) => ({ ...d, isSaved: true }))
      );
  
      console.log(`✅ Se guardaron ${unsaved.length} mediciones de Exp2 correctamente.`);
      alert("✅ Datos guardados con éxito.");
    } catch (error) {
      console.error("❌ Error guardando datos de Exp2:", error);
      alert("❌ Hubo un error al guardar los datos.");
    }
  };

  const handleDeleteMeasurement = async (timestamp) => {
    if (!timestamp) return;

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este registro permanentemente de la base de datos?"
    );
    if (!confirmar) return;

    try {
      await set(ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`), null);
      setDatosTemporales((prev) => prev.filter((d) => d.timestamp !== timestamp));
      console.log(`🗑️ Registro eliminado: ${timestamp}`);
    } catch (error) {
      console.error("Error eliminando registro:", error);
      alert("Hubo un error al intentar eliminar el registro.");
    }
  };

  const datosNormalizados = useMemo(() => {
    return datosTemporales.map((d) => ({
      ...d,
      pitchAngle: d.pitchAngle ?? d.pitch ?? 0,
      rollAngle: d.rollAngle ?? d.roll ?? 0,
    }));
  }, [datosTemporales]);

  const dataAxis1 = useMemo(() => {
    return datosNormalizados.filter((d) => d.rollAngle === rollInicial);
  }, [datosNormalizados, rollInicial]);

  const dataAxis2 = useMemo(() => {
    return datosNormalizados.filter((d) => d.pitchAngle === pitchFinal);
  }, [datosNormalizados, pitchFinal]);

  const globalStartTime = datosNormalizados.length > 0 ? datosNormalizados[0].timestamp : 0;

  useEffect(() => {
    if (faseBarrido === "roll") {
      setActiveTab(1);
    } else if (faseBarrido === "pitch" && datosTemporales.length === 0) {
      setActiveTab(0);
    }
  }, [faseBarrido, datosTemporales.length]);

  const tabStyles = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "1rem",
    borderRadius: "8px",
    margin: "0 4px",
    transition: "all 0.3s ease",
    "&.Mui-selected": {
      backgroundColor: "#e3f2fd",
      color: "#1565c0",
      boxShadow: "0 2px 4px rgba(25, 118, 210, 0.15)"
    },
    "&:hover": {
      backgroundColor: "#f5f5f5"
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={2}>
            {/* <RocketLaunch color="primary" sx={{ mr: 1 }} /> */}
            <Typography variant="h5">Automatic sweeping control (2-Axis)</Typography>
          </Box>

          {/* <Box
            sx={{
              "& .MuiSlider-root.Mui-disabled": {
                color: "#9e9e9e",
                "& .MuiSlider-thumb": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#9e9e9e",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#9e9e9e",
                  borderColor: "#9e9e9e",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "#e0e0e0",
                },
                "& .MuiSlider-mark": {
                  backgroundColor: "#9e9e9e",
                },
                "& .MuiSlider-markLabel": {
                  color: "#9e9e9e",
                }
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Azimuth Axis
            </Typography>

            <SliderComponent
              value={pitchInicial}
              label="Initial Azimuth"
              min={-30}
              max={30}
              step={5}
              actualAngle={pitchInicial}
              onChange={(e, v) => setPitchInicial(v)}
              disabled={barridoEnProgreso || !isHardwareReady}
            />

            <Box mt={2}>
              <SliderComponent
                value={pitchFinal}
                label="Final Azimuth"
                min={-30}
                max={30}
                step={5}
                actualAngle={pitchFinal}
                onChange={(e, v) => setPitchFinal(v)}
                disabled={barridoEnProgreso || !isHardwareReady}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Zenith Axis
            </Typography>

            <SliderComponent
              value={rollInicial}
              label="Initial Zenith"
              min={-30}
              max={30}
              step={5}
              actualAngle={rollInicial}
              onChange={(e, v) => setRollInicial(v)}
              disabled={barridoEnProgreso || !isHardwareReady}
            />

            <Box mt={2}>
              <SliderComponent
                value={rollFinal}
                label="Final Zenith"
                min={-30}
                max={30}
                step={5}
                actualAngle={rollFinal}
                onChange={(e, v) => setRollFinal(v)}
                disabled={barridoEnProgreso || !isHardwareReady}
              />
            </Box>
          </Box> */}
          <Box sx={{ mt: 2 }}>
            <DualAxisControl
              axisName="Azimuth Axis"
              startValue={pitchInicial}
              endValue={pitchFinal}
              setStart={setPitchInicial}
              setEnd={setPitchFinal}
              min={-30}
              max={30}
              disabled={barridoEnProgreso || !isHardwareReady}
            />

            <DualAxisControl
              axisName="Zenith Axis"
              startValue={rollInicial}
              endValue={rollFinal}
              setStart={setRollInicial}
              setEnd={setRollFinal}
              min={-30}
              max={30}
              disabled={barridoEnProgreso || !isHardwareReady}
            />
          </Box>

          <Box mt={3} mb={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={iniciarBarrido}
              disabled={barridoEnProgreso || !isHardwareReady}
              startIcon={
                !isHardwareReady ? (
                  <CircularProgress size={20} color="inherit" />
                ) : barridoEnProgreso ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PlayArrow />
                )
              }
            >
              {!isHardwareReady
                ? "Calibrating Panel..."
                : barridoEnProgreso
                ? `Scanning ${faseBarrido.toUpperCase()}...`
                : MOVE_BUTTON}
            </Button>
          </Box>

          {barridoEnProgreso && puntosBarrido.length > 0 && (
            <Box sx={{ mb: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width: `${((puntoActualIndex + 1) / puntosBarrido.length) * 100}%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">Measurements Table</Typography>
            <Button
              variant={hayDatosSinGuardar ? "contained" : "outlined"}
              color="primary"
              onClick={guardarBarrido}
              disabled={datosTemporales.length === 0}
              startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
              size="medium"
            >
              {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
            </Button>
          </Box>

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSYSTEM2_COLUMNS}
                data={datosNormalizados.map((d) => {
                  const voltage = Number(d.voltage ?? 0);
                  const current = Number(d.current ?? 0);

                  // Leemos los valores reales guardados por el backend
                  // Multiplicamos efficiency por 100 para mostrarlo como porcentaje
                  const efficiency = d.efficiency !== undefined ? (d.efficiency * 100).toFixed(2) : "0.00%";
                  const fillFactor = d.fillFactor !== undefined ? d.fillFactor.toFixed(4) : "0.0000";
              
                  return {
                    [SUBSYSTEM2_COLUMNS[0]]: `${d.pitchAngle}`,
                    [SUBSYSTEM2_COLUMNS[1]]: `${d.rollAngle}`,
                    [SUBSYSTEM2_COLUMNS[2]]: voltage.toFixed(2),
                    [SUBSYSTEM2_COLUMNS[3]]: current.toFixed(2),
                    [SUBSYSTEM2_COLUMNS[4]]: efficiency,
                    [SUBSYSTEM2_COLUMNS[5]]: fillFactor,
                  };
                })}
                onDelete={(index) => {
                  const datoOriginal = datosTemporales[index];
                  if (datoOriginal?.timestamp) {
                    handleDeleteMeasurement(datoOriginal.timestamp);
                  }
                }}
                maxHeight="550px"
                disableHorizontalScroll={true}
              />
            ) : (
              <Paper sx={{ p: 2, textAlign: "center", color: "#666" }}>
                Waiting for sweep data...
              </Paper>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
            <Paper
              className="paper-camera"
              sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", display: "flex", alignItems: "center", fontFamily: '"Poppins", sans-serif' }}
              >
                {CAMERA_TITLE}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: "#e53935", fontWeight: "bold", ml: 1, fontFamily: '"Poppins", sans-serif' }}
                >
                  ● En vivo
                </Typography>
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: "300px",
                  mt: 1,
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#000"
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1"
                  title="Cam"
                  frameBorder="0"
                  allowFullScreen
                />
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              p: "6px",
              mb: 2,
              border: "1px solid #e0e0e0"
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="fullWidth"
              TabIndicatorProps={{ style: { display: "none" } }}
            >
              <Tab label="Axis 1: Azimuth" sx={tabStyles} />
              <Tab label="Axis 2: Zenith" sx={tabStyles} />
            </Tabs>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
              <GraphTitleWithTooltip
                title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
                description={GRAPH_DESCRIPTIONS?.VOLTAGE_VS_TIME || "Real-time voltage measurements."}
              />
              <Box mt={2}>
                <RealTimeChart
                  chartId="chart-voltage-2"
                  data={activeTab === 0 ? dataAxis1 : dataAxis2}
                  customStartTime={globalStartTime}
                  dataKey="voltage"
                  color="#2196f3"
                  yLabel="Voltage (V)"
                  unit="V"
                  angleKey={activeTab === 0 ? "pitchAngle" : "rollAngle"}
                  angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, mb: 3, position: "relative", top: 10 }}>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() =>
                exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "volt", "Exp2", "csv", globalStartTime)
              }
              startIcon={<Download fontSize="small" />}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => downloadChartAsImage("chart-voltage-2", "Volt")}
              startIcon={<CropFree fontSize="small" />}
            >
              IMG
            </Button>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
            <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
              <GraphTitleWithTooltip
                title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? "Azimuth" : "Zenith"})`}
                description={GRAPH_DESCRIPTIONS?.CURRENT_VS_TIME || "Real-time current measurements."}
              />
              <Box mt={2}>
                <RealTimeChart
                  chartId="chart-current-2"
                  data={activeTab === 0 ? dataAxis1 : dataAxis2}
                  customStartTime={globalStartTime}
                  dataKey="current"
                  color="#4caf50"
                  yLabel="Current (A)"
                  unit="A"
                  angleKey={activeTab === 0 ? "pitchAngle" : "rollAngle"}
                  angleLabel={activeTab === 0 ? "Azimuth Angle" : "Zenith Angle"}
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: -2, position: "relative", top: 10 }}>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() =>
                exportData(activeTab === 0 ? dataAxis1 : dataAxis2, "curr", "Exp2", "csv", globalStartTime)
              }
              startIcon={<Download fontSize="small" />}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => downloadChartAsImage("chart-current-2", "Curr")}
              startIcon={<CropFree fontSize="small" />}
            >
              IMG
            </Button>
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              color="pink"
              onClick={() => exportData(datosNormalizados, "full_report_exp2", "Exp2", "csv")}
              fullWidth
              marginTop={2}
              startIcon={<SaveAlt />}
            >
              {DOWNLOAD_GRAPHS_BUTTON}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box mt={6} mb={4} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
          {BACK_BUTTON}
        </Button>
      </Box>
    </Box>
  );
};

export default Subsistema2;