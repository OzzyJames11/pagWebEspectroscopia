/*import React, { useState, useEffect } from 'react';
import { Box, FormControlLabel, Checkbox, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/Elements/DataTable.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { PAGE_TITLES, ALERT_MESSAGES, SUBSYSTEM_TITLES } from '../../assets/Strings/Experiments/DataSummaryStrings.jsx';
import { SUBSISTEMA1_COLUMNS } from '../../assets/Strings/Experiments/Subsistema1Strings.jsx';
import { SUBSISTEMA2_COLUMNS } from '../../assets/Strings/Experiments/Subsistema2Strings.jsx';

// Importar otros componentes
import Button from '../../components/Elements/Button.jsx';
import { generateCSV } from '../../components/Elements/generateCSV.jsx';

const DataSummary = () => {
    const navigate = useNavigate();
    const {MAIN_TITLE, DESCRIPTION, DOWNLOAD_BUTTON, CLEAR_BUTTON, NO_DATA_MESSAGE, SELECT_SUBSYSTEMS, BACK_BUTTON} = PAGE_TITLES;
   
    // Estados para datos
    const [datosSubsistema1, setDatosSubsistema1] = useState([]);
    const [datosSubsistema2, setDatosSubsistema2] = useState([]);
    const [datosSubsistema3, setDatosSubsistema3] = useState([]);
    const [datosSubsistema4, setDatosSubsistema4] = useState([]);
    const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
   
    const [selectedSystems, setSelectedSystems] = useState({
        subsistema1: true,
        subsistema2: true,
        subsistema3: true,
        subsistema4: true
    });

    // Cargar datos al iniciar
    useEffect(() => {
        cargarTodosLosDatos();
    }, []);

    const cargarTodosLosDatos = () => {
        // Cargar datos tradicionales
        const datos1 = JSON.parse(localStorage.getItem("historicalData_subsistema1")) || [];
        const datos2 = JSON.parse(localStorage.getItem("historicalData_subsistema2")) || [];
        const datos3 = JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
        const datos4 = JSON.parse(localStorage.getItem("historicalData_subsistema4")) || [];
       
        setDatosSubsistema1(datos1);
        setDatosSubsistema2(datos2);
        setDatosSubsistema3(datos3);
        setDatosSubsistema4(datos4);

        // Cargar datos de barridos
        const barridos = obtenerBarridosDeLocalStorage();
        setBarridosSubsistema1(barridos.subsistema1);
    };

    // Función para obtener barridos de localStorage
    // ✅ CORREGIR COMPLETAMENTE:
    const obtenerBarridosDeLocalStorage = () => {
    const barridos = {
        subsistema1: {},
        subsistema2: {},
        subsistema3: {},
        subsistema4: {}
    };
   
    console.log("🔍 Buscando barridos en localStorage...");
   
    // ⭐ CORRECCIÓN: Recolectar todas las keys primero
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allKeys.push(key);
    }
   
    console.log(`📦 Total de items en localStorage: ${allKeys.length}`);
   
    // Buscar keys de barridos del Subsistema 1
    const sweepKeys = allKeys.filter(key =>
        key.includes("historicalData_subsistema1") &&
        key.includes("sweep_")
    );
   
    console.log(`🎯 Barridos encontrados: ${sweepKeys.length}`, sweepKeys);
   
    sweepKeys.forEach(key => {
        try {
        const datosBarrido = JSON.parse(localStorage.getItem(key));
       
        // Extraer sweepId de forma robusta
        let sweepId;
        if (key.startsWith("historicalData_subsistema1_sweep_")) {
            sweepId = key.replace("historicalData_subsistema1_", "");
        } else {
            // Fallback: buscar el último número (timestamp)
            const parts = key.split("_");
            const timestamp = parts[parts.length - 1];
            sweepId = `sweep_${timestamp}`;
        }
       
        // Asegurar formato correcto
        if (!sweepId.startsWith("sweep_")) {
            sweepId = `sweep_${sweepId}`;
        }
       
        console.log(`📊 Procesando barrido: ${sweepId}`);
       
        // Buscar metadata
        const metadataKey = `sweep_metadata_${sweepId}`;
        const metadataString = localStorage.getItem(metadataKey);
       
        let metadata;
        if (metadataString) {
            metadata = JSON.parse(metadataString);
            console.log(`✅ Metadata encontrada para ${sweepId}:`, metadata);
        } else {
            // Crear metadata por defecto si no existe
            metadata = {
            sweepId: sweepId,
            startAngle: "N/A",
            endAngle: "N/A",
            timestamp: sweepId.replace("sweep_", ""),
            totalMeasurements: datosBarrido?.length || 0
            };
            console.log(`⚠️ Metadata no encontrada, usando valores por defecto`);
        }
       
        // Guardar barrido con metadata
        barridos.subsistema1[sweepId] = {
            metadata: {
              ...metadata,
              ...(datosBarrido.metadata || {}), // Combina metadatos guardados en Subsistema1
            },
            datos: Array.isArray(datosBarrido)
              ? datosBarrido
              : Array.isArray(datosBarrido?.data)
              ? datosBarrido.data
              : [],
        };
       
        } catch (error) {
        console.error(`❌ Error procesando barrido ${key}:`, error);
        }
    });
   
    console.log(`✅ Total de barridos procesados: ${Object.keys(barridos.subsistema1).length}`);
    return barridos;
    };

    // Función para limpiar datos

    const handleClearData = (subsistema) => {
    const confirmar = window.confirm(
        `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\n` +
        `Esta acción no se puede deshacer.`
    );
   
    if (!confirmar) return;
   
    console.log(`🗑️ Eliminando datos de ${subsistema}...`);
   
    // Variable para contar total de eliminaciones
    let totalEliminado = 0;
   
    // Eliminar datos tradicionales
    localStorage.removeItem(`historicalData_${subsistema}`);
    totalEliminado++;
    console.log(`✅ Datos tradicionales eliminados`);
   
    // Eliminar datos de barridos
    if (subsistema === "subsistema1") {
        const keysToDelete = [];
       
        for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith("historicalData_subsistema1_sweep_") ||
            key.startsWith("sweep_metadata_sweep_")
        )) {
            keysToDelete.push(key);
        }
        }
       
        console.log(`📦 Keys de barridos a eliminar: ${keysToDelete.length}`);
       
        // Eliminar de forma segura
        let eliminados = 0;
        keysToDelete.forEach(key => {
        try {
            localStorage.removeItem(key);
            eliminados++;
        } catch (error) {
            console.error(`Error al eliminar ${key}:`, error);
        }
        });
       
        console.log(`✅ Eliminados ${eliminados} items de barridos`);
        totalEliminado += eliminados;
        setBarridosSubsistema1({});
    }
   
    // Actualizar estados
    switch (subsistema) {
        case "subsistema1":
        setDatosSubsistema1([]);
        break;
        case "subsistema2":
        setDatosSubsistema2([]);
        break;
        case "subsistema3":
        setDatosSubsistema3([]);
        break;
        case "subsistema4":
        setDatosSubsistema4([]);
        break;
        default:
        break;
    }
   
    alert(
        `✅ Datos del ${subsistema} eliminados correctamente.\n\n` +
        `Total eliminado: ${totalEliminado} archivo(s)`
    );
   
    // Recargar datos para actualizar UI
    cargarTodosLosDatos();
    };

    const handleCheckboxChange = (event) => {
        setSelectedSystems({
            ...selectedSystems,
            [event.target.name]: event.target.checked
        });
    };

    const handleDownloadCSV = () => {
        const selectedData = [
            {
                title: SUBSYSTEM_TITLES.SUBSYSTEM1,
                data: [
                    ...datosSubsistema1,
                    ...Object.values(barridosSubsistema1).flatMap(barrido => barrido.datos)
                ],
                key: "subsistema1"
            },
            { title: SUBSYSTEM_TITLES.SUBSYSTEM2, data: datosSubsistema2, key: "subsistema2" },
            { title: SUBSYSTEM_TITLES.SUBSYSTEM3, data: datosSubsistema3, key: "subsistema3" },
            { title: SUBSYSTEM_TITLES.SUBSYSTEM4, data: datosSubsistema4, key: "subsistema4" }
        ].filter(({ key }) => selectedSystems[key]);

        if (selectedData.length === 0) {
            alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
            return;
        }

        // Mapa de columnas para cada subsistema
        const columnsMap = {
            subsistema1: SUBSISTEMA1_COLUMNS,
            subsistema2: SUBSISTEMA2_COLUMNS,
            subsistema3: ["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"],
            subsistema4: ["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]
        };

        // Generar el contenido del CSV
        const csvContent = generateCSV(selectedData, columnsMap);

        // Descargar el archivo CSV
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `data_summary_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };

    const NoDataMessage = () => (
        <Typography variant="body1" align="center" sx={{ p: 3, color: 'text.secondary' }}>
            {NO_DATA_MESSAGE}
        </Typography>
    );

    // Función para formatear fecha
    const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
   
    try {
        // Intentar parsear como número
        const timestampNum = typeof timestamp === 'string'
        ? parseInt(timestamp)
        : timestamp;
       
        const date = new Date(timestampNum);
       
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
        return "Fecha inválida";
        }
       
        // Formatear con opciones detalladas
        return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        });
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return "Error en fecha";
    }
    };

    // Render
    return (
        <div>
            <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
                <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
                <Typography variant="body1" gutterBottom> {DESCRIPTION}</Typography>
               
                
                <Box mt={4}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        {SUBSYSTEM_TITLES.SUBSYSTEM1}
                        <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                            ({Object.keys(barridosSubsistema1).length} barridos guardados)
                        </Typography>
                    </Typography>
                   
                    
                    {Object.keys(barridosSubsistema1).length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                📊 Barridos Automáticos Guardados
                            </Typography>
                            {Object.entries(barridosSubsistema1).map(([sweepId, barrido]) => (
                                <Accordion key={sweepId} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>
                                            🎯 Barrido: {barrido.metadata.startAngle}° a {barrido.metadata.endAngle}°
                                            ({barrido.datos.length} mediciones) -
                                            {formatearFecha(barrido.metadata.timestamp)}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <DataTable
                                            columns={SUBSISTEMA1_COLUMNS}
                                            data={barrido.datos}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    )}
                   
                    
                    {datosSubsistema1.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                📋 Mediciones Tradicionales
                            </Typography>
                            <DataTable columns={SUBSISTEMA1_COLUMNS} data={datosSubsistema1} />
                        </>
                    ) : Object.keys(barridosSubsistema1).length === 0 ? (
                        <NoDataMessage />
                    ) : null}
                   
                    {(datosSubsistema1.length > 0 || Object.keys(barridosSubsistema1).length > 0) && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleClearData("subsistema1")}
                            align="right"
                            marginTop={1}
                        >
                            🗑️ {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                
                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
                    {datosSubsistema2.length > 0 ? (
                        <DataTable columns={SUBSISTEMA2_COLUMNS} data={datosSubsistema2} />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema2.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema2")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM3}</Typography>
                    {datosSubsistema3.length > 0 ? (
                        <DataTable
                            columns={["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]}
                            data={datosSubsistema3.map(dato => ({
                                "Angle (°)": dato.angulo,
                                "Voltage": dato.voltaje,
                                "Current": dato.corriente,
                                "Efficiency": dato.eficiencia,
                                "Fill Factor": dato.factorLlenado
                            }))}
                        />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema3.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema3")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM4}</Typography>
                    {datosSubsistema4.length > 0 ? (
                        <DataTable
                            columns={["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]}
                            data={datosSubsistema4.map(dato => ({
                                "Angle (°)": dato.angulo,
                                "Voltage": dato.voltaje,
                                "Current": dato.corriente,
                                "Efficiency": dato.eficiencia,
                                "Fill Factor": dato.factorLlenado
                            }))}
                        />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema4.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema4")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                
                <Box mt={4} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>{SELECT_SUBSYSTEMS}</Typography>
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema1} onChange={handleCheckboxChange} name="subsistema1" />}
                        label={`${SUBSYSTEM_TITLES.SUBSYSTEM1} (${datosSubsistema1.length + Object.values(barridosSubsistema1).reduce((total, barrido) => total + barrido.datos.length, 0)} mediciones)`}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema2} onChange={handleCheckboxChange} name="subsistema2" />}
                        label={`${SUBSYSTEM_TITLES.SUBSYSTEM2} (${datosSubsistema2.length} mediciones)`}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema3} onChange={handleCheckboxChange} name="subsistema3" />}
                        label={`${SUBSYSTEM_TITLES.SUBSYSTEM3} (${datosSubsistema3.length} mediciones)`}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema4} onChange={handleCheckboxChange} name="subsistema4" />}
                        label={`${SUBSYSTEM_TITLES.SUBSYSTEM4} (${datosSubsistema4.length} mediciones)`}
                    />
                </Box>

                {
                {(datosSubsistema1.length > 0 || datosSubsistema2.length > 0 || datosSubsistema3.length > 0 || datosSubsistema4.length > 0) && (
                    <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="right" marginTop={2}>
                        📥 {DOWNLOAD_BUTTON}
                    </Button>
                )}
               
                <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4} >
                    {BACK_BUTTON}
                </Button>
            </Box>
        </div>
    );
};

export default DataSummary;*/













//Nueva version
/*
import React, { useState, useEffect } from 'react';
import { Box, FormControlLabel, Checkbox, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/Elements/DataTable.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { PAGE_TITLES, ALERT_MESSAGES, SUBSYSTEM_TITLES } from '../../assets/Strings/Experiments/DataSummaryStrings.jsx';
import { SUBSISTEMA1_COLUMNS } from '../../assets/Strings/Experiments/Subsistema1Strings.jsx';
import { SUBSISTEMA2_COLUMNS } from '../../assets/Strings/Experiments/Subsistema2Strings.jsx';

import Button from '../../components/Elements/Button.jsx';
import { generateCSV } from '../../components/Elements/generateCSV.jsx';

const DataSummary = () => {
  const navigate = useNavigate();
  const {
    MAIN_TITLE,
    DESCRIPTION,
    DOWNLOAD_BUTTON,
    CLEAR_BUTTON,
    NO_DATA_MESSAGE,
    SELECT_SUBSYSTEMS,
    BACK_BUTTON
  } = PAGE_TITLES;

  // ====================== ESTADOS ======================
  const [datosSubsistema1, setDatosSubsistema1] = useState([]);
  const [datosSubsistema2, setDatosSubsistema2] = useState([]);
  const [datosSubsistema3, setDatosSubsistema3] = useState([]);
  const [datosSubsistema4, setDatosSubsistema4] = useState([]);
  const [barridosSubsistema1, setBarridosSubsistema1] = useState({});

  const [selectedSystems, setSelectedSystems] = useState({
    subsistema1: true,
    subsistema2: true,
    subsistema3: true,
    subsistema4: true
  });

  // ====================== CARGA INICIAL ======================
  useEffect(() => {
    cargarTodosLosDatos();
  }, []);

  const cargarTodosLosDatos = () => {
    const datos1 = JSON.parse(localStorage.getItem("historicalData_subsistema1")) || [];
    const datos2 = JSON.parse(localStorage.getItem("historicalData_subsistema2")) || [];
    const datos3 = JSON.parse(localStorage.getItem("historicalData_subsistema3")) || [];
    const datos4 = JSON.parse(localStorage.getItem("historicalData_subsistema4")) || [];

    setDatosSubsistema1(datos1);
    setDatosSubsistema2(datos2);
    setDatosSubsistema3(datos3);
    setDatosSubsistema4(datos4);

    const barridos = obtenerBarridosDeLocalStorage();
    setBarridosSubsistema1(barridos.subsistema1);
  };

  // ====================== FUNCIÓN DE BARRIDOS ======================
  const obtenerBarridosDeLocalStorage = () => {
    const barridos = {
      subsistema1: {},
      subsistema2: {},
      subsistema3: {},
      subsistema4: {}
    };

    console.log("🔍 Buscando barridos en localStorage...");

    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    console.log(`📦 Total de items en localStorage: ${allKeys.length}`);

    const sweepKeys = allKeys.filter(key =>
      key.includes("historicalData_subsistema1") && key.includes("sweep_")
    );

    console.log(`🎯 Barridos encontrados: ${sweepKeys.length}`, sweepKeys);

    sweepKeys.forEach(key => {
      try {
        const rawItem = localStorage.getItem(key);
        if (!rawItem) return;

        const parsed = JSON.parse(rawItem);
        const sweepId = key.replace("historicalData_subsistema1_", "");

        const datos = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.data)
          ? parsed.data
          : [];

        const metadata = parsed?.metadata || {
          sweepId,
          startAngle: datos[0]?.angle ?? "N/A",
          endAngle: datos[datos.length - 1]?.angle ?? "N/A",
          timestamp: sweepId.replace("sweep_", ""),
          totalMeasurements: datos.length
        };

        barridos.subsistema1[sweepId] = { metadata, datos };
      } catch (error) {
        console.error(`❌ Error procesando barrido ${key}:`, error);
      }
    });

    console.log(`✅ Total de barridos procesados: ${Object.keys(barridos.subsistema1).length}`);
    return barridos;
  };

  // ====================== LIMPIAR DATOS ======================
  const handleClearData = (subsistema) => {
    const confirmar = window.confirm(
      `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    console.log(`🗑️ Eliminando datos de ${subsistema}...`);
    let totalEliminado = 0;

    localStorage.removeItem(`historicalData_${subsistema}`);
    totalEliminado++;

    if (subsistema === "subsistema1") {
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith("historicalData_subsistema1_sweep_") ||
          key.startsWith("sweep_metadata_sweep_")
        )) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        try {
          localStorage.removeItem(key);
          totalEliminado++;
        } catch (error) {
          console.error(`Error al eliminar ${key}:`, error);
        }
      });
      setBarridosSubsistema1({});
    }

    switch (subsistema) {
      case "subsistema1": setDatosSubsistema1([]); break;
      case "subsistema2": setDatosSubsistema2([]); break;
      case "subsistema3": setDatosSubsistema3([]); break;
      case "subsistema4": setDatosSubsistema4([]); break;
      default: break;
    }

    alert(`✅ Datos del ${subsistema} eliminados correctamente.\n\nTotal eliminado: ${totalEliminado} archivo(s)`);
    cargarTodosLosDatos();
  };

  // ====================== UTILIDADES ======================
  const handleCheckboxChange = (event) => {
    setSelectedSystems({
      ...selectedSystems,
      [event.target.name]: event.target.checked
    });
  };

  const handleDownloadCSV = () => {
    const selectedData = [
      {
        title: SUBSYSTEM_TITLES.SUBSYSTEM1,
        data: [
          ...datosSubsistema1,
          ...Object.values(barridosSubsistema1).flatMap(barrido => barrido.datos)
        ],
        key: "subsistema1"
      },
      { title: SUBSYSTEM_TITLES.SUBSYSTEM2, data: datosSubsistema2, key: "subsistema2" },
      { title: SUBSYSTEM_TITLES.SUBSYSTEM3, data: datosSubsistema3, key: "subsistema3" },
      { title: SUBSYSTEM_TITLES.SUBSYSTEM4, data: datosSubsistema4, key: "subsistema4" }
    ].filter(({ key }) => selectedSystems[key]);

    if (selectedData.length === 0) {
      alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
      return;
    }

    const columnsMap = {
      subsistema1: SUBSISTEMA1_COLUMNS,
      subsistema2: SUBSISTEMA2_COLUMNS,
      subsistema3: ["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"],
      subsistema4: ["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]
    };

    const csvContent = generateCSV(selectedData, columnsMap);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => navigate('/experiments/experimentChooser');

  const NoDataMessage = () => (
    <Typography variant="body1" align="center" sx={{ p: 3, color: 'text.secondary' }}>
      {NO_DATA_MESSAGE}
    </Typography>
  );

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    try {
      const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      const date = new Date(ts);
      return isNaN(date.getTime())
        ? "Fecha inválida"
        : date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  // ====================== RENDER ======================
  return (
    <div>
      <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
        <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
        <Typography variant="body1" gutterBottom>{DESCRIPTION}</Typography>
*/
        {/* SUBSISTEMA 1 */}
      /*  <Box mt={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            {SUBSYSTEM_TITLES.SUBSYSTEM1}
            <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
              ({Object.keys(barridosSubsistema1).length} barridos guardados)
            </Typography>
          </Typography>

          {Object.keys(barridosSubsistema1).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                📊 Barridos Automáticos Guardados
              </Typography>
              {Object.entries(barridosSubsistema1).map(([sweepId, barrido]) => (
                <Accordion key={sweepId} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      🎯 Barrido: {barrido.metadata.startAngle}° a {barrido.metadata.endAngle}°
                      ({barrido.datos.length} mediciones) – {formatearFecha(barrido.metadata.timestamp)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DataTable
                      columns={SUBSISTEMA1_COLUMNS}
                      data={barrido.datos.map(d => ({
                        "Angle (°)": d.angle,
                        "Voltage": d.voltage?.toFixed(2),
                        "Current": d.current?.toFixed(2),
                        "Efficiency": ((d.voltage * d.current) / 100).toFixed(2),
                        "Fill Factor": "—"
                      }))}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {datosSubsistema1.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>📋 Mediciones Tradicionales</Typography>
              <DataTable columns={SUBSISTEMA1_COLUMNS} data={datosSubsistema1} />
            </>
          ) : Object.keys(barridosSubsistema1).length === 0 ? (
            <NoDataMessage />
          ) : null}

          {(datosSubsistema1.length > 0 || Object.keys(barridosSubsistema1).length > 0) && (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleClearData("subsistema1")}
              align="right"
              marginTop={1}
            >
              🗑️ {CLEAR_BUTTON}
            </Button>
          )}
        </Box>

        <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
          {BACK_BUTTON}
        </Button>
      </Box>
    </div>
  );
};

export default DataSummary;
*/
















