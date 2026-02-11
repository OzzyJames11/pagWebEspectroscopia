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

/** Simple TabPanel helper */
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

  // ====================== FILTRO: SOLO BARRIDOS GUARDADOS ======================
  // Un barrido “guardado” aquí significa: tiene al menos 1 medición con isSaved=true asociada a ese sweepId
  const filtrarSoloBarridosGuardados = (sweepsWithData) => {
    const filtrados = {};
    Object.entries(sweepsWithData).forEach(([sweepId, obj]) => {
      if ((obj?.datos?.length ?? 0) > 0) {
        filtrados[sweepId] = obj;
      }
    });
    return filtrados;
  };

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

              // ✅ FILTRAR: solo barridos con mediciones guardadas
              const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
              setBarridosSubsistema1(soloGuardados);

              // ✅ si el sweep seleccionado quedó fuera, limpiarlo
              if (selectedSweepS1 && !soloGuardados[selectedSweepS1]) {
                setSelectedSweepS1("");
              }
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

              // ✅ FILTRAR: solo barridos con mediciones guardadas
              const soloGuardados = filtrarSoloBarridosGuardados(sweepsWithData);
              setBarridosSubsistema2(soloGuardados);

              // ✅ si el sweep seleccionado quedó fuera, limpiarlo
              if (selectedSweepS2 && !soloGuardados[selectedSweepS2]) {
                setSelectedSweepS2("");
              }

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

      <Box sx={{ display: "flex", gap: 2, minHeight: 520 }}>
        {/* ================= LEFT SIDEBAR ================= */}
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
            <Tab label="Exportar / CSV" />
          </Tabs>

          <Divider sx={{ my: 1 }} />

          <Button variant="outlined" color="secondary" onClick={handleBack} align="center">
            {BACK_BUTTON}
          </Button>
        </Paper>

        {/* ================= RIGHT CONTENT (SCROLL INTERNO) ================= */}
        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            height: "calc(100vh - 180px)",
            overflow: "auto",
          }}
        >
          {/* ================ TAB: SUBSISTEMA 1 ================ */}
          <TabPanel value={tab} index={0}>
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
                        Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
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

          {/* ================ TAB: SUBSISTEMA 2 ================ */}
          <TabPanel value={tab} index={1}>
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
                        {`🎯 Az(${s.metadata?.azimuthStart ?? "?"}°→${s.metadata?.azimuthEnd ?? "?"}°) • Ze(${
                          s.metadata?.zenithStart ?? "?"
                        }°→${s.metadata?.zenithEnd ?? "?"}°) • ${
                          s.datos?.length ?? 0
                        } mediciones • ${formatearFecha(s.metadata?.timestamp)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedS2Obj ? (
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
                        Efficiency: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
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

          {/* ================ TAB: EXPORTAR ================ */}
          <TabPanel value={tab} index={2}>
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

