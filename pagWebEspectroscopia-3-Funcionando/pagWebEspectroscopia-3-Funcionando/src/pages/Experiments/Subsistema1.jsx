/*
import React, { useState, useEffect, useRef } from "react"; // ⭐ AGREGADO useRef
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

import Hls from 'hls.js';

// Importación de componentes
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";
import { generateGraphCSV, downloadCSV } from '../../../src/utils/csvExporter';

// Importación de constantes
import {
  SUBSISTEMA1_COLUMNS,
  PAGE_TITLES,
  SUBSISTEMA1_TOOLTIPS,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";

// Importación de estilos
import "../../assets/css/Elements/PaperStyles.css";

// Importación envío de datos
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onChildAdded,
  remove,
  update,
  push
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

const Subsistema1 = () => {
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

  // ==================== NUEVOS ESTADOS PARA BARRIDO ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(30);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [userSession, setUserSession] = useState(null);

  // ⭐ NUEVO: Referencias para mantener valores actualizados en listeners
  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  // ==================== ESTADOS EXISTENTES (MANTENER) ====================
  const [contadorValue, setContadorValue] = useState("");
  const [corrienteData, setCorrienteData] = useState([]);
  const [voltajeData, setVoltajeData] = useState([]);
  const [contadorLabels, setContadorLabels] = useState([]);
  const [corrienteValue_1, setcorrienteValue_1] = useState(false);
  const [voltajeValue_1, setvoltajeValue_1] = useState(false);
  const [isSliderDisabled_1, setIsSliderDisabled_1] = useState(true);
  const [actualPanelAngle, setactualPanelAngle] = useState(5);
  const [isMoveButtonDisabled_1, setIsMoveButtonDisabled_1] = useState(true);
  const [isTextDisabled_1, setIsTextDisabled_1] = useState(true);
  const [enviarAngulo, setEnviarAngulo] = useState(false);
  const [datos, setDatos] = useState([]);
  const [isGuardarLecturaDisabled_1, setIsGuardarLecturaDisabled_1] = useState(true);
  const [youtubeVideoId] = useState("nAQz4RMaHVA");

  const db = getDatabase(app);

  // ⭐ NUEVO: Sincronizar refs con estados
  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
  }, [angulosBarrido]);

  useEffect(() => {
    anguloActualIndexRef.current = anguloActualIndex;
  }, [anguloActualIndex]);

  useEffect(() => {
    sweepIdActualRef.current = sweepIdActual;
  }, [sweepIdActual]);

  // ==================== FUNCIONES NUEVAS PARA BARRIDO ====================

  // Generar userSession al cargar el componente
  useEffect(() => {
    const generarUserSession = () => {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
   
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("Sesión de usuario iniciada:", sessionId);
   
    // Cargar datos guardados
    const datosGuardados = JSON.parse(localStorage.getItem("historicalData_subsistema1")) || [];
    setDatos(datosGuardados);
   
    // Enviar señal de inicio
    change5sec();
  }, []);

  // Función para calcular ángulos del barrido
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    if (inicio === fin) return [inicio];
   
    if (inicio > fin) {
      [inicio, fin] = [fin, inicio];
    }
   
    const angulos = [];
    for (let angulo = inicio; angulo <= fin; angulo += paso) {
      angulos.push(Math.round(angulo));
    }
   
    if (angulos.length > 0 && angulos[angulos.length - 1] < fin) {
      angulos.push(fin);
    }
   
    return angulos;
  };

  // Función principal para iniciar barrido
  const iniciarBarrido = async () => {
    // 1. Validar sesión de usuario
    if (!userSession) {
      alert("Error: Sesión no inicializada. Recarga la página.");
      return;
    }

    // 2. Verificar si hay un barrido en progreso
    if (barridoEnProgreso) {
      const confirmar = window.confirm(
        "Ya hay un barrido en progreso.\n¿Deseas cancelarlo y comenzar uno nuevo?"
      );
      if (!confirmar) return;
     
      // Cancelar barrido anterior
      if (sweepIdActual) {
        try {
          const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepIdActual}`);
          await update(sweepRef, {
            status: "cancelled",
            cancelledAt: Date.now()
          });
          console.log("⚠️ Barrido anterior cancelado");
        } catch (error) {
          console.error("Error al cancelar barrido:", error);
        }
      }
    }

    // 3. Validar que los ángulos sean diferentes
    if (anguloInicial === anguloFinal) {
      alert("⚠️ Los ángulos inicial y final deben ser diferentes");
      return;
    }

    // 4. Validar rango de ángulos
    if (anguloInicial < -30 || anguloInicial > 30 || anguloFinal < -30 || anguloFinal > 30) {
      alert("⚠️ Los ángulos deben estar entre -30° y 30°");
      return;
    }

    // 5. Validar conexión con Firebase
    try {
      const testRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await get(testRef);
    } catch (error) {
      alert("❌ Error de conexión con Firebase. Verifica tu conexión a internet.");
      console.error("Error de conexión:", error);
      return;
    }

    try {
      console.log("🚀 Iniciando barrido automático...");
     
      // 6. Calcular ángulos del barrido
      const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
     
      // Validar que haya al menos 2 ángulos
      if (angulos.length < 2) {
        alert("⚠️ El barrido debe incluir al menos 2 posiciones diferentes");
        return;
      }
     
      setAngulosBarrido(angulos);
      setBarridoEnProgreso(true);
      setAnguloActualIndex(0);
      setDatosTemporales([]);
     
      console.log(`📊 Barrido configurado: ${angulos.length} posiciones`, angulos);

      // 7. Crear ID único para este barrido
      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      // 8. Crear barrido en Firebase
      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
     
      await set(sweepRef, {
        startAngle: anguloInicial,
        endAngle: anguloFinal,
        step: 5,
        status: "in_progress",
        timestamp: Date.now(),
        userSession: userSession,
        totalMeasurements: angulos.length,
        currentAngle: angulos[0],
        createdAt: new Date().toISOString()
      });

      console.log("✅ Barrido creado en Firebase:", sweepId);

      // 9. Deshabilitar controles durante el barrido
      setIsSliderDisabled_1(true);
      setIsMoveButtonDisabled_1(true);
      setIsGuardarLecturaDisabled_1(true);
      setIsTextDisabled_1(true);

      // 10. Mostrar notificación
      console.log(`🎯 Iniciando barrido: ${anguloInicial}° → ${anguloFinal}° (${angulos.length} posiciones)`);

      // 11. Empezar con el primer ángulo (con delay para estabilidad)
      setTimeout(async () => {
        await moverASiguienteAngulo(angulos[0], sweepId, 0);
      }, 1000);

    } catch (error) {
      console.error("❌ Error al iniciar barrido:", error);
      setBarridoEnProgreso(false);
     
      // Reactivar controles en caso de error
      setIsSliderDisabled_1(false);
      setIsMoveButtonDisabled_1(false);
      setIsGuardarLecturaDisabled_1(false);
      setIsTextDisabled_1(false);
     
      alert("Error al iniciar el barrido: " + error.message);
    }
  };

  // Función para mover al siguiente ángulo del barrido
  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);

    setAnguloActualIndex(index);

    try {
      // 1️⃣ Enviar comando de movimiento
      const msg = "p" + angulo;
      const docRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(docRef, msg);
      console.log(`✅ Comando enviado al Arduino: ${msg}`);

      // 2️⃣ Resetear el canal tras breve pausa (para asegurar detección de próximos comandos)
      setTimeout(async () => {
        try {
          await set(docRef, "x");
          console.log("🔁 Canal FrontToBack reseteado (desde frontend)");
        } catch (resetError) {
          console.error("❌ Error al resetear canal FrontToBack:", resetError);
        }
      }, 500); // 0.5 segundos de delay es suficiente

      // 3️⃣ Actualizar ángulo actual en Firebase
      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, {
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });

    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
      alert("Error al mover el panel. Barrido detenido.\n" + error.message);

      // Marcar barrido como fallido
      try {
        const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
        await update(sweepRef, {
          status: "failed",
          error: error.message,
          failedAt: Date.now(),
        });
      } catch (updateError) {
        console.error("Error al actualizar estado de fallo:", updateError);
      }

      // Reactivar controles
      setIsSliderDisabled_1(false);
      setIsMoveButtonDisabled_1(false);
      setIsGuardarLecturaDisabled_1(false);
      setIsTextDisabled_1(false);
    }
  };

  // ==================== LISTENERS DE FIREBASE ====================

  // 1. Listener de Mediciones - CON LIMPIEZA
  useEffect(() => {
    if (!sweepIdActual) {
      console.log("⏸️ No hay barrido activo, listener de mediciones inactivo");
      return;
    }

    console.log(`👂 Escuchando mediciones para barrido: ${sweepIdActual}`);
   
    const dbRef = ref(db, "experiments/Exp1/measurements");
   
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const medicion = snapshot.val();
     
      // Solo procesar mediciones del barrido actual y no guardadas
      if (medicion.sweepId === sweepIdActual && !medicion.isSaved) {
        console.log("📊 Nueva medición detectada:", {
          id: snapshot.key,
          angle: medicion.angle,
          voltage: medicion.voltage,
          current: medicion.current
        });
       
        // Agregar a datos temporales (evitar duplicados)
        setDatosTemporales(prev => {
          const existe = prev.some(d => d.id === snapshot.key);
          if (!existe) {
            return [...prev, { ...medicion, id: snapshot.key }];
          }
          return prev;
        });
      }
    });

    return () => {
      console.log("🧹 Limpiando listener de mediciones");
      unsubscribe();
    };
  }, [sweepIdActual, db]);

  // 2. ⭐ LISTENER BackToFront CORREGIDO - USA REFS
  useEffect(() => {
    console.log("👂 Escuchando mensajes de BackToFront");
   
    const dbRef = ref(db, "experiments/Exp1/communication/BackToFront");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const mensaje = snapshot.val();
       
        // Ignorar mensajes vacíos o de reset
        if (!mensaje || mensaje === "x") return;
       
        console.log("📨 Mensaje de BackToFront:", mensaje);

        if (mensaje === "EndMov") {
          console.log("✅ Movimiento completado");
         
          // ⭐ USAR REFS en lugar de estados
          const angulosActuales = angulosBarridoRef.current;
          const indexActual = anguloActualIndexRef.current;
          const sweepActual = sweepIdActualRef.current;
         
          console.log(`📊 DEBUG: angulosActuales.length = ${angulosActuales.length}`);
          console.log(`📊 DEBUG: indexActual = ${indexActual}`);
         
          // Solo procesar si hay un barrido en progreso
          if (barridoEnProgreso && sweepActual && angulosActuales.length > 0) {
            const siguienteIndex = indexActual + 1;
           
            if (siguienteIndex < angulosActuales.length) {
              // Hay más ángulos por procesar
              console.log(`⏭️ Preparando siguiente ángulo (${siguienteIndex + 1}/${angulosActuales.length})`);
             
              setTimeout(() => {
                moverASiguienteAngulo(
                  angulosActuales[siguienteIndex],
                  sweepActual,
                  siguienteIndex
                );
              }, 2000); // Esperar 2 segundos antes del siguiente movimiento
             
            } else {
              // BARRIDO COMPLETADO
              console.log("🎉 ¡Barrido completado exitosamente!");
              setBarridoEnProgreso(false);
             
              // Marcar barrido como completado en Firebase
              const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepActual}`);
              update(sweepRef, {
                status: "completed",
                completedAt: Date.now()
              }).then(() => {
                console.log("✅ Barrido marcado como completado en Firebase");
              }).catch(error => {
                console.error("❌ Error al marcar barrido como completado:", error);
              });

              // Habilitar controles
              setIsSliderDisabled_1(false);
              setIsMoveButtonDisabled_1(false);
              setIsTextDisabled_1(false);
              setIsGuardarLecturaDisabled_1(false);
             
              // Mostrar notificación de éxito
              alert(
                `🎉 ¡Barrido completado!\n\n` +
                `📊 Se recolectaron ${angulosActuales.length} mediciones\n` +
                `💾 Presiona "Guardar" para almacenar los datos permanentemente`
              );
            }
          } else {
            console.log("⚠️ No se puede continuar barrido:");
            console.log(`   - barridoEnProgreso: ${barridoEnProgreso}`);
            console.log(`   - sweepActual: ${sweepActual}`);
            console.log(`   - angulosActuales.length: ${angulosActuales.length}`);
          }
         
        } else if (mensaje.startsWith("PITCH:")) {
          console.log("🎯 Arduino solicitando ángulo PITCH");
          setEnviarAngulo(true);
         
        } else {
          console.log("📝 Mensaje no procesado:", mensaje);
        }
      }
    });

    return () => {
      console.log("🧹 Limpiando listener de BackToFront");
      unsubscribe();
    };
  }, [db, barridoEnProgreso]); // ⭐ REMOVIDAS angulosBarrido y anguloActualIndex

  // 3. Listener para detectar desconexiones
  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
   
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        console.warn("⚠️ Conexión con Firebase perdida");
       
        if (barridoEnProgreso) {
          alert("⚠️ Conexión perdida. El barrido se ha pausado.");
          setBarridoEnProgreso(false);
        }
      } else {
        console.log("✅ Conectado a Firebase");
      }
    });

    return () => unsubscribe();
  }, [db, barridoEnProgreso]);

  // 4. Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      console.log("🔚 Componente desmontado - Enviando señal de detención");
     
      noEnviarNuevoAngulo();
     
      if (sweepIdActual && barridoEnProgreso) {
        const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepIdActual}`);
        update(sweepRef, {
          status: "interrupted",
          interruptedAt: Date.now()
        }).catch(error => {
          console.error("Error al marcar barrido como interrumpido:", error);
        });
      }
    };
  }, [sweepIdActual, barridoEnProgreso]);

  // ==================== FUNCIONES EXISTENTES (MODIFICADAS) ====================

  // Función para guardar el barrido completo
  const handleGuardar = async () => {
    if (datosTemporales.length === 0) {
      alert("No hay datos temporales para guardar");
      return;
    }

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido ${anguloInicial}° a ${anguloFinal}°?`
    );
   
    if (!confirmar) return;

    try {
      console.log("🔄 Iniciando guardado de barrido...");
     
      const datosParaGuardar = datosTemporales.map(medicion => ({
        "Ángulo": `${medicion.angle}°`,
        "Voltaje (V)": medicion.voltage?.toFixed(2) || "0.00",
        "Corriente (A)": medicion.current?.toFixed(2) || "0.00",
        "Potencia (W)": ((medicion.voltage || 0) * (medicion.current || 0)).toFixed(2),
        "Eficiencia (%)": calcularEficiencia(medicion.voltage, medicion.current),
        "sweepId": medicion.sweepId,
        "timestamp": medicion.timestamp
      }));

      const nuevosDatos = [...datos, ...datosParaGuardar];
      setDatos(nuevosDatos);
      localStorage.setItem("historicalData_subsistema1", JSON.stringify(nuevosDatos));
      console.log("✅ Datos guardados en localStorage general");

      const metadata = {
        sweepId: sweepIdActual,
        startAngle: anguloInicial,
        endAngle: anguloFinal,
        step: 5,
        timestamp: Date.now(),
        totalMeasurements: datosTemporales.length,
        userSession: userSession
      };

      localStorage.setItem(
        `sweep_metadata_${sweepIdActual}`,
        JSON.stringify(metadata)
      );
      console.log("✅ Metadata del barrido guardada:", metadata);

      localStorage.setItem(
        `historicalData_subsistema1_${sweepIdActual}`,
        JSON.stringify(datosParaGuardar)
      );
      console.log(`✅ Barrido guardado con ID: ${sweepIdActual}`);

      const updates = {};
      let contadorActualizaciones = 0;
     
      datosTemporales.forEach(medicion => {
        if (medicion.id) {
          updates[`experiments/Exp1/measurements/${medicion.id}/isSaved`] = true;
          contadorActualizaciones++;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        console.log(`✅ ${contadorActualizaciones} mediciones marcadas como guardadas en Firebase`);
      }

      if (sweepIdActual) {
        const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepIdActual}`);
        await update(sweepRef, {
          status: "saved",
          savedAt: Date.now()
        });
        console.log("✅ Sweep marcado como 'saved' en Firebase");
      }

      alert(
        `✅ Barrido guardado exitosamente!\n\n` +
        `📊 Mediciones: ${datosTemporales.length}\n` +
        `📐 Rango: ${anguloInicial}° a ${anguloFinal}°\n` +
        `🆔 ID: ${sweepIdActual}`
      );
     
      setDatosTemporales([]);
      console.log("✅ Datos temporales limpiados");

    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
      alert("Error al guardar el barrido: " + error.message);
    }
  };

  const calcularEficiencia = (voltage, current) => {
    if (!voltage || !current) return "0.00";
    const potencia = voltage * current;
    const potenciaMaxima = 25;
    const eficiencia = (potencia / potenciaMaxima) * 100;
    return eficiencia.toFixed(2);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(db, "experiments/Exp1/communication/FrontToBack");
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          setactualPanelAngle(snapshot.val() || "");
        }
      } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
      }
    };
    fetchData();
  }, [db]);

  const handleEliminar = (index) => {
    const nuevosDatos = datos.filter((_, i) => i !== index);
    setDatos(nuevosDatos);
    localStorage.setItem("historicalData_subsistema1", JSON.stringify(nuevosDatos));
  };

  const handleDownloadBothData = () => {
    generateTXT({
      filename: "subsystem1_all_data.txt",
      metadata: [
        { label: "Azimuth Angle", value: `${anguloInicial}° to ${anguloFinal}°` },
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
    navigate("/experiments/experimentChooser");
  };

  const change5sec = async () => {
    try {
      const msg = "y";
      const docRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(docRef, msg);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  const noEnviarNuevoAngulo = async () => {
    try {
      const signal = "n";
      const docRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(docRef, signal);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  const corrienteChart = {
    labels: contadorLabels,
    datasets: [
      {
        label: "Corriente (A)",
        data: corrienteData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
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
      },
    ],
  };

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h5" gutterBottom>
              🎯 Configuración de Barrido Automático
            </Typography>
           
            <SliderComponent
              value={anguloInicial}
              label="Ángulo Inicial"
              min={-30}
              max={30}
              step={1}
              onChange={(e, newValue) => setAnguloInicial(newValue)}
              disabled={barridoEnProgreso}
            />
           
            <SliderComponent
              value={anguloFinal}
              label="Ángulo Final"
              min={-30}
              max={30}
              step={1}
              onChange={(e, newValue) => setAnguloFinal(newValue)}
              disabled={barridoEnProgreso}
            />
           
            {anguloInicial !== anguloFinal && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 2 }}>
                <strong>Ángulos del barrido:</strong> {calcularAngulosBarrido(anguloInicial, anguloFinal, 5).join('°, ')}°
              </Typography>
            )}

            {barridoEnProgreso && (
              <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, mt: 2 }}>
                <Typography variant="h6" gutterBottom>📊 Barrido en Progreso</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Procesando:</strong> {angulosBarrido[anguloActualIndex]}°
                  ({anguloActualIndex + 1} de {angulosBarrido.length})
                </Typography>
                <Box sx={{ width: '100%', bgcolor: '#bbdefb', borderRadius: 1 }}>
                  <Box sx={{ height: 8, bgcolor: '#2196f3', borderRadius: 1, width: `${((anguloActualIndex + 1) / angulosBarrido.length) * 100}%` }} />
                </Box>
              </Box>
            )}

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={iniciarBarrido}
                align="right"
                disabled={barridoEnProgreso || !userSession || anguloInicial === anguloFinal}
                fullWidth
              >
                {barridoEnProgreso ? "⏳ Barrido en Progreso..." : "🚀 Iniciar Barrido Automático"}
              </Button>
            </Box>
          </Paper>

          {datosTemporales.length > 0 && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fff3cd' }}>
              <Typography variant="h6" gutterBottom>📋 Datos Temporales del Barrido</Typography>
              <DataTable
                columns={["Ángulo", "Voltaje (V)", "Corriente (A)", "Potencia (W)", "Eficiencia (%)"]}
                data={datosTemporales.map(medicion => ({
                  "Ángulo": `${medicion.angle}°`,
                  "Voltaje (V)": medicion.voltage?.toFixed(2) || "0.00",
                  "Corriente (A)": medicion.current?.toFixed(2) || "0.00",
                  "Potencia (W)": ((medicion.voltage || 0) * (medicion.current || 0)).toFixed(2),
                  "Eficiencia (%)": calcularEficiencia(medicion.voltage, medicion.current)
                }))}
              />
             
              <Button
                variant="contained"
                color="success"
                onClick={handleGuardar}
                align="right"
                marginTop={2}
                fullWidth
              >
                💾 Guardar Barrido Completo
              </Button>
            </Paper>
          )}

          <DataTable
            columns={SUBSISTEMA1_COLUMNS}
            data={datos}
            onDelete={handleEliminar}
            tooltips={SUBSISTEMA1_TOOLTIPS}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper className="paper-camera" sx={{ p: 2, width: "100%", backgroundColor: "#121212", color: "#fff" }}>
              <Typography variant="h5" gutterBottom>{CAMERA_TITLE}</Typography>
              <Box sx={{ width: "100%", height: "400px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                  title="Transmisión en vivo"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </Box>
            </Paper>    
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip title={VOLTAGE_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME} />
              <div style={styles.smallGraph}>
                <Line data={voltajeChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={handleDownloadVoltageData} align="right" marginTop={1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip title={CURRENT_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME} />
              <div style={styles.smallGraph}>
                <Line data={corrienteChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={handleDownloadCurrentData} align="right" marginTop={1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Button variant="contained" color="pink" onClick={handleDownloadBothData} fullWidth align="center" marginTop={2}>
            {DOWNLOAD_GRAPHS_BUTTON}
          </Button>
        </Grid>
      </Grid>

      <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4}>
        {BACK_BUTTON}
      </Button>
    </Box>
  );
};

const styles = {
  smallGraph: {
    width: "80%",
    height: "400px",
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
};

export default Subsistema1;*/
















