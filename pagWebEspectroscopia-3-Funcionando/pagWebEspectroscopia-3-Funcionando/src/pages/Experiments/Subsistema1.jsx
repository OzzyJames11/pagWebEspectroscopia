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














// Version funcional del barrido ya con la interfaz sin usuarios
/*
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

  const youtubeVideoId = "1wLSlr1kh6Q";

  return (
    <Box width="90%" maxWidth="1200px" margin="auto" mt={7} mb={5}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "left" }}>
        {MAIN_TITLE}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "left", mb: 3 }}>
        {DESCRIPTION}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">*/
        {/* ===================== COLUMNA IZQUIERDA ===================== */}
      /*  <Grid item xs={12} md={6}>
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
*/
        {/* ===================== COLUMNA DERECHA ===================== */}
      /*  <Grid
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

*/










// Usuarios v1 no funciona
/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ AGREGADO

import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

import {
  SUBSISTEMA1_COLUMNS,
  PAGE_TITLES,
  SUBSISTEMA1_TOOLTIPS,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";

import "../../assets/css/Elements/PaperStyles.css";

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

  // ✅ OBTENER UID DEL USUARIO LOGEADO
  const user = useSelector((state) => state.auth.user);
  const userId = user?.uid;

  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);

  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  // ✅ VERIFICAR QUE EL USUARIO ESTÉ LOGEADO
  useEffect(() => {
    if (!userId) {
      alert("Debes iniciar sesión para usar este experimento");
      navigate("/login");
    }
  }, [userId, navigate]);

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
    if (!userId) return alert("Debes iniciar sesión");
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

      // ✅ RUTAS CON UID
      await Promise.all([
        set(ref(db, `users/${userId}/Exp1/sweeps/${sweepId}`), {
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
          status: "in_progress",
          timestamp: Date.now(),
        }),
        set(ref(db, `users/${userId}/Exp1/currentSweepId`), sweepId),
      ]);

      console.log("🚀 Barrido iniciado:", angulos);
      setTimeout(() => moverASiguienteAngulo(angulos[0], sweepId, 0), 1000);
    } catch (err) {
      console.error("❌ Error al iniciar barrido:", err);
      setBarridoEnProgreso(false);
    }
  };

  const moverASiguienteAngulo = async (angulo, sweepId, index) => {
    if (!userId) return;

    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);
    try {
      const comando = "p" + angulo;
      // ✅ RUTA CON UID
      const fbRef = ref(db, `users/${userId}/Exp1/communication/FrontToBack`);
      await set(fbRef, comando);
      console.log(`✅ Comando enviado: ${comando}`);

      setTimeout(async () => {
        await set(fbRef, "x");
      }, 500);

      const sweepRef = ref(db, `users/${userId}/Exp1/sweeps/${sweepId}`);
      await update(sweepRef, {
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // ✅ RUTA CON UID
    const dbRef = ref(db, `users/${userId}/Exp1/communication/BackToFront`);
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

          const sweepRef = ref(db, `users/${userId}/Exp1/sweeps/${sweepId}`);
          await update(sweepRef, {
            status: "completed",
            lastUpdated: Date.now(),
          });
        }
      }
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // ✅ RUTA CON UID
    const dbRef = ref(db, `users/${userId}/Exp1/measurements`);
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
  }, [sweepIdActual, userId]);

  // ✅ GUARDAR EN FIREBASE (NO LOCALSTORAGE)
  const guardarBarrido = async () => {
    if (!userId) return alert("Debes iniciar sesión");
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(`¿Guardar ${datosTemporales.length} mediciones del barrido?`);
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`users/${userId}/Exp1/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
    }
  };

  const noEnviarNuevoAngulo = async () => {
    if (!userId) return;
    try {
      await set(ref(db, `users/${userId}/Exp1/communication/FrontToBack`), "n");
    } catch (error) {
      console.error("Error al enviar señal 'n':", error);
    }
  };

  const eliminarDatos = async () => {
    if (!userId) return;
    try {
      await remove(ref(db, `users/${userId}/Exp1/measurements`));
    } catch (error) {
      console.error("Error al eliminar datos:", error);
    }
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    eliminarDatos();
  };

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

  const youtubeVideoId = "1wLSlr1kh6Q";

  if (!userId) {
    return <Typography>Cargando...</Typography>;
  }

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
            {barridoEnProgreso && <p style={{ color: "black" }}>El panel está en movimiento</p>}
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

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA1_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA1_COLUMNS[0]]: `${d.angle}°`,
                  [SUBSISTEMA1_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA1_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA1_COLUMNS[3]]: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
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

          <Button variant="contained" color="pink" onClick={() => {}} fullWidth align="center" marginTop={2}>
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

export default Subsistema1;
*/

































/*
import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ UID real

import SliderComponent from "../../components/Elements/SliderComponent";
import DataTable from "../../components/Elements/DataTable";
import Button from "../../components/Elements/Button.jsx";
import GraphTitleWithTooltip from "../../components/Elements/GraphTitleWithTooltip";

import {
  SUBSISTEMA1_COLUMNS,
  PAGE_TITLES,
  SUBSISTEMA1_TOOLTIPS,
  GRAPH_DESCRIPTIONS,
} from "../../assets/Strings/Experiments/Subsistema1Strings.jsx";

import "../../assets/css/Elements/PaperStyles.css";

import { getDatabase, ref, set, update, onValue, onChildAdded, remove } from "firebase/database";
import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);

  // ✅ UID del usuario logeado
  const user = useSelector((state) => state.auth.user);
  const userId = user?.uid;

  // ==================== ESTADOS ====================
  const [anguloInicial, setAnguloInicial] = useState(0);
  const [anguloFinal, setAnguloFinal] = useState(20);
  const [barridoEnProgreso, setBarridoEnProgreso] = useState(false);
  const [angulosBarrido, setAngulosBarrido] = useState([]);
  const [anguloActualIndex, setAnguloActualIndex] = useState(0);
  const [sweepIdActual, setSweepIdActual] = useState(null);
  const [datosTemporales, setDatosTemporales] = useState([]);

  const angulosBarridoRef = useRef([]);
  const anguloActualIndexRef = useRef(0);
  const sweepIdActualRef = useRef(null);

  useEffect(() => {
    angulosBarridoRef.current = angulosBarrido;
    anguloActualIndexRef.current = anguloActualIndex;
    sweepIdActualRef.current = sweepIdActual;
  }, [angulosBarrido, anguloActualIndex, sweepIdActual]);

  // ✅ Guard: requiere login
  useEffect(() => {
    if (!userId) {
      alert("Debes iniciar sesión para usar este experimento");
      navigate("/login");
    }
  }, [userId, navigate]);

  // ==================== AUX ====================
  const calcularAngulosBarrido = (inicio, fin, paso = 5) => {
    const angulos = [];
    if (inicio <= fin) for (let a = inicio; a <= fin; a += paso) angulos.push(a);
    else for (let a = inicio; a >= fin; a -= paso) angulos.push(a);
    return angulos;
  };

  // ==================== INICIAR BARRIDO ====================
  const iniciarBarrido = async () => {
    if (!userId) return alert("Debes iniciar sesión");
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

      await Promise.all([
        set(ref(db, `users/${userId}/Exp1/sweeps/${sweepId}`), {
          startAngle: anguloInicial,
          endAngle: anguloFinal,
          step: 5,
          status: "in_progress",
          timestamp: Date.now(),
        }),
        set(ref(db, `users/${userId}/Exp1/currentSweepId`), sweepId),
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
    if (!userId) return;

    console.log(`🎯 Moviendo a ángulo ${angulo}° (${index + 1}/${angulosBarridoRef.current.length})`);
    try {
      const comando = "p" + angulo;
      const fbRef = ref(db, `users/${userId}/Exp1/communication/FrontToBack`);
      await set(fbRef, comando);

      setTimeout(async () => {
        await set(fbRef, "x");
      }, 500);

      await update(ref(db, `users/${userId}/Exp1/sweeps/${sweepId}`), {
        currentAngle: angulo,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error al mover el panel:", error);
      setBarridoEnProgreso(false);
    }
  };

  // ==================== ESCUCHAR EndMov ====================
  useEffect(() => {
    if (!userId) return;

    const dbRef = ref(db, `users/${userId}/Exp1/communication/BackToFront`);
    const unsubscribe = onValue(dbRef, async (snapshot) => {
      const msg = snapshot.val();
      if (msg === "EndMov") {
        const indexActual = anguloActualIndexRef.current;
        const siguiente = indexActual + 1;
        const sweepId = sweepIdActualRef.current;
        const angulos = angulosBarridoRef.current;

        if (siguiente < angulos.length) {
          setAnguloActualIndex(siguiente);
          setTimeout(() => moverASiguienteAngulo(angulos[siguiente], sweepId, siguiente), 2000);
        } else {
          setBarridoEnProgreso(false);

          await update(ref(db, `users/${userId}/Exp1/sweeps/${sweepId}`), {
            status: "completed",
            lastUpdated: Date.now(),
          });

          // ✅ opcional: limpiar currentSweepId al terminar
          await set(ref(db, `users/${userId}/Exp1/currentSweepId`), null);
        }
      }
    });

    return () => unsubscribe();
  }, [db, userId]);

  // ==================== ESCUCHAR MEDICIONES ====================
  useEffect(() => {
    if (!userId) return;

    const dbRef = ref(db, `users/${userId}/Exp1/measurements`);
    const unsubscribe = onChildAdded(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.sweepId === sweepIdActual && data.isSaved === false) {
        setDatosTemporales((prev) => {
          const existe = prev.some((d) => d.timestamp === data.timestamp);
          return existe ? prev : [...prev, data];
        });
      }
    });

    return () => unsubscribe();
  }, [db, sweepIdActual, userId]);

  // ==================== GUARDAR ====================
  const guardarBarrido = async () => {
    if (!userId) return alert("Debes iniciar sesión");
    if (datosTemporales.length === 0) return alert("No hay datos para guardar");

    const confirmar = window.confirm(`¿Guardar ${datosTemporales.length} mediciones del barrido?`);
    if (!confirmar) return;

    try {
      const updates = {};
      datosTemporales.forEach((d) => {
        updates[`users/${userId}/Exp1/measurements/meas_${d.timestamp}/isSaved`] = true;
      });
      await update(ref(db), updates);

      alert("✅ Barrido guardado correctamente");
      setDatosTemporales([]);
    } catch (error) {
      console.error("❌ Error al guardar barrido:", error);
    }
  };

  // ==================== BACK ====================
  const noEnviarNuevoAngulo = async () => {
    if (!userId) return;
    await set(ref(db, `users/${userId}/Exp1/communication/FrontToBack`), "n").catch(() => {});
    setTimeout(() => set(ref(db, `users/${userId}/Exp1/communication/FrontToBack`), "x").catch(() => {}), 200);
  };

  const limpiarTemporales = async () => {
    if (!userId) return;
    await remove(ref(db, `users/${userId}/Exp1/measurements`)).catch(() => {});
    await set(ref(db, `users/${userId}/Exp1/currentSweepId`), null).catch(() => {});
  };

  const handleBack = () => {
    noEnviarNuevoAngulo();
    navigate("/experiments/experimentChooser");
    limpiarTemporales();
  };

  // ==================== UI ====================
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

  const youtubeVideoId = "1wLSlr1kh6Q";

  if (!userId) return <Typography>Cargando...</Typography>;

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
            {barridoEnProgreso && <p style={{ color: "black" }}>El panel está en movimiento</p>}
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

          <Box mt={3}>
            {datosTemporales.length > 0 ? (
              <DataTable
                columns={SUBSISTEMA1_COLUMNS}
                data={datosTemporales.map((d) => ({
                  [SUBSISTEMA1_COLUMNS[0]]: `${d.angle}°`,
                  [SUBSISTEMA1_COLUMNS[1]]: d.voltage?.toFixed(2),
                  [SUBSISTEMA1_COLUMNS[2]]: d.current?.toFixed(2),
                  [SUBSISTEMA1_COLUMNS[3]]: (((d.voltage ?? 0) * (d.current ?? 0)) / 100).toFixed(2),
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
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
                {CAMERA_TITLE}
                <Typography component="span" variant="caption" sx={{ color: "#e53935", fontWeight: "bold", ml: 1 }}>
                  ● En vivo
                </Typography>
              </Typography>

              <Box sx={{ width: "100%", height: "400px", mt: 1, borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
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
              <GraphTitleWithTooltip title={VOLTAGE_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.VOLTAGE_VS_TIME} />
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Box mt={2} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Paper className="paper-graph">
              <GraphTitleWithTooltip title={CURRENT_VS_TIME_TITLE} description={GRAPH_DESCRIPTIONS.CURRENT_VS_TIME} />
            </Paper>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => {}} align="right" marginTop={-1}>
            {DOWNLOAD_1_GRAPH}
          </Button>

          <Button variant="contained" color="pink" onClick={() => {}} fullWidth align="center" marginTop={2}>
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

export default Subsistema1;


*/











































// ozzyjames11: modificacion, esta es la version del 10/2/2026
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

  // 1. USUARIO ESPECÍFICO (QUEMADO PARA PRODUCCIÓN ACTUAL)
  // const UID_USUARIO = "8qb4yEqxXWcvdIEEXYBgANR57T12"; 
  // Se obtiene el ID del usuario dinámicamente
  const user = useSelector((state) => state.auth.user);
  // if(!user){
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

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

  // const handleBackSafe = () => {
  //   // Ya no preguntamos aquí. Simplemente intentamos navegar.
  //   // El 'useBlocker' atrapará este intento y lanzará la alerta automáticamente.
  //   navigate("/experiments/experimentChooser");
  // };


  // ozzyjames11: esto es solo para desarrollo, simular datos. Borrar después
  // ==================== 🛠️ SIMULADOR (SOLO DESARROLLO) ====================
  // const simularDatos = () => {
  //   if (!sweepIdActual) return alert("Espera a que se cargue el ID (o inicia un barrido primero)");
    
  //   console.log("🛠️ Generando datos de prueba...");
  //   const updates = {};
  //   const baseTime = Date.now();
    
  //   // Generamos 20 puntos de datos simulados
  //   for (let i = 0; i < 20; i++) {
  //     const time = baseTime + (i * 1000);
  //     const fakeData = {
  //       angle: -30 + (i * 3), // Simula cambio de ángulo
  //       current: Number((1.5 + Math.random()).toFixed(2)),
  //       voltage: Number((10 + Math.random() * 2).toFixed(2)),
  //       isSaved: false, // Importante: simulan no estar guardados
  //       sweepId: sweepIdActual,
  //       timestamp: time
  //     };
  //     // Escribimos directamente en la ruta del usuario
  //     updates[`${BASE_PATH}/measurements/meas_${time}`] = fakeData;
  //   }
    
  //   // Enviamos a Firebase (esto disparará tus gráficos automáticamente)
  //   update(ref(db), updates); 
  // };

  // ==================== UI ====================
  // const {
  //   MAIN_TITLE, DESCRIPTION, MOVE_BUTTON, SAVE_BUTTON, CAMERA_TITLE,
  //   VOLTAGE_VS_TIME_TITLE, CURRENT_VS_TIME_TITLE, DOWNLOAD_1_GRAPH,
  //   DOWNLOAD_GRAPHS_BUTTON, BACK_BUTTON,
  // } = PAGE_TITLES;

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



            {/* ozzyjames11: boton para pruebas, borrar luego */}
            {/* 👇👇👇 NUEVO BOTÓN PARA PRUEBAS 👇👇👇 */}
          {/* <Box mt={4} mb={2} sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="warning" 
              onClick={simularDatos}
              disabled={barridoEnProgreso}
            >
              🛠️ Test Data
            </Button>
          </Box> */}

          {/* Barra de Progreso */}
          {/* ozzyjames11: considerar borrar la barra de progreso */}
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