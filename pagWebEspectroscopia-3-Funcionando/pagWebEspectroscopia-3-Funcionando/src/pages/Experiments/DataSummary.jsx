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

        {/* SUBSISTEMA 1 */}
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