//Código que ya funciona lo básico, solo barridos
/*import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, Slider } from "@mui/material";
import { getDatabase, ref, set, update, onValue } from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  const db = getDatabase(app);

  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);

  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");
    if (anguloInicial === anguloFinal) return alert("Los ángulos deben ser diferentes");

    try {
      const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
      setAngulosBarrido(angulos);
      setBarridoEnProgreso(true);
      setAnguloActualIndex(0);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await set(ref(db, `experiments/Exp1/sweeps/${sweepId}`), {
        startAngle: anguloInicial,
        endAngle: anguloFinal,
        step: 5,
        status: "in_progress",
        timestamp: Date.now(),
      });

      console.log("🚀 Barrido iniciado:", angulos);

      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("❌ Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);

    try {
      const comando = "p" + angulo;
      const fbRef = ref(db, "experiments/Exp1/communication/FrontToBack");

      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      // 🔁 Reset del canal
      setTimeout(async () => {
        await set(fbRef, "x");
        console.log("🔁 Canal FrontToBack reseteado");
      }, 500);

      // Actualiza progreso
      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, { currentAngle: angulo, lastUpdated: Date.now() });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // Escucha cuando Arduino envía "EndMov"
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/communication/BackToFront");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        console.log("✅ Movimiento completado");
        const indexActual = anguloActualIndexRef.current;
        const siguiente = indexActual + 1;
        const sweepId = sweepIdActualRef.current;
        const angulos = angulosBarridoRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(() => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente), 2000);
        } else {
          console.log("🎉 Barrido completado!");
          setBarridoEnProgreso(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box width="80%" m="auto" mt={8}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5">🚀 Control de Barrido Automático</Typography>

        <Typography>Ángulo Inicial: {anguloInicial}°</Typography>
        <Slider value={anguloInicial} onChange={(e, v) => setAnguloInicial(v)} min={-30} max={30} step={5} />

        <Typography>Ángulo Final: {anguloFinal}°</Typography>
        <Slider value={anguloFinal} onChange={(e, v) => setAnguloFinal(v)} min={-30} max={30} step={5} />

        <Button variant="contained" onClick={iniciarBarrido} sx={{ mt: 2 }}>
          {barridoEnProgreso ? "⏳ Barrido en progreso..." : "Iniciar Barrido"}
        </Button>
      </Paper>
    </Box>
  );
};

export default Subsistema1;*/