//Usuarios
/*
import React, { useState, useEffect } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ AGREGADO
import DataTable from '../../components/Elements/DataTable.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { PAGE_TITLES, SUBSYSTEM_TITLES } from '../../assets/Strings/Experiments/DataSummaryStrings.jsx';
import { SUBSISTEMA1_COLUMNS } from '../../assets/Strings/Experiments/Subsistema1Strings.jsx';
import { SUBSISTEMA2_COLUMNS } from '../../assets/Strings/Experiments/Subsistema2Strings.jsx';

import Button from '../../components/Elements/Button.jsx';
import { generateCSV } from '../../components/Elements/generateCSV.jsx';

// ✅ FIREBASE IMPORTS
import { getDatabase, ref, onValue, remove } from "firebase/database";
import app from "../../firebaseConfig.js";

const DataSummary = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  // ✅ OBTENER UID DEL USUARIO LOGEADO
  const user = useSelector((state) => state.auth.user);
  const userId = user?.uid;

  const {
    MAIN_TITLE,
    DESCRIPTION,
    DOWNLOAD_BUTTON,
    CLEAR_BUTTON,
    NO_DATA_MESSAGE,
    BACK_BUTTON
  } = PAGE_TITLES;

  const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
  const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedSystems, setSelectedSystems] = useState({
    subsistema1: true,
    subsistema2: true,
  });

  // ✅ VERIFICAR LOGIN
  useEffect(() => {
    if (!userId) {
      alert("Debes iniciar sesión para ver tus datos");
      navigate("/login");
    }
  }, [userId, navigate]);

  // ✅ CARGAR DATOS DESDE FIREBASE
  useEffect(() => {
    if (!userId) return;

    console.log(`🔍 Cargando datos para usuario: ${userId}`);
    cargarDatosDesdeFirebase();
  }, [userId]);

  const cargarDatosDesdeFirebase = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // ✅ CARGAR BARRIDOS EXP1
      const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
      onValue(exp1SweepsRef, (snapshot) => {
        if (snapshot.exists()) {
          const sweeps = snapshot.val();
          console.log("📊 Barridos Exp1 encontrados:", Object.keys(sweeps).length);
          
          const sweepsWithData = {};
          
          Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
            sweepsWithData[sweepId] = {
              metadata: sweepMeta,
              datos: []
            };
          });

          // Cargar mediciones
          const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
          onValue(exp1MeasurementsRef, (measSnap) => {
            if (measSnap.exists()) {
              const measurements = measSnap.val();
              
              Object.values(measurements).forEach((meas) => {
                if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
                  sweepsWithData[meas.sweepId].datos.push(meas);
                }
              });

              // Ordenar mediciones por timestamp
              Object.keys(sweepsWithData).forEach(sweepId => {
                sweepsWithData[sweepId].datos.sort((a, b) => a.timestamp - b.timestamp);
              });

              setBarridosSubsistema1(sweepsWithData);
              console.log(`✅ Exp1: ${Object.keys(sweepsWithData).length} barridos cargados`);
            }
          }, { onlyOnce: true });

        } else {
          console.log("ℹ️ No hay barridos guardados en Exp1");
          setBarridosSubsistema1({});
        }
      }, { onlyOnce: true });

      // ✅ CARGAR BARRIDOS EXP2
      const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
      onValue(exp2SweepsRef, (snapshot) => {
        if (snapshot.exists()) {
          const sweeps = snapshot.val();
          console.log("📊 Barridos Exp2 encontrados:", Object.keys(sweeps).length);
          
          const sweepsWithData = {};
          
          Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
            sweepsWithData[sweepId] = {
              metadata: sweepMeta,
              datos: []
            };
          });

          // Cargar mediciones
          const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
          onValue(exp2MeasurementsRef, (measSnap) => {
            if (measSnap.exists()) {
              const measurements = measSnap.val();
              
              Object.values(measurements).forEach((meas) => {
                if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
                  sweepsWithData[meas.sweepId].datos.push(meas);
                }
              });

              // Ordenar mediciones por timestamp
              Object.keys(sweepsWithData).forEach(sweepId => {
                sweepsWithData[sweepId].datos.sort((a, b) => a.timestamp - b.timestamp);
              });

              setBarridosSubsistema2(sweepsWithData);
              console.log(`✅ Exp2: ${Object.keys(sweepsWithData).length} barridos cargados`);
            }
          }, { onlyOnce: true });

        } else {
          console.log("ℹ️ No hay barridos guardados en Exp2");
          setBarridosSubsistema2({});
        }
        
        setLoading(false);
      }, { onlyOnce: true });

    } catch (error) {
      console.error("❌ Error al cargar datos desde Firebase:", error);
      setLoading(false);
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
        alert(`✅ Datos del ${subsistema} eliminados correctamente`);
      }

      if (subsistema === "subsistema2") {
        await remove(ref(db, `users/${userId}/Exp2/sweeps`));
        await remove(ref(db, `users/${userId}/Exp2/measurements`));
        setBarridosSubsistema2({});
        alert(`✅ Datos del ${subsistema} eliminados correctamente`);
      }

      cargarDatosDesdeFirebase();
    } catch (error) {
      console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
      alert(`Error al eliminar datos: ${error.message}`);
    }
  };

  const handleCheckboxChange = (event) => {
    setSelectedSystems({
      ...selectedSystems,
      [event.target.name]: event.target.checked
    });
  };

  const handleDownloadCSV = () => {
    const selectedData = [
      {
        title: SUBSYSTEM_TITLES.SUBSYSTEM1,
        data: Object.values(barridosSubsistema1).flatMap(barrido => barrido.datos),
        key: "subsistema1"
      },
      {
        title: SUBSYSTEM_TITLES.SUBSYSTEM2,
        data: Object.values(barridosSubsistema2).flatMap(barrido => barrido.datos),
        key: "subsistema2"
      },
    ].filter(({ key }) => selectedSystems[key]);

    if (selectedData.length === 0) {
      alert("Selecciona al menos un subsistema");
      return;
    }

    const columnsMap = {
      subsistema1: SUBSISTEMA1_COLUMNS,
      subsistema2: SUBSISTEMA2_COLUMNS,
    };

    const csvContent = generateCSV(selectedData, columnsMap);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => navigate('/experiments/experimentChooser');

  const NoDataMessage = () => (
    <Typography variant="body1" align="center" sx={{ p: 3, color: 'text.secondary' }}>
      {NO_DATA_MESSAGE}
    </Typography>
  );

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    try {
      const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      const date = new Date(ts);
      return isNaN(date.getTime())
        ? "Fecha inválida"
        : date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  if (!userId) {
    return <Typography>Cargando...</Typography>;
  }

  if (loading) {
    return (
      <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
        <Typography variant="h4" gutterBottom>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
        <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
        <Typography variant="body1" gutterBottom>{DESCRIPTION}</Typography>
*/
        {/* SUBSISTEMA 1 */}
      /*  <Box mt={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            {SUBSYSTEM_TITLES.SUBSYSTEM1}
            <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
              ({Object.keys(barridosSubsistema1).length} barridos guardados)
            </Typography>
          </Typography>

          {Object.keys(barridosSubsistema1).length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                📊 Barridos Automáticos Guardados
              </Typography>
              {Object.entries(barridosSubsistema1).map(([sweepId, barrido]) => (
                <Accordion key={sweepId} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      🎯 Barrido: {barrido.metadata.startAngle}° a {barrido.metadata.endAngle}°
                      ({barrido.datos.length} mediciones) – {formatearFecha(barrido.metadata.timestamp)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DataTable
                      columns={SUBSISTEMA1_COLUMNS}
                      data={barrido.datos.map(d => ({
                        "Angle (°)": d.angle,
                        "Voltage": d.voltage?.toFixed(2),
                        "Current": d.current?.toFixed(2),
                        "Efficiency": ((d.voltage * d.current) / 100).toFixed(2),
                        "Fill Factor": "—"
                      }))}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <NoDataMessage />
          )}

          {Object.keys(barridosSubsistema1).length > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleClearData("subsistema1")}
              align="right"
              marginTop={1}
            >
              🗑️ {CLEAR_BUTTON}
            </Button>
          )}
        </Box>
*/
        {/* SUBSISTEMA 2 */}
       /* <Box mt={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            {SUBSYSTEM_TITLES.SUBSYSTEM2}
            <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
              ({Object.keys(barridosSubsistema2).length} barridos guardados)
            </Typography>
          </Typography>

          {Object.keys(barridosSubsistema2).length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                📊 Barridos Automáticos Guardados
              </Typography>
              {Object.entries(barridosSubsistema2).map(([sweepId, barrido]) => (
                <Accordion key={sweepId} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      🎯 Barrido: Az({barrido.metadata.azimuthStart}° a {barrido.metadata.azimuthEnd}°) 
                      Ze({barrido.metadata.zenithStart}° a {barrido.metadata.zenithEnd}°)
                      ({barrido.datos.length} mediciones) – {formatearFecha(barrido.metadata.timestamp)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DataTable
                      columns={SUBSISTEMA2_COLUMNS}
                      data={barrido.datos.map(d => ({
                        "Zenith Angle (°)": d.rollAngle,
                        "Azimuth Angle (°)": d.pitchAngle,
                        "Voltage": d.voltage?.toFixed(2),
                        "Current": d.current?.toFixed(2),
                        "Efficiency": ((d.voltage * d.current) / 100).toFixed(2),
                        "Fill Factor": "—"
                      }))}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <NoDataMessage />
          )}

          {Object.keys(barridosSubsistema2).length > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleClearData("subsistema2")}
              align="right"
              marginTop={1}
            >
              🗑️ {CLEAR_BUTTON}
            </Button>
          )}
        </Box>

        {(Object.keys(barridosSubsistema1).length > 0 || Object.keys(barridosSubsistema2).length > 0) && (
          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadCSV}
              align="center"
            >
              📥 {DOWNLOAD_BUTTON}
            </Button>
          </Box>
        )}

        <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
          {BACK_BUTTON}
        </Button>
      </Box>
    </div>
  );
};

export default DataSummary;*/
































//Usuarios final
/*
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import DataTable from "../../components/Elements/DataTable.jsx";
import Button from "../../components/Elements/Button.jsx";
import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// ✅ FIREBASE IMPORTS
import { getDatabase, ref, onValue, remove } from "firebase/database";
import app from "../../firebaseConfig.js";

import {
  PAGE_TITLES,
  ALERT_MESSAGES,
  SUBSYSTEM_TITLES,
} from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
import { SUBSISTEMA2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";
*/
/** Simple TabPanel helper */
/*
function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return (
    <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
      {children}
    </Box>
  );
}

const DataSummary = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  // ✅ OBTENER UID DEL USUARIO LOGEADO
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

  // ====================== ESTADOS ======================
  const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
  const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ pestañas: 0 = subsistema1, 1 = subsistema2, 2 = exportar
  const [tab, setTab] = useState(0);

  // ✅ selector de barrido (mostrar uno a la vez)
  const [selectedSweepS1, setSelectedSweepS1] = useState("");
  const [selectedSweepS2, setSelectedSweepS2] = useState("");

  // Para exportar (checkboxes)
  const [selectedSystems, setSelectedSystems] = useState({
    subsistema1: true,
    subsistema2: true,
  });

  // ✅ VERIFICAR QUE EL USUARIO ESTÉ LOGEADO
  useEffect(() => {
    if (!userId) {
      alert("Debes iniciar sesión para ver tus datos");
      navigate("/login");
    }
  }, [userId, navigate]);

  // ====================== CARGA INICIAL DESDE FIREBASE ======================
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

                // ordenar por timestamp
                Object.keys(sweepsWithData).forEach((sid) => {
                  sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
                });
              }

              setBarridosSubsistema1(sweepsWithData);
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
            setLoading(false);
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

                // ordenar por timestamp
                Object.keys(sweepsWithData).forEach((sid) => {
                  sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
                });
              }

              setBarridosSubsistema2(sweepsWithData);
              setLoading(false);
            },
            { onlyOnce: true }
          );
        },
        { onlyOnce: true }
      );
    } catch (error) {
      console.error("❌ Error al cargar datos desde Firebase:", error);
      setLoading(false);
    }
  };

  // ====================== LIMPIAR DATOS ======================
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
        alert(`✅ Datos del ${subsistema} eliminados correctamente`);
      }

      if (subsistema === "subsistema2") {
        await remove(ref(db, `users/${userId}/Exp2/sweeps`));
        await remove(ref(db, `users/${userId}/Exp2/measurements`));
        setBarridosSubsistema2({});
        setSelectedSweepS2("");
        alert(`✅ Datos del ${subsistema} eliminados correctamente`);
      }

      cargarDatosDesdeFirebase();
    } catch (error) {
      console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
      alert(`Error al eliminar datos: ${error.message}`);
    }
  };

  // ====================== UTILIDADES ======================
  const handleCheckboxChange = (event) => {
    setSelectedSystems({
      ...selectedSystems,
      [event.target.name]: event.target.checked,
    });
  };

  const handleDownloadCSV = () => {
    const selectedData = [
      {
        title: SUBSYSTEM_TITLES.SUBSYSTEM1,
        data: Object.values(barridosSubsistema1).flatMap((b) => b.datos),
        key: "subsistema1",
      },
      {
        title: SUBSYSTEM_TITLES.SUBSYSTEM2,
        data: Object.values(barridosSubsistema2).flatMap((b) => b.datos),
        key: "subsistema2",
      },
    ].filter(({ key }) => selectedSystems[key]);

    if (selectedData.length === 0) {
      alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
      return;
    }

    const columnsMap = {
      subsistema1: SUBSISTEMA1_COLUMNS,
      subsistema2: SUBSISTEMA2_COLUMNS,
    };

    const csvContent = generateCSV(selectedData, columnsMap);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `data_summary_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => navigate("/experiments/experimentChooser");

  const NoDataMessage = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {NO_DATA_MESSAGE}
      </Typography>
    </Paper>
  );

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

  // ====================== LISTAS ORDENADAS PARA SELECT ======================
  const sweepsS1 = useMemo(() => {
    const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
      id,
      ...obj,
      ts: obj?.metadata?.timestamp ?? 0,
    }));
    arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0)); // más reciente primero
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

  // ✅ setear sweep seleccionado por defecto cuando cargan datos
  useEffect(() => {
    if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
  }, [sweepsS1, selectedSweepS1]);

  useEffect(() => {
    if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
  }, [sweepsS2, selectedSweepS2]);

  const selectedS1Obj = useMemo(
    () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
    [sweepsS1, selectedSweepS1]
  );
  const selectedS2Obj = useMemo(
    () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
    [sweepsS2, selectedSweepS2]
  );

  const countS1 = sweepsS1.length;
  const countS2 = sweepsS2.length;

  // ====================== GUARDS ======================
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

  // ====================== RENDER ======================
  return (
    <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
      <Typography variant="h4" gutterBottom>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
        {DESCRIPTION}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>*/
        {/* ================= LEFT SIDEBAR ================= */}
      /*  <Paper
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
            <Tab label="Exportar / CSV" />
          </Tabs>

          <Divider sx={{ my: 1 }} />

          <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
            {BACK_BUTTON}
          </Button>
        </Paper>
*/
        {/* ================= RIGHT CONTENT (SCROLL INTERNO) ================= */}
      /*  <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            height: "calc(100vh - 180px)", // ajusta si tu header es más grande/pequeño
            overflow: "auto",
          }}
        >*/
          {/* ================ TAB: SUBSISTEMA 1 ================ */}
        /*  <TabPanel value={tab} index={0}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {countS1} barridos guardados
                </Typography>
              </Box>

              {countS1 > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleClearData("subsistema1")}
                  align="right"
                >
                  🗑️ {CLEAR_BUTTON}
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {countS1 > 0 ? (
              <>*/
                {/* ✅ Selector de barrido */}
               /* <FormControl fullWidth sx={{ mb: 2 }}>
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
*/
                {/* ✅ Render SOLO del barrido seleccionado */}
              /*  {selectedS1Obj ? (
                  <>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Barrido seleccionado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
                          selectedS1Obj.metadata?.endAngle ?? "?"
                        }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
                          selectedS1Obj.metadata?.timestamp
                        )}`}
                      </Typography>
                    </Paper>

                    <DataTable
                      columns={SUBSISTEMA1_COLUMNS}
                      data={(selectedS1Obj.datos || []).map((d) => ({
                        "Angle (°)": d.angle,
                        Voltage: d.voltage?.toFixed(2),
                        Current: d.current?.toFixed(2),
                        Efficiency: ((d.voltage * d.current) / 100).toFixed(2),
                        "Fill Factor": "—",
                      }))}
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
*/
          {/* ================ TAB: SUBSISTEMA 2 ================ */}
        /*  <TabPanel value={tab} index={1}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {countS2} barridos guardados
                </Typography>
              </Box>

              {countS2 > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleClearData("subsistema2")}
                  align="right"
                >
                  🗑️ {CLEAR_BUTTON}
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {countS2 > 0 ? (
              <>*/
                {/* ✅ Selector de barrido */}
              /*  <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
                  <Select
                    labelId="s2-sweep-label"
                    value={selectedSweepS2}
                    label="Selecciona un barrido"
                    onChange={(e) => setSelectedSweepS2(e.target.value)}
                  >
                    {sweepsS2.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {`🎯 Az(${s.metadata?.azimuthStart ?? "?"}°→${s.metadata?.azimuthEnd ?? "?"}°) • Ze(${
                          s.metadata?.zenithStart ?? "?"
                        }°→${s.metadata?.zenithEnd ?? "?"}°) • ${
                          s.datos?.length ?? 0
                        } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
*/
                {/* ✅ Render SOLO del barrido seleccionado */}
              /*  {selectedS2Obj ? (
                  <>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Barrido seleccionado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`Az(${selectedS2Obj.metadata?.azimuthStart ?? "?"}°→${
                          selectedS2Obj.metadata?.azimuthEnd ?? "?"
                        }°) • Ze(${selectedS2Obj.metadata?.zenithStart ?? "?"}°→${
                          selectedS2Obj.metadata?.zenithEnd ?? "?"
                        }°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
                          selectedS2Obj.metadata?.timestamp
                        )}`}
                      </Typography>
                    </Paper>

                    <DataTable
                      columns={SUBSISTEMA2_COLUMNS}
                      data={(selectedS2Obj.datos || []).map((d) => ({
                        "Zenith Angle (°)": d.rollAngle,
                        "Azimuth Angle (°)": d.pitchAngle,
                        Voltage: d.voltage?.toFixed(2),
                        Current: d.current?.toFixed(2),
                        Efficiency: ((d.voltage * d.current) / 100).toFixed(2),
                        "Fill Factor": "—",
                      }))}
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
*/
          {/* ================ TAB: EXPORTAR ================ */}
        /*  <TabPanel value={tab} index={2}>
            <Typography variant="h5" gutterBottom>
              Exportar datos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona qué subsistemas incluir en el CSV.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSystems.subsistema1}
                    onChange={handleCheckboxChange}
                    name="subsistema1"
                  />
                }
                label={`Subsystem 1 (${countS1})`}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSystems.subsistema2}
                    onChange={handleCheckboxChange}
                    name="subsistema2"
                  />
                }
                label={`Subsystem 2 (${countS2})`}
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

            {countS1 === 0 && countS2 === 0 && (
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

*/

















