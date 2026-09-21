import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
// import { useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // ✅ CORRECCIÓN: Importación correcta
import {useSelector} from "react-redux";

// Componentes
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import RealTimeChart from "../../components/Elements/RealTimeChart"; 

// Utilidades de descarga
import { exportData, downloadChartAsImage } from "../../../src/utils/ExportUtils";

// Importaci[on de onDisconnect
import { getDatabase, ref, set, update, onValue, onChildAdded, get, onDisconnect } from "firebase/database";

// Strings
import {
  SUBSISTEMA1_COLUMNS,
  PAGE_TITLES,
  SUBSISTEMA1_TOOLTIPS,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";

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
import CircularProgress from '@mui/material/CircularProgress';

// Estilos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase (Eliminamos la importación duplicada que tenías abajo y usamos la de arriba que ya tiene onDisconnect)
import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  // Se obtiene el ID del usuario dinámicamente
  const user = useSelector((state) => state.auth.user);

  // 1. Manejo seguro del usuario para no romper los Hooks
  const UID_USUARIO = user?.uid || "invitado";
  const BASE_PATH = `users/${UID_USUARIO}/Exp1`;

  // ==================== ESTADOS ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  
  // Identificadores de sesión y datos
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // Estado para saber si el panel ya terminó de calibrarse
  const [isHardwareReady, setIsHardwareReady] = useState(false);

  // Escuchar el estado físico del motor
  useEffect(() => {
    const statusRef = ref(db, 'estado_general/Exp1/hardwareStatus');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsHardwareReady(snapshot.val() === 'READY');
      }
    });
    return () => unsubscribe();
  }, [db]);

  // ==================== REFERENCIAS (Para limpieza al desmontar) ====================
  const sweepIdActualRef = useRef(null);
  const datosTemporalesRef = useRef([]); 
  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);

  // Mantener referencias sincronizadas
  useEffect(() => {
    sweepIdActualRef.current = sweepIdActual;
    datosTemporalesRef.current = datosTemporales;
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
  }, [sweepIdActual, datosTemporales, angulosBarrido, anguloActualIndex]);

// ==================== 1. INICIALIZACIÓN Y RECUPERACIÓN ====================
useEffect(() => {
  if (!user) return; 

  const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setUserSession(sessionId);
  
  const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);

  // Seguro: Si cierran la pestaña de golpe, Firebase manda 'n'
  onDisconnect(fbRef).set("n");

  // Despertar Arduino de forma limpia
  set(fbRef, "y").catch((err) => console.error(err));
  
  // Recuperar ID de barrido anterior
  const currentSweepRef = ref(db, `${BASE_PATH}/currentSweepId`);
  get(currentSweepRef).then((snapshot) => {
    if (snapshot.exists()) {
      setSweepIdActual(snapshot.val()); 
    }
  });

  // LIMPIEZA AL SALIR
  return () => {
    console.log("🧹 Desmontando componente...");
    set(fbRef, "n").catch(() => {});
    onDisconnect(fbRef).cancel(); 
    
    const datos = datosTemporalesRef.current;
    const datosBasura = datos.filter(d => d.isSaved === false);
    if (datosBasura.length > 0) {
      const updates = {};
      datosBasura.forEach((d) => {
         updates[`${BASE_PATH}/measurements/meas_${d.timestamp}`] = null;
      });
      update(ref(db), updates).catch((e) => console.error(e));
    }
  };
}, [user]);


  // ==================== PROTECCIÓN F5 / CERRAR PESTAÑA ====================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hayDatosSinGuardar = datosTemporales.some(d => !d.isSaved);
      
      // Si el barrido está corriendo o hay datos sin guardar, activamos la alerta del navegador
      if (barridoEnProgreso || hayDatosSinGuardar) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [datosTemporales, barridoEnProgreso]);

// ==================== VARIABLES GLOBALES PARA EL HEADER ====================
const hayDatosSinGuardar = datosTemporales.some((d) => d.isSaved === false);

