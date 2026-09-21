import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  OutlinedInput,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Menu,
  FormGroup,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import DataTable from "../../components/Elements/DataTable.jsx";
import Button from "../../components/Elements/Button.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Download,
  CropFree,
  ArrowDropDown,
} from "@mui/icons-material";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";
import { exportData } from "../../../src/utils/ExportUtils.js";

import { getDatabase, ref, onValue, remove } from "firebase/database";
import app from "../../firebaseConfig.js";

import {
  PAGE_TITLES,
  ALERT_MESSAGES,
  SUBSYSTEM_TITLES,
} from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";
import { SUBSISTEMA3_COLUMNS } from "../../assets/Strings/Experiments/Subsistema3Strings.jsx";
import tableStyles from "../../assets/css/Elements/DataTable.module.css";

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return (
    <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
      {children}
    </Box>
  );
}

const SUBSYSTEM4_COLUMNS = [
  "Integration Time (ms)",
  "Date",
  "Actions",
];

const SUBSYSTEM4_FILTER_COLUMNS = [
  "Date",
  "Reference (%)",
  "Yellow Filter (%)",
  "Blue Filter (%)",
  "Red Filter (%)",
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
      width: 380,
    },
    sx: {
      '& .MuiTypography-root, & .MuiMenuItem-root': {
        fontFamily: '"Poppins", sans-serif !important',
      }
    }
  },
};

const ESTOY_EN_EL_LAB = true;

//const API_BASE_URL = ESTOY_EN_EL_LAB
  //? "http://127.0.0.1:8000"
  //: "https://tactilely-furrowless-liane.ngrok-free.dev";

  // API BASE URL: funciona via Nginx Proxy
const API_BASE_URL = "/api-python";

const DataSummary = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  const user = useSelector((state) => state.auth.user);
  const userId = user?.uid;

  const {
    MAIN_TITLE,
    DESCRIPTION,
    DOWNLOAD_BUTTON,
    CLEAR_BUTTON,
    NO_DATA_MESSAGE,
    SELECT_SUBSYSTEMS,
    BACK_BUTTON,
  } = PAGE_TITLES;

  const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
  const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
  const [medicionesSubsistema3, setMedicionesSubsistema3] = useState({});
  const [medicionesSubsistema4, setMedicionesSubsistema4] = useState({});
  const [environmentDataSubsistema4, setEnvironmentDataSubsistema4] = useState({});

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [selectedSweepS1, setSelectedSweepS1] = useState("");
  const [selectedSweepS2, setSelectedSweepS2] = useState("");
  const [selectedMeasurementS3, setSelectedMeasurementS3] = useState("");
  const [selectedMeasurementS4, setSelectedMeasurementS4] = useState("");

  const [selectedSystems, setSelectedSystems] = useState({
    subsistema1: true,
    subsistema2: true,
    subsistema3: true,
    subsistema4: true,
  });

  const [selectedSweepsS1, setSelectedSweepsS1] = useState([]);
  const [selectedSweepsS2, setSelectedSweepsS2] = useState([]);
  const [selectedMeasurementsS3, setSelectedMeasurementsS3] = useState([]);
  const [selectedMeasurementsS4, setSelectedMeasurementsS4] = useState([]);
  const [includeFiltersS4, setIncludeFiltersS4] = useState(true);

  const [anchorElS4, setAnchorElS4] = useState(null);
  const [imageSelectionS4, setImageSelectionS4] = useState({
    completo: true,
    uv: false,
    visible: false,
    nir: false,
  });

  useEffect(() => {
    if (!userId) {
      alert("Debes iniciar sesión para ver tus datos");
      navigate("/login");
    }
  }, [userId, navigate]);

  const filtrarSoloBarridosGuardados = (sweepsWithData) => {
    const filtrados = {};
    Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
      if ((obj?.datos?.length ?? 0) > 0) {
        filtrados[sweepId] = obj;
      }
    });
    return filtrados;
  };

  useEffect(() => {
    if (!userId) return;
    cargarDatosDesdeFirebase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const cargarDatosDesdeFirebase = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // ===================== EXP1 =====================
      const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
      onValue(
        exp1SweepsRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setBarridosSubsistema1({});
            return;
          }

          const sweeps = snapshot.val();
          const sweepsWithData = {};
          Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
            sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
          });

          const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
          onValue(
            exp1MeasurementsRef,
            (measSnap) => {
              if (measSnap.exists()) {
                const measurements = measSnap.val();
                Object.values(measurements).forEach((meas) => {
                  if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
                    sweepsWithData[meas.sweepId].datos.push(meas);
                  }
                });

                Object.keys(sweepsWithData).forEach((sid) => {
                  sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
                });
              }

              const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
              setBarridosSubsistema1(soloGuardados);

              if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
                setSelectedSweepS1("");
              }

              setSelectedSweepsS1((prev) => prev.filter((id) => soloGuardados[id]));
            },
            { onlyOnce: true }
          );
        },
        { onlyOnce: true }
      );

      // ===================== EXP2 =====================
      const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
      onValue(
        exp2SweepsRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setBarridosSubsistema2({});
            return;
          }

          const sweeps = snapshot.val();
          const sweepsWithData = {};
          Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
            sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
          });

          const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
          onValue(
            exp2MeasurementsRef,
            (measSnap) => {
              if (measSnap.exists()) {
                const measurements = measSnap.val();
                Object.values(measurements).forEach((meas) => {
                  if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
                    sweepsWithData[meas.sweepId].datos.push(meas);
                  }
                });

                Object.keys(sweepsWithData).forEach((sid) => {
                  sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
                });
              }

              const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
              setBarridosSubsistema2(soloGuardados);

              if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
                setSelectedSweepS2("");
              }

              setSelectedSweepsS2((prev) => prev.filter((id) => soloGuardados[id]));
            },
            { onlyOnce: true }
          );
        },
        { onlyOnce: true }
      );

      // ===================== EXP3 =====================
      const exp3MeasurementsRef = ref(db, `users/${userId}/Exp3/measurements`);
      onValue(
        exp3MeasurementsRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setMedicionesSubsistema3({});
            return;
          }

          const measurements = snapshot.val();
          const savedMeasurements = {};

          Object.entries(measurements).forEach(([measurementId, measurementData]) => {
            if (measurementData?.isSaved) {
              savedMeasurements[measurementId] = measurementData;
            }
          });

          setMedicionesSubsistema3(savedMeasurements);

          if (selectedMeasurementS3 && !savedMeasurements[selectedMeasurementS3]) {
            setSelectedMeasurementS3("");
          }

          setSelectedMeasurementsS3((prev) =>
            prev.filter((id) => savedMeasurements[id])
          );
        },
        { onlyOnce: true }
      );

      // ===================== EXP4 - MEDICIONES =====================
      const exp4MeasurementsRef = ref(db, `users/${userId}/Exp4/measurements`);
      onValue(
        exp4MeasurementsRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setMedicionesSubsistema4({});
            return;
          }

          const measurements = snapshot.val();
          const savedMeasurements = {};

          Object.entries(measurements).forEach(([measurementId, measurementData]) => {
            if (measurementData?.isSaved) {
              savedMeasurements[measurementId] = measurementData;
            }
          });

          setMedicionesSubsistema4(savedMeasurements);

          if (selectedMeasurementS4 && !savedMeasurements[selectedMeasurementS4]) {
            setSelectedMeasurementS4("");
          }

          setSelectedMeasurementsS4((prev) =>
            prev.filter((id) => savedMeasurements[id])
          );
        },
        { onlyOnce: true }
      );

      // ===================== EXP4 - FILTROS =====================
      const exp4EnvironmentRef = ref(db, `users/${userId}/Exp4/environmentData`);
      onValue(
        exp4EnvironmentRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setEnvironmentDataSubsistema4({});
            setLoading(false);
            return;
          }

          setEnvironmentDataSubsistema4(snapshot.val());
          setLoading(false);
        },
        { onlyOnce: true }
      );
    } catch (error) {
      console.error("❌ Error al cargar datos desde Firebase:", error);
      setLoading(false);
    }
  };