//usaurios corregida

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// // ✅ FIREBASE IMPORTS
// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// /** Simple TabPanel helper */
// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   // ✅ OBTENER UID DEL USUARIO LOGEADO
//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   // ====================== ESTADOS ======================
//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [loading, setLoading] = useState(true);

//   // ✅ pestañas: 0 = subsistema1, 1 = subsistema2, 2 = exportar
//   const [tab, setTab] = useState(0);

//   // ✅ selector de barrido (mostrar uno a la vez)
//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");

//   // Para exportar (checkboxes)
//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//   });

//   // ✅ VERIFICAR QUE EL USUARIO ESTÉ LOGEADO
//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   // ====================== FILTRO: SOLO BARRIDOS GUARDADOS ======================
//   // Un barrido “guardado” aquí significa: tiene al menos 1 medición con isSaved=true asociada a ese sweepId
//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   // ====================== CARGA INICIAL DESDE FIREBASE ======================
//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 // ordenar por timestamp
//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               // ✅ FILTRAR: solo barridos con mediciones guardadas
//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               // ✅ si el sweep seleccionado quedó fuera, limpiarlo
//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             setLoading(false);
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 // ordenar por timestamp
//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               // ✅ FILTRAR: solo barridos con mediciones guardadas
//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               // ✅ si el sweep seleccionado quedó fuera, limpiarlo
//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }

//               setLoading(false);
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   // ====================== LIMPIAR DATOS ======================
//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   // ====================== UTILIDADES ======================
//   const handleCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const handleDownloadCSV = () => {
//     const selectedData = [
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: Object.values(barridosSubsistema1).flatMap((b) => b.datos),
//         key: "subsistema1",
//       },
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: Object.values(barridosSubsistema2).flatMap((b) => b.datos),
//         key: "subsistema2",
//       },
//     ].filter(({ key }) => selectedSystems[key]);

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSISTEMA2_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   // ====================== LISTAS ORDENADAS PARA SELECT ======================
//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0)); // más reciente primero
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   // ✅ setear sweep seleccionado por defecto cuando cargan datos
//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );
//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;

