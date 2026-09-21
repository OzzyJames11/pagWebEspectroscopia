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