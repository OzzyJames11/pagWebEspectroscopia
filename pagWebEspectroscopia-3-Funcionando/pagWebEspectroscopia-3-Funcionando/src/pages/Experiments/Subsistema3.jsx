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


  const initialMeasurementsCount = useRef(null);

  useEffect(() => {
    if (!user) return;
    const dbRef = ref(db, `${BASE_PATH}/measurements`);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        
        // Convertimos el objeto en un array y lo ordenamos cronológicamente
        const allData = Object.values(rawData).sort((a, b) => a.timestamp - b.timestamp);

        // 1. Si es la PRIMERA VEZ que leemos los datos al entrar a la página
        if (initialMeasurementsCount.current === null) {
          // Guardamos la cuenta exacta de mediciones que ya existían
          initialMeasurementsCount.current = allData.length;
          // Dejamos la tabla vacía para la nueva sesión
          setDatosTemporales([]);
          return;
        }

        // 2. Si hay datos NUEVOS (se agregaron mediciones tras hacer clic en Clean)
        if (allData.length > initialMeasurementsCount.current) {
          // Cortamos la historia antigua y nos quedamos solo con lo nuevo de esta sesión
          const newDataOnly = allData.slice(initialMeasurementsCount.current);
          setDatosTemporales(newDataOnly);
        } else {
          // Por seguridad, si los datos bajan o se mantienen igual, mostramos vacío
          setDatosTemporales([]);
        }

      } else {
        // Base de datos vacía
        initialMeasurementsCount.current = 0;
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