//   // ====================== GUARDS ======================
//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   // ====================== RENDER ======================
//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         {/* ================= LEFT SIDEBAR ================= */}
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         {/* ================= RIGHT CONTENT (SCROLL INTERNO) ================= */}
//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* ================ TAB: SUBSISTEMA 1 ================ */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               {countS1 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema1")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: SUBSISTEMA 2 ================ */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               {countS2 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema2")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${s.metadata?.azimuthStart ?? "?"}°→${s.metadata?.azimuthEnd ?? "?"}°) • Ze(${
//                           s.metadata?.zenithStart ?? "?"
//                         }°→${s.metadata?.zenithEnd ?? "?"}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${selectedS2Obj.metadata?.azimuthStart ?? "?"}°→${
//                           selectedS2Obj.metadata?.azimuthEnd ?? "?"
//                         }°) • Ze(${selectedS2Obj.metadata?.zenithStart ?? "?"}°→${
//                           selectedS2Obj.metadata?.zenithEnd ?? "?"
//                         }°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Zenith Angle (°)": d.rollAngle,
//                         "Azimuth Angle (°)": d.pitchAngle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: EXPORTAR ================ */}
//           <TabPanel value={tab} index={2}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Selecciona qué subsistemas incluir en el CSV.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label={`Subsystem 1 (${countS1})`}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label={`Subsystem 2 (${countS2})`}
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {countS1 === 0 && countS2 === 0 && (
//               <Box sx={{ mt: 2 }}>
//                 <NoDataMessage />
//               </Box>
//             )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;

   




// Anterior version funcinoal buena con sub 1 y 2

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [loading, setLoading] = useState(true);

//   const [tab, setTab] = useState(0);

//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");

//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//   });

//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             setLoading(false);
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }

//               setLoading(false);
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   const handleCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const handleDownloadCSV = () => {
//     const selectedData = [
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: Object.values(barridosSubsistema1).flatMap((b) => b.datos),
//         key: "subsistema1",
//       },
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: Object.values(barridosSubsistema2).flatMap((b) => b.datos),
//         key: "subsistema2",
//       },
//     ].filter(({ key }) => selectedSystems[key]);

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSYSTEM2_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   // ====================== HELPERS SUBSISTEMA 2 ======================
//   const getExp2StartPitch = (meta) =>
//     meta?.pitchStart ?? meta?.azimuthStart ?? "?";

//   const getExp2EndPitch = (meta) =>
//     meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

//   const getExp2StartRoll = (meta) =>
//     meta?.rollStart ?? meta?.zenithStart ?? "?";

//   const getExp2EndRoll = (meta) =>
//     meta?.rollEnd ?? meta?.zenithEnd ?? "?";

//   const getExp2PitchMeasurement = (d) =>
//     d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

//   const getExp2RollMeasurement = (d) =>
//     d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

//   // ====================== LISTAS ORDENADAS PARA SELECT ======================
//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );

//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;

//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         {/* ================= LEFT SIDEBAR ================= */}
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         {/* ================= RIGHT CONTENT ================= */}
//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* ================ TAB: SUBSISTEMA 1 ================ */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               {countS1 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema1")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: SUBSISTEMA 2 ================ */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               {countS2 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema2")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
//                           selectedS2Obj.metadata
//                         )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
//                           selectedS2Obj.metadata
//                         )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//                         "Zenith Angle (°)": getExp2RollMeasurement(d),
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: EXPORTAR ================ */}
//           <TabPanel value={tab} index={2}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Selecciona qué subsistemas incluir en el CSV.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label={`Subsystem 1 (${countS1})`}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label={`Subsystem 2 (${countS2})`}
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {countS1 === 0 && countS2 === 0 && (
//               <Box sx={{ mt: 2 }}>
//                 <NoDataMessage />
//               </Box>
//             )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;











// Nueva version 1 con subsistema4


// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const SUBSYSTEM4_COLUMNS = [
//   "Measurement ID",
//   "Integration Time (ms)",
//   "Status",
//   "Saved",
//   "Date",
// ];

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [medicionesSubsistema4, setMedicionesSubsistema4] = useState({});
//   const [environmentDataSubsistema4, setEnvironmentDataSubsistema4] = useState({});

//   const [loading, setLoading] = useState(true);

//   const [tab, setTab] = useState(0);

//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");
//   const [selectedMeasurementS4, setSelectedMeasurementS4] = useState("");

//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//     subsistema4: true,
//   });

//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - MEDICIONES =====================
//       const exp4MeasurementsRef = ref(db, `users/${userId}/Exp4/measurements`);
//       onValue(
//         exp4MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema4({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema4(savedMeasurements);

//           if (selectedMeasurementS4 && !savedMeasurements[selectedMeasurementS4]) {
//             setSelectedMeasurementS4("");
//           }
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - FILTROS =====================
//       const exp4EnvironmentRef = ref(db, `users/${userId}/Exp4/environmentData`);
//       onValue(
//         exp4EnvironmentRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setEnvironmentDataSubsistema4({});
//             setLoading(false);
//             return;
//           }

//           setEnvironmentDataSubsistema4(snapshot.val());
//           setLoading(false);
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       if (subsistema === "subsistema4") {
//         await remove(ref(db, `users/${userId}/Exp4/measurements`));
//         await remove(ref(db, `users/${userId}/Exp4/environmentData`));
//         await remove(ref(db, `users/${userId}/Exp4/currentMeasurementId`));
//         await remove(ref(db, `users/${userId}/Exp4/currentSensorMeasurementId`));
//         setMedicionesSubsistema4({});
//         setEnvironmentDataSubsistema4({});
//         setSelectedMeasurementS4("");
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   const handleCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const handleDownloadCSV = () => {
//     const selectedData = [
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: Object.values(barridosSubsistema1).flatMap((b) => b.datos),
//         key: "subsistema1",
//       },
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: Object.values(barridosSubsistema2).flatMap((b) => b.datos),
//         key: "subsistema2",
//       },
//       {
//         title: SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4",
//         data: Object.entries(medicionesSubsistema4).map(([id, d]) => ({
//           measurementId: id,
//           integrationTime: d.integrationTime,
//           status: d.status,
//           isSaved: d.isSaved,
//           timestamp: d.timestamp,
//         })),
//         key: "subsistema4",
//       },
//     ].filter(({ key }) => selectedSystems[key]);

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSYSTEM2_COLUMNS,
//       subsistema4: SUBSYSTEM4_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   // ====================== HELPERS SUBSISTEMA 2 ======================
//   const getExp2StartPitch = (meta) =>
//     meta?.pitchStart ?? meta?.azimuthStart ?? "?";

//   const getExp2EndPitch = (meta) =>
//     meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

//   const getExp2StartRoll = (meta) =>
//     meta?.rollStart ?? meta?.zenithStart ?? "?";

//   const getExp2EndRoll = (meta) =>
//     meta?.rollEnd ?? meta?.zenithEnd ?? "?";

//   const getExp2PitchMeasurement = (d) =>
//     d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

//   const getExp2RollMeasurement = (d) =>
//     d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

//   // ====================== HELPERS SUBSISTEMA 4 ======================
//   const getLatestEnvironmentData = () => {
//     const entries = Object.entries(environmentDataSubsistema4 || {});
//     if (entries.length === 0) return null;

//     entries.sort((a, b) => {
//       const tsA = a[1]?.timestamp ?? 0;
//       const tsB = b[1]?.timestamp ?? 0;
//       return tsB - tsA;
//     });

//     return entries[0][1];
//   };

//   const latestEnvironmentDataS4 = getLatestEnvironmentData();

//   // ====================== LISTAS ORDENADAS PARA SELECT ======================
//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   const measurementsS4 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema4).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema4]);

//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   useEffect(() => {
//     if (!selectedMeasurementS4 && measurementsS4.length > 0) {
//       setSelectedMeasurementS4(measurementsS4[0].id);
//     }
//   }, [measurementsS4, selectedMeasurementS4]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );

//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const selectedS4Obj = useMemo(
//     () => measurementsS4.find((m) => m.id === selectedMeasurementS4) || null,
//     [measurementsS4, selectedMeasurementS4]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;
//   const countS4 = measurementsS4.length;

//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label={`Subsystem 4 ${countS4 ? `(${countS4})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* ================ TAB: SUBSISTEMA 1 ================ */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               {countS1 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema1")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: SUBSISTEMA 2 ================ */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               {countS2 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema2")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
//                           selectedS2Obj.metadata
//                         )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
//                           selectedS2Obj.metadata
//                         )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//                         "Zenith Angle (°)": getExp2RollMeasurement(d),
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: SUBSISTEMA 4 ================ */}
//           <TabPanel value={tab} index={2}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS4} mediciones guardadas
//                 </Typography>
//               </Box>

//               {(countS4 > 0 || latestEnvironmentDataS4) && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema4")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS4 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s4-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s4-measurement-label"
//                     value={selectedMeasurementS4}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS4(e.target.value)}
//                   >
//                     {measurementsS4.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧪 ${m.id} • ${m.integrationTime ?? "?"} ms • ${m.status ?? "unknown"} • ${formatearFecha(
//                           m.timestamp
//                         )}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS4Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`ID: ${selectedS4Obj.id} • Tiempo de integración: ${
//                           selectedS4Obj.integrationTime ?? "?"
//                         } ms • Estado: ${selectedS4Obj.status ?? "unknown"} • ${formatearFecha(
//                           selectedS4Obj.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM4_COLUMNS}
//                       data={[
//                         {
//                           "Measurement ID": selectedS4Obj.id,
//                           "Integration Time (ms)": selectedS4Obj.integrationTime ?? "—",
//                           Status: selectedS4Obj.status ?? "—",
//                           Saved: selectedS4Obj.isSaved ? "Yes" : "No",
//                           Date: formatearFecha(selectedS4Obj.timestamp),
//                         },
//                       ]}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}

//             <Divider sx={{ my: 4 }} />

//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Light Filters Efficiency
//             </Typography>

//             {latestEnvironmentDataS4 ? (
//               <Grid container spacing={2}>
//                 {[
//                   { label: "Reference", key: "referencia", color: "#9e9e9e" },
//                   { label: "Yellow Filter", key: "filtroAmarillo", color: "#fbc02d" },
//                   { label: "Blue Filter", key: "filtroAzul", color: "#1976d2" },
//                   { label: "Red Filter", key: "filtroRojo", color: "#d32f2f" },
//                 ].map((panel) => (
//                   <Grid item xs={12} sm={6} md={3} key={panel.key}>
//                     <Paper
//                       elevation={3}
//                       sx={{
//                         p: 3,
//                         textAlign: "center",
//                         borderRadius: "15px",
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <Typography variant="subtitle2" color="text.secondary">
//                         {panel.label}
//                       </Typography>
//                       <Typography
//                         variant="h4"
//                         sx={{ fontWeight: "bold", color: panel.color, my: 1 }}
//                       >
//                         {latestEnvironmentDataS4?.[panel.key] ?? 0}%
//                       </Typography>
//                       <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.disabled" }}>
//                         Relative Power
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================ TAB: EXPORTAR ================ */}
//           <TabPanel value={tab} index={3}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Selecciona qué subsistemas incluir en el CSV.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label={`Subsystem 1 (${countS1})`}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label={`Subsystem 2 (${countS2})`}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema4}
//                     onChange={handleCheckboxChange}
//                     name="subsistema4"
//                   />
//                 }
//                 label={`Subsystem 4 (${countS4})`}
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {countS1 === 0 && countS2 === 0 && countS4 === 0 && (
//               <Box sx={{ mt: 2 }}>
//                 <NoDataMessage />
//               </Box>
//             )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;







// // nuvea version 2 con  s4

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";

// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const SUBSYSTEM4_COLUMNS = [
//   "Measurement ID",
//   "Integration Time (ms)",
//   "Status",
//   "Saved",
//   "Date",
// ];

// const SUBSYSTEM4_FILTER_COLUMNS = [
//   "Date",
//   "Reference (%)",
//   "Yellow Filter (%)",
//   "Blue Filter (%)",
//   "Red Filter (%)",
// ];

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [medicionesSubsistema4, setMedicionesSubsistema4] = useState({});
//   const [environmentDataSubsistema4, setEnvironmentDataSubsistema4] = useState({});

//   const [loading, setLoading] = useState(true);

//   const [tab, setTab] = useState(0);

//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");
//   const [selectedMeasurementS4, setSelectedMeasurementS4] = useState("");

//   // selección múltiple para exportar
//   const [selectedSweepsS1, setSelectedSweepsS1] = useState([]);
//   const [selectedSweepsS2, setSelectedSweepsS2] = useState([]);
//   const [selectedMeasurementsS4, setSelectedMeasurementsS4] = useState([]);
//   const [includeFiltersS4, setIncludeFiltersS4] = useState(true);

//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//     subsistema4: true,
//   });

//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }

//               setSelectedSweepsS1((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }

//               setSelectedSweepsS2((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - MEDICIONES =====================
//       const exp4MeasurementsRef = ref(db, `users/${userId}/Exp4/measurements`);
//       onValue(
//         exp4MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema4({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema4(savedMeasurements);

//           if (selectedMeasurementS4 && !savedMeasurements[selectedMeasurementS4]) {
//             setSelectedMeasurementS4("");
//           }

//           setSelectedMeasurementsS4((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - FILTROS =====================
//       const exp4EnvironmentRef = ref(db, `users/${userId}/Exp4/environmentData`);
//       onValue(
//         exp4EnvironmentRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setEnvironmentDataSubsistema4({});
//             setLoading(false);
//             return;
//           }

//           setEnvironmentDataSubsistema4(snapshot.val());
//           setLoading(false);
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         setSelectedSweepsS1([]);
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         setSelectedSweepsS2([]);
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       if (subsistema === "subsistema4") {
//         await remove(ref(db, `users/${userId}/Exp4/measurements`));
//         await remove(ref(db, `users/${userId}/Exp4/environmentData`));
//         await remove(ref(db, `users/${userId}/Exp4/currentMeasurementId`));
//         await remove(ref(db, `users/${userId}/Exp4/currentSensorMeasurementId`));
//         setMedicionesSubsistema4({});
//         setEnvironmentDataSubsistema4({});
//         setSelectedMeasurementS4("");
//         setSelectedMeasurementsS4([]);
//         alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       }

//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   const handleSystemCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   // ====================== HELPERS SUBSISTEMA 2 ======================
//   const getExp2StartPitch = (meta) =>
//     meta?.pitchStart ?? meta?.azimuthStart ?? "?";

//   const getExp2EndPitch = (meta) =>
//     meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

//   const getExp2StartRoll = (meta) =>
//     meta?.rollStart ?? meta?.zenithStart ?? "?";

//   const getExp2EndRoll = (meta) =>
//     meta?.rollEnd ?? meta?.zenithEnd ?? "?";

//   const getExp2PitchMeasurement = (d) =>
//     d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

//   const getExp2RollMeasurement = (d) =>
//     d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

//   // ====================== HELPERS SUBSISTEMA 4 ======================
//   const getLatestEnvironmentData = () => {
//     const entries = Object.entries(environmentDataSubsistema4 || {});
//     if (entries.length === 0) return null;

//     entries.sort((a, b) => {
//       const tsA = a[1]?.timestamp ?? 0;
//       const tsB = b[1]?.timestamp ?? 0;
//       return tsB - tsA;
//     });

//     return { id: entries[0][0], ...entries[0][1] };
//   };

//   const latestEnvironmentDataS4 = getLatestEnvironmentData();

//   // ====================== LISTAS ORDENADAS ======================
//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   const measurementsS4 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema4).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema4]);

//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   useEffect(() => {
//     if (!selectedMeasurementS4 && measurementsS4.length > 0) {
//       setSelectedMeasurementS4(measurementsS4[0].id);
//     }
//   }, [measurementsS4, selectedMeasurementS4]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );

//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const selectedS4Obj = useMemo(
//     () => measurementsS4.find((m) => m.id === selectedMeasurementS4) || null,
//     [measurementsS4, selectedMeasurementS4]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;
//   const countS4 = measurementsS4.length;

//   // ====================== SELECCIÓN MÚLTIPLE ======================
//   const toggleSelection = (id, selectedList, setSelectedList) => {
//     setSelectedList((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = (allIds, selectedList, setSelectedList) => {
//     if (allIds.length === 0) return;
//     const allSelected = allIds.every((id) => selectedList.includes(id));
//     setSelectedList(allSelected ? [] : allIds);
//   };

//   // ====================== EXPORTAR ======================
//   const handleDownloadCSV = () => {
//     const selectedData = [];

//     if (selectedSystems.subsistema1 && selectedSweepsS1.length > 0) {
//       const dataS1 = selectedSweepsS1.flatMap((id) => {
//         const sweep = barridosSubsistema1[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Angle (°)": d.angle,
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: dataS1,
//         key: "subsistema1",
//       });
//     }

//     if (selectedSystems.subsistema2 && selectedSweepsS2.length > 0) {
//       const dataS2 = selectedSweepsS2.flatMap((id) => {
//         const sweep = barridosSubsistema2[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//           "Zenith Angle (°)": getExp2RollMeasurement(d),
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: dataS2,
//         key: "subsistema2",
//       });
//     }

//     if (selectedSystems.subsistema4 && selectedMeasurementsS4.length > 0) {
//       const dataS4 = selectedMeasurementsS4.map((id) => {
//         const m = medicionesSubsistema4[id];
//         return {
//           "Measurement ID": id,
//           "Integration Time (ms)": m?.integrationTime ?? "—",
//           Status: m?.status ?? "—",
//           Saved: m?.isSaved ? "Yes" : "No",
//           Date: formatearFecha(m?.timestamp),
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4 Measurements",
//         data: dataS4,
//         key: "subsistema4",
//       });

//       if (includeFiltersS4 && latestEnvironmentDataS4) {
//         selectedData.push({
//           title: "Subsystem 4 Filters",
//           data: [
//             {
//               Date: formatearFecha(latestEnvironmentDataS4.timestamp),
//               "Reference (%)": latestEnvironmentDataS4.referencia ?? 0,
//               "Yellow Filter (%)": latestEnvironmentDataS4.filtroAmarillo ?? 0,
//               "Blue Filter (%)": latestEnvironmentDataS4.filtroAzul ?? 0,
//               "Red Filter (%)": latestEnvironmentDataS4.filtroRojo ?? 0,
//             },
//           ],
//           key: "subsistema4_filtros",
//         });
//       }
//     }

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED || "No hay datos seleccionados para exportar.");
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSYSTEM2_COLUMNS,
//       subsistema4: SUBSYSTEM4_COLUMNS,
//       subsistema4_filtros: SUBSYSTEM4_FILTER_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_selected_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label={`Subsystem 4 ${countS4 ? `(${countS4})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* ================= TAB 1 ================= */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               {countS1 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema1")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                       Barridos seleccionables para exportar
//                     </Typography>
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => toggleSelectAll(sweepsS1.map((s) => s.id), selectedSweepsS1, setSelectedSweepsS1)}
//                     >
//                       {sweepsS1.every((s) => selectedSweepsS1.includes(s.id)) ? "Deseleccionar todo" : "Seleccionar todo"}
//                     </Button>
//                   </Box>

//                   {sweepsS1.map((s) => (
//                     <FormControlLabel
//                       key={s.id}
//                       control={
//                         <Checkbox
//                           checked={selectedSweepsS1.includes(s.id)}
//                           onChange={() => toggleSelection(s.id, selectedSweepsS1, setSelectedSweepsS1)}
//                         />
//                       }
//                       label={`${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${s.datos?.length ?? 0} mediciones`}
//                     />
//                   ))}
//                 </Paper>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================= TAB 2 ================= */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               {countS2 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema2")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                       Barridos seleccionables para exportar
//                     </Typography>
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => toggleSelectAll(sweepsS2.map((s) => s.id), selectedSweepsS2, setSelectedSweepsS2)}
//                     >
//                       {sweepsS2.every((s) => selectedSweepsS2.includes(s.id)) ? "Deseleccionar todo" : "Seleccionar todo"}
//                     </Button>
//                   </Box>

//                   {sweepsS2.map((s) => (
//                     <FormControlLabel
//                       key={s.id}
//                       control={
//                         <Checkbox
//                           checked={selectedSweepsS2.includes(s.id)}
//                           onChange={() => toggleSelection(s.id, selectedSweepsS2, setSelectedSweepsS2)}
//                         />
//                       }
//                       label={`Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                         s.metadata
//                       )}°→${getExp2EndRoll(s.metadata)}°) • ${s.datos?.length ?? 0} mediciones`}
//                     />
//                   ))}
//                 </Paper>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
//                           selectedS2Obj.metadata
//                         )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
//                           selectedS2Obj.metadata
//                         )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//                         "Zenith Angle (°)": getExp2RollMeasurement(d),
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================= TAB 4 ================= */}
//           <TabPanel value={tab} index={2}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS4} mediciones guardadas
//                 </Typography>
//               </Box>

//               {(countS4 > 0 || latestEnvironmentDataS4) && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema4")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS4 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s4-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s4-measurement-label"
//                     value={selectedMeasurementS4}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS4(e.target.value)}
//                   >
//                     {measurementsS4.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧪 ${m.id} • ${m.integrationTime ?? "?"} ms • ${m.status ?? "unknown"} • ${formatearFecha(
//                           m.timestamp
//                         )}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                       Mediciones seleccionables para exportar
//                     </Typography>
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() =>
//                         toggleSelectAll(
//                           measurementsS4.map((m) => m.id),
//                           selectedMeasurementsS4,
//                           setSelectedMeasurementsS4
//                         )
//                       }
//                     >
//                       {measurementsS4.every((m) => selectedMeasurementsS4.includes(m.id))
//                         ? "Deseleccionar todo"
//                         : "Seleccionar todo"}
//                     </Button>
//                   </Box>

//                   {measurementsS4.map((m) => (
//                     <FormControlLabel
//                       key={m.id}
//                       control={
//                         <Checkbox
//                           checked={selectedMeasurementsS4.includes(m.id)}
//                           onChange={() =>
//                             toggleSelection(m.id, selectedMeasurementsS4, setSelectedMeasurementsS4)
//                           }
//                         />
//                       }
//                       label={`${m.id} • ${m.integrationTime ?? "?"} ms • ${m.status ?? "unknown"}`}
//                     />
//                   ))}

//                   <Divider sx={{ my: 1.5 }} />

//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={includeFiltersS4}
//                         onChange={(e) => setIncludeFiltersS4(e.target.checked)}
//                       />
//                     }
//                     label="Incluir también el último registro de Light Filters Efficiency"
//                   />
//                 </Paper>

//                 {selectedS4Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`ID: ${selectedS4Obj.id} • Tiempo de integración: ${
//                           selectedS4Obj.integrationTime ?? "?"
//                         } ms • Estado: ${selectedS4Obj.status ?? "unknown"} • ${formatearFecha(
//                           selectedS4Obj.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM4_COLUMNS}
//                       data={[
//                         {
//                           "Measurement ID": selectedS4Obj.id,
//                           "Integration Time (ms)": selectedS4Obj.integrationTime ?? "—",
//                           Status: selectedS4Obj.status ?? "—",
//                           Saved: selectedS4Obj.isSaved ? "Yes" : "No",
//                           Date: formatearFecha(selectedS4Obj.timestamp),
//                         },
//                       ]}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}

//             <Divider sx={{ my: 4 }} />

//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Light Filters Efficiency
//             </Typography>

//             {latestEnvironmentDataS4 ? (
//               <Grid container spacing={2}>
//                 {[
//                   { label: "Reference", key: "referencia", color: "#9e9e9e" },
//                   { label: "Yellow Filter", key: "filtroAmarillo", color: "#fbc02d" },
//                   { label: "Blue Filter", key: "filtroAzul", color: "#1976d2" },
//                   { label: "Red Filter", key: "filtroRojo", color: "#d32f2f" },
//                 ].map((panel) => (
//                   <Grid item xs={12} sm={6} md={3} key={panel.key}>
//                     <Paper
//                       elevation={3}
//                       sx={{
//                         p: 3,
//                         textAlign: "center",
//                         borderRadius: "15px",
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <Typography variant="subtitle2" color="text.secondary">
//                         {panel.label}
//                       </Typography>
//                       <Typography
//                         variant="h4"
//                         sx={{ fontWeight: "bold", color: panel.color, my: 1 }}
//                       >
//                         {latestEnvironmentDataS4?.[panel.key] ?? 0}%
//                       </Typography>
//                       <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.disabled" }}>
//                         Relative Power
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* ================= EXPORT ================= */}
//           <TabPanel value={tab} index={3}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos seleccionados
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Marca qué subsistemas incluir y asegúrate de haber seleccionado barridos o mediciones en cada pestaña.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label={`Subsystem 1 (${selectedSweepsS1.length} seleccionados)`}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label={`Subsystem 2 (${selectedSweepsS2.length} seleccionados)`}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema4}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema4"
//                   />
//                 }
//                 label={`Subsystem 4 (${selectedMeasurementsS4.length} seleccionados)`}
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {selectedSweepsS1.length === 0 &&
//               selectedSweepsS2.length === 0 &&
//               selectedMeasurementsS4.length === 0 && (
//                 <Box sx={{ mt: 2 }}>
//                   <NoDataMessage />
//                 </Box>
//               )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;





















// nueva nueva version

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   OutlinedInput,
//   ListItemText,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";
// import tableStyles from "../../assets/css/Elements/DataTable.module.css";

// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const SUBSYSTEM3_COLUMNS = [
//   "Angle (°)",
//   "Dirty Voltage",
//   "Dirty Current",
//   "Dirty Efficiency",
//   "Dirty Fill Factor",
//   "Clean Voltage",
//   "Clean Current",
//   "Clean Efficiency",
//   "Clean Fill Factor",
//   "Date",
// ];

// const SUBSYSTEM4_COLUMNS = [
//   "Measurement ID",
//   "Integration Time (ms)",
//   "Status",
//   "Saved",
//   "Date",
// ];

// const SUBSYSTEM4_FILTER_COLUMNS = [
//   "Date",
//   "Reference (%)",
//   "Yellow Filter (%)",
//   "Blue Filter (%)",
//   "Red Filter (%)",
// ];

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

// const menuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
//       width: 380,
//     },
//   },
// };

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [medicionesSubsistema3, setMedicionesSubsistema3] = useState({});
//   const [medicionesSubsistema4, setMedicionesSubsistema4] = useState({});
//   const [environmentDataSubsistema4, setEnvironmentDataSubsistema4] = useState({});

//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState(0);

//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");
//   const [selectedMeasurementS3, setSelectedMeasurementS3] = useState("");
//   const [selectedMeasurementS4, setSelectedMeasurementS4] = useState("");

//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//     subsistema3: true,
//     subsistema4: true,
//   });

//   const [selectedSweepsS1, setSelectedSweepsS1] = useState([]);
//   const [selectedSweepsS2, setSelectedSweepsS2] = useState([]);
//   const [selectedMeasurementsS3, setSelectedMeasurementsS3] = useState([]);
//   const [selectedMeasurementsS4, setSelectedMeasurementsS4] = useState([]);
//   const [includeFiltersS4, setIncludeFiltersS4] = useState(true);

//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }

//               setSelectedSweepsS1((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }

//               setSelectedSweepsS2((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP3 =====================
//       const exp3MeasurementsRef = ref(db, `users/${userId}/Exp3/measurements`);
//       onValue(
//         exp3MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema3({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema3(savedMeasurements);

//           if (selectedMeasurementS3 && !savedMeasurements[selectedMeasurementS3]) {
//             setSelectedMeasurementS3("");
//           }

//           setSelectedMeasurementsS3((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - MEDICIONES =====================
//       const exp4MeasurementsRef = ref(db, `users/${userId}/Exp4/measurements`);
//       onValue(
//         exp4MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema4({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema4(savedMeasurements);

//           if (selectedMeasurementS4 && !savedMeasurements[selectedMeasurementS4]) {
//             setSelectedMeasurementS4("");
//           }

//           setSelectedMeasurementsS4((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - FILTROS =====================
//       const exp4EnvironmentRef = ref(db, `users/${userId}/Exp4/environmentData`);
//       onValue(
//         exp4EnvironmentRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setEnvironmentDataSubsistema4({});
//             setLoading(false);
//             return;
//           }

//           setEnvironmentDataSubsistema4(snapshot.val());
//           setLoading(false);
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         setSelectedSweepsS1([]);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         setSelectedSweepsS2([]);
//       }

//       if (subsistema === "subsistema3") {
//         await remove(ref(db, `users/${userId}/Exp3/measurements`));
//         setMedicionesSubsistema3({});
//         setSelectedMeasurementS3("");
//         setSelectedMeasurementsS3([]);
//       }

//       if (subsistema === "subsistema4") {
//         await remove(ref(db, `users/${userId}/Exp4/measurements`));
//         await remove(ref(db, `users/${userId}/Exp4/environmentData`));
//         await remove(ref(db, `users/${userId}/Exp4/currentMeasurementId`));
//         await remove(ref(db, `users/${userId}/Exp4/currentSensorMeasurementId`));
//         setMedicionesSubsistema4({});
//         setEnvironmentDataSubsistema4({});
//         setSelectedMeasurementS4("");
//         setSelectedMeasurementsS4([]);
//       }

//       alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   const handleDeleteMeasurementS3 = async (measurementId) => {
//     if (!userId || !measurementId) return;
  
//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar esta medición del Subsystem 3?"
//     );
//     if (!confirmar) return;
  
//     try {
//       await remove(ref(db, `users/${userId}/Exp3/measurements/${measurementId}`));
  
//       setMedicionesSubsistema3((prev) => {
//         const updated = { ...prev };
//         delete updated[measurementId];
//         return updated;
//       });
  
//       if (selectedMeasurementS3 === measurementId) {
//         setSelectedMeasurementS3("");
//       }
  
//       setSelectedMeasurementsS3((prev) => prev.filter((id) => id !== measurementId));
  
//       alert("✅ Medición eliminada correctamente");
//     } catch (error) {
//       console.error("❌ Error al eliminar medición de Subsystem 3:", error);
//       alert(`Error al eliminar medición: ${error.message}`);
//     }
//   };

//   const handleSystemCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   const getExp2StartPitch = (meta) =>
//     meta?.pitchStart ?? meta?.azimuthStart ?? "?";

//   const getExp2EndPitch = (meta) =>
//     meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

//   const getExp2StartRoll = (meta) =>
//     meta?.rollStart ?? meta?.zenithStart ?? "?";

//   const getExp2EndRoll = (meta) =>
//     meta?.rollEnd ?? meta?.zenithEnd ?? "?";

//   const getExp2PitchMeasurement = (d) =>
//     d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

//   const getExp2RollMeasurement = (d) =>
//     d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

//   const getLatestEnvironmentData = () => {
//     const entries = Object.entries(environmentDataSubsistema4 || {});
//     if (entries.length === 0) return null;

//     entries.sort((a, b) => {
//       const tsA = a[1]?.timestamp ?? 0;
//       const tsB = b[1]?.timestamp ?? 0;
//       return tsB - tsA;
//     });

//     return { id: entries[0][0], ...entries[0][1] };
//   };

//   const latestEnvironmentDataS4 = getLatestEnvironmentData();

//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   const measurementsS3 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema3).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema3]);

//   const measurementsS4 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema4).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema4]);

//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   useEffect(() => {
//     if (!selectedMeasurementS3 && measurementsS3.length > 0) {
//       setSelectedMeasurementS3(measurementsS3[0].id);
//     }
//   }, [measurementsS3, selectedMeasurementS3]);

//   useEffect(() => {
//     if (!selectedMeasurementS4 && measurementsS4.length > 0) {
//       setSelectedMeasurementS4(measurementsS4[0].id);
//     }
//   }, [measurementsS4, selectedMeasurementS4]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );

//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const selectedS3Obj = useMemo(
//     () => measurementsS3.find((m) => m.id === selectedMeasurementS3) || null,
//     [measurementsS3, selectedMeasurementS3]
//   );

//   const selectedS4Obj = useMemo(
//     () => measurementsS4.find((m) => m.id === selectedMeasurementS4) || null,
//     [measurementsS4, selectedMeasurementS4]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;
//   const countS3 = measurementsS3.length;
//   const countS4 = measurementsS4.length;

//   const handleDownloadCSV = () => {
//     const selectedData = [];

//     if (selectedSystems.subsistema1 && selectedSweepsS1.length > 0) {
//       const dataS1 = selectedSweepsS1.flatMap((id) => {
//         const sweep = barridosSubsistema1[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Angle (°)": d.angle,
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: dataS1,
//         key: "subsistema1",
//       });
//     }

//     if (selectedSystems.subsistema2 && selectedSweepsS2.length > 0) {
//       const dataS2 = selectedSweepsS2.flatMap((id) => {
//         const sweep = barridosSubsistema2[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//           "Zenith Angle (°)": getExp2RollMeasurement(d),
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: dataS2,
//         key: "subsistema2",
//       });
//     }

//     if (selectedSystems.subsistema3 && selectedMeasurementsS3.length > 0) {
//       const dataS3 = selectedMeasurementsS3.map((id) => {
//         const m = medicionesSubsistema3[id];
//         return {
//           "Angle (°)": m?.angle ?? "—",
//           "Dirty Voltage": m?.Vo != null ? Number(m.Vo).toFixed(2) : "—",
//           "Dirty Current": m?.Io != null ? Number(m.Io).toFixed(2) : "—",
//           "Dirty Efficiency": m?.Eo != null ? `${(Number(m.Eo) * 100).toFixed(2)}%` : "—",
//           "Dirty Fill Factor": m?.FFo != null ? Number(m.FFo).toFixed(2) : "—",
//           "Clean Voltage": m?.Vf != null ? Number(m.Vf).toFixed(2) : "—",
//           "Clean Current": m?.If != null ? Number(m.If).toFixed(2) : "—",
//           "Clean Efficiency": m?.Ef != null ? `${(Number(m.Ef) * 100).toFixed(2)}%` : "—",
//           "Clean Fill Factor": m?.FFf != null ? Number(m.FFf).toFixed(2) : "—",
//           Date: formatearFecha(m?.timestamp),
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3",
//         data: dataS3,
//         key: "subsistema3",
//       });
//     }

//     if (selectedSystems.subsistema4 && selectedMeasurementsS4.length > 0) {
//       const dataS4 = selectedMeasurementsS4.map((id) => {
//         const m = medicionesSubsistema4[id];
//         return {
//           "Measurement ID": id,
//           "Integration Time (ms)": m?.integrationTime ?? "—",
//           Status: m?.status ?? "—",
//           Saved: m?.isSaved ? "Yes" : "No",
//           Date: formatearFecha(m?.timestamp),
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4 Measurements",
//         data: dataS4,
//         key: "subsistema4",
//       });

//       if (includeFiltersS4 && latestEnvironmentDataS4) {
//         selectedData.push({
//           title: "Subsystem 4 Filters",
//           data: [
//             {
//               Date: formatearFecha(latestEnvironmentDataS4.timestamp),
//               "Reference (%)": latestEnvironmentDataS4.referencia ?? 0,
//               "Yellow Filter (%)": latestEnvironmentDataS4.filtroAmarillo ?? 0,
//               "Blue Filter (%)": latestEnvironmentDataS4.filtroAzul ?? 0,
//               "Red Filter (%)": latestEnvironmentDataS4.filtroRojo ?? 0,
//             },
//           ],
//           key: "subsistema4_filtros",
//         });
//       }
//     }

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED || "No hay datos seleccionados para exportar.");
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSYSTEM2_COLUMNS,
//       subsistema3: SUBSYSTEM3_COLUMNS,
//       subsistema4: SUBSYSTEM4_COLUMNS,
//       subsistema4_filtros: SUBSYSTEM4_FILTER_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_selected_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label={`Subsystem 3 ${countS3 ? `(${countS3})` : ""}`} />
//             <Tab label={`Subsystem 4 ${countS4 ? `(${countS4})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* SUBSYSTEM 1 */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               {countS1 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema1")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 2 */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               {countS2 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema2")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
//                           selectedS2Obj.metadata
//                         )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
//                           selectedS2Obj.metadata
//                         )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//                         "Zenith Angle (°)": getExp2RollMeasurement(d),
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 3 */}
//           <TabPanel value={tab} index={2}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS3} mediciones guardadas
//                 </Typography>
//               </Box>

//               {countS3 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema3")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS3 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s3-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s3-measurement-label"
//                     value={selectedMeasurementS3}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS3(e.target.value)}
//                   >
//                     {measurementsS3.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧼 ${m.angle ?? "?"}° • ${formatearFecha(m.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS3Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Ángulo: ${selectedS3Obj.angle ?? "?"}° • ${formatearFecha(
//                           selectedS3Obj.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <TableContainer
//                       component={Paper}
//                       className={tableStyles.dataTableContainer}
//                       sx={{
//                         maxHeight: "500px",
//                         borderRadius: 2,
//                         border: "1px solid #e0e0e0",
//                         boxShadow: "none",
//                       }}
//                     >
//                       <Table stickyHeader className={tableStyles.tableFit}>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell className={tableStyles.tableHeader}>Angle</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Voltage</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Current</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Efficiency</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Fill Factor</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Actions</TableCell>
//                           </TableRow>
//                         </TableHead>

//                         <TableBody>
//                           <React.Fragment key={selectedS3Obj.id}>
//                             <TableRow className={tableStyles.tableRow}>
//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 rowSpan={2}
//                                 sx={{ borderBottom: "1px solid #e0e0e0", fontWeight: "bold" }}
//                               >
//                                 {selectedS3Obj.angle ?? "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Vo != null ? selectedS3Obj.Vo.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Io != null ? selectedS3Obj.Io.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Eo != null
//                                   ? `${(selectedS3Obj.Eo * 100).toFixed(2)}%`
//                                   : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.FFo != null ? selectedS3Obj.FFo.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 rowSpan={2}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 <IconButton
//                                   color="error"
//                                   onClick={() => handleDeleteMeasurementS3(selectedS3Obj.id)}
//                                 >
//                                   <DeleteIcon />
//                                 </IconButton>
//                               </TableCell>
//                             </TableRow>

//                             <TableRow className={tableStyles.tableRow}>
//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.Vf != null ? selectedS3Obj.Vf.toFixed(2) : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.If != null ? selectedS3Obj.If.toFixed(2) : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.Ef != null
//                                   ? `${(selectedS3Obj.Ef * 100).toFixed(2)}%`
//                                   : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.FFf != null ? selectedS3Obj.FFf.toFixed(2) : "..."}
//                               </TableCell>
//                             </TableRow>
//                           </React.Fragment>
//                         </TableBody>                        
//                       </Table>
//                     </TableContainer>
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 4 */}
//           <TabPanel value={tab} index={3}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS4} mediciones guardadas
//                 </Typography>
//               </Box>