// ====== BORRADO INDIVIDUAL DE REGISTROS (S1 Y S2) ======
const handleDeleteMeasurementS1 = async (sweepId, timestamp) => {
  if (!userId || !sweepId || !timestamp) return;
  const confirmar = window.confirm("¿Estás seguro de eliminar este registro permanentemente?");
  if (!confirmar) return;

  try {
    await remove(ref(db, `users/${userId}/Exp1/measurements/meas_${timestamp}`));
    // Actualizamos la tabla visualmente al instante
    setBarridosSubsistema1((prev) => {
      const updated = { ...prev };
      if (updated[sweepId]) {
        updated[sweepId].datos = updated[sweepId].datos.filter(d => d.timestamp !== timestamp);
      }
      return updated;
    });
  } catch (error) {
    console.error("Error al eliminar S1:", error);
  }
};

const handleDeleteMeasurementS2 = async (sweepId, timestamp) => {
  if (!userId || !sweepId || !timestamp) return;
  const confirmar = window.confirm("¿Estás seguro de eliminar este registro permanentemente?");
  if (!confirmar) return;

  try {
    await remove(ref(db, `users/${userId}/Exp2/measurements/meas_${timestamp}`));
    // Actualizamos la tabla visualmente al instante
    setBarridosSubsistema2((prev) => {
      const updated = { ...prev };
      if (updated[sweepId]) {
        updated[sweepId].datos = updated[sweepId].datos.filter(d => d.timestamp !== timestamp);
      }
      return updated;
    });
  } catch (error) {
    console.error("Error al eliminar S2:", error);
  }
};

  const handleClearData = async (subsistema) => {
    if (!userId) return;

    const confirmar = window.confirm(
      `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      if (subsistema === "subsistema1") {
        await remove(ref(db, `users/${userId}/Exp1/sweeps`));
        await remove(ref(db, `users/${userId}/Exp1/measurements`));
        setBarridosSubsistema1({});
        setSelectedSweepS1("");
        setSelectedSweepsS1([]);
      }

      if (subsistema === "subsistema2") {
        await remove(ref(db, `users/${userId}/Exp2/sweeps`));
        await remove(ref(db, `users/${userId}/Exp2/measurements`));
        setBarridosSubsistema2({});
        setSelectedSweepS2("");
        setSelectedSweepsS2([]);
      }

      if (subsistema === "subsistema3") {
        await remove(ref(db, `users/${userId}/Exp3/measurements`));
        setMedicionesSubsistema3({});
        setSelectedMeasurementS3("");
        setSelectedMeasurementsS3([]);
      }

      if (subsistema === "subsistema4") {
        await remove(ref(db, `users/${userId}/Exp4/measurements`));
        await remove(ref(db, `users/${userId}/Exp4/environmentData`));
        await remove(ref(db, `users/${userId}/Exp4/currentMeasurementId`));
        await remove(ref(db, `users/${userId}/Exp4/currentSensorMeasurementId`));
        setMedicionesSubsistema4({});
        setEnvironmentDataSubsistema4({});
        setSelectedMeasurementS4("");
        setSelectedMeasurementsS4([]);
      }

      alert(`✅ Datos del ${subsistema} eliminados correctamente`);
      cargarDatosDesdeFirebase();
    } catch (error) {
      console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
      alert(`Error al eliminar datos: ${error.message}`);
    }
  };

  const handleDeleteMeasurementS3 = async (measurementId) => {
    if (!userId || !measurementId) return;

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta medición del Subsystem 3?"
    );
    if (!confirmar) return;

    try {
      await remove(ref(db, `users/${userId}/Exp3/measurements/${measurementId}`));

      setMedicionesSubsistema3((prev) => {
        const updated = { ...prev };
        delete updated[measurementId];
        return updated;
      });

      if (selectedMeasurementS3 === measurementId) {
        setSelectedMeasurementS3("");
      }

      setSelectedMeasurementsS3((prev) => prev.filter((id) => id !== measurementId));

      alert("✅ Medición eliminada correctamente");
    } catch (error) {
      console.error("❌ Error al eliminar medición de Subsystem 3:", error);
      alert(`Error al eliminar medición: ${error.message}`);
    }
  };

  const handleDeleteMeasurementS4 = async (measurementId) => {
    if (!userId || !measurementId) return;

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta medición del Subsystem 4?"
    );
    if (!confirmar) return;

    try {
      await remove(ref(db, `users/${userId}/Exp4/measurements/${measurementId}`));

      setMedicionesSubsistema4((prev) => {
        const updated = { ...prev };
        delete updated[measurementId];
        return updated;
      });

      if (selectedMeasurementS4 === measurementId) {
        setSelectedMeasurementS4("");
      }

      setSelectedMeasurementsS4((prev) => prev.filter((id) => id !== measurementId));

      alert("✅ Medición eliminada correctamente");
    } catch (error) {
      console.error("❌ Error al eliminar medición de Subsystem 4:", error);
      alert(`Error al eliminar medición: ${error.message}`);
    }
  };

  const handleSystemCheckboxChange = (event) => {
    setSelectedSystems({
      ...selectedSystems,
      [event.target.name]: event.target.checked,
    });
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    try {
      const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
      const date = new Date(ts);
      return isNaN(date.getTime())
        ? "Fecha inválida"
        : date.toLocaleString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
    } catch {
      return "Error en fecha";
    }
  };

  const getExp2StartPitch = (meta) =>
    meta?.pitchStart ?? meta?.azimuthStart ?? "?";

  const getExp2EndPitch = (meta) =>
    meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

  const getExp2StartRoll = (meta) =>
    meta?.rollStart ?? meta?.zenithStart ?? "?";

  const getExp2EndRoll = (meta) =>
    meta?.rollEnd ?? meta?.zenithEnd ?? "?";

  const getExp2PitchMeasurement = (d) =>
    d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

  const getExp2RollMeasurement = (d) =>
    d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

  const getLatestEnvironmentData = () => {
    const entries = Object.entries(environmentDataSubsistema4 || {});
    if (entries.length === 0) return null;

    entries.sort((a, b) => {
      const tsA = a[1]?.timestamp ?? 0;
      const tsB = b[1]?.timestamp ?? 0;
      return tsB - tsA;
    });

    return { id: entries[0][0], ...entries[0][1] };
  };

  const latestEnvironmentDataS4 = getLatestEnvironmentData();

  const sweepsS1 = useMemo(() => {
    const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
      id,
      ...obj,
      ts: obj?.metadata?.timestamp ?? 0,
    }));
    arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
    return arr;
  }, [barridosSubsistema1]);

  const sweepsS2 = useMemo(() => {
    const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
      id,
      ...obj,
      ts: obj?.metadata?.timestamp ?? 0,
    }));
    arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
    return arr;
  }, [barridosSubsistema2]);

  const measurementsS3 = useMemo(() => {
    const arr = Object.entries(medicionesSubsistema3).map(([id, data]) => ({
      id,
      ...data,
      ts: data?.timestamp ?? 0,
    }));
    arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
    return arr;
  }, [medicionesSubsistema3]);

  const measurementsS4 = useMemo(() => {
    const arr = Object.entries(medicionesSubsistema4).map(([id, data]) => ({
      id,
      ...data,
      ts: data?.timestamp ?? 0,
    }));
    arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
    return arr;
  }, [medicionesSubsistema4]);

  useEffect(() => {
    if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
  }, [sweepsS1, selectedSweepS1]);

  useEffect(() => {
    if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
  }, [sweepsS2, selectedSweepS2]);

  useEffect(() => {
    if (!selectedMeasurementS3 && measurementsS3.length > 0) {
      setSelectedMeasurementS3(measurementsS3[0].id);
    }
  }, [measurementsS3, selectedMeasurementS3]);

  useEffect(() => {
    if (!selectedMeasurementS4 && measurementsS4.length > 0) {
      setSelectedMeasurementS4(measurementsS4[0].id);
    }
  }, [measurementsS4, selectedMeasurementS4]);

  const selectedS1Obj = useMemo(
    () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
    [sweepsS1, selectedSweepS1]
  );

  const selectedS2Obj = useMemo(
    () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
    [sweepsS2, selectedSweepS2]
  );

  const selectedS3Obj = useMemo(
    () => measurementsS3.find((m) => m.id === selectedMeasurementS3) || null,
    [measurementsS3, selectedMeasurementS3]
  );

  const selectedS4Obj = useMemo(
    () => measurementsS4.find((m) => m.id === selectedMeasurementS4) || null,
    [measurementsS4, selectedMeasurementS4]
  );

  const countS1 = sweepsS1.length;
  const countS2 = sweepsS2.length;
  const countS3 = measurementsS3.length;
  const countS4 = measurementsS4.length;


  // ====== DESCARGAS INDIVIDUALES (Usando el nuevo ExportUtils) ======
  const handleDownloadSelectedS1CSV = () => {
    if (!selectedS1Obj || !selectedS1Obj.datos) return alert("No hay datos en el barrido seleccionado.");
    exportData(selectedS1Obj.datos, 'full_report', 'Exp1', 'csv');
  };

  const handleDownloadSelectedS2CSV = () => {
    if (!selectedS2Obj || !selectedS2Obj.datos) return alert("No hay datos en el barrido seleccionado.");
    exportData(selectedS2Obj.datos, 'full_report', 'Exp2', 'csv');
  };

  const handleDownloadSelectedS3CSV = () => {
    if (!selectedS3Obj) return alert("Selecciona una medición del Subsystem 3.");
    exportData([selectedS3Obj], 'full_report', 'Exp3', 'csv');
  };

  const handleDownloadSelectedS4CSV = () => {
    if (!selectedS4Obj) return alert("Selecciona una medición del Subsystem 4.");
    exportData([selectedS4Obj], 'full_report', 'Exp4', 'csv');
  };

  // ====== FUNCIONES DEL MENÚ Y DESCARGA DE IMÁGENES DEL SUBSISTEMA 4 ======
  const handleMenuOpenS4 = (event) => setAnchorElS4(event.currentTarget);
  const handleMenuCloseS4 = () => setAnchorElS4(null);

  const handleCheckboxToggleS4 = (name) => {
    setImageSelectionS4((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isAllSelectedS4 =
    imageSelectionS4.completo &&
    imageSelectionS4.uv &&
    imageSelectionS4.visible &&
    imageSelectionS4.nir;

  const handleSelectAllS4 = (event) => {
    const checked = event.target.checked;
    setImageSelectionS4({
      completo: checked,
      uv: checked,
      visible: checked,
      nir: checked,
    });
  };

  const handleDownloadTxtS4 = () => {
    if (!selectedS4Obj?.id) {
      alert("Selecciona una medición del Subsystem 4.");
      return;
    }
    const downloadUrl = `${API_BASE_URL}/descargar/datos/${userId}/${selectedS4Obj.id}`;
    window.open(downloadUrl, "_blank");
  };

  const handleDownloadImagesS4 = () => {
    if (!selectedS4Obj?.id) {
      alert("Selecciona una medición del Subsystem 4.");
      return;
    }

    const haySeleccion =
      imageSelectionS4.completo ||
      imageSelectionS4.uv ||
      imageSelectionS4.visible ||
      imageSelectionS4.nir;

    if (!haySeleccion) {
      alert("Selecciona al menos una gráfica.");
      return;
    }

    const queryParams = new URLSearchParams({
      completo: imageSelectionS4.completo,
      uv: imageSelectionS4.uv,
      visible: imageSelectionS4.visible,
      nir: imageSelectionS4.nir,
    }).toString();

    const downloadUrl = `${API_BASE_URL}/descargar/graficas/${userId}/${selectedS4Obj.id}?${queryParams}`;
    window.open(downloadUrl, "_blank");
    handleMenuCloseS4();
  };

  // ====== DESCARGA MÚLTIPLE (Pestaña Exportar) ======
  const handleDownloadCSV = () => {
    let descargasRealizadas = 0;

    if (selectedSystems.subsistema1 && selectedSweepsS1.length > 0) {
      selectedSweepsS1.forEach((id) => {
        const sweep = barridosSubsistema1[id];
        if (sweep && sweep.datos) { exportData(sweep.datos, 'full_report', 'Exp1', 'csv'); descargasRealizadas++; }
      });
    }

    if (selectedSystems.subsistema2 && selectedSweepsS2.length > 0) {
      selectedSweepsS2.forEach((id) => {
        const sweep = barridosSubsistema2[id];
        if (sweep && sweep.datos) { exportData(sweep.datos, 'full_report', 'Exp2', 'csv'); descargasRealizadas++; }
      });
    }

    if (selectedSystems.subsistema3 && selectedMeasurementsS3.length > 0) {
      const dataS3 = selectedMeasurementsS3.map(id => medicionesSubsistema3[id]).filter(Boolean);
      if (dataS3.length > 0) { exportData(dataS3, 'full_report', 'Exp3', 'csv'); descargasRealizadas++; }
    }

    if (selectedSystems.subsistema4 && selectedMeasurementsS4.length > 0) {
      const dataS4 = selectedMeasurementsS4.map(id => medicionesSubsistema4[id]).filter(Boolean);
      if (dataS4.length > 0) { exportData(dataS4, 'full_report', 'Exp4', 'csv'); descargasRealizadas++; }
      
      if (includeFiltersS4 && latestEnvironmentDataS4) {
        exportData([latestEnvironmentDataS4], 'full_report', 'Exp4_Filters', 'csv');
        descargasRealizadas++;
      }
    }

    if (descargasRealizadas === 0) {
      alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED || "No hay datos seleccionados para exportar.");
    }
  };

  const handleBack = () => navigate("/experiments/experimentChooser");

  const NoDataMessage = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {NO_DATA_MESSAGE}
      </Typography>
    </Paper>
  );

  if (!userId) return <Typography>Cargando...</Typography>;

  if (loading) {
    return (
      <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
        <Typography variant="h4" gutterBottom>
          Cargando datos...
        </Typography>
      </Box>
    );
  }

  return (
    // <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
    <Box 
      width="90%" 
      maxWidth="1300px" 
      margin="auto" 
      mt={11} 
      mb={5}
      sx={{
        // ✅ Forzar Poppins en todos los textos, pestañas y campos de Material UI dentro de esta página
        '& .MuiTypography-root, & .MuiTab-root, & .MuiInputLabel-root, & .MuiInputBase-root': {
          fontFamily: '"Poppins", sans-serif !important',
        }
      }}
    >
      <Typography variant="h4" gutterBottom>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
        {DESCRIPTION}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
        <Paper
          sx={{
            width: 260,
            p: 1,
            borderRadius: 2,
            height: "fit-content",
            position: "sticky",
            top: 90,
          }}
        >
          <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
            {SELECT_SUBSYSTEMS}
          </Typography>
          <Divider />

          <Tabs
            orientation="vertical"
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mt: 1,
              "& .MuiTab-root": {
                alignItems: "flex-start",
                textTransform: "none",
                minHeight: 44,
              },
            }}
          >
            <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
            <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
            <Tab label={`Subsystem 3 ${countS3 ? `(${countS3})` : ""}`} />
            <Tab label={`Subsystem 4 ${countS4 ? `(${countS4})` : ""}`} />
            {/* <Tab label="Exportar / CSV" /> */}
          </Tabs>

          <Divider sx={{ my: 1 }} />

          <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
            {BACK_BUTTON}
          </Button>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            height: "calc(100vh - 180px)",
            minHeight: "600px",
            overflow: "auto",
          }}
        >
          {/* SUBSYSTEM 1 */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {countS1} barridos guardados
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedS1Obj && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleDownloadSelectedS1CSV}
                    startIcon={<Download fontSize="small" />}
                  >
                    CSV
                  </Button>
                )}

              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {countS1 > 0 ? (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
                  <Select
                    labelId="s1-sweep-label"
                    value={selectedSweepS1}
                    label="Selecciona un barrido"
                    onChange={(e) => setSelectedSweepS1(e.target.value)}
                  >
                    {sweepsS1.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
                          s.datos?.length ?? 0
                        } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedS1Obj ? (
                  <>
                    <DataTable
                      columns={SUBSISTEMA1_COLUMNS}
                      disableTooltips={true}
                      maxHeight="500px"
                      data={(selectedS1Obj.datos || []).map((d) => ({
                        [SUBSISTEMA1_COLUMNS[0]]: d.angle ?? 0,
                        [SUBSISTEMA1_COLUMNS[1]]: d.voltage?.toFixed(2) ?? "0.00",
                        [SUBSISTEMA1_COLUMNS[2]]: d.current?.toFixed(2) ?? "0.00",
                        [SUBSISTEMA1_COLUMNS[3]]: d.efficiency !== undefined ? (d.efficiency * 100).toFixed(2) : "0.00",
                        [SUBSISTEMA1_COLUMNS[4]]: d.fillFactor !== undefined ? d.fillFactor.toFixed(4) : "0.0000",
                      }))}
                      onDelete={(index) => {
                        const dato = selectedS1Obj.datos[index];
                        if (dato && dato.timestamp) {
                          handleDeleteMeasurementS1(selectedS1Obj.id, dato.timestamp);
                        }
                      }}
                    />

                   
                  </>
                ) : (
                  <NoDataMessage />
                )}
              </>
            ) : (
              <NoDataMessage />
            )}
          </TabPanel>

          {/* SUBSYSTEM 2 */}
          <TabPanel value={tab} index={1}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {countS2} barridos guardados
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedS2Obj && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleDownloadSelectedS2CSV}
                    startIcon={<Download fontSize="small" />}
                  >
                    CSV
                  </Button>
                )}

              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {countS2 > 0 ? (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
                  <Select
                    labelId="s2-sweep-label"
                    value={selectedSweepS2}
                    label="Selecciona un barrido"
                    onChange={(e) => setSelectedSweepS2(e.target.value)}
                  >
                    {sweepsS2.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
                          s.metadata
                        )}°→${getExp2EndRoll(s.metadata)}°) • ${
                          s.datos?.length ?? 0
                        } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedS2Obj ? (
                  <>
                  
                    <DataTable
                      columns={SUBSYSTEM2_COLUMNS}
                      disableTooltips={true}
                      maxHeight="500px"
                      data={(selectedS2Obj.datos || []).map((d) => ({
                        [SUBSYSTEM2_COLUMNS[0]]: getExp2PitchMeasurement(d),
                        [SUBSYSTEM2_COLUMNS[1]]: getExp2RollMeasurement(d),
                        [SUBSYSTEM2_COLUMNS[2]]: d.voltage?.toFixed(2) ?? "0.00",
                        [SUBSYSTEM2_COLUMNS[3]]: d.current?.toFixed(2) ?? "0.00",
                        [SUBSYSTEM2_COLUMNS[4]]: d.efficiency !== undefined ? (d.efficiency * 100).toFixed(2) : "0.00",
                        [SUBSYSTEM2_COLUMNS[5]]: d.fillFactor !== undefined ? d.fillFactor.toFixed(4) : "0.0000",
                      }))}
                      onDelete={(index) => {
                        const dato = selectedS2Obj.datos[index];
                        if (dato && dato.timestamp) {
                          handleDeleteMeasurementS2(selectedS2Obj.id, dato.timestamp);
                        }
                      }}
                    />
                    
                  </>
                ) : (
                  <NoDataMessage />
                )}
              </>
            ) : (
              <NoDataMessage />
            )}
          </TabPanel>

          {/* SUBSYSTEM 3 */}
          <TabPanel value={tab} index={2}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h5">
                  {SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {countS3} mediciones guardadas
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedS3Obj && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleDownloadSelectedS3CSV}
                    startIcon={<Download fontSize="small" />}
                  >
                    CSV
                  </Button>
                )}

              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {countS3 > 0 ? (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="s3-measurement-label">Selecciona una medición</InputLabel>
                  <Select
                    labelId="s3-measurement-label"
                    value={selectedMeasurementS3}
                    label="Selecciona una medición"
                    onChange={(e) => setSelectedMeasurementS3(e.target.value)}
                  >
                    {measurementsS3.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {`🧼 ${m.angle ?? "?"}° • ${formatearFecha(m.timestamp)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedS3Obj ? (
                  <>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Medición seleccionada
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`Ángulo: ${selectedS3Obj.angle ?? "?"}° • ${formatearFecha(
                          selectedS3Obj.timestamp
                        )}`}
                      </Typography>
                    </Paper>

                    <TableContainer
                      component={Paper}
                      className={tableStyles.dataTableContainer}
                      sx={{
                        maxHeight: "500px",
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                        boxShadow: "none",
                      }}
                    >
                      <Table stickyHeader className={tableStyles.tableFit}>
                        <TableHead>
                          <TableRow>
                            {/* ✅ Mapeamos los títulos directamente desde Subsistema3Strings.jsx */}
                            {SUBSISTEMA3_COLUMNS.map((colString, index) => (
                              <TableCell key={index} className={tableStyles.tableHeader}>
                                {colString}
                              </TableCell>
                            ))}
                            {/* Columna de Actions */}
                            <TableCell className={tableStyles.tableHeader}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          <React.Fragment key={selectedS3Obj.id}>
                            <TableRow className={tableStyles.tableRow}>
                              <TableCell
                                className={tableStyles.tableCell}
                                rowSpan={2}
                                // sx={{ fontWeight: "bold" }}
                              >
                                {selectedS3Obj.angle ?? "—"}
                              </TableCell>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.Vo != null ? selectedS3Obj.Vo.toFixed(2) : "—"} <span style={{ color: '#f57c00', fontSize: '0.8em' }}>(Dirty)</span>
                              </TableCell>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.Io != null ? selectedS3Obj.Io.toFixed(2) : "—"}
                              </TableCell>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.Eo != null ? `${(selectedS3Obj.Eo * 100).toFixed(2)}%` : "—"}
                              </TableCell>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.FFo != null ? selectedS3Obj.FFo.toFixed(4) : "—"}
                              </TableCell>
                              <TableCell
                                className={tableStyles.tableCell}
                                rowSpan={2}
                              >
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteMeasurementS3(selectedS3Obj.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>

                            <TableRow className={tableStyles.tableRow}>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.Vf != null ? selectedS3Obj.Vf.toFixed(2) : "..."} <span style={{ color: '#4caf50', fontSize: '0.8em' }}>(Clean)</span>
                              </TableCell>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.If != null ? selectedS3Obj.If.toFixed(2) : "..."}
                              </TableCell>
                              <TableCell className={tableStyles.tableCell}>
                                {selectedS3Obj.Ef != null ? `${(selectedS3Obj.Ef * 100).toFixed(2)}%` : "..."}
                              </TableCell>
                              {/* ✅ CORRECCIÓN DE BORDE DERECHO: Usamos la clase forceRightBorder del CSS */}
                              <TableCell className={`${tableStyles.tableCell} ${tableStyles.forceRightBorder}`}>
                                {selectedS3Obj.FFf != null ? selectedS3Obj.FFf.toFixed(4) : "..."}
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <NoDataMessage />
                )}
              </>
            ) : (
              <NoDataMessage />
            )}
          </TabPanel>

          {/* SUBSYSTEM 4 */}
          <TabPanel value={tab} index={3}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h5">
                  {SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {countS4} mediciones guardadas
                </Typography>
              </Box>

            </Box>

            <Divider sx={{ my: 2 }} />

            {countS4 > 0 ? (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="s4-measurement-label">Selecciona una medición</InputLabel>
                  <Select
                    labelId="s4-measurement-label"
                    value={selectedMeasurementS4}
                    label="Selecciona una medición"
                    onChange={(e) => setSelectedMeasurementS4(e.target.value)}
                  >
                    {measurementsS4.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {`🧪 ${m.id} • ${m.integrationTime ?? "?"} ms • ${formatearFecha(
                          m.timestamp
                        )}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedS4Obj ? (
                  <>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Medición seleccionada
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`ID: ${selectedS4Obj.id} • Tiempo de integración: ${
                          selectedS4Obj.integrationTime ?? "?"
                        } ms • ${formatearFecha(selectedS4Obj.timestamp)}`}
                      </Typography>
                    </Paper>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="h6">Spectrometer Files</Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={handleDownloadSelectedS4CSV}
                          startIcon={<Download fontSize="small" />}
                        >
                          CSV
                        </Button>

                        <Tooltip title="Descargar archivo TXT de la medición" arrow>
                          <span>
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={handleDownloadTxtS4}
                              startIcon={<Download fontSize="small" />}
                            >
                              TXT
                            </Button>
                          </span>
                        </Tooltip>

                        <Tooltip title="Seleccionar y descargar gráficas" arrow>
                          <span>
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={handleMenuOpenS4}
                              startIcon={<CropFree fontSize="small" />}
                              endIcon={<ArrowDropDown fontSize="small" />}
                            >
                              IMG
                            </Button>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>

<TableContainer
                      component={Paper}
                      className={tableStyles.dataTableContainer}
                      sx={{
                        maxHeight: "400px",
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                        boxShadow: "none",
                      }}
                    >
                      <Table stickyHeader className={tableStyles.tableFit}>
                        <TableHead>
                          <TableRow>
                            {SUBSYSTEM4_COLUMNS.map((col, idx) => (
                              <TableCell key={idx} className={tableStyles.tableHeader}>
                                {col}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          <TableRow className={tableStyles.tableRow}>
                            <TableCell className={tableStyles.tableCell}>
                              {selectedS4Obj.integrationTime ?? "—"}
                            </TableCell>
                            <TableCell className={tableStyles.tableCell}>
                              {formatearFecha(selectedS4Obj.timestamp)}
                            </TableCell>
                            <TableCell className={tableStyles.tableCell}>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteMeasurementS4(selectedS4Obj.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <NoDataMessage />
                )}
              </>
            ) : (
              <NoDataMessage />
            )}

            <Menu
              anchorEl={anchorElS4}
              open={Boolean(anchorElS4)}
              onClose={handleMenuCloseS4}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ 
                sx: { 
                  borderRadius: "12px", mt: 1, minWidth: "220px", p: 1,
                  // ✅ Inyectar Poppins a los checkboxes de este menú
                  '& .MuiTypography-root, & .MuiFormControlLabel-label': { 
                    fontFamily: '"Poppins", sans-serif !important' 
                  }
                } 
              }}
            >
              <Box sx={{ px: 2, py: 1, outline: "none" }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: "bold" }}>
                  Select graphs to export
                </Typography>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAllSelectedS4}
                        onChange={handleSelectAllS4}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: "bold" }}>All Graphs</Typography>}
                  />
                  <Divider sx={{ my: 0.5 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={imageSelectionS4.completo}
                        onChange={() => handleCheckboxToggleS4("completo")}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Complete Spectrum</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={imageSelectionS4.uv}
                        onChange={() => handleCheckboxToggleS4("uv")}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">UV Spectrum</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={imageSelectionS4.visible}
                        onChange={() => handleCheckboxToggleS4("visible")}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Visible Spectrum</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={imageSelectionS4.nir}
                        onChange={() => handleCheckboxToggleS4("nir")}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">NIR Spectrum</Typography>}
                  />
                </FormGroup>

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handleDownloadImagesS4}
                  startIcon={<Download fontSize="small" />}
                >
                  Download
                </Button>
              </Box>
            </Menu>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Light Filters Efficiency
            </Typography>

            {latestEnvironmentDataS4 ? (
              <Grid container spacing={2}>
                {[
                  { label: "Reference", key: "referencia", color: "#9e9e9e" },
                  { label: "Yellow Filter", key: "filtroAmarillo", color: "#fbc02d" },
                  { label: "Blue Filter", key: "filtroAzul", color: "#1976d2" },
                  { label: "Red Filter", key: "filtroRojo", color: "#d32f2f" },
                ].map((panel) => (
                  <Grid item xs={12} sm={6} md={3} key={panel.key}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        textAlign: "center",
                        borderRadius: "15px",
                        border: "1px solid #eee",
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        {panel.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", color: panel.color, my: 1 }}
                      >
                        {latestEnvironmentDataS4?.[panel.key] ?? 0}%
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.disabled" }}>
                        Relative Power
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <NoDataMessage />
            )}
          </TabPanel>

          {/* EXPORT */}
          <TabPanel value={tab} index={4}>
            <Typography variant="h5" gutterBottom>
              Exportar datos seleccionados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona los subsistemas y los registros que deseas descargar.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSystems.subsistema1}
                    onChange={handleSystemCheckboxChange}
                    name="subsistema1"
                  />
                }
                label="Subsystem 1"
              />

              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                <InputLabel id="multi-s1-label">Barridos de Subsystem 1</InputLabel>
                <Select
                  labelId="multi-s1-label"
                  multiple
                  value={selectedSweepsS1}
                  onChange={(e) => setSelectedSweepsS1(e.target.value)}
                  input={<OutlinedInput label="Barridos de Subsystem 1" />}
                  renderValue={(selected) =>
                    selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
                  }
                  MenuProps={menuProps}
                >
                  {sweepsS1.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      <Checkbox checked={selectedSweepsS1.includes(s.id)} />
                      <ListItemText
                        primary={`${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}°`}
                        secondary={`${s.datos?.length ?? 0} mediciones`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSystems.subsistema2}
                    onChange={handleSystemCheckboxChange}
                    name="subsistema2"
                  />
                }
                label="Subsystem 2"
              />

              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                <InputLabel id="multi-s2-label">Barridos de Subsystem 2</InputLabel>
                <Select
                  labelId="multi-s2-label"
                  multiple
                  value={selectedSweepsS2}
                  onChange={(e) => setSelectedSweepsS2(e.target.value)}
                  input={<OutlinedInput label="Barridos de Subsystem 2" />}
                  renderValue={(selected) =>
                    selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
                  }
                  MenuProps={menuProps}
                >
                  {sweepsS2.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      <Checkbox checked={selectedSweepsS2.includes(s.id)} />
                      <ListItemText
                        primary={`Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
                          s.metadata
                        )}°→${getExp2EndRoll(s.metadata)}°)`}
                        secondary={`${s.datos?.length ?? 0} mediciones`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSystems.subsistema3}
                    onChange={handleSystemCheckboxChange}
                    name="subsistema3"
                  />
                }
                label="Subsystem 3"
              />

              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                <InputLabel id="multi-s3-label">Mediciones de Subsystem 3</InputLabel>
                <Select
                  labelId="multi-s3-label"
                  multiple
                  value={selectedMeasurementsS3}
                  onChange={(e) => setSelectedMeasurementsS3(e.target.value)}
                  input={<OutlinedInput label="Mediciones de Subsystem 3" />}
                  renderValue={(selected) =>
                    selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
                  }
                  MenuProps={menuProps}
                >
                  {measurementsS3.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      <Checkbox checked={selectedMeasurementsS3.includes(m.id)} />
                      <ListItemText
                        primary={`Ángulo ${m.angle ?? "?"}°`}
                        secondary={formatearFecha(m.timestamp)}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSystems.subsistema4}
                    onChange={handleSystemCheckboxChange}
                    name="subsistema4"
                  />
                }
                label="Subsystem 4"
              />

              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                <InputLabel id="multi-s4-label">Mediciones de Subsystem 4</InputLabel>
                <Select
                  labelId="multi-s4-label"
                  multiple
                  value={selectedMeasurementsS4}
                  onChange={(e) => setSelectedMeasurementsS4(e.target.value)}
                  input={<OutlinedInput label="Mediciones de Subsystem 4" />}
                  renderValue={(selected) =>
                    selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
                  }
                  MenuProps={menuProps}
                >
                  {measurementsS4.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      <Checkbox checked={selectedMeasurementsS4.includes(m.id)} />
                      <ListItemText
                        primary={`${m.id}`}
                        secondary={`${m.integrationTime ?? "?"} ms`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeFiltersS4}
                    onChange={(e) => setIncludeFiltersS4(e.target.checked)}
                  />
                }
                label="Incluir también Light Filters Efficiency de Subsystem 4"
              />
            </Paper>

            <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
                📥 {DOWNLOAD_BUTTON}
              </Button>

              <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
                {BACK_BUTTON}
              </Button>
            </Box>

            {selectedSweepsS1.length === 0 &&
              selectedSweepsS2.length === 0 &&
              selectedMeasurementsS3.length === 0 &&
              selectedMeasurementsS4.length === 0 && (
                <Box sx={{ mt: 2 }}>
                  <NoDataMessage />
                </Box>
              )}
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
};

export default DataSummary;