useEffect(() => {
  window.barridoEnProgreso = barridoEnProgreso;
  window.datosEnPeligro = hayDatosSinGuardar;

  return () => {
    window.barridoEnProgreso = false;
    window.datosEnPeligro = false;
  };
}, [barridoEnProgreso, hayDatosSinGuardar]);

// ==================== PROTECCIÓN F5 / CERRAR PESTAÑA ====================
// Nota: El navegador fuerza su propio popup aquí. No podemos usar window.alert.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (barridoEnProgreso || hayDatosSinGuardar) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [datosTemporales, barridoEnProgreso]);

// ==================== TRAMPA PARA LA FLECHA DE ATRÁS DEL NAVEGADOR ====================
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
  return () => window.removeEventListener("popstate", handlePopState);
}, [navigate]);

// ==================== BOTÓN GO BACK ====================
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


  // ==================== 2. LECTURA DE DATOS (HISTÓRICO + TIEMPO REAL) ====================
  useEffect(() => {
    if (!sweepIdActual) return; // Esperamos a tener el ID

    const dbRef = ref(db, `${BASE_PATH}/measurements`);

    // A. CARGA INICIAL (SNAPSHOT): Trae lo que YA está en la BD
    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        // Convertir objeto a array y filtrar por el ID actual
        const loadedData = Object.values(rawData).filter(d => d.sweepId === sweepIdActual);
        
        if (loadedData.length > 0) {
          // Ordenar por tiempo para graficar correctamente
          loadedData.sort((a, b) => a.timestamp - b.timestamp);
          console.log(`📂 Carga inicial: ${loadedData.length} datos encontrados.`);
          setDatosTemporales(loadedData);
        }
      }
    });

    // B. ESCUCHA ACTIVA (LISTENER): Para datos que lleguen de ahora en adelante
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const newData = snapshot.val();
      
      // Solo agregamos si coincide el ID y NO lo tenemos ya (para evitar duplicados con el snapshot)
      if (newData.sweepId === sweepIdActual) {
        setDatosTemporales((prev) => {
          const yaExiste = prev.some(d => d.timestamp === newData.timestamp);
          return yaExiste ? prev : [...prev, newData];
        });
      }
    });

    return () => unsubscribe();
  }, [sweepIdActual]);


  // ==================== HELPERS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // Wrapper para tu función de descarga
  const handleDownload = (filename) => {
    if (datosTemporales.length === 0) {
      alert("No hay datos para descargar.");
      return;
    }
    // Asumo que tu función downloadCSV acepta (data, filename)
    // Si necesitas procesar antes con generateGraphCSV, ajusta aquí.
    downloadCSV(datosTemporales, filename); 
  };


  // ==================== LÓGICA DE BARRIDO ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");
    if (anguloInicial === anguloFinal) return alert("Los ángulos deben ser diferentes");

    // Limpiamos visualmente para el nuevo experimento
    setDatosTemporales([]); 
    
    // Generar nuevo ID
    const sweepId = `sweep_${Date.now()}`;
    setSweepIdActual(sweepId);
    
    const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
    setAngulosBarrido(angulos);
    setBarridoEnProgreso(true);
    setAnguloActualIndex(0);

    try {
      await Promise.all([
        set(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
          status: "in_progress",
          timestamp: Date.now(),
          userSession: userSession,
        }),
        set(ref(db, `${BASE_PATH}/currentSweepId`), sweepId),
      ]);

      console.log(`Barrido iniciado: ${sweepId}`);
      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    try {
      // ✅ SE MANTIENE: Envía "p" + ángulo (ej. "p20") a la cola de FrontToBack
      const fbRef = ref(db, `${BASE_PATH}/communication/FrontToBack`);
      await set(fbRef, "p" + angulo);

      await update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), {
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("Error moviendo panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // Listener Fin Movimiento
  useEffect(() => {
    const dbRef = ref(db, `${BASE_PATH}/communication/BackToFront`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        const siguiente = anguloActualIndexRef.current + 1;
        const angulos = angulosBarridoRef.current;
        const sweepId = sweepIdActualRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(() => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente), 2000);
        } else {
          setBarridoEnProgreso(false);
          update(ref(db, `${BASE_PATH}/sweeps/${sweepId}`), { status: "completed" });
        }
      }
    });
    return () => unsubscribe();
  }, [BASE_PATH]);


  // ==================== GUARDAR Y SALIR ====================
  const guardarBarrido = async () => {
    const datosAGuardar = datosTemporales.filter(d => !d.isSaved);
    if (datosAGuardar.length === 0) return alert("No hay nuevos datos para guardar.");

    if (!window.confirm(`¿Guardar ${datosAGuardar.length} mediciones permanentemente?`)) return;

    try {
      const updates = {};
      datosAGuardar.forEach((d) => {
        updates[`${BASE_PATH}/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);
      
      // Actualizamos localmente
      setDatosTemporales(prev => prev.map(d => ({ ...d, isSaved: true })));
      alert("✅ Datos guardados con éxito.");
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const youtubeVideoId = "nAQz4RMaHVA";

    // ==================== BORRAR REGISTRO INDIVIDUAL ====================
  const handleDeleteMeasurement = async (timestamp) => {
    if (!timestamp) return;

    // Confirmación de seguridad
    const confirmar = window.confirm("¿Estás seguro de eliminar este registro permanentemente de la base de datos?");
    if (!confirmar) return;

    try {
      // 1. Referencia exacta al dato en Firebase
      const measurementRef = ref(db, `${BASE_PATH}/measurements/meas_${timestamp}`);
      
      // 2. Borrado físico (set null elimina el nodo)
      await set(measurementRef, null);
      
      console.log(`Registro eliminado: meas_${timestamp}`);
      
      // 3. Actualización optimista de la UI (para que desaparezca rápido de la tabla)
      setDatosTemporales(prev => prev.filter(d => d.timestamp !== timestamp));
      
    } catch (error) {
      console.error("Error eliminando registro:", error);
      alert("Hubo un error al intentar eliminar el registro.");
    }
  };

  // ==================== UI ====================
  const {
    MAIN_TITLE, DESCRIPTION, MOVE_BUTTON, CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE, DOWNLOAD_GRAPHS_BUTTON, BACK_BUTTON,
  } = PAGE_TITLES;
  
  // 2. Retorno condicional DESPUÉS de todos los Hooks
  if(!user){
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
    width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}
    >
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>{MAIN_TITLE}</Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>{DESCRIPTION}</Typography>

      <Grid container spacing={4} alignItems="flex-start">
        {/* === IZQUIERDA === */}
        <Grid item xs={12} md={6}>
          {/* <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>Automatic sweeping control</Typography> */}
          <Box display="flex" alignItems="center" mb={2}>
            {/* <RocketLaunch color="primary" sx={{ mr: 1 }} /> */}
            <Typography variant="h5">
              Automatic sweeping control
            </Typography>
          </Box>
          

          <Box 
            sx={{
              // Forzamos el color gris oscuro en TODO el slider cuando tiene la clase .Mui-disabled
              '& .MuiSlider-root.Mui-disabled': {
                color: '#9e9e9e', // Cambia el color base a gris
                
                // Sobrescribimos partes específicas que podrían resistirse
                '& .MuiSlider-thumb': {
                  backgroundColor: '#f5f5f5', // Thumb blanco-grisáceo
                  borderColor: '#9e9e9e',     // Borde gris
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#9e9e9e', // Línea principal gris
                  borderColor: '#9e9e9e',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#e0e0e0', // Línea de fondo (más clara)
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#9e9e9e', // Puntitos de marca grises
                },
                '& .MuiSlider-markLabel': {
                  color: '#9e9e9e', // Texto de los grados en gris
                }
              }
            }}
          >
          <SliderComponent
            value={anguloInicial} label="Initial Angle" min={-30} max={30} step={5}
            actualAngle={anguloInicial} onChange={(e, v) => setAnguloInicial(v)} disabled={barridoEnProgreso || !isHardwareReady}
          />
          <Box mt={2}>
            <SliderComponent
              value={anguloFinal} label="Final Angle" min={-30} max={30} step={5}
              actualAngle={anguloFinal} onChange={(e, v) => setAnguloFinal(v)} disabled={barridoEnProgreso || !isHardwareReady}
            />
          </Box>
          </Box>

          {/* <Box mt={2}>
            {barridoEnProgreso && <p style={{ color: "black" }}>El panel está en movimiento...</p>} */}
            {/* <Button id="btnMov1" variant="contained" color="primary" onClick={iniciarBarrido} disabled={barridoEnProgreso}>
              {barridoEnProgreso ? " ..." : MOVE_BUTTON}
            </Button> */}
            {/* ozzyjames11: estético, probar cuando haya backend, solo descomentar y comentar el Button anterior */}
            {/* <Button
              id="btnMov1"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              disabled={barridoEnProgreso}
              startIcon={barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            >
              {barridoEnProgreso ? "Moving..." : MOVE_BUTTON}
            </Button> */}
            <Box mt={3} mb={2} sx={{ display: 'flex', gap: 2 }}>
            {/* BOTÓN MOVE CON CIRCULAR PROGRESS */}
            <Button 
              id="btnMov1" 
              variant="contained" 
              color="primary" 
              size="large" //mod
              fullWidth //mod
              onClick={iniciarBarrido} 
              // Se bloquea si hay barrido O si no está ready
              disabled={barridoEnProgreso || !isHardwareReady}
              startIcon={
                // Icono dinámico según lo que esté haciendo
                !isHardwareReady ? <CircularProgress size={20} color="inherit" /> :
                barridoEnProgreso ? <CircularProgress size={20} color="inherit" /> : 
                <PlayArrow />
              }
            >
              {/* Texto dinámico */}
              {!isHardwareReady ? "Calibrating Panel..." :
              barridoEnProgreso ? "Running Sweep..." : 
              MOVE_BUTTON}
            </Button>
            </Box>

          {barridoEnProgreso && angulosBarrido.length > 0 && (
            <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
              <Box sx={{
                height: "100%", borderRadius: 1, backgroundColor: "#2196f3", transition: "width 0.3s",
                width: `${((anguloActualIndex + 1) / angulosBarrido.length) * 100}%`,
              }} />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">
              Measurements Table
            </Typography>

            <Button
              // Si hay datos sin guardar (true) -> "contained" (Sólido)
              // Si todo está guardado (false) -> "outlined" (Solo borde)
              variant={hayDatosSinGuardar ? "contained" : "outlined"}
              
              color="primary" // Siempre azul
              onClick={guardarBarrido}
              disabled={datosTemporales.length === 0}
              
              // Cambiamos el icono según el estado
              startIcon={hayDatosSinGuardar ? <Save /> : <CloudDone />}
              
              size="medium"
            >
              {/* Texto dinámico */}
              {hayDatosSinGuardar ? "SAVE DATA" : "ALL DATA SAVED"}
            </Button>
          </Box>

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
                  <DataTable
                    columns={SUBSISTEMA1_COLUMNS}
                    
                    // 1. MAPEO DE DATOS (Lo que se ve)
                    data={datosTemporales.map((d) => {
                      // Cálculos simulados para la vista
                      // const power = ((d.voltage ?? 0) * (d.current ?? 0)).toFixed(4);
                      // const efficiency = (15 + Math.random() * 7).toFixed(2); // Aleatorio 15-22%
                      // const fillFactor = (0.70 + Math.random() * 0.15).toFixed(2); // Aleatorio 0.70-0.85
                      
                      return {
                        [SUBSISTEMA1_COLUMNS[0]]: `${d.angle}`,
                        [SUBSISTEMA1_COLUMNS[1]]: d.voltage?.toFixed(2),
                        [SUBSISTEMA1_COLUMNS[2]]: d.current?.toFixed(2),
                        [SUBSISTEMA1_COLUMNS[3]]: (d.efficiency * 100)?.toFixed(2),
                        [SUBSISTEMA1_COLUMNS[4]]: d.fillFactor?.toFixed(2) // Antes era isSaved, ahora es Fill Factor
                      };
                    })}

                    // 2. CONEXIÓN DEL BASURERO (La clave de tu problema)
                    onDelete={(index) => {
                      // Usamos el índice de la fila para buscar el dato original en memoria
                      const datoOriginal = datosTemporales[index];
                      
                      if (datoOriginal && datoOriginal.timestamp) {
                        // Llamamos a la función que borra en Firebase usando el ID real
                        handleDeleteMeasurement(datoOriginal.timestamp);
                      } else {
                        console.error("No se pudo encontrar el timestamp del dato en el índice:", index);
                      }
                    }}

                    tooltips={SUBSISTEMA1_TOOLTIPS}
                    maxHeight="950px"
                  />
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Esperando datos del barrido...
                </Typography>
              </Paper>
            )}
          </Box>

        </Grid>

        {/* === DERECHA === */}
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
          
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-camera" sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff", borderRadius: "12px" }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
                {CAMERA_TITLE} <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>● En vivo</Typography>
              </Typography>
              <Box sx={{ width: "100%", height: "300px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
                {/* ozzyjames11: descomentar, es la transmisión de YT */}
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/live_stream?channel=UCo3rncfvezDnIu6mCpdOMZA&autoplay=1&mute=1" title="Cam" frameBorder="0" allowFullScreen /> 
              </Box>
            </Paper>
          </Box>

          {/* Gráfico 1 */}
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 3 }}>
            <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
              <GraphTitleWithTooltip title={VOLTAGE_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME} />
              <Box mt={2}>
                <RealTimeChart
                  chartId="chart-voltage"
                  data={datosTemporales}
                  dataKey="voltage"
                  color="#2196f3"
                  yLabel="Voltage (V)"
                  unit="V"
                />
              </Box>
            </Paper>
          </Box>


          {/* Opción A: Botones discretos y alineados */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -1 }}>
            <Button 
              variant="outlined"   // Mucho más limpio que contained
              size="small"     // Para que no roben atención
              color="primary" 
              onClick={() => exportData(datosTemporales, 'chart_voltage', 'Exp1', 'csv')}
              startIcon={<Download fontSize="small" />} // Ícono pequeño
            >
              CSV
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              color="primary" 
              onClick={() => downloadChartAsImage("chart-voltage", "Voltage_Graph")}
              startIcon={<CropFree fontSize="small" />} // CropFree se ve más técnico que Camera
            >
              IMG
            </Button>
          </Box>

          {/* Gráfico 2 */}
          <Box mt={4} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph" sx={{ width: "100%", p: 2 }}>
              <GraphTitleWithTooltip title={CURRENT_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME} />
              <Box mt={2}>
                <RealTimeChart
                  chartId="chart-current"
                  data={datosTemporales}
                  dataKey="current"
                  color="#4caf50"
                  yLabel="Current (A)"
                  unit="A"
                />
              </Box>
            </Paper>
          </Box>

          {/* BOTONERA CORRIENTE: DATOS + IMAGEN */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: -1 }}>
            <Button 
              variant="outlined" 
              size="small"
              color="primary" 
              // fullWidth
              onClick={() => exportData(datosTemporales, 'chart_current', 'Exp1', 'csv')}
              startIcon={<Download />}
            >
              {/* {DOWNLOAD_1_GRAPH}  */}
              CSV
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => downloadChartAsImage("chart-current", "Current_Graph")}
              startIcon={<CropFree />}
            >
              IMG
            </Button>
          </Box>

           {/* --- DESCARGA TOTAL --- */}
          <Box mt={4}>
            <Button
              variant="contained" 
              color="pink" 
              // color="secondary"
              onClick={() => exportData(datosTemporales, 'full_report', 'Exp1', 'csv')}
              fullWidth 
              // size="large"
              marginTop={2}
              startIcon={<SaveAlt />}
            >
              {DOWNLOAD_GRAPHS_BUTTON}
            </Button>
          </Box>

        </Grid>
      </Grid>

      <Button variant="outlined" color="secondary" onClick={handleBackSafe} align="center" marginTop={4}>
        {BACK_BUTTON}
      </Button>
    </Box>
  );
};

export default Subsistema1;