//               {(countS4 > 0 || latestEnvironmentDataS4) && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema4")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS4 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s4-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s4-measurement-label"
//                     value={selectedMeasurementS4}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS4(e.target.value)}
//                   >
//                     {measurementsS4.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧪 ${m.id} • ${m.integrationTime ?? "?"} ms • ${m.status ?? "unknown"} • ${formatearFecha(
//                           m.timestamp
//                         )}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS4Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`ID: ${selectedS4Obj.id} • Tiempo de integración: ${
//                           selectedS4Obj.integrationTime ?? "?"
//                         } ms • Estado: ${selectedS4Obj.status ?? "unknown"} • ${formatearFecha(
//                           selectedS4Obj.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM4_COLUMNS}
//                       data={[
//                         {
//                           "Measurement ID": selectedS4Obj.id,
//                           "Integration Time (ms)": selectedS4Obj.integrationTime ?? "—",
//                           Status: selectedS4Obj.status ?? "—",
//                           Saved: selectedS4Obj.isSaved ? "Yes" : "No",
//                           Date: formatearFecha(selectedS4Obj.timestamp),
//                         },
//                       ]}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}

//             <Divider sx={{ my: 4 }} />

//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Light Filters Efficiency
//             </Typography>

//             {latestEnvironmentDataS4 ? (
//               <Grid container spacing={2}>
//                 {[
//                   { label: "Reference", key: "referencia", color: "#9e9e9e" },
//                   { label: "Yellow Filter", key: "filtroAmarillo", color: "#fbc02d" },
//                   { label: "Blue Filter", key: "filtroAzul", color: "#1976d2" },
//                   { label: "Red Filter", key: "filtroRojo", color: "#d32f2f" },
//                 ].map((panel) => (
//                   <Grid item xs={12} sm={6} md={3} key={panel.key}>
//                     <Paper
//                       elevation={3}
//                       sx={{
//                         p: 3,
//                         textAlign: "center",
//                         borderRadius: "15px",
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <Typography variant="subtitle2" color="text.secondary">
//                         {panel.label}
//                       </Typography>
//                       <Typography
//                         variant="h4"
//                         sx={{ fontWeight: "bold", color: panel.color, my: 1 }}
//                       >
//                         {latestEnvironmentDataS4?.[panel.key] ?? 0}%
//                       </Typography>
//                       <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.disabled" }}>
//                         Relative Power
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* EXPORT */}
//           <TabPanel value={tab} index={4}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos seleccionados
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Selecciona los subsistemas y los registros que deseas descargar.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label="Subsystem 1"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s1-label">Barridos de Subsystem 1</InputLabel>
//                 <Select
//                   labelId="multi-s1-label"
//                   multiple
//                   value={selectedSweepsS1}
//                   onChange={(e) => setSelectedSweepsS1(e.target.value)}
//                   input={<OutlinedInput label="Barridos de Subsystem 1" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {sweepsS1.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       <Checkbox checked={selectedSweepsS1.includes(s.id)} />
//                       <ListItemText
//                         primary={`${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}°`}
//                         secondary={`${s.datos?.length ?? 0} mediciones`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label="Subsystem 2"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s2-label">Barridos de Subsystem 2</InputLabel>
//                 <Select
//                   labelId="multi-s2-label"
//                   multiple
//                   value={selectedSweepsS2}
//                   onChange={(e) => setSelectedSweepsS2(e.target.value)}
//                   input={<OutlinedInput label="Barridos de Subsystem 2" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {sweepsS2.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       <Checkbox checked={selectedSweepsS2.includes(s.id)} />
//                       <ListItemText
//                         primary={`Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°)`}
//                         secondary={`${s.datos?.length ?? 0} mediciones`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema3}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema3"
//                   />
//                 }
//                 label="Subsystem 3"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s3-label">Mediciones de Subsystem 3</InputLabel>
//                 <Select
//                   labelId="multi-s3-label"
//                   multiple
//                   value={selectedMeasurementsS3}
//                   onChange={(e) => setSelectedMeasurementsS3(e.target.value)}
//                   input={<OutlinedInput label="Mediciones de Subsystem 3" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {measurementsS3.map((m) => (
//                     <MenuItem key={m.id} value={m.id}>
//                       <Checkbox checked={selectedMeasurementsS3.includes(m.id)} />
//                       <ListItemText
//                         primary={`Ángulo ${m.angle ?? "?"}°`}
//                         secondary={formatearFecha(m.timestamp)}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema4}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema4"
//                   />
//                 }
//                 label="Subsystem 4"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s4-label">Mediciones de Subsystem 4</InputLabel>
//                 <Select
//                   labelId="multi-s4-label"
//                   multiple
//                   value={selectedMeasurementsS4}
//                   onChange={(e) => setSelectedMeasurementsS4(e.target.value)}
//                   input={<OutlinedInput label="Mediciones de Subsystem 4" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {measurementsS4.map((m) => (
//                     <MenuItem key={m.id} value={m.id}>
//                       <Checkbox checked={selectedMeasurementsS4.includes(m.id)} />
//                       <ListItemText
//                         primary={`${m.id}`}
//                         secondary={`${m.integrationTime ?? "?"} ms • ${m.status ?? "unknown"}`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={includeFiltersS4}
//                     onChange={(e) => setIncludeFiltersS4(e.target.checked)}
//                   />
//                 }
//                 label="Incluir también Light Filters Efficiency de Subsystem 4"
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {selectedSweepsS1.length === 0 &&
//               selectedSweepsS2.length === 0 &&
//               selectedMeasurementsS3.length === 0 &&
//               selectedMeasurementsS4.length === 0 && (
//                 <Box sx={{ mt: 2 }}>
//                   <NoDataMessage />
//                 </Box>
//               )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;






// nueva verdsion son mejora s4



// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   OutlinedInput,
//   ListItemText,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Tooltip,
//   Menu,
//   FormGroup,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { Download, CropFree, ArrowDropDown } from "@mui/icons-material";
// import { generateCSV } from "../../components/Elements/generateCSV.jsx";

// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";
// import tableStyles from "../../assets/css/Elements/DataTable.module.css";

// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const SUBSYSTEM3_COLUMNS = [
//   "Angle (°)",
//   "Dirty Voltage",
//   "Dirty Current",
//   "Dirty Efficiency",
//   "Dirty Fill Factor",
//   "Clean Voltage",
//   "Clean Current",
//   "Clean Efficiency",
//   "Clean Fill Factor",
//   "Date",
// ];

// const SUBSYSTEM4_COLUMNS = [
//   "Integration Time (ms)",
//   "Date",
//   "Actions",
// ];

// const SUBSYSTEM4_FILTER_COLUMNS = [
//   "Date",
//   "Reference (%)",
//   "Yellow Filter (%)",
//   "Blue Filter (%)",
//   "Red Filter (%)",
// ];

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

// const menuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
//       width: 380,
//     },
//   },
// };

// const ESTOY_EN_EL_LAB = true;

// const API_BASE_URL = ESTOY_EN_EL_LAB
//   ? "http://127.0.0.1:8000"
//   : "https://tactilely-furrowless-liane.ngrok-free.dev";

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [medicionesSubsistema3, setMedicionesSubsistema3] = useState({});
//   const [medicionesSubsistema4, setMedicionesSubsistema4] = useState({});
//   const [environmentDataSubsistema4, setEnvironmentDataSubsistema4] = useState({});

//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState(0);

//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");
//   const [selectedMeasurementS3, setSelectedMeasurementS3] = useState("");
//   const [selectedMeasurementS4, setSelectedMeasurementS4] = useState("");

//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//     subsistema3: true,
//     subsistema4: true,
//   });

//   const [selectedSweepsS1, setSelectedSweepsS1] = useState([]);
//   const [selectedSweepsS2, setSelectedSweepsS2] = useState([]);
//   const [selectedMeasurementsS3, setSelectedMeasurementsS3] = useState([]);
//   const [selectedMeasurementsS4, setSelectedMeasurementsS4] = useState([]);
//   const [includeFiltersS4, setIncludeFiltersS4] = useState(true);

//   const [anchorElS4, setAnchorElS4] = useState(null);
//   const [imageSelectionS4, setImageSelectionS4] = useState({
//     completo: true,
//     uv: false,
//     visible: false,
//     nir: false,
//   });

//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }

//               setSelectedSweepsS1((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }

//               setSelectedSweepsS2((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP3 =====================
//       const exp3MeasurementsRef = ref(db, `users/${userId}/Exp3/measurements`);
//       onValue(
//         exp3MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema3({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema3(savedMeasurements);

//           if (selectedMeasurementS3 && !savedMeasurements[selectedMeasurementS3]) {
//             setSelectedMeasurementS3("");
//           }

//           setSelectedMeasurementsS3((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - MEDICIONES =====================
//       const exp4MeasurementsRef = ref(db, `users/${userId}/Exp4/measurements`);
//       onValue(
//         exp4MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema4({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema4(savedMeasurements);

//           if (selectedMeasurementS4 && !savedMeasurements[selectedMeasurementS4]) {
//             setSelectedMeasurementS4("");
//           }

//           setSelectedMeasurementsS4((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - FILTROS =====================
//       const exp4EnvironmentRef = ref(db, `users/${userId}/Exp4/environmentData`);
//       onValue(
//         exp4EnvironmentRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setEnvironmentDataSubsistema4({});
//             setLoading(false);
//             return;
//           }

//           setEnvironmentDataSubsistema4(snapshot.val());
//           setLoading(false);
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         setSelectedSweepsS1([]);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         setSelectedSweepsS2([]);
//       }

//       if (subsistema === "subsistema3") {
//         await remove(ref(db, `users/${userId}/Exp3/measurements`));
//         setMedicionesSubsistema3({});
//         setSelectedMeasurementS3("");
//         setSelectedMeasurementsS3([]);
//       }

//       if (subsistema === "subsistema4") {
//         await remove(ref(db, `users/${userId}/Exp4/measurements`));
//         await remove(ref(db, `users/${userId}/Exp4/environmentData`));
//         await remove(ref(db, `users/${userId}/Exp4/currentMeasurementId`));
//         await remove(ref(db, `users/${userId}/Exp4/currentSensorMeasurementId`));
//         setMedicionesSubsistema4({});
//         setEnvironmentDataSubsistema4({});
//         setSelectedMeasurementS4("");
//         setSelectedMeasurementsS4([]);
//       }

//       alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   const handleDeleteMeasurementS3 = async (measurementId) => {
//     if (!userId || !measurementId) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar esta medición del Subsystem 3?"
//     );
//     if (!confirmar) return;

//     try {
//       await remove(ref(db, `users/${userId}/Exp3/measurements/${measurementId}`));

//       setMedicionesSubsistema3((prev) => {
//         const updated = { ...prev };
//         delete updated[measurementId];
//         return updated;
//       });

//       if (selectedMeasurementS3 === measurementId) {
//         setSelectedMeasurementS3("");
//       }

//       setSelectedMeasurementsS3((prev) => prev.filter((id) => id !== measurementId));

//       alert("✅ Medición eliminada correctamente");
//     } catch (error) {
//       console.error("❌ Error al eliminar medición de Subsystem 3:", error);
//       alert(`Error al eliminar medición: ${error.message}`);
//     }
//   };

//   const handleDeleteMeasurementS4 = async (measurementId) => {
//     if (!userId || !measurementId) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar esta medición del Subsystem 4?"
//     );
//     if (!confirmar) return;

//     try {
//       await remove(ref(db, `users/${userId}/Exp4/measurements/${measurementId}`));

//       setMedicionesSubsistema4((prev) => {
//         const updated = { ...prev };
//         delete updated[measurementId];
//         return updated;
//       });

//       if (selectedMeasurementS4 === measurementId) {
//         setSelectedMeasurementS4("");
//       }

//       setSelectedMeasurementsS4((prev) => prev.filter((id) => id !== measurementId));

//       alert("✅ Medición eliminada correctamente");
//     } catch (error) {
//       console.error("❌ Error al eliminar medición de Subsystem 4:", error);
//       alert(`Error al eliminar medición: ${error.message}`);
//     }
//   };

//   const handleSystemCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   const getExp2StartPitch = (meta) =>
//     meta?.pitchStart ?? meta?.azimuthStart ?? "?";

//   const getExp2EndPitch = (meta) =>
//     meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

//   const getExp2StartRoll = (meta) =>
//     meta?.rollStart ?? meta?.zenithStart ?? "?";

//   const getExp2EndRoll = (meta) =>
//     meta?.rollEnd ?? meta?.zenithEnd ?? "?";

//   const getExp2PitchMeasurement = (d) =>
//     d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

//   const getExp2RollMeasurement = (d) =>
//     d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

//   const getLatestEnvironmentData = () => {
//     const entries = Object.entries(environmentDataSubsistema4 || {});
//     if (entries.length === 0) return null;

//     entries.sort((a, b) => {
//       const tsA = a[1]?.timestamp ?? 0;
//       const tsB = b[1]?.timestamp ?? 0;
//       return tsB - tsA;
//     });

//     return { id: entries[0][0], ...entries[0][1] };
//   };

//   const latestEnvironmentDataS4 = getLatestEnvironmentData();

//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   const measurementsS3 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema3).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema3]);

//   const measurementsS4 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema4).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema4]);

//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   useEffect(() => {
//     if (!selectedMeasurementS3 && measurementsS3.length > 0) {
//       setSelectedMeasurementS3(measurementsS3[0].id);
//     }
//   }, [measurementsS3, selectedMeasurementS3]);

//   useEffect(() => {
//     if (!selectedMeasurementS4 && measurementsS4.length > 0) {
//       setSelectedMeasurementS4(measurementsS4[0].id);
//     }
//   }, [measurementsS4, selectedMeasurementS4]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );

//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const selectedS3Obj = useMemo(
//     () => measurementsS3.find((m) => m.id === selectedMeasurementS3) || null,
//     [measurementsS3, selectedMeasurementS3]
//   );

//   const selectedS4Obj = useMemo(
//     () => measurementsS4.find((m) => m.id === selectedMeasurementS4) || null,
//     [measurementsS4, selectedMeasurementS4]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;
//   const countS3 = measurementsS3.length;
//   const countS4 = measurementsS4.length;

//   const handleMenuOpenS4 = (event) => setAnchorElS4(event.currentTarget);
//   const handleMenuCloseS4 = () => setAnchorElS4(null);

//   const handleCheckboxToggleS4 = (name) => {
//     setImageSelectionS4((prev) => ({ ...prev, [name]: !prev[name] }));
//   };

//   const isAllSelectedS4 =
//     imageSelectionS4.completo &&
//     imageSelectionS4.uv &&
//     imageSelectionS4.visible &&
//     imageSelectionS4.nir;

//   const handleSelectAllS4 = (event) => {
//     const checked = event.target.checked;
//     setImageSelectionS4({
//       completo: checked,
//       uv: checked,
//       visible: checked,
//       nir: checked,
//     });
//   };

//   const handleDownloadTxtS4 = () => {
//     if (!selectedS4Obj?.id) {
//       alert("Selecciona una medición del Subsystem 4.");
//       return;
//     }

//     const downloadUrl = `${API_BASE_URL}/descargar/datos/${userId}/${selectedS4Obj.id}`;
//     window.open(downloadUrl, "_blank");
//   };

//   const handleDownloadImagesS4 = () => {
//     if (!selectedS4Obj?.id) {
//       alert("Selecciona una medición del Subsystem 4.");
//       return;
//     }

//     const haySeleccion =
//       imageSelectionS4.completo ||
//       imageSelectionS4.uv ||
//       imageSelectionS4.visible ||
//       imageSelectionS4.nir;

//     if (!haySeleccion) {
//       alert("Selecciona al menos una gráfica.");
//       return;
//     }

//     const queryParams = new URLSearchParams({
//       completo: imageSelectionS4.completo,
//       uv: imageSelectionS4.uv,
//       visible: imageSelectionS4.visible,
//       nir: imageSelectionS4.nir,
//     }).toString();

//     const downloadUrl = `${API_BASE_URL}/descargar/graficas/${userId}/${selectedS4Obj.id}?${queryParams}`;
//     window.open(downloadUrl, "_blank");
//     handleMenuCloseS4();
//   };

//   const handleDownloadCSV = () => {
//     const selectedData = [];

//     if (selectedSystems.subsistema1 && selectedSweepsS1.length > 0) {
//       const dataS1 = selectedSweepsS1.flatMap((id) => {
//         const sweep = barridosSubsistema1[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Angle (°)": d.angle,
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: dataS1,
//         key: "subsistema1",
//       });
//     }

//     if (selectedSystems.subsistema2 && selectedSweepsS2.length > 0) {
//       const dataS2 = selectedSweepsS2.flatMap((id) => {
//         const sweep = barridosSubsistema2[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//           "Zenith Angle (°)": getExp2RollMeasurement(d),
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: dataS2,
//         key: "subsistema2",
//       });
//     }

//     if (selectedSystems.subsistema3 && selectedMeasurementsS3.length > 0) {
//       const dataS3 = selectedMeasurementsS3.map((id) => {
//         const m = medicionesSubsistema3[id];
//         return {
//           "Angle (°)": m?.angle ?? "—",
//           "Dirty Voltage": m?.Vo != null ? Number(m.Vo).toFixed(2) : "—",
//           "Dirty Current": m?.Io != null ? Number(m.Io).toFixed(2) : "—",
//           "Dirty Efficiency": m?.Eo != null ? `${(Number(m.Eo) * 100).toFixed(2)}%` : "—",
//           "Dirty Fill Factor": m?.FFo != null ? Number(m.FFo).toFixed(2) : "—",
//           "Clean Voltage": m?.Vf != null ? Number(m.Vf).toFixed(2) : "—",
//           "Clean Current": m?.If != null ? Number(m.If).toFixed(2) : "—",
//           "Clean Efficiency": m?.Ef != null ? `${(Number(m.Ef) * 100).toFixed(2)}%` : "—",
//           "Clean Fill Factor": m?.FFf != null ? Number(m.FFf).toFixed(2) : "—",
//           Date: formatearFecha(m?.timestamp),
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3",
//         data: dataS3,
//         key: "subsistema3",
//       });
//     }

//     if (selectedSystems.subsistema4 && selectedMeasurementsS4.length > 0) {
//       const dataS4 = selectedMeasurementsS4.map((id) => {
//         const m = medicionesSubsistema4[id];
//         return {
//           "Integration Time (ms)": m?.integrationTime ?? "—",
//           Date: formatearFecha(m?.timestamp),
//           Actions: "TXT / IMG",
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4 Measurements",
//         data: dataS4,
//         key: "subsistema4",
//       });

//       if (includeFiltersS4 && latestEnvironmentDataS4) {
//         selectedData.push({
//           title: "Subsystem 4 Filters",
//           data: [
//             {
//               Date: formatearFecha(latestEnvironmentDataS4.timestamp),
//               "Reference (%)": latestEnvironmentDataS4.referencia ?? 0,
//               "Yellow Filter (%)": latestEnvironmentDataS4.filtroAmarillo ?? 0,
//               "Blue Filter (%)": latestEnvironmentDataS4.filtroAzul ?? 0,
//               "Red Filter (%)": latestEnvironmentDataS4.filtroRojo ?? 0,
//             },
//           ],
//           key: "subsistema4_filtros",
//         });
//       }
//     }

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED || "No hay datos seleccionados para exportar.");
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSYSTEM2_COLUMNS,
//       subsistema3: SUBSYSTEM3_COLUMNS,
//       subsistema4: SUBSYSTEM4_COLUMNS,
//       subsistema4_filtros: SUBSYSTEM4_FILTER_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_selected_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label={`Subsystem 3 ${countS3 ? `(${countS3})` : ""}`} />
//             <Tab label={`Subsystem 4 ${countS4 ? `(${countS4})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* SUBSYSTEM 1 */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               {countS1 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema1")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 2 */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               {countS2 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema2")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
//                           selectedS2Obj.metadata
//                         )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
//                           selectedS2Obj.metadata
//                         )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//                         "Zenith Angle (°)": getExp2RollMeasurement(d),
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 3 */}
//           <TabPanel value={tab} index={2}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS3} mediciones guardadas
//                 </Typography>
//               </Box>

