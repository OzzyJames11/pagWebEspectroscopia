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
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

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
  const UID_USUARIO = "8qb4yEqxXWcvdIEEXYBgANR57T12"; // Usuario quemado para pruebas
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
        update(ref(db), { [`${BASE_PATH}/communication/FrontToBack`]: "n" }).catch(() => {});
        
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
  }, []);

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
            setActiveTab(1); 
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
  }, [azimuthEnd, zenithStart]); 

  // Listener Datos (Measurements)
  useEffect(() => {
    if (!sweepIdActual) return;
    const dbRef = ref(db, `${BASE_PATH}/measurements`);
    
    // Carga inicial
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const allData = Object.values(snapshot.val());
            const myData = allData.filter(d => d.sweepId === sweepIdActual);
            // Inferencia simple de fase
            const myDataWithPhase = myData.map(d => ({
                ...d,
                faseEstimada: (d.rollAngle === zenithStart && d.pitchAngle !== azimuthEnd) ? "azimuth" : "zenith"
            }));
            setDatosTemporales(myDataWithPhase);
        }
    });

    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.sweepId === sweepIdActual) {
        const datoConFase = { ...data, faseEstimada: faseBarridoRef.current }; 
        setDatosTemporales((prev) => {
           const existe = prev.some((d) => d.timestamp === data.timestamp);
           return existe ? prev : [...prev, datoConFase];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

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

  // Filtro para gráficas según Tab
  const chartData = datosTemporales.filter(d => {
      if (activeTab === 0) return d.faseEstimada === "azimuth" || (!d.faseEstimada && d.rollAngle === zenithStart);
      if (activeTab === 1) return d.faseEstimada === "zenith" || (!d.faseEstimada && d.pitchAngle === azimuthEnd);
      return true;
  });

  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4} alignItems="flex-start">
        
        {/* === IZQUIERDA: CONTROLES === */}
        <Grid item xs={12} md={6}>
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

            {/* Test Button */}
            <Box mb={2}>
                <Button variant="outlined" color="warning" onClick={simularDatos} disabled={!barridoEnProgreso}>
                    🛠️ Test Point
                </Button>
            </Box>

            {/* Progress Bar */}
            {barridoEnProgreso && (
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

            {/* TABLA DE MEDIDAS */}
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

        {/* === DERECHA: CÁMARA Y GRÁFICOS === */}
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
             
             {/* CÁMARA */}
             <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
                <Paper className="paper-camera" sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center", fontFamily: '"Poppins", sans-serif' }}>
                        {CAMERA_TITLE} <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1, fontFamily: '"Poppins", sans-serif' }}>● En vivo</Typography>
                    </Typography>
                    <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`} title="Cam" frameBorder="0" allowFullScreen />
                    </Box>
                </Paper>
             </Box>

             {/* TABS */}
             <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                 <Tabs 
                    value={activeTab} 
                    onChange={(e, v) => setActiveTab(v)} 
                    variant="fullWidth" 
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ '& .MuiTab-root': { fontFamily: '"Poppins", sans-serif', textTransform: 'none', fontWeight: 600 } }}
                 >
                     <Tab label="Axis 1: Azimuth" />
                     <Tab label="Axis 2: Zenith" />
                 </Tabs>
             </Paper>

             {/* GRÁFICOS */}
             {/* Voltaje */}
             <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
                    <GraphTitleWithTooltip 
                        title={`${VOLTAGE_VS_TIME_TITLE} (${activeTab === 0 ? 'Azimuth' : 'Zenith'})`} 
                        description="Real-time voltage measurements." 
                    />
                    <Box mt={2}>
                        <RealTimeChart
                            chartId="chart-voltage-2"
                            data={chartData} 
                            dataKey="voltage"
                            color="#2196f3"
                            yLabel="Voltage (V)"
                            unit="V"
                        />
                    </Box>
                </Paper>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -1, mb: 3, position: 'relative', top: 10 }}>
                <Button variant="outlined" size="small" color="primary" onClick={() => exportData(chartData, 'volt', 'Exp2', 'csv')} startIcon={<Download fontSize="small" />}>CSV</Button>
                <Button variant="outlined" size="small" color="primary" onClick={() => downloadChartAsImage("chart-voltage-2", "Volt")} startIcon={<CropFree fontSize="small" />}>IMG</Button>
             </Box>

             {/* Corriente */}
             <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
                    <GraphTitleWithTooltip 
                        title={`${CURRENT_VS_TIME_TITLE} (${activeTab === 0 ? 'Azimuth' : 'Zenith'})`} 
                        description="Real-time current measurements." 
                    />
                    <Box mt={2}>
                        <RealTimeChart
                            chartId="chart-current-2"
                            data={chartData}
                            dataKey="current"
                            color="#4caf50"
                            yLabel="Current (A)"
                            unit="A"
                        />
                    </Box>
                </Paper>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -1, position: 'relative', top: 10 }}>
                <Button variant="outlined" size="small" color="primary" onClick={() => exportData(chartData, 'curr', 'Exp2', 'csv')} startIcon={<Download fontSize="small" />}>CSV</Button>
                <Button variant="outlined" size="small" color="primary" onClick={() => downloadChartAsImage("chart-current-2", "Curr")} startIcon={<CropFree fontSize="small" />}>IMG</Button>
             </Box>

             {/* Descarga Total */}
             <Box mt={5}>
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

      {/* FOOTER */}
      <Box mt={6} mb={4} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button variant="outlined" color="secondary" onClick={handleBackSafe}>
            {BACK_BUTTON}
          </Button>
      </Box>
    </Box>
  );
};

export default Subsistema2;