// Version donde se veia los datos de la tabala
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, Slider } from "@mui/material";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
} from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  const db = getDatabase(app);

  // ==================== ESTADOS PRINCIPALES ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // ==================== REFERENCIAS SINCRONIZADAS ====================
  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () => {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== FUNCIÓN PARA CALCULAR LOS ÁNGULOS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== INICIO DE BARRIDO ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");
    if (anguloInicial === anguloFinal) return alert("Los ángulos deben ser diferentes");

    try {
      const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
      setAngulosBarrido(angulos);
      setBarridoEnProgreso(true);
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await set(ref(db, `experiments/Exp1/sweeps/${sweepId}`), {
        startAngle: anguloInicial,
        endAngle: anguloFinal,
        step: 5,
        status: "in_progress",
        timestamp: Date.now(),
        userSession: userSession,
      });

      console.log("🚀 Barrido iniciado:", angulos);
      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("❌ Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER AL SIGUIENTE ÁNGULO ====================
  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);

    try {
      const comando = "p" + angulo;
      const fbRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      // 🔁 Reset del canal
      setTimeout(async () => {
        await set(fbRef, "x");
        console.log("🔁 Canal FrontToBack reseteado");
      }, 500);

      // Actualiza progreso
      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, { currentAngle: angulo, lastUpdated: Date.now() });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR FIN DE MOVIMIENTO (BACKEND → FRONT) ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/communication/BackToFront");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        console.log("✅ Movimiento completado");
        const indexActual = anguloActualIndexRef.current;
        const siguiente = indexActual + 1;
        const sweepId = sweepIdActualRef.current;
        const angulos = angulosBarridoRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(() => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente), 2000);
        } else {
          console.log("🎉 Barrido completado!");
          setBarridoEnProgreso(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/measurements");
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

  // ==================== GUARDAR DATOS PERMANENTES ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp1/measurements/${d.id}/isSaved`] = true;
      });
      await update(ref(db), updates);

      localStorage.setItem(
        `historicalData_subsistema1_${sweepIdActual}`,
        JSON.stringify(datosTemporales)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
    }
  };

  // ==================== RENDER ====================
  return (
    <Box width="80%" m="auto" mt={8}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5">🚀 Control de Barrido Automático</Typography>

        <Typography>Ángulo Inicial: {anguloInicial}°</Typography>
        <Slider value={anguloInicial} onChange={(e, v) => setAnguloInicial(v)} min={-30} max={30} step={5} />

        <Typography>Ángulo Final: {anguloFinal}°</Typography>
        <Slider value={anguloFinal} onChange={(e, v) => setAnguloFinal(v)} min={-30} max={30} step={5} />

        <Button variant="contained" onClick={iniciarBarrido} sx={{ mt: 2 }}>
          {barridoEnProgreso ? "⏳ Barrido en progreso..." : "Iniciar Barrido"}
        </Button>

        
        {barridoEnProgreso && (
          <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
            <Box
              sx={{
                height: "100%",
                borderRadius: 1,
                backgroundColor: "#2196f3",
                width: `${((anguloActualIndex + 1) / angulosBarrido.length) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </Box>
        )}

        
        {datosTemporales.length > 0 && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6">📋 Datos Temporales</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Ángulo (°)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Voltaje (V)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Corriente (A)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Potencia (W)</th>
                </tr>
              </thead>
              <tbody>
                {datosTemporales.map((d, i) => (
                  <tr key={i}>
                    <td>{d.angle}</td>
                    <td>{d.voltage?.toFixed(2)}</td>
                    <td>{d.current?.toFixed(2)}</td>
                    <td>{(d.voltage * d.current).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={guardarBarrido}>
              💾 Guardar Barrido
            </Button>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default Subsistema1;
*/
















/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, Slider } from "@mui/material";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
} from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  const db = getDatabase(app);

  // ==================== ESTADOS PRINCIPALES ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // ==================== REFERENCIAS SINCRONIZADAS ====================
  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () => {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== FUNCIÓN PARA CALCULAR LOS ÁNGULOS ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== INICIO DE BARRIDO ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");
    if (anguloInicial === anguloFinal) return alert("Los ángulos deben ser diferentes");

    try {
      const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
      setAngulosBarrido(angulos);
      setBarridoEnProgreso(true);
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      // Guardar información del barrido y publicar el sweepId actual
      await Promise.all([
        set(ref(db, `experiments/Exp1/sweeps/${sweepId}`), {
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
          status: "in_progress",
          timestamp: Date.now(),
          userSession: userSession,
        }),
        set(ref(db, "experiments/Exp1/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido iniciado:", angulos);
      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("❌ Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER AL SIGUIENTE ÁNGULO ====================
  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);

    try {
      const comando = "p" + angulo;
      const fbRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      // 🔁 Reset del canal
      setTimeout(async () => {
        await set(fbRef, "x");
        console.log("🔁 Canal FrontToBack reseteado");
      }, 500);

      // Actualiza progreso
      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, { currentAngle: angulo, lastUpdated: Date.now() });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR FIN DE MOVIMIENTO (BACKEND → FRONT) ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/communication/BackToFront");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        console.log("✅ Movimiento completado");
        const indexActual = anguloActualIndexRef.current;
        const siguiente = indexActual + 1;
        const sweepId = sweepIdActualRef.current;
        const angulos = angulosBarridoRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(() => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente), 2000);
        } else {
          console.log("🎉 Barrido completado!");
          setBarridoEnProgreso(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/measurements");
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        console.log("📊 Nueva medición temporal:", data);
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

  // ==================== GUARDAR DATOS PERMANENTES ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(`¿Guardar ${datosTemporales.length} mediciones del barrido?`);
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp1/measurements/${d.id}/isSaved`] = true;
      });
      await update(ref(db), updates);

      localStorage.setItem(`historicalData_subsistema1_${sweepIdActual}`, JSON.stringify(datosTemporales));

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
    }
  };

  // ==================== RENDER ====================
  return (
    <Box width="80%" m="auto" mt={8}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5">🚀 Control de Barrido Automático</Typography>

        <Typography>Ángulo Inicial: {anguloInicial}°</Typography>
        <Slider value={anguloInicial} onChange={(e, v) => setAnguloInicial(v)} min={-30} max={30} step={5} />

        <Typography>Ángulo Final: {anguloFinal}°</Typography>
        <Slider value={anguloFinal} onChange={(e, v) => setAnguloFinal(v)} min={-30} max={30} step={5} />

        <Button variant="contained" onClick={iniciarBarrido} sx={{ mt: 2 }}>
          {barridoEnProgreso ? "⏳ Barrido en progreso..." : "Iniciar Barrido"}
        </Button>

        
        {barridoEnProgreso && (
          <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
            <Box
              sx={{
                height: "100%",
                borderRadius: 1,
                backgroundColor: "#2196f3",
                width: `${((anguloActualIndex + 1) / angulosBarrido.length) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </Box>
        )}

        
        {datosTemporales.length > 0 && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6">📋 Datos Temporales</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Ángulo (°)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Voltaje (V)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Corriente (A)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Potencia (W)</th>
                </tr>
              </thead>
              <tbody>
                {datosTemporales.map((d, i) => (
                  <tr key={i}>
                    <td>{d.angle}</td>
                    <td>{d.voltage?.toFixed(2)}</td>
                    <td>{d.current?.toFixed(2)}</td>
                    <td>{(d.voltage * d.current).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={guardarBarrido}>
              💾 Guardar Barrido
            </Button>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default Subsistema1;*/
























//Version Funcional del barrido sin interfaz
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, Slider } from "@mui/material";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
} from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  const db = getDatabase(app);

  // ==================== ESTADOS ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // ==================== REFERENCIAS ====================
  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  // ==================== SESIÓN DE USUARIO ====================
  useEffect(() => {
    const generarUserSession = () => {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== FUNCIONES AUXILIARES ====================
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
    if (anguloInicial === anguloFinal) return alert("Los ángulos deben ser diferentes");

    try {
      const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
      setAngulosBarrido(angulos);
      setBarridoEnProgreso(true);
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      // Guardar sweep y publicar sweepId actual
      await Promise.all([
        set(ref(db, `experiments/Exp1/sweeps/${sweepId}`), {
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
          status: "in_progress",
          timestamp: Date.now(),
          userSession: userSession,
        }),
        set(ref(db, "experiments/Exp1/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido iniciado:", angulos);
      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("❌ Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER PANEL ====================
  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);
    try {
      const comando = "p" + angulo;
      const fbRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      // Reset del canal
      setTimeout(async () => {
        await set(fbRef, "x");
        console.log("🔁 Canal FrontToBack reseteado");
      }, 500);

      // Actualizar estado del barrido
      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, { currentAngle: angulo, lastUpdated: Date.now() });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR FIN DE MOVIMIENTO ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/communication/BackToFront");
    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        console.log("✅ Movimiento completado");
        const indexActual = anguloActualIndexRef.current;
        const siguiente = indexActual + 1;
        const sweepId = sweepIdActualRef.current;
        const angulos = angulosBarridoRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(() => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente), 2000);
        } else {
          console.log("🎉 Barrido completado!");
          setBarridoEnProgreso(false);

          const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
          await update(sweepRef, { status: "completed", lastUpdated: Date.now() });
          console.log("✅ Estado del barrido actualizado a 'completed'");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ==================== ESCUCHAR MEDICIONES NUEVAS ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/measurements");
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        console.log("📊 Nueva medición temporal:", data);
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

  // ==================== GUARDAR DATOS PERMANENTES ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");
  
    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;
  
    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`experiments/Exp1/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);
  
      // 🔹 Nuevo formato con metadata
      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
        },
        data: datosTemporales,
      };
  
      localStorage.setItem(
        `historicalData_subsistema1_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );
  
      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
    }
  };

  // ==================== RENDER ====================
  return (
    <Box width="80%" m="auto" mt={8}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5">🚀 Control de Barrido Automático</Typography>

        <Typography>Ángulo Inicial: {anguloInicial}°</Typography>
        <Slider
          value={anguloInicial}
          onChange={(e, v) => setAnguloInicial(v)}
          min={-30}
          max={30}
          step={5}
        />

        <Typography>Ángulo Final: {anguloFinal}°</Typography>
        <Slider
          value={anguloFinal}
          onChange={(e, v) => setAnguloFinal(v)}
          min={-30}
          max={30}
          step={5}
        />

        <Button variant="contained" onClick={iniciarBarrido} sx={{ mt: 2 }}>
          {barridoEnProgreso ? "⏳ Barrido en progreso..." : "Iniciar Barrido"}
        </Button>

        
        {barridoEnProgreso && (
          <Box sx={{ mt: 3, backgroundColor: "#eee", borderRadius: 1, height: 10 }}>
            <Box
              sx={{
                height: "100%",
                borderRadius: 1,
                backgroundColor: "#2196f3",
                width: `${((anguloActualIndex + 1) / angulosBarrido.length) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </Box>
        )}

        
        {datosTemporales.length > 0 && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6">📋 Datos Temporales</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Ángulo (°)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Voltaje (V)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Corriente (A)</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Potencia (W)</th>
                </tr>
              </thead>
              <tbody>
                {datosTemporales.map((d, i) => (
                  <tr key={i}>
                    <td>{d.angle}</td>
                    <td>{d.voltage?.toFixed(2)}</td>
                    <td>{d.current?.toFixed(2)}</td>
                    <td>{(d.voltage * d.current).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              onClick={guardarBarrido}
            >
              💾 Guardar Barrido
            </Button>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default Subsistema1;*/














// Version funcional del barrido ya con la interfaz

import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";

// ✅ UI antigua (mismos componentes/estilos)
import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

// Strings/columnas antiguas
import {
  SUBSISTEMA1_COLUMNS,
  PAGE_TITLES,
  SUBSISTEMA1_TOOLTIPS,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";

// Estilos antiguos
import "../../assets/css/Elements/PaperStyles.css";

// Firebase (igual que tu versión de barrido)
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

const Subsistema1 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  // ==================== ESTADOS (BARRIDO) ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [userSession, setUserSession] = useState(null);

  // ==================== REFERENCIAS (BARRIDO) ====================
  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  // ==================== SESIÓN DE USUARIO (BARRIDO) ====================
  useEffect(() => {
    const generarUserSession = () => {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const sessionId = generarUserSession();
    setUserSession(sessionId);
    console.log("🆔 Sesión iniciada:", sessionId);
  }, []);

  // ==================== FUNCIONES AUXILIARES (BARRIDO) ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) {
      for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    } else {
      for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    }
    return angulos;
  };

  // ==================== INICIAR BARRIDO (BARRIDO) ====================
  const iniciarBarrido = async () => {
    if (barridoEnProgreso) return alert("Ya hay un barrido en progreso");
    if (anguloInicial === anguloFinal)
      return alert("Los ángulos deben ser diferentes");

    try {
      const angulos = calcularAngulosBarrido(anguloInicial, anguloFinal, 5);
      setAngulosBarrido(angulos);
      setBarridoEnProgreso(true);
      setAnguloActualIndex(0);
      setDatosTemporales([]);

      const sweepId = `sweep_${Date.now()}`;
      setSweepIdActual(sweepId);

      await Promise.all([
        set(ref(db, `experiments/Exp1/sweeps/${sweepId}`), {
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
          status: "in_progress",
          timestamp: Date.now(),
          userSession: userSession,
        }),
        set(ref(db, "experiments/Exp1/currentSweepId"), sweepId),
      ]);

      console.log("🚀 Barrido iniciado:", angulos);
      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("❌ Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== MOVER PANEL (BARRIDO) ====================
  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    console.log(
      `🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${
        angulosBarridoRef.current.length
      })`
    );
    try {
      const comando = "p" + angulo;
      const fbRef = ref(db, "experiments/Exp1/communication/FrontToBack");
      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      setTimeout(async () => {
        await set(fbRef, "x");
        console.log("🔁 Canal FrontToBack reseteado");
      }, 500);

      const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, {
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR FIN DE MOVIMIENTO (BARRIDO) ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/communication/BackToFront");
    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        console.log("✅ Movimiento completado");
        const indexActual = anguloActualIndexRef.current;
        const siguiente = indexActual + 1;
        const sweepId = sweepIdActualRef.current;
        const angulos = angulosBarridoRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(
            () => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente),
            2000
          );
        } else {
          console.log("🎉 Barrido completado!");
          setBarridoEnProgreso(false);

          const sweepRef = ref(db, `experiments/Exp1/sweeps/${sweepId}`);
          await update(sweepRef, {
            status: "completed",
            lastUpdated: Date.now(),
          });
          console.log("✅ Estado del barrido actualizado a 'completed'");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ==================== ESCUCHAR MEDICIONES NUEVAS (BARRIDO) ====================
  useEffect(() => {
    const dbRef = ref(db, "experiments/Exp1/measurements");
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data.sweepId === sweepIdActual && data.isSaved === false) {
        console.log("📊 Nueva medición temporal:", data);
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });
    return () => unsubscribe();
  }, [sweepIdActual]);

  // ==================== GUARDAR DATOS PERMANENTES (BARRIDO) ====================
  const guardarBarrido = async () => {
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(
      `¿Guardar ${datosTemporales.length} mediciones del barrido?`
    );
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[
          `experiments/Exp1/measurements/meas_${d.timestamp}/isSaved`
        ] = true;
      });
      await update(ref(db), updates);

      const dataToStore = {
        metadata: {
          sweepId: sweepIdActual,
          timestamp: Date.now(),
          userSession,
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
        },
        data: datosTemporales,
      };

      localStorage.setItem(
        `historicalData_subsistema1_${sweepIdActual}`,
        JSON.stringify(dataToStore)
      );

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
    }
  };

  // ==================== BACK COMO ANTES (SOLO UI/COMPORTAMIENTO BACK) ====================
  const noEnviarNuevoAngulo = async () => {
    try {
      // ✅ En la versión vieja era Exp1/FrontToBack.
      // ✅ En la nueva es experiments/Exp1/communication/FrontToBack.
      // Para mantener compatibilidad sin tocar lógica de barrido:
      await set(ref(db, "Exp1/FrontToBack"), "n").catch(() => {});
      await set(
        ref(db, "experiments/Exp1/communication/FrontToBack"),
        "n"
      ).catch(() => {});

      console.log("🛑 Señal 'n' enviada para detener movimientos");
    } catch (error) {
      console.error("Error al enviar señal 'n':", error);
    }
  };

  const eliminarDatos = async () => {
    try {
      // Igual que antes: borraba Exp1/data.
      await remove(ref(db, "Exp1/data")).catch(() => {});
      console.log("🧹 Datos Exp1/data eliminados");
    } catch (error) {
      console.error("Error al eliminar datos:", error);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

  // ==================== UI (IGUAL A LA ANTERIOR) ====================
  const {
    MAIN_TITLE,
    DESCRIPTION,
    MOVE_BUTTON,
    SAVE_BUTTON,
    CAMERA_TITLE,
    VOLTAGE_VS_TIME_TITLE,
    CURRENT_VS_TIME_TITLE,
    DOWNLOAD_1_GRAPH,
    DOWNLOAD_GRAPHS_BUTTON,
    BACK_BUTTON,
  } = PAGE_TITLES;

  const youtubeVideoId = "nAQz4RMaHVA";

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        {/* ===================== COLUMNA IZQUIERDA ===================== */}
        <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              🚀 Automatic sweeping control
            </Typography>
          <SliderComponent
            value={anguloInicial}
            label="Initial Angle"
            min={-30}
            max={30}
            step={5}
            actualAngle={anguloInicial}
            onChange={(e, newValue) => setAnguloInicial(newValue)}
            disabled={barridoEnProgreso}
          />

          <Box mt={2}>
            <SliderComponent
              value={anguloFinal}
              label="Final Angle"
              min={-30}
              max={30}
              step={5}
              actualAngle={anguloFinal}
              onChange={(e, newValue) => setAnguloFinal(newValue)}
              disabled={barridoEnProgreso}
            />
          </Box>

          <Box mt={2}>
            {barridoEnProgreso && (
              <p style={{ color: "black" }}>El panel está en movimiento</p>
            )}
            <Button
              id="btnMov1"
              variant="contained"
              color="primary"
              onClick={iniciarBarrido}
              align="right"
              disabled={barridoEnProgreso}
            >
              {barridoEnProgreso ? "⏳ Barrido en progreso..." : MOVE_BUTTON}
            </Button>
          </Box>

          {barridoEnProgreso && angulosBarrido.length > 0 && (
            <Box
              sx={{
                mt: 3,
                backgroundColor: "#eee",
                borderRadius: 1,
                height: 10,
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  backgroundColor: "#2196f3",
                  width: `${
                    ((anguloActualIndex + 1) / angulosBarrido.length) * 100
                  }%`,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          )}

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA1_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA1_COLUMNS[0]]: `${d.angle}°`,
                  [SUBSISTEMA1_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA1_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA1_COLUMNS[3]]: (
                    ((d.voltage ?? 0) * (d.current ?? 0)) /
                    100
                  ).toFixed(2),
                  [SUBSISTEMA1_COLUMNS[4]]: "—",
                }))}
                tooltips={SUBSISTEMA1_TOOLTIPS}
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

        {/* ===================== COLUMNA DERECHA ===================== */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
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
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                }}
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

          <Box
            mt={2}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
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
            onClick={() => {}}
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

export default Subsistema1;