//               {countS3 > 0 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema3")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS3 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s3-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s3-measurement-label"
//                     value={selectedMeasurementS3}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS3(e.target.value)}
//                   >
//                     {measurementsS3.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧼 ${m.angle ?? "?"}° • ${formatearFecha(m.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS3Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Ángulo: ${selectedS3Obj.angle ?? "?"}° • ${formatearFecha(
//                           selectedS3Obj.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <TableContainer
//                       component={Paper}
//                       className={tableStyles.dataTableContainer}
//                       sx={{
//                         maxHeight: "500px",
//                         borderRadius: 2,
//                         border: "1px solid #e0e0e0",
//                         boxShadow: "none",
//                       }}
//                     >
//                       <Table stickyHeader className={tableStyles.tableFit}>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell className={tableStyles.tableHeader}>Angle</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Voltage</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Current</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Efficiency</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Fill Factor</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Actions</TableCell>
//                           </TableRow>
//                         </TableHead>

//                         <TableBody>
//                           <React.Fragment key={selectedS3Obj.id}>
//                             <TableRow className={tableStyles.tableRow}>
//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 rowSpan={2}
//                                 sx={{ borderBottom: "1px solid #e0e0e0", fontWeight: "bold" }}
//                               >
//                                 {selectedS3Obj.angle ?? "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Vo != null ? selectedS3Obj.Vo.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Io != null ? selectedS3Obj.Io.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Eo != null
//                                   ? `${(selectedS3Obj.Eo * 100).toFixed(2)}%`
//                                   : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.FFo != null ? selectedS3Obj.FFo.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 rowSpan={2}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 <IconButton
//                                   color="error"
//                                   onClick={() => handleDeleteMeasurementS3(selectedS3Obj.id)}
//                                 >
//                                   <DeleteIcon />
//                                 </IconButton>
//                               </TableCell>
//                             </TableRow>

//                             <TableRow className={tableStyles.tableRow}>
//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.Vf != null ? selectedS3Obj.Vf.toFixed(2) : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.If != null ? selectedS3Obj.If.toFixed(2) : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.Ef != null
//                                   ? `${(selectedS3Obj.Ef * 100).toFixed(2)}%`
//                                   : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.FFf != null ? selectedS3Obj.FFf.toFixed(2) : "..."}
//                               </TableCell>
//                             </TableRow>
//                           </React.Fragment>
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 4 */}
//           <TabPanel value={tab} index={3}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS4} mediciones guardadas
//                 </Typography>
//               </Box>

//               {(countS4 > 0 || latestEnvironmentDataS4) && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema4")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS4 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s4-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s4-measurement-label"
//                     value={selectedMeasurementS4}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS4(e.target.value)}
//                   >
//                     {measurementsS4.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧪 ${m.id} • ${m.integrationTime ?? "?"} ms • ${formatearFecha(
//                           m.timestamp
//                         )}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS4Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`ID: ${selectedS4Obj.id} • Tiempo de integración: ${
//                           selectedS4Obj.integrationTime ?? "?"
//                         } ms • ${formatearFecha(selectedS4Obj.timestamp)}`}
//                       </Typography>
//                     </Paper>

//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         mb: 2,
//                         gap: 2,
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <Typography variant="h6">Spectrometer Files</Typography>

//                       <Box sx={{ display: "flex", gap: 1 }}>
//                         <Tooltip title="Descargar archivo TXT de la medición" arrow>
//                           <span>
//                             <Button
//                               variant="outlined"
//                               size="small"
//                               color="primary"
//                               onClick={handleDownloadTxtS4}
//                               startIcon={<Download fontSize="small" />}
//                             >
//                               TXT
//                             </Button>
//                           </span>
//                         </Tooltip>

//                         <Tooltip title="Seleccionar y descargar gráficas" arrow>
//                           <span>
//                             <Button
//                               variant="outlined"
//                               size="small"
//                               color="primary"
//                               onClick={handleMenuOpenS4}
//                               startIcon={<CropFree fontSize="small" />}
//                               endIcon={<ArrowDropDown fontSize="small" />}
//                             >
//                               IMG
//                             </Button>
//                           </span>
//                         </Tooltip>
//                       </Box>
//                     </Box>

//                     <TableContainer
//                       component={Paper}
//                       className={tableStyles.dataTableContainer}
//                       sx={{
//                         maxHeight: "400px",
//                         borderRadius: 2,
//                         border: "1px solid #e0e0e0",
//                         boxShadow: "none",
//                       }}
//                     >
//                       <Table stickyHeader className={tableStyles.tableFit}>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell className={tableStyles.tableHeader}>
//                               Integration Time (ms)
//                             </TableCell>
//                             <TableCell className={tableStyles.tableHeader}>
//                               Date
//                             </TableCell>
//                             <TableCell className={tableStyles.tableHeader}>
//                               Actions
//                             </TableCell>
//                           </TableRow>
//                         </TableHead>

//                         <TableBody>
//                           <TableRow className={tableStyles.tableRow}>
//                             <TableCell className={tableStyles.tableCell}>
//                               {selectedS4Obj.integrationTime ?? "—"}
//                             </TableCell>

//                             <TableCell className={tableStyles.tableCell}>
//                               {formatearFecha(selectedS4Obj.timestamp)}
//                             </TableCell>

//                             <TableCell className={tableStyles.tableCell}>
//                               <IconButton
//                                 color="error"
//                                 onClick={() => handleDeleteMeasurementS4(selectedS4Obj.id)}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </TableCell>
//                           </TableRow>
//                         </TableBody>
//                       </Table>
//                     </TableContainer>                    
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}

//             <Menu
//               anchorEl={anchorElS4}
//               open={Boolean(anchorElS4)}
//               onClose={handleMenuCloseS4}
//               anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//               transformOrigin={{ vertical: "top", horizontal: "right" }}
//               PaperProps={{ sx: { borderRadius: "12px", mt: 1, minWidth: "220px", p: 1 } }}
//             >
//               <Box sx={{ px: 2, py: 1, outline: "none" }}>
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: "bold" }}>
//                   Select graphs to export
//                 </Typography>

//                 <FormGroup>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={isAllSelectedS4}
//                         onChange={handleSelectAllS4}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2" sx={{ fontWeight: "bold" }}>All Graphs</Typography>}
//                   />
//                   <Divider sx={{ my: 0.5 }} />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.completo}
//                         onChange={() => handleCheckboxToggleS4("completo")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">Complete Spectrum</Typography>}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.uv}
//                         onChange={() => handleCheckboxToggleS4("uv")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">UV Spectrum</Typography>}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.visible}
//                         onChange={() => handleCheckboxToggleS4("visible")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">Visible Spectrum</Typography>}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.nir}
//                         onChange={() => handleCheckboxToggleS4("nir")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">NIR Spectrum</Typography>}
//                   />
//                 </FormGroup>

//                 <Button
//                   variant="contained"
//                   color="primary"
//                   size="small"
//                   fullWidth
//                   sx={{ mt: 2 }}
//                   onClick={handleDownloadImagesS4}
//                   startIcon={<Download fontSize="small" />}
//                 >
//                   Download
//                 </Button>
//               </Box>
//             </Menu>

//             <Divider sx={{ my: 4 }} />

//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Light Filters Efficiency
//             </Typography>

//             {latestEnvironmentDataS4 ? (
//               <Grid container spacing={2}>
//                 {[
//                   { label: "Reference", key: "referencia", color: "#9e9e9e" },
//                   { label: "Yellow Filter", key: "filtroAmarillo", color: "#fbc02d" },
//                   { label: "Blue Filter", key: "filtroAzul", color: "#1976d2" },
//                   { label: "Red Filter", key: "filtroRojo", color: "#d32f2f" },
//                 ].map((panel) => (
//                   <Grid item xs={12} sm={6} md={3} key={panel.key}>
//                     <Paper
//                       elevation={3}
//                       sx={{
//                         p: 3,
//                         textAlign: "center",
//                         borderRadius: "15px",
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <Typography variant="subtitle2" color="text.secondary">
//                         {panel.label}
//                       </Typography>
//                       <Typography
//                         variant="h4"
//                         sx={{ fontWeight: "bold", color: panel.color, my: 1 }}
//                       >
//                         {latestEnvironmentDataS4?.[panel.key] ?? 0}%
//                       </Typography>
//                       <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.disabled" }}>
//                         Relative Power
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* EXPORT */}
//           <TabPanel value={tab} index={4}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos seleccionados
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Selecciona los subsistemas y los registros que deseas descargar.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label="Subsystem 1"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s1-label">Barridos de Subsystem 1</InputLabel>
//                 <Select
//                   labelId="multi-s1-label"
//                   multiple
//                   value={selectedSweepsS1}
//                   onChange={(e) => setSelectedSweepsS1(e.target.value)}
//                   input={<OutlinedInput label="Barridos de Subsystem 1" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {sweepsS1.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       <Checkbox checked={selectedSweepsS1.includes(s.id)} />
//                       <ListItemText
//                         primary={`${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}°`}
//                         secondary={`${s.datos?.length ?? 0} mediciones`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label="Subsystem 2"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s2-label">Barridos de Subsystem 2</InputLabel>
//                 <Select
//                   labelId="multi-s2-label"
//                   multiple
//                   value={selectedSweepsS2}
//                   onChange={(e) => setSelectedSweepsS2(e.target.value)}
//                   input={<OutlinedInput label="Barridos de Subsystem 2" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {sweepsS2.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       <Checkbox checked={selectedSweepsS2.includes(s.id)} />
//                       <ListItemText
//                         primary={`Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°)`}
//                         secondary={`${s.datos?.length ?? 0} mediciones`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema3}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema3"
//                   />
//                 }
//                 label="Subsystem 3"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s3-label">Mediciones de Subsystem 3</InputLabel>
//                 <Select
//                   labelId="multi-s3-label"
//                   multiple
//                   value={selectedMeasurementsS3}
//                   onChange={(e) => setSelectedMeasurementsS3(e.target.value)}
//                   input={<OutlinedInput label="Mediciones de Subsystem 3" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {measurementsS3.map((m) => (
//                     <MenuItem key={m.id} value={m.id}>
//                       <Checkbox checked={selectedMeasurementsS3.includes(m.id)} />
//                       <ListItemText
//                         primary={`Ángulo ${m.angle ?? "?"}°`}
//                         secondary={formatearFecha(m.timestamp)}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema4}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema4"
//                   />
//                 }
//                 label="Subsystem 4"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s4-label">Mediciones de Subsystem 4</InputLabel>
//                 <Select
//                   labelId="multi-s4-label"
//                   multiple
//                   value={selectedMeasurementsS4}
//                   onChange={(e) => setSelectedMeasurementsS4(e.target.value)}
//                   input={<OutlinedInput label="Mediciones de Subsystem 4" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {measurementsS4.map((m) => (
//                     <MenuItem key={m.id} value={m.id}>
//                       <Checkbox checked={selectedMeasurementsS4.includes(m.id)} />
//                       <ListItemText
//                         primary={`${m.id}`}
//                         secondary={`${m.integrationTime ?? "?"} ms`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={includeFiltersS4}
//                     onChange={(e) => setIncludeFiltersS4(e.target.checked)}
//                   />
//                 }
//                 label="Incluir también Light Filters Efficiency de Subsystem 4"
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {selectedSweepsS1.length === 0 &&
//               selectedSweepsS2.length === 0 &&
//               selectedMeasurementsS3.length === 0 &&
//               selectedMeasurementsS4.length === 0 && (
//                 <Box sx={{ mt: 2 }}>
//                   <NoDataMessage />
//                 </Box>
//               )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;





// la version de anthony
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   OutlinedInput,
//   ListItemText,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Tooltip,
//   Menu,
//   FormGroup,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// import DataTable from "../../components/Elements/DataTable.jsx";
// import Button from "../../components/Elements/Button.jsx";
// import DeleteIcon from "@mui/icons-material/Delete";
// import {
//   Download,
//   CropFree,
//   ArrowDropDown,
// } from "@mui/icons-material";
// // import { generateCSV } from "../../components/Elements/generateCSV.jsx";
// import { exportData } from "../../../src/utils/ExportUtils.js";

// import { getDatabase, ref, onValue, remove } from "firebase/database";
// import app from "../../firebaseConfig.js";

// import {
//   PAGE_TITLES,
//   ALERT_MESSAGES,
//   SUBSYSTEM_TITLES,
// } from "../../assets/Strings/Experiments/DataSummaryStrings.jsx";
// import { SUBSISTEMA1_COLUMNS } from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";
// import { SUBSYSTEM2_COLUMNS } from "../../assets/Strings/Experiments/Subsistema2Strings.jsx";
// import tableStyles from "../../assets/css/Elements/DataTable.module.css";

// function TabPanel({ value, index, children }) {
//   if (value !== index) return null;
//   return (
//     <Box sx={{ pt: 2, width: "100%" }} role="tabpanel">
//       {children}
//     </Box>
//   );
// }

// const SUBSYSTEM3_COLUMNS = [
//   "Angle (°)",
//   "Dirty Voltage",
//   "Dirty Current",
//   "Dirty Efficiency",
//   "Dirty Fill Factor",
//   "Clean Voltage",
//   "Clean Current",
//   "Clean Efficiency",
//   "Clean Fill Factor",
//   "Date",
// ];

// const SUBSYSTEM4_COLUMNS = [
//   "Integration Time (ms)",
//   "Date",
//   "Actions",
// ];

// const SUBSYSTEM4_FILTER_COLUMNS = [
//   "Date",
//   "Reference (%)",
//   "Yellow Filter (%)",
//   "Blue Filter (%)",
//   "Red Filter (%)",
// ];

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

// const menuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
//       width: 380,
//     },
//   },
// };

// const ESTOY_EN_EL_LAB = true;

// const API_BASE_URL = ESTOY_EN_EL_LAB
//   ? "http://127.0.0.1:8000"
//   : "https://tactilely-furrowless-liane.ngrok-free.dev";

// const DataSummary = () => {
//   const navigate = useNavigate();
//   const db = getDatabase(app);

//   const user = useSelector((state) => state.auth.user);
//   const userId = user?.uid;

//   const {
//     MAIN_TITLE,
//     DESCRIPTION,
//     DOWNLOAD_BUTTON,
//     CLEAR_BUTTON,
//     NO_DATA_MESSAGE,
//     SELECT_SUBSYSTEMS,
//     BACK_BUTTON,
//   } = PAGE_TITLES;

//   const [barridosSubsistema1, setBarridosSubsistema1] = useState({});
//   const [barridosSubsistema2, setBarridosSubsistema2] = useState({});
//   const [medicionesSubsistema3, setMedicionesSubsistema3] = useState({});
//   const [medicionesSubsistema4, setMedicionesSubsistema4] = useState({});
//   const [environmentDataSubsistema4, setEnvironmentDataSubsistema4] = useState({});

//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState(0);

//   const [selectedSweepS1, setSelectedSweepS1] = useState("");
//   const [selectedSweepS2, setSelectedSweepS2] = useState("");
//   const [selectedMeasurementS3, setSelectedMeasurementS3] = useState("");
//   const [selectedMeasurementS4, setSelectedMeasurementS4] = useState("");

//   const [selectedSystems, setSelectedSystems] = useState({
//     subsistema1: true,
//     subsistema2: true,
//     subsistema3: true,
//     subsistema4: true,
//   });

//   const [selectedSweepsS1, setSelectedSweepsS1] = useState([]);
//   const [selectedSweepsS2, setSelectedSweepsS2] = useState([]);
//   const [selectedMeasurementsS3, setSelectedMeasurementsS3] = useState([]);
//   const [selectedMeasurementsS4, setSelectedMeasurementsS4] = useState([]);
//   const [includeFiltersS4, setIncludeFiltersS4] = useState(true);

//   const [anchorElS4, setAnchorElS4] = useState(null);
//   const [imageSelectionS4, setImageSelectionS4] = useState({
//     completo: true,
//     uv: false,
//     visible: false,
//     nir: false,
//   });

//   useEffect(() => {
//     if (!userId) {
//       alert("Debes iniciar sesión para ver tus datos");
//       navigate("/login");
//     }
//   }, [userId, navigate]);

//   const filtrarSoloBarridosGuardados = (sweepsWithData) => {
//     const filtrados = {};
//     Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
//       if ((obj?.datos?.length ?? 0) > 0) {
//         filtrados[sweepId] = obj;
//       }
//     });
//     return filtrados;
//   };

//   useEffect(() => {
//     if (!userId) return;
//     cargarDatosDesdeFirebase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const cargarDatosDesdeFirebase = async () => {
//     if (!userId) return;

//     setLoading(true);

//     try {
//       // ===================== EXP1 =====================
//       const exp1SweepsRef = ref(db, `users/${userId}/Exp1/sweeps`);
//       onValue(
//         exp1SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema1({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp1MeasurementsRef = ref(db, `users/${userId}/Exp1/measurements`);
//           onValue(
//             exp1MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema1(soloGuardados);

//               if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
//                 setSelectedSweepS1("");
//               }

//               setSelectedSweepsS1((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP2 =====================
//       const exp2SweepsRef = ref(db, `users/${userId}/Exp2/sweeps`);
//       onValue(
//         exp2SweepsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setBarridosSubsistema2({});
//             return;
//           }

//           const sweeps = snapshot.val();
//           const sweepsWithData = {};
//           Object.entries(sweeps).forEach(([sweepId, sweepMeta]) => {
//             sweepsWithData[sweepId] = { metadata: sweepMeta, datos: [] };
//           });

//           const exp2MeasurementsRef = ref(db, `users/${userId}/Exp2/measurements`);
//           onValue(
//             exp2MeasurementsRef,
//             (measSnap) => {
//               if (measSnap.exists()) {
//                 const measurements = measSnap.val();
//                 Object.values(measurements).forEach((meas) => {
//                   if (meas.isSaved && meas.sweepId && sweepsWithData[meas.sweepId]) {
//                     sweepsWithData[meas.sweepId].datos.push(meas);
//                   }
//                 });

//                 Object.keys(sweepsWithData).forEach((sid) => {
//                   sweepsWithData[sid].datos.sort((a, b) => a.timestamp - b.timestamp);
//                 });
//               }

//               const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
//               setBarridosSubsistema2(soloGuardados);

//               if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
//                 setSelectedSweepS2("");
//               }

//               setSelectedSweepsS2((prev) => prev.filter((id) => soloGuardados[id]));
//             },
//             { onlyOnce: true }
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP3 =====================
//       const exp3MeasurementsRef = ref(db, `users/${userId}/Exp3/measurements`);
//       onValue(
//         exp3MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema3({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema3(savedMeasurements);

//           if (selectedMeasurementS3 && !savedMeasurements[selectedMeasurementS3]) {
//             setSelectedMeasurementS3("");
//           }

//           setSelectedMeasurementsS3((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - MEDICIONES =====================
//       const exp4MeasurementsRef = ref(db, `users/${userId}/Exp4/measurements`);
//       onValue(
//         exp4MeasurementsRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setMedicionesSubsistema4({});
//             return;
//           }

//           const measurements = snapshot.val();
//           const savedMeasurements = {};

//           Object.entries(measurements).forEach(([measurementId, measurementData]) => {
//             if (measurementData?.isSaved) {
//               savedMeasurements[measurementId] = measurementData;
//             }
//           });

//           setMedicionesSubsistema4(savedMeasurements);

//           if (selectedMeasurementS4 && !savedMeasurements[selectedMeasurementS4]) {
//             setSelectedMeasurementS4("");
//           }

//           setSelectedMeasurementsS4((prev) =>
//             prev.filter((id) => savedMeasurements[id])
//           );
//         },
//         { onlyOnce: true }
//       );

//       // ===================== EXP4 - FILTROS =====================
//       const exp4EnvironmentRef = ref(db, `users/${userId}/Exp4/environmentData`);
//       onValue(
//         exp4EnvironmentRef,
//         (snapshot) => {
//           if (!snapshot.exists()) {
//             setEnvironmentDataSubsistema4({});
//             setLoading(false);
//             return;
//           }

//           setEnvironmentDataSubsistema4(snapshot.val());
//           setLoading(false);
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("❌ Error al cargar datos desde Firebase:", error);
//       setLoading(false);
//     }
//   };

//   const handleClearData = async (subsistema) => {
//     if (!userId) return;

//     const confirmar = window.confirm(
//       `⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos del ${subsistema}?\n\nEsta acción no se puede deshacer.`
//     );
//     if (!confirmar) return;

//     try {
//       if (subsistema === "subsistema1") {
//         await remove(ref(db, `users/${userId}/Exp1/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp1/measurements`));
//         setBarridosSubsistema1({});
//         setSelectedSweepS1("");
//         setSelectedSweepsS1([]);
//       }

//       if (subsistema === "subsistema2") {
//         await remove(ref(db, `users/${userId}/Exp2/sweeps`));
//         await remove(ref(db, `users/${userId}/Exp2/measurements`));
//         setBarridosSubsistema2({});
//         setSelectedSweepS2("");
//         setSelectedSweepsS2([]);
//       }

//       if (subsistema === "subsistema3") {
//         await remove(ref(db, `users/${userId}/Exp3/measurements`));
//         setMedicionesSubsistema3({});
//         setSelectedMeasurementS3("");
//         setSelectedMeasurementsS3([]);
//       }

//       if (subsistema === "subsistema4") {
//         await remove(ref(db, `users/${userId}/Exp4/measurements`));
//         await remove(ref(db, `users/${userId}/Exp4/environmentData`));
//         await remove(ref(db, `users/${userId}/Exp4/currentMeasurementId`));
//         await remove(ref(db, `users/${userId}/Exp4/currentSensorMeasurementId`));
//         setMedicionesSubsistema4({});
//         setEnvironmentDataSubsistema4({});
//         setSelectedMeasurementS4("");
//         setSelectedMeasurementsS4([]);
//       }

//       alert(`✅ Datos del ${subsistema} eliminados correctamente`);
//       cargarDatosDesdeFirebase();
//     } catch (error) {
//       console.error(`❌ Error al eliminar datos de ${subsistema}:`, error);
//       alert(`Error al eliminar datos: ${error.message}`);
//     }
//   };

//   const handleDeleteMeasurementS3 = async (measurementId) => {
//     if (!userId || !measurementId) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar esta medición del Subsystem 3?"
//     );
//     if (!confirmar) return;

//     try {
//       await remove(ref(db, `users/${userId}/Exp3/measurements/${measurementId}`));

//       setMedicionesSubsistema3((prev) => {
//         const updated = { ...prev };
//         delete updated[measurementId];
//         return updated;
//       });

//       if (selectedMeasurementS3 === measurementId) {
//         setSelectedMeasurementS3("");
//       }

//       setSelectedMeasurementsS3((prev) => prev.filter((id) => id !== measurementId));

//       alert("✅ Medición eliminada correctamente");
//     } catch (error) {
//       console.error("❌ Error al eliminar medición de Subsystem 3:", error);
//       alert(`Error al eliminar medición: ${error.message}`);
//     }
//   };

//   const handleDeleteMeasurementS4 = async (measurementId) => {
//     if (!userId || !measurementId) return;

//     const confirmar = window.confirm(
//       "¿Estás seguro de eliminar esta medición del Subsystem 4?"
//     );
//     if (!confirmar) return;

//     try {
//       await remove(ref(db, `users/${userId}/Exp4/measurements/${measurementId}`));

//       setMedicionesSubsistema4((prev) => {
//         const updated = { ...prev };
//         delete updated[measurementId];
//         return updated;
//       });

//       if (selectedMeasurementS4 === measurementId) {
//         setSelectedMeasurementS4("");
//       }

//       setSelectedMeasurementsS4((prev) => prev.filter((id) => id !== measurementId));

//       alert("✅ Medición eliminada correctamente");
//     } catch (error) {
//       console.error("❌ Error al eliminar medición de Subsystem 4:", error);
//       alert(`Error al eliminar medición: ${error.message}`);
//     }
//   };

//   const handleSystemCheckboxChange = (event) => {
//     setSelectedSystems({
//       ...selectedSystems,
//       [event.target.name]: event.target.checked,
//     });
//   };

//   const formatearFecha = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";
//     try {
//       const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
//       const date = new Date(ts);
//       return isNaN(date.getTime())
//         ? "Fecha inválida"
//         : date.toLocaleString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//           });
//     } catch {
//       return "Error en fecha";
//     }
//   };

//   const getExp2StartPitch = (meta) =>
//     meta?.pitchStart ?? meta?.azimuthStart ?? "?";

//   const getExp2EndPitch = (meta) =>
//     meta?.pitchEnd ?? meta?.azimuthEnd ?? "?";

//   const getExp2StartRoll = (meta) =>
//     meta?.rollStart ?? meta?.zenithStart ?? "?";

//   const getExp2EndRoll = (meta) =>
//     meta?.rollEnd ?? meta?.zenithEnd ?? "?";

//   const getExp2PitchMeasurement = (d) =>
//     d?.pitch ?? d?.pitchAngle ?? d?.azimuthAngle ?? "—";

//   const getExp2RollMeasurement = (d) =>
//     d?.roll ?? d?.rollAngle ?? d?.zenithAngle ?? "—";

//   const getLatestEnvironmentData = () => {
//     const entries = Object.entries(environmentDataSubsistema4 || {});
//     if (entries.length === 0) return null;

//     entries.sort((a, b) => {
//       const tsA = a[1]?.timestamp ?? 0;
//       const tsB = b[1]?.timestamp ?? 0;
//       return tsB - tsA;
//     });

//     return { id: entries[0][0], ...entries[0][1] };
//   };

//   const latestEnvironmentDataS4 = getLatestEnvironmentData();

//   const sweepsS1 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema1).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema1]);

//   const sweepsS2 = useMemo(() => {
//     const arr = Object.entries(barridosSubsistema2).map(([id, obj]) => ({
//       id,
//       ...obj,
//       ts: obj?.metadata?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [barridosSubsistema2]);

//   const measurementsS3 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema3).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema3]);

//   const measurementsS4 = useMemo(() => {
//     const arr = Object.entries(medicionesSubsistema4).map(([id, data]) => ({
//       id,
//       ...data,
//       ts: data?.timestamp ?? 0,
//     }));
//     arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
//     return arr;
//   }, [medicionesSubsistema4]);

//   useEffect(() => {
//     if (!selectedSweepS1 && sweepsS1.length > 0) setSelectedSweepS1(sweepsS1[0].id);
//   }, [sweepsS1, selectedSweepS1]);

//   useEffect(() => {
//     if (!selectedSweepS2 && sweepsS2.length > 0) setSelectedSweepS2(sweepsS2[0].id);
//   }, [sweepsS2, selectedSweepS2]);

//   useEffect(() => {
//     if (!selectedMeasurementS3 && measurementsS3.length > 0) {
//       setSelectedMeasurementS3(measurementsS3[0].id);
//     }
//   }, [measurementsS3, selectedMeasurementS3]);

//   useEffect(() => {
//     if (!selectedMeasurementS4 && measurementsS4.length > 0) {
//       setSelectedMeasurementS4(measurementsS4[0].id);
//     }
//   }, [measurementsS4, selectedMeasurementS4]);

//   const selectedS1Obj = useMemo(
//     () => sweepsS1.find((s) => s.id === selectedSweepS1) || null,
//     [sweepsS1, selectedSweepS1]
//   );

//   const selectedS2Obj = useMemo(
//     () => sweepsS2.find((s) => s.id === selectedSweepS2) || null,
//     [sweepsS2, selectedSweepS2]
//   );

//   const selectedS3Obj = useMemo(
//     () => measurementsS3.find((m) => m.id === selectedMeasurementS3) || null,
//     [measurementsS3, selectedMeasurementS3]
//   );

//   const selectedS4Obj = useMemo(
//     () => measurementsS4.find((m) => m.id === selectedMeasurementS4) || null,
//     [measurementsS4, selectedMeasurementS4]
//   );

//   const countS1 = sweepsS1.length;
//   const countS2 = sweepsS2.length;
//   const countS3 = measurementsS3.length;
//   const countS4 = measurementsS4.length;

//   // desde aqui
//   const downloadCsvFile = (selectedData, columnsMap, filename) => {
//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", filename);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleDownloadSelectedS1CSV = () => {
//     if (!selectedS1Obj) {
//       alert("Selecciona un barrido del Subsystem 1.");
//       return;
//     }

//     const data = (selectedS1Obj.datos || []).map((d) => ({
//       "Angle (°)": d.angle,
//       Voltage: d.voltage?.toFixed(2),
//       Current: d.current?.toFixed(2),
//       Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//       "Fill Factor": "—",
//     }));

//     downloadCsvFile(
//       [
//         {
//           title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//           data,
//           key: "subsistema1",
//         },
//       ],
//       { subsistema1: SUBSISTEMA1_COLUMNS },
//       `subsystem1_${selectedS1Obj.id}.csv`
//     );
//   };

//   const handleDownloadSelectedS2CSV = () => {
//     if (!selectedS2Obj) {
//       alert("Selecciona un barrido del Subsystem 2.");
//       return;
//     }

//     const data = (selectedS2Obj.datos || []).map((d) => ({
//       "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//       "Zenith Angle (°)": getExp2RollMeasurement(d),
//       Voltage: d.voltage?.toFixed(2),
//       Current: d.current?.toFixed(2),
//       Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//       "Fill Factor": "—",
//     }));

//     downloadCsvFile(
//       [
//         {
//           title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//           data,
//           key: "subsistema2",
//         },
//       ],
//       { subsistema2: SUBSYSTEM2_COLUMNS },
//       `subsystem2_${selectedS2Obj.id}.csv`
//     );
//   };

//   const handleDownloadSelectedS3CSV = () => {
//     if (!selectedS3Obj) {
//       alert("Selecciona una medición del Subsystem 3.");
//       return;
//     }

//     const data = [
//       {
//         "Angle (°)": selectedS3Obj?.angle ?? "—",
//         "Dirty Voltage": selectedS3Obj?.Vo != null ? Number(selectedS3Obj.Vo).toFixed(2) : "—",
//         "Dirty Current": selectedS3Obj?.Io != null ? Number(selectedS3Obj.Io).toFixed(2) : "—",
//         "Dirty Efficiency":
//           selectedS3Obj?.Eo != null ? `${(Number(selectedS3Obj.Eo) * 100).toFixed(2)}%` : "—",
//         "Dirty Fill Factor":
//           selectedS3Obj?.FFo != null ? Number(selectedS3Obj.FFo).toFixed(2) : "—",
//         "Clean Voltage": selectedS3Obj?.Vf != null ? Number(selectedS3Obj.Vf).toFixed(2) : "—",
//         "Clean Current": selectedS3Obj?.If != null ? Number(selectedS3Obj.If).toFixed(2) : "—",
//         "Clean Efficiency":
//           selectedS3Obj?.Ef != null ? `${(Number(selectedS3Obj.Ef) * 100).toFixed(2)}%` : "—",
//         "Clean Fill Factor":
//           selectedS3Obj?.FFf != null ? Number(selectedS3Obj.FFf).toFixed(2) : "—",
//         Date: formatearFecha(selectedS3Obj?.timestamp),
//       },
//     ];

//     downloadCsvFile(
//       [
//         {
//           title: SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3",
//           data,
//           key: "subsistema3",
//         },
//       ],
//       { subsistema3: SUBSYSTEM3_COLUMNS },
//       `subsystem3_${selectedS3Obj.id}.csv`
//     );
//   };

//   const handleDownloadSelectedS4CSV = () => {
//     if (!selectedS4Obj) {
//       alert("Selecciona una medición del Subsystem 4.");
//       return;
//     }

//     const data = [
//       {
//         "Integration Time (ms)": selectedS4Obj?.integrationTime ?? "—",
//         Date: formatearFecha(selectedS4Obj?.timestamp),
//         Actions: "—",
//       },
//     ];

//     downloadCsvFile(
//       [
//         {
//           title: SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4",
//           data,
//           key: "subsistema4",
//         },
//       ],
//       { subsistema4: SUBSYSTEM4_COLUMNS },
//       `subsystem4_${selectedS4Obj.id}.csv`
//     );
//   };

//   const handleMenuOpenS4 = (event) => setAnchorElS4(event.currentTarget);
//   const handleMenuCloseS4 = () => setAnchorElS4(null);

//   const handleCheckboxToggleS4 = (name) => {
//     setImageSelectionS4((prev) => ({ ...prev, [name]: !prev[name] }));
//   };

//   const isAllSelectedS4 =
//     imageSelectionS4.completo &&
//     imageSelectionS4.uv &&
//     imageSelectionS4.visible &&
//     imageSelectionS4.nir;

//   const handleSelectAllS4 = (event) => {
//     const checked = event.target.checked;
//     setImageSelectionS4({
//       completo: checked,
//       uv: checked,
//       visible: checked,
//       nir: checked,
//     });
//   };

//   const handleDownloadTxtS4 = () => {
//     if (!selectedS4Obj?.id) {
//       alert("Selecciona una medición del Subsystem 4.");
//       return;
//     }

//     const downloadUrl = `${API_BASE_URL}/descargar/datos/${userId}/${selectedS4Obj.id}`;
//     window.open(downloadUrl, "_blank");
//   };

//   const handleDownloadImagesS4 = () => {
//     if (!selectedS4Obj?.id) {
//       alert("Selecciona una medición del Subsystem 4.");
//       return;
//     }

//     const haySeleccion =
//       imageSelectionS4.completo ||
//       imageSelectionS4.uv ||
//       imageSelectionS4.visible ||
//       imageSelectionS4.nir;

//     if (!haySeleccion) {
//       alert("Selecciona al menos una gráfica.");
//       return;
//     }

//     const queryParams = new URLSearchParams({
//       completo: imageSelectionS4.completo,
//       uv: imageSelectionS4.uv,
//       visible: imageSelectionS4.visible,
//       nir: imageSelectionS4.nir,
//     }).toString();

//     const downloadUrl = `${API_BASE_URL}/descargar/graficas/${userId}/${selectedS4Obj.id}?${queryParams}`;
//     window.open(downloadUrl, "_blank");
//     handleMenuCloseS4();
//   };

//   const handleDownloadCSV = () => {
//     const selectedData = [];

//     if (selectedSystems.subsistema1 && selectedSweepsS1.length > 0) {
//       const dataS1 = selectedSweepsS1.flatMap((id) => {
//         const sweep = barridosSubsistema1[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Angle (°)": d.angle,
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM1,
//         data: dataS1,
//         key: "subsistema1",
//       });
//     }

//     if (selectedSystems.subsistema2 && selectedSweepsS2.length > 0) {
//       const dataS2 = selectedSweepsS2.flatMap((id) => {
//         const sweep = barridosSubsistema2[id];
//         if (!sweep) return [];
//         return (sweep.datos || []).map((d) => ({
//           "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//           "Zenith Angle (°)": getExp2RollMeasurement(d),
//           Voltage: d.voltage?.toFixed(2),
//           Current: d.current?.toFixed(2),
//           Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//           "Fill Factor": "—",
//         }));
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM2,
//         data: dataS2,
//         key: "subsistema2",
//       });
//     }

//     if (selectedSystems.subsistema3 && selectedMeasurementsS3.length > 0) {
//       const dataS3 = selectedMeasurementsS3.map((id) => {
//         const m = medicionesSubsistema3[id];
//         return {
//           "Angle (°)": m?.angle ?? "—",
//           "Dirty Voltage": m?.Vo != null ? Number(m.Vo).toFixed(2) : "—",
//           "Dirty Current": m?.Io != null ? Number(m.Io).toFixed(2) : "—",
//           "Dirty Efficiency": m?.Eo != null ? `${(Number(m.Eo) * 100).toFixed(2)}%` : "—",
//           "Dirty Fill Factor": m?.FFo != null ? Number(m.FFo).toFixed(2) : "—",
//           "Clean Voltage": m?.Vf != null ? Number(m.Vf).toFixed(2) : "—",
//           "Clean Current": m?.If != null ? Number(m.If).toFixed(2) : "—",
//           "Clean Efficiency": m?.Ef != null ? `${(Number(m.Ef) * 100).toFixed(2)}%` : "—",
//           "Clean Fill Factor": m?.FFf != null ? Number(m.FFf).toFixed(2) : "—",
//           Date: formatearFecha(m?.timestamp),
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3",
//         data: dataS3,
//         key: "subsistema3",
//       });
//     }

//     if (selectedSystems.subsistema4 && selectedMeasurementsS4.length > 0) {
//       const dataS4 = selectedMeasurementsS4.map((id) => {
//         const m = medicionesSubsistema4[id];
//         return {
//           "Integration Time (ms)": m?.integrationTime ?? "—",
//           Date: formatearFecha(m?.timestamp),
//           Actions: "—",
//         };
//       });

//       selectedData.push({
//         title: SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4 Measurements",
//         data: dataS4,
//         key: "subsistema4",
//       });

//       if (includeFiltersS4 && latestEnvironmentDataS4) {
//         selectedData.push({
//           title: "Subsystem 4 Filters",
//           data: [
//             {
//               Date: formatearFecha(latestEnvironmentDataS4.timestamp),
//               "Reference (%)": latestEnvironmentDataS4.referencia ?? 0,
//               "Yellow Filter (%)": latestEnvironmentDataS4.filtroAmarillo ?? 0,
//               "Blue Filter (%)": latestEnvironmentDataS4.filtroAzul ?? 0,
//               "Red Filter (%)": latestEnvironmentDataS4.filtroRojo ?? 0,
//             },
//           ],
//           key: "subsistema4_filtros",
//         });
//       }
//     }

//     if (selectedData.length === 0) {
//       alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED || "No hay datos seleccionados para exportar.");
//       return;
//     }

//     const columnsMap = {
//       subsistema1: SUBSISTEMA1_COLUMNS,
//       subsistema2: SUBSYSTEM2_COLUMNS,
//       subsistema3: SUBSYSTEM3_COLUMNS,
//       subsistema4: SUBSYSTEM4_COLUMNS,
//       subsistema4_filtros: SUBSYSTEM4_FILTER_COLUMNS,
//     };

//     const csvContent = generateCSV(selectedData, columnsMap);
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `data_summary_selected_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBack = () => navigate("/experiments/experimentChooser");

//   const NoDataMessage = () => (
//     <Paper sx={{ p: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         {NO_DATA_MESSAGE}
//       </Typography>
//     </Paper>
//   );

//   if (!userId) return <Typography>Cargando...</Typography>;

//   if (loading) {
//     return (
//       <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
//         <Typography variant="h4" gutterBottom>
//           Cargando datos...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box width="90%" maxWidth="1300px" margin="auto" mt={11} mb={5}>
//       <Typography variant="h4" gutterBottom>
//         {MAIN_TITLE}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
//         {DESCRIPTION}
//       </Typography>

//       <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
//         <Paper
//           sx={{
//             width: 260,
//             p: 1,
//             borderRadius: 2,
//             height: "fit-content",
//             position: "sticky",
//             top: 90,
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ px: 1, py: 1 }}>
//             {SELECT_SUBSYSTEMS}
//           </Typography>
//           <Divider />

//           <Tabs
//             orientation="vertical"
//             value={tab}
//             onChange={(_, v) => setTab(v)}
//             sx={{
//               mt: 1,
//               "& .MuiTab-root": {
//                 alignItems: "flex-start",
//                 textTransform: "none",
//                 minHeight: 44,
//               },
//             }}
//           >
//             <Tab label={`Subsystem 1 ${countS1 ? `(${countS1})` : ""}`} />
//             <Tab label={`Subsystem 2 ${countS2 ? `(${countS2})` : ""}`} />
//             <Tab label={`Subsystem 3 ${countS3 ? `(${countS3})` : ""}`} />
//             <Tab label={`Subsystem 4 ${countS4 ? `(${countS4})` : ""}`} />
//             <Tab label="Exportar / CSV" />
//           </Tabs>

//           <Divider sx={{ my: 1 }} />

//           <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//             {BACK_BUTTON}
//           </Button>
//         </Paper>

//         <Paper
//           sx={{
//             flex: 1,
//             p: 2,
//             borderRadius: 2,
//             height: "calc(100vh - 180px)",
//             overflow: "auto",
//           }}
//         >
//           {/* SUBSYSTEM 1 */}
//           <TabPanel value={tab} index={0}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS1} barridos guardados
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                 {selectedS1Obj && (
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     onClick={handleDownloadSelectedS1CSV}
//                     startIcon={<Download fontSize="small" />}
//                   >
//                     CSV
//                   </Button>
//                 )}

//                 {countS1 > 0 && (
//                   <Button
//                     variant="contained"
//                     color="error"
//                     onClick={() => handleClearData("subsistema1")}
//                     align="right"
//                   >
//                     🗑️ {CLEAR_BUTTON}
//                   </Button>
//                 )}
//               </Box>
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS1 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s1-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s1-sweep-label"
//                     value={selectedSweepS1}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS1(e.target.value)}
//                   >
//                     {sweepsS1.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 ${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}° • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS1Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
//                           selectedS1Obj.metadata?.endAngle ?? "?"
//                         }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS1Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSISTEMA1_COLUMNS}
//                       data={(selectedS1Obj.datos || []).map((d) => ({
//                         "Angle (°)": d.angle,
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 2 */}
//           <TabPanel value={tab} index={1}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
//               <Box>
//                 <Typography variant="h5">{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS2} barridos guardados
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                 {selectedS2Obj && (
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     onClick={handleDownloadSelectedS2CSV}
//                     startIcon={<Download fontSize="small" />}
//                   >
//                     CSV
//                   </Button>
//                 )}

//                 {countS2 > 0 && (
//                   <Button
//                     variant="contained"
//                     color="error"
//                     onClick={() => handleClearData("subsistema2")}
//                     align="right"
//                   >
//                     🗑️ {CLEAR_BUTTON}
//                   </Button>
//                 )}
//               </Box>
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS2 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s2-sweep-label">Selecciona un barrido</InputLabel>
//                   <Select
//                     labelId="s2-sweep-label"
//                     value={selectedSweepS2}
//                     label="Selecciona un barrido"
//                     onChange={(e) => setSelectedSweepS2(e.target.value)}
//                   >
//                     {sweepsS2.map((s) => (
//                       <MenuItem key={s.id} value={s.id}>
//                         {`🎯 Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°) • ${
//                           s.datos?.length ?? 0
//                         } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS2Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Barrido seleccionado
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
//                           selectedS2Obj.metadata
//                         )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
//                           selectedS2Obj.metadata
//                         )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
//                           selectedS2Obj.metadata?.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <DataTable
//                       columns={SUBSYSTEM2_COLUMNS}
//                       data={(selectedS2Obj.datos || []).map((d) => ({
//                         "Azimuth Angle (°)": getExp2PitchMeasurement(d),
//                         "Zenith Angle (°)": getExp2RollMeasurement(d),
//                         Voltage: d.voltage?.toFixed(2),
//                         Current: d.current?.toFixed(2),
//                         Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
//                         "Fill Factor": "—",
//                       }))}
//                     />
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 3 */}
//           <TabPanel value={tab} index={2}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM3 || "Subsystem 3"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS3} mediciones guardadas
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                 {selectedS3Obj && (
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     onClick={handleDownloadSelectedS3CSV}
//                     startIcon={<Download fontSize="small" />}
//                   >
//                     CSV
//                   </Button>
//                 )}

//                 {countS3 > 0 && (
//                   <Button
//                     variant="contained"
//                     color="error"
//                     onClick={() => handleClearData("subsistema3")}
//                     align="right"
//                   >
//                     🗑️ {CLEAR_BUTTON}
//                   </Button>
//                 )}
//               </Box>
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS3 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s3-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s3-measurement-label"
//                     value={selectedMeasurementS3}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS3(e.target.value)}
//                   >
//                     {measurementsS3.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧼 ${m.angle ?? "?"}° • ${formatearFecha(m.timestamp)}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS3Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`Ángulo: ${selectedS3Obj.angle ?? "?"}° • ${formatearFecha(
//                           selectedS3Obj.timestamp
//                         )}`}
//                       </Typography>
//                     </Paper>

//                     <TableContainer
//                       component={Paper}
//                       className={tableStyles.dataTableContainer}
//                       sx={{
//                         maxHeight: "500px",
//                         borderRadius: 2,
//                         border: "1px solid #e0e0e0",
//                         boxShadow: "none",
//                       }}
//                     >
//                       <Table stickyHeader className={tableStyles.tableFit}>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell className={tableStyles.tableHeader}>Angle</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Voltage</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Current</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Efficiency</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Fill Factor</TableCell>
//                             <TableCell className={tableStyles.tableHeader}>Actions</TableCell>
//                           </TableRow>
//                         </TableHead>

//                         <TableBody>
//                           <React.Fragment key={selectedS3Obj.id}>
//                             <TableRow className={tableStyles.tableRow}>
//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 rowSpan={2}
//                                 sx={{ borderBottom: "1px solid #e0e0e0", fontWeight: "bold" }}
//                               >
//                                 {selectedS3Obj.angle ?? "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Vo != null ? selectedS3Obj.Vo.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Io != null ? selectedS3Obj.Io.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.Eo != null
//                                   ? `${(selectedS3Obj.Eo * 100).toFixed(2)}%`
//                                   : "—"}
//                               </TableCell>

//                               <TableCell className={tableStyles.tableCell}>
//                                 {selectedS3Obj.FFo != null ? selectedS3Obj.FFo.toFixed(2) : "—"}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 rowSpan={2}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 <IconButton
//                                   color="error"
//                                   onClick={() => handleDeleteMeasurementS3(selectedS3Obj.id)}
//                                 >
//                                   <DeleteIcon />
//                                 </IconButton>
//                               </TableCell>
//                             </TableRow>

//                             <TableRow className={tableStyles.tableRow}>
//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.Vf != null ? selectedS3Obj.Vf.toFixed(2) : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.If != null ? selectedS3Obj.If.toFixed(2) : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.Ef != null
//                                   ? `${(selectedS3Obj.Ef * 100).toFixed(2)}%`
//                                   : "..."}
//                               </TableCell>

//                               <TableCell
//                                 className={tableStyles.tableCell}
//                                 sx={{ borderBottom: "1px solid #e0e0e0" }}
//                               >
//                                 {selectedS3Obj.FFf != null ? selectedS3Obj.FFf.toFixed(2) : "..."}
//                               </TableCell>
//                             </TableRow>
//                           </React.Fragment>
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* SUBSYSTEM 4 */}
//           <TabPanel value={tab} index={3}>
//             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
//               <Box>
//                 <Typography variant="h5">
//                   {SUBSYSTEM_TITLES.SUBSYSTEM4 || "Subsystem 4"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {countS4} mediciones guardadas
//                 </Typography>
//               </Box>

//               {(countS4 > 0 || latestEnvironmentDataS4) && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => handleClearData("subsistema4")}
//                   align="right"
//                 >
//                   🗑️ {CLEAR_BUTTON}
//                 </Button>
//               )}
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {countS4 > 0 ? (
//               <>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="s4-measurement-label">Selecciona una medición</InputLabel>
//                   <Select
//                     labelId="s4-measurement-label"
//                     value={selectedMeasurementS4}
//                     label="Selecciona una medición"
//                     onChange={(e) => setSelectedMeasurementS4(e.target.value)}
//                   >
//                     {measurementsS4.map((m) => (
//                       <MenuItem key={m.id} value={m.id}>
//                         {`🧪 ${m.id} • ${m.integrationTime ?? "?"} ms • ${formatearFecha(
//                           m.timestamp
//                         )}`}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 {selectedS4Obj ? (
//                   <>
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                         Medición seleccionada
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {`ID: ${selectedS4Obj.id} • Tiempo de integración: ${
//                           selectedS4Obj.integrationTime ?? "?"
//                         } ms • ${formatearFecha(selectedS4Obj.timestamp)}`}
//                       </Typography>
//                     </Paper>

//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         mb: 2,
//                         gap: 2,
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <Typography variant="h6">Spectrometer Files</Typography>

//                       <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                         <Button
//                           variant="outlined"
//                           size="small"
//                           color="primary"
//                           onClick={handleDownloadSelectedS4CSV}
//                           startIcon={<Download fontSize="small" />}
//                         >
//                           CSV
//                         </Button>

//                         <Tooltip title="Descargar archivo TXT de la medición" arrow>
//                           <span>
//                             <Button
//                               variant="outlined"
//                               size="small"
//                               color="primary"
//                               onClick={handleDownloadTxtS4}
//                               startIcon={<Download fontSize="small" />}
//                             >
//                               TXT
//                             </Button>
//                           </span>
//                         </Tooltip>

//                         <Tooltip title="Seleccionar y descargar gráficas" arrow>
//                           <span>
//                             <Button
//                               variant="outlined"
//                               size="small"
//                               color="primary"
//                               onClick={handleMenuOpenS4}
//                               startIcon={<CropFree fontSize="small" />}
//                               endIcon={<ArrowDropDown fontSize="small" />}
//                             >
//                               IMG
//                             </Button>
//                           </span>
//                         </Tooltip>
//                       </Box>
//                     </Box>

//                     <TableContainer
//                       component={Paper}
//                       className={tableStyles.dataTableContainer}
//                       sx={{
//                         maxHeight: "400px",
//                         borderRadius: 2,
//                         border: "1px solid #e0e0e0",
//                         boxShadow: "none",
//                       }}
//                     >
//                       <Table stickyHeader className={tableStyles.tableFit}>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell className={tableStyles.tableHeader}>
//                               Integration Time (ms)
//                             </TableCell>
//                             <TableCell className={tableStyles.tableHeader}>
//                               Date
//                             </TableCell>
//                             <TableCell className={tableStyles.tableHeader}>
//                               Actions
//                             </TableCell>
//                           </TableRow>
//                         </TableHead>

//                         <TableBody>
//                           <TableRow className={tableStyles.tableRow}>
//                             <TableCell className={tableStyles.tableCell}>
//                               {selectedS4Obj.integrationTime ?? "—"}
//                             </TableCell>

//                             <TableCell className={tableStyles.tableCell}>
//                               {formatearFecha(selectedS4Obj.timestamp)}
//                             </TableCell>

//                             <TableCell className={tableStyles.tableCell}>
//                               <IconButton
//                                 color="error"
//                                 onClick={() => handleDeleteMeasurementS4(selectedS4Obj.id)}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </TableCell>
//                           </TableRow>
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </>
//                 ) : (
//                   <NoDataMessage />
//                 )}
//               </>
//             ) : (
//               <NoDataMessage />
//             )}

//             <Menu
//               anchorEl={anchorElS4}
//               open={Boolean(anchorElS4)}
//               onClose={handleMenuCloseS4}
//               anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//               transformOrigin={{ vertical: "top", horizontal: "right" }}
//               PaperProps={{ sx: { borderRadius: "12px", mt: 1, minWidth: "220px", p: 1 } }}
//             >
//               <Box sx={{ px: 2, py: 1, outline: "none" }}>
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: "bold" }}>
//                   Select graphs to export
//                 </Typography>

//                 <FormGroup>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={isAllSelectedS4}
//                         onChange={handleSelectAllS4}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2" sx={{ fontWeight: "bold" }}>All Graphs</Typography>}
//                   />
//                   <Divider sx={{ my: 0.5 }} />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.completo}
//                         onChange={() => handleCheckboxToggleS4("completo")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">Complete Spectrum</Typography>}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.uv}
//                         onChange={() => handleCheckboxToggleS4("uv")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">UV Spectrum</Typography>}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.visible}
//                         onChange={() => handleCheckboxToggleS4("visible")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">Visible Spectrum</Typography>}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={imageSelectionS4.nir}
//                         onChange={() => handleCheckboxToggleS4("nir")}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2">NIR Spectrum</Typography>}
//                   />
//                 </FormGroup>

//                 <Button
//                   variant="contained"
//                   color="primary"
//                   size="small"
//                   fullWidth
//                   sx={{ mt: 2 }}
//                   onClick={handleDownloadImagesS4}
//                   startIcon={<Download fontSize="small" />}
//                 >
//                   Download
//                 </Button>
//               </Box>
//             </Menu>

//             <Divider sx={{ my: 4 }} />

//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Light Filters Efficiency
//             </Typography>

//             {latestEnvironmentDataS4 ? (
//               <Grid container spacing={2}>
//                 {[
//                   { label: "Reference", key: "referencia", color: "#9e9e9e" },
//                   { label: "Yellow Filter", key: "filtroAmarillo", color: "#fbc02d" },
//                   { label: "Blue Filter", key: "filtroAzul", color: "#1976d2" },
//                   { label: "Red Filter", key: "filtroRojo", color: "#d32f2f" },
//                 ].map((panel) => (
//                   <Grid item xs={12} sm={6} md={3} key={panel.key}>
//                     <Paper
//                       elevation={3}
//                       sx={{
//                         p: 3,
//                         textAlign: "center",
//                         borderRadius: "15px",
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <Typography variant="subtitle2" color="text.secondary">
//                         {panel.label}
//                       </Typography>
//                       <Typography
//                         variant="h4"
//                         sx={{ fontWeight: "bold", color: panel.color, my: 1 }}
//                       >
//                         {latestEnvironmentDataS4?.[panel.key] ?? 0}%
//                       </Typography>
//                       <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.disabled" }}>
//                         Relative Power
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             ) : (
//               <NoDataMessage />
//             )}
//           </TabPanel>

//           {/* EXPORT */}
//           <TabPanel value={tab} index={4}>
//             <Typography variant="h5" gutterBottom>
//               Exportar datos seleccionados
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//               Selecciona los subsistemas y los registros que deseas descargar.
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema1}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema1"
//                   />
//                 }
//                 label="Subsystem 1"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s1-label">Barridos de Subsystem 1</InputLabel>
//                 <Select
//                   labelId="multi-s1-label"
//                   multiple
//                   value={selectedSweepsS1}
//                   onChange={(e) => setSelectedSweepsS1(e.target.value)}
//                   input={<OutlinedInput label="Barridos de Subsystem 1" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {sweepsS1.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       <Checkbox checked={selectedSweepsS1.includes(s.id)} />
//                       <ListItemText
//                         primary={`${s.metadata?.startAngle ?? "?"}° → ${s.metadata?.endAngle ?? "?"}°`}
//                         secondary={`${s.datos?.length ?? 0} mediciones`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema2}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema2"
//                   />
//                 }
//                 label="Subsystem 2"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s2-label">Barridos de Subsystem 2</InputLabel>
//                 <Select
//                   labelId="multi-s2-label"
//                   multiple
//                   value={selectedSweepsS2}
//                   onChange={(e) => setSelectedSweepsS2(e.target.value)}
//                   input={<OutlinedInput label="Barridos de Subsystem 2" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguno" : `${selected.length} seleccionados`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {sweepsS2.map((s) => (
//                     <MenuItem key={s.id} value={s.id}>
//                       <Checkbox checked={selectedSweepsS2.includes(s.id)} />
//                       <ListItemText
//                         primary={`Az(${getExp2StartPitch(s.metadata)}°→${getExp2EndPitch(s.metadata)}°) • Ze(${getExp2StartRoll(
//                           s.metadata
//                         )}°→${getExp2EndRoll(s.metadata)}°)`}
//                         secondary={`${s.datos?.length ?? 0} mediciones`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema3}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema3"
//                   />
//                 }
//                 label="Subsystem 3"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s3-label">Mediciones de Subsystem 3</InputLabel>
//                 <Select
//                   labelId="multi-s3-label"
//                   multiple
//                   value={selectedMeasurementsS3}
//                   onChange={(e) => setSelectedMeasurementsS3(e.target.value)}
//                   input={<OutlinedInput label="Mediciones de Subsystem 3" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {measurementsS3.map((m) => (
//                     <MenuItem key={m.id} value={m.id}>
//                       <Checkbox checked={selectedMeasurementsS3.includes(m.id)} />
//                       <ListItemText
//                         primary={`Ángulo ${m.angle ?? "?"}°`}
//                         secondary={formatearFecha(m.timestamp)}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <Divider sx={{ my: 1 }} />

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={selectedSystems.subsistema4}
//                     onChange={handleSystemCheckboxChange}
//                     name="subsistema4"
//                   />
//                 }
//                 label="Subsystem 4"
//               />

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
//                 <InputLabel id="multi-s4-label">Mediciones de Subsystem 4</InputLabel>
//                 <Select
//                   labelId="multi-s4-label"
//                   multiple
//                   value={selectedMeasurementsS4}
//                   onChange={(e) => setSelectedMeasurementsS4(e.target.value)}
//                   input={<OutlinedInput label="Mediciones de Subsystem 4" />}
//                   renderValue={(selected) =>
//                     selected.length === 0 ? "Ninguna" : `${selected.length} seleccionadas`
//                   }
//                   MenuProps={menuProps}
//                 >
//                   {measurementsS4.map((m) => (
//                     <MenuItem key={m.id} value={m.id}>
//                       <Checkbox checked={selectedMeasurementsS4.includes(m.id)} />
//                       <ListItemText
//                         primary={`${m.id}`}
//                         secondary={`${m.integrationTime ?? "?"} ms`}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={includeFiltersS4}
//                     onChange={(e) => setIncludeFiltersS4(e.target.checked)}
//                   />
//                 }
//                 label="Incluir también Light Filters Efficiency de Subsystem 4"
//               />
//             </Paper>

//             <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
//               <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="center">
//                 📥 {DOWNLOAD_BUTTON}
//               </Button>

//               <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
//                 {BACK_BUTTON}
//               </Button>
//             </Box>

//             {selectedSweepsS1.length === 0 &&
//               selectedSweepsS2.length === 0 &&
//               selectedMeasurementsS3.length === 0 &&
//               selectedMeasurementsS4.length === 0 && (
//                 <Box sx={{ mt: 2 }}>
//                   <NoDataMessage />
//                 </Box>
//               )}
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DataSummary;







// mi version ozzyjames11
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

// const SUBSYSTEM3_COLUMNS = [
//   "Angle (°)",
//   "Dirty Voltage",
//   "Dirty Current",
//   "Dirty Efficiency",
//   "Dirty Fill Factor",
//   "Clean Voltage",
//   "Clean Current",
//   "Clean Efficiency",
//   "Clean Fill Factor",
//   "Date",
// ];

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

const API_BASE_URL = ESTOY_EN_EL_LAB
  ? "http://127.0.0.1:8000"
  : "https://tactilely-furrowless-liane.ngrok-free.dev";

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

                {/* {countS1 > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleClearData("subsistema1")}
                    align="right"
                  >
                    🗑️ {CLEAR_BUTTON}
                  </Button>
                )} */}
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
                    {/* <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Barrido seleccionado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`${selectedS1Obj.metadata?.startAngle ?? "?"}° → ${
                          selectedS1Obj.metadata?.endAngle ?? "?"
                        }° • ${(selectedS1Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
                          selectedS1Obj.metadata?.timestamp
                        )}`}
                      </Typography>
                    </Paper> */}

                    {/* <DataTable
                      columns={SUBSISTEMA1_COLUMNS}
                      data={(selectedS1Obj.datos || []).map((d) => ({
                        "Angle \n(deg)": d.angle,
                        Voltage: d.voltage?.toFixed(2),
                        Current: d.current?.toFixed(2),
                        Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
                        "Fill Factor": "—",
                      }))}
                    /> */}
                    <DataTable
                      columns={SUBSISTEMA1_COLUMNS}
                      disableTooltips={true}
                      maxHeight="calc(100vh - 470px)"
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

                {/* {countS2 > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleClearData("subsistema2")}
                    align="right"
                  >
                    🗑️ {CLEAR_BUTTON}
                  </Button>
                )} */}
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
                    {/* <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Barrido seleccionado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`Az(${getExp2StartPitch(selectedS2Obj.metadata)}°→${getExp2EndPitch(
                          selectedS2Obj.metadata
                        )}°) • Ze(${getExp2StartRoll(selectedS2Obj.metadata)}°→${getExp2EndRoll(
                          selectedS2Obj.metadata
                        )}°) • ${(selectedS2Obj.datos?.length ?? 0)} mediciones • ${formatearFecha(
                          selectedS2Obj.metadata?.timestamp
                        )}`}
                      </Typography>
                    </Paper> */}

                  
                    <DataTable
                      columns={SUBSYSTEM2_COLUMNS}
                      disableTooltips={true}
                      maxHeight="calc(100vh - 385px)" //limitar el tamanio de la tabla
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

                {/* {countS3 > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleClearData("subsistema3")}
                    align="right"
                  >
                    🗑️ {CLEAR_BUTTON}
                  </Button>
                )} */}
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

              {/* {(countS4 > 0 || latestEnvironmentDataS4) && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleClearData("subsistema4")}
                  align="right"
                >
                  🗑️ {CLEAR_BUTTON}
                </Button>
              )} */}
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

                    {/* <TableContainer
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
                            <TableCell className={tableStyles.tableHeader}>
                              Integration Time (ms)
                            </TableCell>
                            <TableCell className={tableStyles.tableHeader}>
                              Date
                            </TableCell>
                            <TableCell className={tableStyles.tableHeader}>
                              Actions
                            </TableCell>
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
                    </TableContainer> */}

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