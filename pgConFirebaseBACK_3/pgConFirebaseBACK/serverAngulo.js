/*
import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente - Nueva estructura");

const db = getDatabase();

// ==================== VARIABLES GLOBALES ====================
let sweepIdActual = "";
let anguloObjetivoActual = 0;
let userSessionActual = "";

// ==================== CONFIGURACIÓN PUERTOS SERIALES ====================
const COM_1 = "COM5";
const port = new SerialPort({ path: COM_1, baudRate: 9600 });

port.on("open", () => {
  console.log("✅ Conexión serial COM5 abierta - Subsistema 1");
});

// ==================== REFERENCIAS FIREBASE ====================
const sweepsRef = db.ref("experiments/Exp1/sweeps");
const measurementsRef = db.ref("experiments/Exp1/measurements");
const comFrontToBackRef = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef = db.ref("experiments/Exp1/communication/BackToFront");

// ==================== DETECTOR DE BARRIDOS ====================
sweepsRef.on('child_added', (snapshot) => {
  const sweepData = snapshot.val();
  if (sweepData.status === "in_progress") {
    sweepIdActual = snapshot.key;
    userSessionActual = sweepData.userSession || "unknown";
    anguloObjetivoActual = sweepData.currentAngle || 0;
   
    console.log(`🎯 Nuevo barrido detectado: ${sweepIdActual}`);
    console.log(`👤 Usuario: ${userSessionActual}`);
    console.log(`📐 Ángulo inicial: ${anguloObjetivoActual}°`);
  }
});

sweepsRef.on('child_changed', (snapshot) => {
  const sweepData = snapshot.val();
  if (snapshot.key === sweepIdActual) {
    if (sweepData.currentAngle && sweepData.currentAngle !== anguloObjetivoActual) {
      anguloObjetivoActual = sweepData.currentAngle;
      console.log(`📐 Ángulo actualizado: ${anguloObjetivoActual}°`);
    }
   
    if (sweepData.status === "completed") {
      console.log(`✅ Barrido ${snapshot.key} completado`);
      sweepIdActual = "";
      userSessionActual = "";
      anguloObjetivoActual = 0;
    }
  }
});

// ==================== OBJETO PARA MEDICIONES ====================
let cont = 0;
const medicionActual = {
  voltage: null,
  current: null,
  angle: null
};

function resetMedicion() {
  medicionActual.voltage = null;
  medicionActual.current = null;
  medicionActual.angle = null;
}

// ⭐ FUNCIÓN PARA GUARDAR CON VALIDACIONES
function guardarSiCompleto() {
  if (medicionActual.current !== null &&
      medicionActual.voltage !== null &&
      sweepIdActual) {
   
    const measurementId = `meas_${Date.now()}_${cont}`;
    const measurementData = {
      sweepId: sweepIdActual,
      angle: medicionActual.angle || anguloObjetivoActual,
      voltage: medicionActual.voltage,
      current: medicionActual.current,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      isSaved: false,
      userSession: userSessionActual || "unknown"
    };

    // ⭐ Validar que los valores son números válidos
    if (isNaN(measurementData.voltage) || isNaN(measurementData.current)) {
      console.error("❌ Valores inválidos detectados:", measurementData);
      resetMedicion();
      return;
    }

    // ⭐ Validar rango de valores razonable
    if (measurementData.voltage < 0 || measurementData.voltage > 50) {
      console.warn("⚠️ Voltaje fuera de rango esperado:", measurementData.voltage);
    }
    if (measurementData.current < 0 || measurementData.current > 10) {
      console.warn("⚠️ Corriente fuera de rango esperado:", measurementData.current);
    }

    measurementsRef.child(measurementId).set(measurementData)
      .then(() => {
        const potencia = (medicionActual.voltage * medicionActual.current).toFixed(2);
       
        console.log(`✅ Medición COMPLETA guardada:`);
        console.log(`   - ID: ${measurementId}`);
        console.log(`   - Barrido: ${sweepIdActual}`);
        console.log(`   - Usuario: ${userSessionActual}`);
        console.log(`   - Ángulo: ${medicionActual.angle}°`);
        console.log(`   - Voltaje: ${medicionActual.voltage}V`);
        console.log(`   - Corriente: ${medicionActual.current}A`);
        console.log(`   - Potencia: ${potencia}W`);
        console.log(`   - isSaved: false (temporal)`);
      })
      .catch((error) => {
        console.error("❌ Error al guardar medición:", error);
        console.error("   - Detalles:", error.message);
       
        // ⭐ Reintento después de 2 segundos
        setTimeout(() => {
          console.log("🔄 Reintentando guardar medición...");
          measurementsRef.child(measurementId).set(measurementData)
            .then(() => console.log("✅ Medición guardada en segundo intento"))
            .catch((retryError) => console.error("❌ Fallo en reintento:", retryError));
        }, 2000);
      });

    resetMedicion();
    cont += 1;
   
  } else {
    const faltan = [];
    if (!sweepIdActual) faltan.push("barrido activo");
    if (medicionActual.current === null) faltan.push("corriente");
    if (medicionActual.voltage === null) faltan.push("voltaje");
   
    console.log(`⏸️  Esperando: ${faltan.join(", ")}`);
  }
}

// ==================== PARSER DEL ARDUINO CON VALIDACIÓN ====================
const parser1 = port.pipe(new ReadlineParser());

parser1.on("data", (line) => {
  const mensaje = line.toString().trim();
 
  // ⭐ Validar mensaje no vacío
  if (!mensaje) {
    console.log("⚠️ Mensaje vacío recibido");
    return;
  }
 
  const choose = mensaje.slice(0, 1);
  const valorStr = mensaje.slice(1);
  const valor = parseFloat(valorStr);
 
  console.log(`🔌 ${COM_1} recibió: "${mensaje}"`);

  if (choose === "I") {
    // ⭐ Validar número
    if (isNaN(valor)) {
      console.error(`❌ Corriente inválida: "${valorStr}"`);
      return;
    }
   
    medicionActual.current = valor;
    console.log(`📊 Corriente medida: ${valor}A`);
    guardarSiCompleto();
   
  } else if (choose === "V") {
    // ⭐ Validar número
    if (isNaN(valor)) {
      console.error(`❌ Voltaje inválido: "${valorStr}"`);
      return;
    }
   
    medicionActual.voltage = valor;
    medicionActual.angle = anguloObjetivoActual;
    console.log(`📊 Voltaje medido: ${valor}V para ángulo ${anguloObjetivoActual}°`);
    guardarSiCompleto();

  } else if (mensaje === "EndMov") {
    console.log("✅ Movimiento completado - Panel en posición");
   
    comBackToFrontRef.set(mensaje)
      .catch(error => console.error("❌ Error al enviar EndMov:", error));
   
    setTimeout(() => {
      comBackToFrontRef.set('x')
        .catch(error => console.error("❌ Error al resetear:", error));
    }, 2000);

  } else if (mensaje.startsWith("PITCH:")) {
    console.log("🎯 Arduino solicitando ángulo PITCH");
   
    comBackToFrontRef.set(mensaje)
      .catch(error => console.error("❌ Error al enviar PITCH:", error));
   
    setTimeout(() => {
      comBackToFrontRef.set('x')
        .catch(error => console.error("❌ Error al resetear:", error));
    }, 2000);

  } else if (mensaje.startsWith("ANGLE:")) {
    const angleValue = parseFloat(mensaje.split(":")[1]);
   
    if (!isNaN(angleValue)) {
      console.log(`📐 Ángulo actual: ${angleValue}°`);
      if (sweepIdActual) {
        anguloObjetivoActual = angleValue;
      }
    } else {
      console.error(`❌ Ángulo inválido: "${mensaje}"`);
    }
   
  } else {
    console.log(`📨 Mensaje no procesado: "${mensaje}"`);
  }
});

// ==================== LISTENER DE COMANDOS ====================
comFrontToBackRef.on("value", (snapshot) => {
  const comando = snapshot.val();

  // Ignorar valores vacíos o de reset
  if (!comando || comando === "x") return;

  console.log("📱 Frontend envió:", comando);

  // Función auxiliar para resetear el canal
  const resetChannel = async (delay = 500) => {
    setTimeout(async () => {
      try {
        await comFrontToBackRef.set("x");
        console.log("🔁 Canal FrontToBack reseteado (desde backend)");
      } catch (resetErr) {
        console.error("❌ Error al resetear canal:", resetErr);
      }
    }, delay);
  };

  // ==================== COMANDOS ====================

  if (comando.startsWith("p")) {
    const angulo = parseInt(comando.substring(1));
    console.log(`🎯 Movimiento solicitado a: ${angulo}°`);
    console.log(`📊 Barrido actual: ${sweepIdActual || "sin barrido activo"}`);

    if (port.isOpen) {
      port.write(comando + "\n", (err) => {
        if (err) {
          console.error("❌ Error al enviar comando serial:", err);
        } else {
          console.log(`✅ Comando enviado al Arduino: ${comando}`);
        }
      });
    } else {
      console.warn("⚠️ Puerto serial cerrado, no se envió el comando");
    }

    // 🔁 Reset automático después de procesar
    resetChannel();
  }

  else if (comando === "y") {
    console.log("🔛 Iniciando mediciones continuas");
    if (port.isOpen) port.write("y\n");
    resetChannel();
  }

  else if (comando === "s") {
    console.log("⏰ Activando modo 1 hora");
    if (port.isOpen) port.write("s\n");
    resetChannel();
  }

  else if (comando === "n") {
    console.log("🛑 Deteniendo proceso actual");
    sweepIdActual = "";
    anguloObjetivoActual = 0;
    userSessionActual = "";
    if (port.isOpen) port.write("n\n");
    resetChannel();
  }

  else {
    console.log("❓ Comando desconocido recibido:", comando);
    resetChannel();
  }
});

// ==================== MANEJO DE ERRORES ====================
port.on("error", (err) => {
  console.error("❌ Error en puerto COM5:", err);
  console.error("   - Código:", err.code);
  console.error("   - Mensaje:", err.message);
 
  // ⭐ Intentar reconectar
  if (err.code === "ECONNRESET" || err.code === "EPIPE") {
    console.log("🔄 Intentando reconectar en 5 segundos...");
    setTimeout(() => {
      try {
        if (!port.isOpen) {
          port.open((openErr) => {
            if (openErr) {
              console.error("❌ Error al reconectar:", openErr);
            } else {
              console.log("✅ Puerto reconectado");
            }
          });
        }
      } catch (reconnectError) {
        console.error("❌ Error en reconexión:", reconnectError);
      }
    }, 5000);
  }
});

// ⭐ Detector de desconexión Firebase
db.ref(".info/connected").on("value", (snapshot) => {
  if (snapshot.val() === false) {
    console.error("❌ Conexión con Firebase perdida");
  } else {
    console.log("✅ Conectado a Firebase");
  }
});

// ==================== CIERRE LIMPIO ====================
process.on('SIGINT', async () => {
  console.log('\n🔚 Cerrando conexiones...');
 
  try {
    await comFrontToBackRef.set('x');
    await comBackToFrontRef.set('x');
    console.log("✅ Firebase reseteado");
   
    if (sweepIdActual) {
      const sweepRef = sweepsRef.child(sweepIdActual);
      await sweepRef.update({
        status: "interrupted",
        interruptedAt: Date.now(),
        reason: "Backend shutdown"
      });
      console.log("✅ Barrido marcado como interrumpido");
    }
   
    if (port.isOpen) {
      port.close((err) => {
        if (err) {
          console.error("❌ Error al cerrar puerto:", err);
        } else {
          console.log("✅ Puerto serial cerrado");
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error durante cierre:", error);
    process.exit(1);
  }
});

console.log("🚀 Backend iniciado - Versión mejorada");
console.log("📊 Estructura Firebase:");
console.log("   - experiments/Exp1/sweeps");
console.log("   - experiments/Exp1/measurements");
console.log("   - experiments/Exp1/communication");
console.log("⚡ Esperando barridos...");*/

















//Código básico que ya funciona lo esencial osea el barrido
/*import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente");

const db = getDatabase();
const port = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const comFrontToBackRef = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef = db.ref("experiments/Exp1/communication/BackToFront");

let anguloObjetivoActual = 0;

const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// Limpieza inicial de canales
(async () => {
  await resetChannel(comFrontToBackRef, "FrontToBack");
  await resetChannel(comBackToFrontRef, "BackToFront");
})();

// Escucha comandos del frontend
comFrontToBackRef.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido:", comando);

  if (comando.startsWith("p")) {
    anguloObjetivoActual = parseInt(comando.slice(1));
    console.log(`🎯 Mover a ${anguloObjetivoActual}°`);

    if (port.isOpen) {
      port.write(comando + "\n", (err) => {
        if (err) console.error("❌ Error al enviar comando serial:", err);
        else console.log(`✅ Comando ${comando} enviado al Arduino`);
      });
    }
    await resetChannel(comFrontToBackRef, "FrontToBack");
  }

  if (comando === "n") {
    console.log("🛑 Deteniendo");
    if (port.isOpen) port.write("n\n");
    await resetChannel(comFrontToBackRef, "FrontToBack");
  }
});

// Escucha mensajes del Arduino
parser.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino:", msg);

  if (msg === "EndMov") {
    await comBackToFrontRef.set("EndMov");
    console.log("✅ Movimiento completado -> enviado al frontend");
    setTimeout(() => resetChannel(comBackToFrontRef, "BackToFront"), 1000);
  }
});

port.on("open", () => console.log("✅ Puerto COM5 abierto"));
port.on("error", (err) => console.error("❌ Error en puerto serial:", err));

process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");
  await resetChannel(comFrontToBackRef, "FrontToBack");
  await resetChannel(comBackToFrontRef, "BackToFront");
  port.close();
  process.exit(0);
});
*/




// Version donde no se ve la tabla de datos
/*
import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente");

// ===============================================================
// 🔧 CONFIGURACIÓN SERIAL Y FIREBASE
// ===============================================================
const db = getDatabase();
const port = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const comFrontToBackRef = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef = db.ref("experiments/Exp1/communication/BackToFront");

let anguloObjetivoActual = 0; // Último ángulo enviado al Arduino
let medicionActual = { voltage: null, current: null }; // Buffer temporal de medición

// ===============================================================
// 🔁 FUNCIÓN AUXILIAR PARA RESET DE CANALES
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// ===============================================================
// 🧹 LIMPIEZA INICIAL DE CANALES
// ===============================================================
(async () => {
  await resetChannel(comFrontToBackRef, "FrontToBack");
  await resetChannel(comBackToFrontRef, "BackToFront");
})();

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND
// ===============================================================
comFrontToBackRef.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual = parseInt(comando.slice(1));
      console.log(`🎯 Mover a ${anguloObjetivoActual}°`);

      if (port.isOpen) {
        port.write(comando + "\n", (err) => {
          if (err) console.error("❌ Error al enviar comando serial:", err);
          else console.log(`✅ Comando ${comando} enviado al Arduino`);
        });
      } else {
        console.warn("⚠️ Puerto serial cerrado, no se pudo enviar comando");
      }

      await resetChannel(comFrontToBackRef, "FrontToBack");
    }

    if (comando === "n") {
      console.log("🛑 Deteniendo...");
      if (port.isOpen) port.write("n\n");
      await resetChannel(comFrontToBackRef, "FrontToBack");
    }
  } catch (err) {
    console.error("❌ Error procesando comando del frontend:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR MENSAJES DEL ARDUINO (LECTURA SERIAL)
// ===============================================================
parser.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino:", msg);

  try {
    // 1️⃣ Voltaje
    if (msg.startsWith("V")) {
      medicionActual.voltage = parseFloat(msg.slice(1));
      console.log(`⚡ Voltaje recibido: ${medicionActual.voltage} V`);
      return;
    }

    // 2️⃣ Corriente
    if (msg.startsWith("I")) {
      medicionActual.current = parseFloat(msg.slice(1));
      console.log(`🔋 Corriente recibida: ${medicionActual.current} A`);
      return;
    }

    // 3️⃣ Movimiento finalizado
    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      // Crear objeto de medición
      const measurementData = {
        angle: anguloObjetivoActual,
        voltage: medicionActual.voltage ?? 0,
        current: medicionActual.current ?? 0,
        sweepId: `sweep_${Math.floor(timestamp / 10000) * 10000}`,
        timestamp,
        isSaved: false,
      };

      // Guardar en Firebase
      await db.ref(`experiments/Exp1/measurements/${measurementId}`).set(measurementData);
      console.log("✅ Medición guardada en Firebase:", measurementData);

      // Avisar al frontend que terminó el movimiento
      await comBackToFrontRef.set("EndMov");
      console.log("✅ Señal 'EndMov' enviada al frontend");

      // Reset de canal y buffer
      medicionActual = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef, "BackToFront"), 1000);
      return;
    }

    // 4️⃣ Otros mensajes opcionales
    if (msg === "ACK") {
      console.log("📩 Arduino confirmó recepción (ACK)");
      return;
    }
  } catch (err) {
    console.error("❌ Error procesando mensaje del Arduino:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS DEL PUERTO SERIAL
// ===============================================================
port.on("open", () => console.log("✅ Puerto COM5 abierto correctamente"));
port.on("error", (err) => console.error("❌ Error en puerto serial:", err));

// ===============================================================
// 🧹 CIERRE CONTROLADO DEL SERVIDOR
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");
  await resetChannel(comFrontToBackRef, "FrontToBack");
  await resetChannel(comBackToFrontRef, "BackToFront");
  port.close(() => {
    console.log("🔌 Puerto serial cerrado. Saliendo...");
    process.exit(0);
  });
});*/

















// Version corregida a la anterior
/*import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente");

// ===============================================================
// 🔧 CONFIGURACIÓN SERIAL Y FIREBASE
// ===============================================================
const db = getDatabase();
const port = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const comFrontToBackRef = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef = db.ref("experiments/Exp1/communication/BackToFront");

let anguloObjetivoActual = 0; // Último ángulo enviado al Arduino
let medicionActual = { voltage: null, current: null }; // Buffer temporal de medición

// ===============================================================
// 🔁 FUNCIÓN AUXILIAR PARA RESET DE CANALES
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// ===============================================================
// 🧹 LIMPIEZA INICIAL DE CANALES
// ===============================================================
(async () => {
  await resetChannel(comFrontToBackRef, "FrontToBack");
  await resetChannel(comBackToFrontRef, "BackToFront");
})();

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND
// ===============================================================
comFrontToBackRef.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual = parseInt(comando.slice(1));
      console.log(`🎯 Mover a ${anguloObjetivoActual}°`);

      if (port.isOpen) {
        port.write(comando + "\n", (err) => {
          if (err) console.error("❌ Error al enviar comando serial:", err);
          else console.log(`✅ Comando ${comando} enviado al Arduino`);
        });
      } else {
        console.warn("⚠️ Puerto serial cerrado, no se pudo enviar comando");
      }

      await resetChannel(comFrontToBackRef, "FrontToBack");
    }

    if (comando === "n") {
      console.log("🛑 Deteniendo...");
      if (port.isOpen) port.write("n\n");
      await resetChannel(comFrontToBackRef, "FrontToBack");
    }
  } catch (err) {
    console.error("❌ Error procesando comando del frontend:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR MENSAJES DEL ARDUINO (LECTURA SERIAL)
// ===============================================================
parser.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino:", msg);

  try {
    // 1️⃣ Voltaje
    if (msg.startsWith("V")) {
      medicionActual.voltage = parseFloat(msg.slice(1));
      console.log(`⚡ Voltaje recibido: ${medicionActual.voltage} V`);
      return;
    }

    // 2️⃣ Corriente
    if (msg.startsWith("I")) {
      medicionActual.current = parseFloat(msg.slice(1));
      console.log(`🔋 Corriente recibida: ${medicionActual.current} A`);
      return;
    }

    // 3️⃣ Movimiento finalizado
    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      // 🧭 Leer sweepId actual sincronizado desde Firebase
      const sweepIdSnap = await db.ref("experiments/Exp1/currentSweepId").once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      console.log(`🧭 Usando sweepId sincronizado: ${sweepId}`);

      // Crear objeto de medición
      const measurementData = {
        angle: anguloObjetivoActual,
        voltage: medicionActual.voltage ?? 0,
        current: medicionActual.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      // Guardar en Firebase
      await db.ref(`experiments/Exp1/measurements/${measurementId}`).set(measurementData);
      console.log("✅ Medición guardada en Firebase:", measurementData);

      // Avisar al frontend que terminó el movimiento
      await comBackToFrontRef.set("EndMov");
      console.log("✅ Señal 'EndMov' enviada al frontend");

      // Reset de canal y buffer
      medicionActual = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef, "BackToFront"), 1000);
      return;
    }

    // 4️⃣ Otros mensajes opcionales
    if (msg === "ACK") {
      console.log("📩 Arduino confirmó recepción (ACK)");
      return;
    }
  } catch (err) {
    console.error("❌ Error procesando mensaje del Arduino:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS DEL PUERTO SERIAL
// ===============================================================
port.on("open", () => console.log("✅ Puerto COM5 abierto correctamente"));
port.on("error", (err) => console.error("❌ Error en puerto serial:", err));

// ===============================================================
// 🧹 CIERRE CONTROLADO DEL SERVIDOR
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");
  await resetChannel(comFrontToBackRef, "FrontToBack");
  await resetChannel(comBackToFrontRef, "BackToFront");
  port.close(() => {
    console.log("🔌 Puerto serial cerrado. Saliendo...");
    process.exit(0);
  });
});

*/







































//Nueva version, igu<l a la anterior pero ya con el subsistema2
/*
import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente (Exp1 + Exp2)");

// ===============================================================
// 🔧 CONFIGURACIÓN FIREBASE
// ===============================================================
const db = getDatabase();

// ===============================================================
// 🔌 CONFIGURACIÓN SERIAL
// ===============================================================
// Exp1 -> COM5
const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// Exp2 -> COM6
const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 📡 REFERENCIAS FIREBASE POR EXPERIMENTO
// ===============================================================
// Exp1
const comFrontToBackRef1 = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef1 = db.ref("experiments/Exp1/communication/BackToFront");

// Exp2
const comFrontToBackRef2 = db.ref("experiments/Exp2/communication/FrontToBack");
const comBackToFrontRef2 = db.ref("experiments/Exp2/communication/BackToFront");

// ===============================================================
// 🧠 ESTADOS TEMPORALES POR EXPERIMENTO
// ===============================================================
let anguloObjetivoActual1 = 0;
let medicionActual1 = { voltage: null, current: null };

let anguloObjetivoActual2 = 0;
let medicionActual2 = { voltage: null, current: null };

// ===============================================================
// 🔁 FUNCIÓN AUXILIAR RESET CANAL
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// ===============================================================
// 🧹 LIMPIEZA INICIAL
// ===============================================================
(async () => {
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");
})();

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP1 (COM5)
// ===============================================================
comFrontToBackRef1.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp1:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual1 = parseInt(comando.slice(1));
      console.log(`🎯 [Exp1] Mover a ${anguloObjetivoActual1}°`);

      if (portExp1.isOpen) {
        portExp1.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp1] Error serial:", err);
          else console.log(`✅ [Exp1] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp1] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
    }

    if (comando === "n") {
      console.log("🛑 [Exp1] Deteniendo...");
      if (portExp1.isOpen) portExp1.write("n\n");
      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando comando:", err);
  }
});

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP2 (COM6)
//     acepta p (azimuth) y r (zenith)
// ===============================================================
comFrontToBackRef2.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp2:", comando);

  try {
    if (comando.startsWith("p") || comando.startsWith("r")) {
      anguloObjetivoActual2 = parseInt(comando.slice(1));
      console.log(`🎯 [Exp2] Mover eje ${comando[0]} a ${anguloObjetivoActual2}°`);

      if (portExp2.isOpen) {
        portExp2.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp2] Error serial:", err);
          else console.log(`✅ [Exp2] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp2] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
    }

    if (comando === "n") {
      console.log("🛑 [Exp2] Deteniendo...");
      if (portExp2.isOpen) portExp2.write("n\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando comando:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP1 (COM5)
// ===============================================================
parserExp1.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp1:", msg);

  try {
    if (msg.startsWith("V")) {
      medicionActual1.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual1.current = parseFloat(msg.slice(1));
      return;
    }

    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db.ref("experiments/Exp1/currentSweepId").once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual1,
        voltage: medicionActual1.voltage ?? 0,
        current: medicionActual1.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db.ref(`experiments/Exp1/measurements/${measurementId}`).set(measurementData);
      console.log("✅ [Exp1] Medición guardada:", measurementData);

      await comBackToFrontRef1.set("EndMov");
      medicionActual1 = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef1, "Exp1 BackToFront"), 1000);
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp1] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando serial:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP2 (COM6)
// ===============================================================
parserExp2.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp2:", msg);

  try {
    if (msg.startsWith("V")) {
      medicionActual2.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual2.current = parseFloat(msg.slice(1));
      return;
    }

    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db.ref("experiments/Exp2/currentSweepId").once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual2,
        voltage: medicionActual2.voltage ?? 0,
        current: medicionActual2.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db.ref(`experiments/Exp2/measurements/${measurementId}`).set(measurementData);
      console.log("✅ [Exp2] Medición guardada:", measurementData);

      await comBackToFrontRef2.set("EndMov");
      medicionActual2 = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 1000);
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp2] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando serial:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS DE PUERTOS
// ===============================================================
portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
portExp1.on("error", (err) => console.error("❌ Error COM5 (Exp1):", err));

portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
portExp2.on("error", (err) => console.error("❌ Error COM6 (Exp2):", err));

// ===============================================================
// 🧹 CIERRE CONTROLADO
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");

  portExp1.close(() => console.log("🔌 COM5 cerrado"));
  portExp2.close(() => console.log("🔌 COM6 cerrado"));

  setTimeout(() => process.exit(0), 500);
});
*/



























//Correcion con el subsistema 2, Barrido funciona, datos incorrectos

/*
import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente (Exp1 + Exp2)");

// ===============================================================
// 🔧 CONFIGURACIÓN FIREBASE
// ===============================================================
const db = getDatabase();

// ===============================================================
// 🔌 CONFIGURACIÓN SERIAL
// ===============================================================
// Exp1 -> COM5
const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// Exp2 -> COM6
const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 📡 REFERENCIAS FIREBASE POR EXPERIMENTO
// ===============================================================
// Exp1
const comFrontToBackRef1 = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef1 = db.ref("experiments/Exp1/communication/BackToFront");

// Exp2
const comFrontToBackRef2 = db.ref("experiments/Exp2/communication/FrontToBack");
const comBackToFrontRef2 = db.ref("experiments/Exp2/communication/BackToFront");

// ===============================================================
// 🧠 ESTADOS TEMPORALES POR EXPERIMENTO
// ===============================================================
let anguloObjetivoActual1 = 0;
let medicionActual1 = { voltage: null, current: null };

let anguloObjetivoActual2 = 0;
let medicionActual2 = { voltage: null, current: null };

// ===============================================================
// 🔁 FUNCIÓN AUXILIAR RESET CANAL
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// ===============================================================
// 🧹 LIMPIEZA INICIAL
// ===============================================================
(async () => {
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");
})();

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP1 (COM5)
// ===============================================================
comFrontToBackRef1.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp1:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual1 = parseInt(comando.slice(1));
      console.log(`🎯 [Exp1] Mover a ${anguloObjetivoActual1}°`);

      if (portExp1.isOpen) {
        portExp1.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp1] Error serial:", err);
          else console.log(`✅ [Exp1] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp1] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
    }

    if (comando === "n") {
      console.log("🛑 [Exp1] Deteniendo...");
      if (portExp1.isOpen) portExp1.write("n\n");
      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando comando:", err);
  }
});

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP2 (COM6)
//     acepta p (pitch/azimuth) y r (roll/zenith)
// ===============================================================
comFrontToBackRef2.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp2:", comando);

  try {
    if (comando.startsWith("p") || comando.startsWith("r")) {
      anguloObjetivoActual2 = parseInt(comando.slice(1));
      console.log(`🎯 [Exp2] Mover eje ${comando[0]} a ${anguloObjetivoActual2}°`);

      if (portExp2.isOpen) {
        portExp2.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp2] Error serial:", err);
          else console.log(`✅ [Exp2] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp2] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
    }

    if (comando === "n") {
      console.log("🛑 [Exp2] Deteniendo...");
      if (portExp2.isOpen) portExp2.write("n\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando comando:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP1 (COM5)
// ===============================================================
parserExp1.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp1:", msg);

  try {
    if (msg.startsWith("V")) {
      medicionActual1.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual1.current = parseFloat(msg.slice(1));
      return;
    }

    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db.ref("experiments/Exp1/currentSweepId").once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual1,
        voltage: medicionActual1.voltage ?? 0,
        current: medicionActual1.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db.ref(`experiments/Exp1/measurements/${measurementId}`).set(measurementData);
      console.log("✅ [Exp1] Medición guardada:", measurementData);

      await comBackToFrontRef1.set("EndMov");
      medicionActual1 = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef1, "Exp1 BackToFront"), 1000);
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp1] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando serial:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP2 (COM6)
//     👉 incluye handshake PITCH/ROLL
// ===============================================================
parserExp2.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp2:", msg);

  try {
    // 1) Handshake viejo
    if (msg === "PITCH:" || msg === "ROLL:") {
      await comBackToFrontRef2.set(msg);
      console.log(`✅ [Exp2] Señal ${msg} enviada al frontend`);
      setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 300);
      return;
    }

    // 2) Voltaje
    if (msg.startsWith("V")) {
      medicionActual2.voltage = parseFloat(msg.slice(1));
      return;
    }

    // 3) Corriente
    if (msg.startsWith("I")) {
      medicionActual2.current = parseFloat(msg.slice(1));
      return;
    }

    // 4) Movimiento finalizado
    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db.ref("experiments/Exp2/currentSweepId").once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual2,
        voltage: medicionActual2.voltage ?? 0,
        current: medicionActual2.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db.ref(`experiments/Exp2/measurements/${measurementId}`).set(measurementData);
      console.log("✅ [Exp2] Medición guardada:", measurementData);

      await comBackToFrontRef2.set("EndMov");
      medicionActual2 = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 1000);
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp2] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando serial:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS DE PUERTOS
// ===============================================================
portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
portExp1.on("error", (err) => console.error("❌ Error COM5 (Exp1):", err));

portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
portExp2.on("error", (err) => console.error("❌ Error COM6 (Exp2):", err));

// ===============================================================
// 🧹 CIERRE CONTROLADO
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");

  portExp1.close(() => console.log("🔌 COM5 cerrado"));
  portExp2.close(() => console.log("🔌 COM6 cerrado"));

  setTimeout(() => process.exit(0), 500);
});*/














/*


import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente (Exp1 + Exp2)");

// ===============================================================
// 🔧 CONFIGURACIÓN FIREBASE
// ===============================================================
const db = getDatabase();

// ===============================================================
// 🔌 CONFIGURACIÓN SERIAL
// ===============================================================
// Exp1 -> COM5
const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// Exp2 -> COM6
const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 📡 REFERENCIAS FIREBASE POR EXPERIMENTO
// ===============================================================
// Exp1
const comFrontToBackRef1 = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef1 = db.ref("experiments/Exp1/communication/BackToFront");

// Exp2
const comFrontToBackRef2 = db.ref("experiments/Exp2/communication/FrontToBack");
const comBackToFrontRef2 = db.ref("experiments/Exp2/communication/BackToFront");

// ===============================================================
// 🧠 ESTADOS TEMPORALES POR EXPERIMENTO
// ===============================================================

// ---------- Exp1 ----------
let anguloObjetivoActual1 = 0;
let medicionActual1 = { voltage: null, current: null };

// ---------- Exp2 ----------
let pitchObjetivoActual2 = 0; // eje p (azimuth)
let rollObjetivoActual2 = 0;  // eje r (zenith)
let medicionActual2 = { voltage: null, current: null };

// ===============================================================
// 🔁 FUNCIÓN AUXILIAR RESET CANAL
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// ===============================================================
// 🧹 LIMPIEZA INICIAL
// ===============================================================
(async () => {
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");
})();

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP1 (COM5)
// ===============================================================
comFrontToBackRef1.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp1:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual1 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp1] Mover a ${anguloObjetivoActual1}°`);

      if (portExp1.isOpen) {
        portExp1.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp1] Error serial:", err);
          else console.log(`✅ [Exp1] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp1] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
      return;
    }

    if (comando === "n") {
      console.log("🛑 [Exp1] Deteniendo...");
      if (portExp1.isOpen) portExp1.write("n\n");
      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando comando:", err);
  }
});

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP2 (COM6)
//     acepta p (pitch/azimuth) y r (roll/zenith)
// ===============================================================
comFrontToBackRef2.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp2:", comando);

  try {
    if (comando.startsWith("p")) {
      pitchObjetivoActual2 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp2] Pitch objetivo = ${pitchObjetivoActual2}°`);

      if (portExp2.isOpen) {
        portExp2.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp2] Error serial:", err);
          else console.log(`✅ [Exp2] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp2] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }

    if (comando.startsWith("r")) {
      rollObjetivoActual2 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp2] Roll objetivo = ${rollObjetivoActual2}°`);

      if (portExp2.isOpen) {
        portExp2.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp2] Error serial:", err);
          else console.log(`✅ [Exp2] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp2] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }

    if (comando === "n") {
      console.log("🛑 [Exp2] Deteniendo...");
      if (portExp2.isOpen) portExp2.write("n\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando comando:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP1 (COM5)
// ===============================================================
parserExp1.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp1:", msg);

  try {
    if (msg.startsWith("V")) {
      medicionActual1.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual1.current = parseFloat(msg.slice(1));
      return;
    }

    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db
        .ref("experiments/Exp1/currentSweepId")
        .once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual1,
        voltage: medicionActual1.voltage ?? 0,
        current: medicionActual1.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db
        .ref(`experiments/Exp1/measurements/${measurementId}`)
        .set(measurementData);
      console.log("✅ [Exp1] Medición guardada:", measurementData);

      await comBackToFrontRef1.set("EndMov");
      medicionActual1 = { voltage: null, current: null };
      setTimeout(
        () => resetChannel(comBackToFrontRef1, "Exp1 BackToFront"),
        800
      );
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp1] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando serial:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP2 (COM6)
// ===============================================================
parserExp2.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp2:", msg);

  try {
    // --------- Medición ---------
    if (msg.startsWith("V")) {
      medicionActual2.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual2.current = parseFloat(msg.slice(1));
      return;
    }

    // --------- Prompts al frontend ---------
    if (msg === "PITCH:" || msg === "ROLL:") {
      await comBackToFrontRef2.set(msg);
      console.log(`✅ [Exp2] Señal ${msg} enviada al frontend`);
      setTimeout(
        () => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"),
        300
      );
      return;
    }

    // --------- Fin movimiento ---------
    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db
        .ref("experiments/Exp2/currentSweepId")
        .once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        pitchAngle: pitchObjetivoActual2,
        rollAngle: rollObjetivoActual2,
        voltage: medicionActual2.voltage ?? 0,
        current: medicionActual2.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db
        .ref(`experiments/Exp2/measurements/${measurementId}`)
        .set(measurementData);
      console.log("✅ [Exp2] Medición guardada:", measurementData);

      await comBackToFrontRef2.set("EndMov");
      medicionActual2 = { voltage: null, current: null };
      setTimeout(
        () => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"),
        800
      );
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp2] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando serial:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS DE PUERTOS
// ===============================================================
portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
portExp1.on("error", (err) =>
  console.error("❌ Error COM5 (Exp1):", err)
);

portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
portExp2.on("error", (err) =>
  console.error("❌ Error COM6 (Exp2):", err)
);

// ===============================================================
// 🧹 CIERRE CONTROLADO
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");

  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");

  portExp1.close(() => console.log("🔌 COM5 cerrado"));
  portExp2.close(() => console.log("🔌 COM6 cerrado"));

  setTimeout(() => process.exit(0), 500);
});

*/

























// Correcciones para la visualizacion de datos
/*
import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente (Exp1 + Exp2)");

// ===============================================================
// 🔧 CONFIGURACIÓN FIREBASE
// ===============================================================
const db = getDatabase();

// ===============================================================
// 🔌 CONFIGURACIÓN SERIAL
// ===============================================================
// Exp1 -> COM5
const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// Exp2 -> COM6
const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 📡 REFERENCIAS FIREBASE POR EXPERIMENTO
// ===============================================================
// Exp1
const comFrontToBackRef1 = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef1 = db.ref("experiments/Exp1/communication/BackToFront");

// Exp2
const comFrontToBackRef2 = db.ref("experiments/Exp2/communication/FrontToBack");
const comBackToFrontRef2 = db.ref("experiments/Exp2/communication/BackToFront");

// ===============================================================
// 🧠 ESTADOS TEMPORALES POR EXPERIMENTO
// ===============================================================

// ---------- Exp1 ----------
let anguloObjetivoActual1 = 0;
let medicionActual1 = { voltage: null, current: null };

// ---------- Exp2 ----------
let pitchObjetivoActual2 = 0; // eje p (azimuth)
let rollObjetivoActual2 = 0;  // eje r (zenith)
let medicionActual2 = { voltage: null, current: null };

// ===============================================================
// 🔁 FUNCIÓN AUXILIAR RESET CANAL
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// ===============================================================
// 🧹 LIMPIEZA INICIAL
// ===============================================================
(async () => {
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");
})();

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP1 (COM5)
// ===============================================================
comFrontToBackRef1.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp1:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual1 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp1] Mover a ${anguloObjetivoActual1}°`);

      if (portExp1.isOpen) {
        portExp1.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp1] Error serial:", err);
          else console.log(`✅ [Exp1] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp1] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
      return;
    }

    if (comando === "n") {
      console.log("🛑 [Exp1] Deteniendo...");
      if (portExp1.isOpen) portExp1.write("n\n");
      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando comando:", err);
  }
});

// ===============================================================
// 🧭 ESCUCHAR COMANDOS DEL FRONTEND - EXP2 (COM6)
//     acepta p (pitch/azimuth) y r (roll/zenith)
// ===============================================================
comFrontToBackRef2.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp2:", comando);

  try {
    if (comando.startsWith("p")) {
      pitchObjetivoActual2 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp2] Pitch objetivo = ${pitchObjetivoActual2}°`);

      if (portExp2.isOpen) {
        portExp2.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp2] Error serial:", err);
          else console.log(`✅ [Exp2] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp2] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }

    if (comando.startsWith("r")) {
      rollObjetivoActual2 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp2] Roll objetivo = ${rollObjetivoActual2}°`);

      if (portExp2.isOpen) {
        portExp2.write(comando + "\n", (err) => {
          if (err) console.error("❌ [Exp2] Error serial:", err);
          else console.log(`✅ [Exp2] Comando ${comando} enviado`);
        });
      } else {
        console.warn("⚠️ [Exp2] Puerto serial cerrado");
      }

      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }

    if (comando === "n") {
      console.log("🛑 [Exp2] Deteniendo...");
      if (portExp2.isOpen) portExp2.write("n\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando comando:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP1 (COM5)
// ===============================================================
parserExp1.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp1:", msg);

  try {
    if (msg.startsWith("V")) {
      medicionActual1.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual1.current = parseFloat(msg.slice(1));
      return;
    }

    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db
        .ref("experiments/Exp1/currentSweepId")
        .once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual1,
        voltage: medicionActual1.voltage ?? 0,
        current: medicionActual1.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db
        .ref(`experiments/Exp1/measurements/${measurementId}`)
        .set(measurementData);

      console.log("✅ [Exp1] Medición guardada:", measurementData);

      await comBackToFrontRef1.set("EndMov");
      medicionActual1 = { voltage: null, current: null };

      setTimeout(
        () => resetChannel(comBackToFrontRef1, "Exp1 BackToFront"),
        800
      );
      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp1] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando serial:", err);
  }
});

// ===============================================================
// ⚡ ESCUCHAR ARDUINO - EXP2 (COM6)
// ===============================================================
parserExp2.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp2:", msg);

  try {
    // --------- Medición ---------
    if (msg.startsWith("V")) {
      medicionActual2.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual2.current = parseFloat(msg.slice(1));
      return;
    }

    // --------- Prompts al frontend ---------
    if (msg === "PITCH:" || msg === "ROLL:") {
      await comBackToFrontRef2.set(msg);
      console.log(`✅ [Exp2] Señal ${msg} enviada al frontend`);

      setTimeout(
        () => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"),
        300
      );
      return;
    }

    // --------- Fin movimiento (CON DELAY) ---------
    if (msg === "EndMov") {
      // Esperamos un poquito para asegurar que ya llegaron los últimos V/I
      setTimeout(async () => {
        const timestamp = Date.now();
        const measurementId = `meas_${timestamp}`;

        const sweepIdSnap = await db
          .ref("experiments/Exp2/currentSweepId")
          .once("value");
        const sweepId = sweepIdSnap.exists()
          ? sweepIdSnap.val()
          : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

        const measurementData = {
          pitchAngle: pitchObjetivoActual2,
          rollAngle: rollObjetivoActual2,
          voltage: medicionActual2.voltage ?? 0,
          current: medicionActual2.current ?? 0,
          sweepId,
          timestamp,
          isSaved: false,
        };

        await db
          .ref(`experiments/Exp2/measurements/${measurementId}`)
          .set(measurementData);

        console.log("✅ [Exp2] Medición guardada:", measurementData);

        await comBackToFrontRef2.set("EndMov");
        setTimeout(
          () => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"),
          800
        );

        // OJO: NO reseteamos medicionActual2 acá para no pisar lecturas.
        // Si querés limpiar, hacelo al iniciar el barrido desde el front.
      }, 200);

      return;
    }

    if (msg === "ACK") {
      console.log("📩 [Exp2] ACK recibido");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando serial:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS DE PUERTOS
// ===============================================================
portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
portExp1.on("error", (err) =>
  console.error("❌ Error COM5 (Exp1):", err)
);

portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
portExp2.on("error", (err) =>
  console.error("❌ Error COM6 (Exp2):", err)
);

// ===============================================================
// 🧹 CIERRE CONTROLADO
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");

  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");

  portExp1.close(() => console.log("🔌 COM5 cerrado"));
  portExp2.close(() => console.log("🔌 COM6 cerrado"));

  setTimeout(() => process.exit(0), 500);
});

*/






























//Nuevas correcciones , Version final sin usaurios
/*
import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

// ===============================================================
// 🔧 FIREBASE INIT
// ===============================================================
const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("✅ Firebase conectado correctamente (Exp1 + Exp2)");

const db = getDatabase();

// ===============================================================
// 🔌 SERIAL
// ===============================================================
// Exp1 -> COM5
const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// Exp2 -> COM6
const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 📡 FIREBASE REFS
// ===============================================================
// Exp1
const comFrontToBackRef1 = db.ref("experiments/Exp1/communication/FrontToBack");
const comBackToFrontRef1 = db.ref("experiments/Exp1/communication/BackToFront");

// Exp2
const comFrontToBackRef2 = db.ref("experiments/Exp2/communication/FrontToBack");
const comBackToFrontRef2 = db.ref("experiments/Exp2/communication/BackToFront");

// ===============================================================
// 🧠 ESTADOS TEMP
// ===============================================================
// Exp1
let anguloObjetivoActual1 = 0;
let medicionActual1 = { voltage: null, current: null };

// Exp2
let pitchObjetivoActual2 = 0;
let rollObjetivoActual2 = 0;
let medicionActual2 = { voltage: null, current: null };

// Control sweep Exp2
let sweepActive2 = false;
let currentSweepId2 = null;
let receivedFirstCommand2 = false; // ✅ para ignorar EndMov de calibración

// ===============================================================
// 🔁 RESET CANALES
// ===============================================================
const resetChannel = async (ref, label) => {
  try {
    await ref.set("x");
    console.log(`🔁 Canal ${label} reseteado`);
  } catch (err) {
    console.error(`❌ Error al resetear canal ${label}:`, err);
  }
};

// limpieza inicial
(async () => {
  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");
})();

// ===============================================================
// 🧠 LISTEN SWEEP STATE (Exp2)
// ===============================================================
// El front crea sweeps/<id> con status="in_progress"
// y setea currentSweepId. Con esto detectamos inicio/fin real.
const currentSweepIdRef2 = db.ref("experiments/Exp2/currentSweepId");
currentSweepIdRef2.on("value", (snap) => {
  const id = snap.val();
  currentSweepId2 = id || null;

  if (currentSweepId2) {
    sweepActive2 = true;
    receivedFirstCommand2 = false; // reset por sweep nuevo
    console.log(`🚦 [Exp2] Sweep activo: ${currentSweepId2}`);
  } else {
    sweepActive2 = false;
    receivedFirstCommand2 = false;
    console.log("🛑 [Exp2] Sweep inactivo (currentSweepId null)");
  }
});

// Si el status cambia a completed/cancelled -> desactiva sweep
const sweepsRef2 = db.ref("experiments/Exp2/sweeps");
sweepsRef2.on("child_changed", (snap) => {
  const sweep = snap.val();
  const sweepId = snap.key;

  if (!sweepId || sweepId !== currentSweepId2) return;

  if (sweep?.status && sweep.status !== "in_progress") {
    sweepActive2 = false;
    receivedFirstCommand2 = false;
    console.log(`🏁 [Exp2] Sweep ${sweepId} terminado con status=${sweep.status}`);
  }
});

// ===============================================================
// 🧭 FRONT -> ARDUINO EXP1
// ===============================================================
comFrontToBackRef1.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp1:", comando);

  try {
    if (comando.startsWith("p")) {
      anguloObjetivoActual1 = parseInt(comando.slice(1), 10);
      console.log(`🎯 [Exp1] Mover a ${anguloObjetivoActual1}°`);

      if (portExp1.isOpen) portExp1.write(comando + "\n");
      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
      return;
    }

    if (comando === "n") {
      console.log("🛑 [Exp1] Deteniendo...");
      if (portExp1.isOpen) portExp1.write("n\n");
      await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp1] Error procesando comando:", err);
  }
});

// ===============================================================
// 🧭 FRONT -> ARDUINO EXP2 (p / r)
// ===============================================================
comFrontToBackRef2.on("value", async (snapshot) => {
  const comando = snapshot.val();
  if (!comando || comando === "x") return;

  console.log("📥 Comando recibido Exp2:", comando);

  try {
    if (comando.startsWith("p")) {
      pitchObjetivoActual2 = parseInt(comando.slice(1), 10);
      if (sweepActive2) receivedFirstCommand2 = true;

      console.log(`🎯 [Exp2] Pitch objetivo = ${pitchObjetivoActual2}°`);
      if (portExp2.isOpen) portExp2.write(comando + "\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }

    if (comando.startsWith("r")) {
      rollObjetivoActual2 = parseInt(comando.slice(1), 10);
      if (sweepActive2) receivedFirstCommand2 = true;

      console.log(`🎯 [Exp2] Roll objetivo = ${rollObjetivoActual2}°`);
      if (portExp2.isOpen) portExp2.write(comando + "\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }

    if (comando === "n") {
      console.log("🛑 [Exp2] Deteniendo...");
      if (portExp2.isOpen) portExp2.write("n\n");
      await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
      return;
    }
  } catch (err) {
    console.error("❌ [Exp2] Error procesando comando:", err);
  }
});

// ===============================================================
// ⚡ ARDUINO -> FIREBASE EXP1
// ===============================================================
parserExp1.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp1:", msg);

  try {
    if (msg.startsWith("V")) {
      medicionActual1.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual1.current = parseFloat(msg.slice(1));
      return;
    }

    if (msg === "EndMov") {
      const timestamp = Date.now();
      const measurementId = `meas_${timestamp}`;

      const sweepIdSnap = await db.ref("experiments/Exp1/currentSweepId").once("value");
      const sweepId = sweepIdSnap.exists()
        ? sweepIdSnap.val()
        : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

      const measurementData = {
        angle: anguloObjetivoActual1,
        voltage: medicionActual1.voltage ?? 0,
        current: medicionActual1.current ?? 0,
        sweepId,
        timestamp,
        isSaved: false,
      };

      await db.ref(`experiments/Exp1/measurements/${measurementId}`).set(measurementData);
      console.log("✅ [Exp1] Medición guardada:", measurementData);

      await comBackToFrontRef1.set("EndMov");
      medicionActual1 = { voltage: null, current: null };
      setTimeout(() => resetChannel(comBackToFrontRef1, "Exp1 BackToFront"), 800);
      return;
    }

    if (msg === "ACK") return;
  } catch (err) {
    console.error("❌ [Exp1] Error procesando serial:", err);
  }
});

// ===============================================================
// ⚡ ARDUINO -> FIREBASE EXP2
// ===============================================================
parserExp2.on("data", async (line) => {
  const msg = line.toString().trim();
  if (!msg) return;

  console.log("📡 Arduino Exp2:", msg);

  try {
    // --------- Medición ---------
    if (msg.startsWith("V")) {
      medicionActual2.voltage = parseFloat(msg.slice(1));
      return;
    }

    if (msg.startsWith("I")) {
      medicionActual2.current = parseFloat(msg.slice(1));
      return;
    }

    // --------- Prompts (solo si sweep activo) ---------
    if ((msg === "PITCH:" || msg === "ROLL:")) {
      if (!sweepActive2) {
        console.log(`⏭️ [Exp2] Ignorando prompt ${msg} (sin sweep activo)`);
        return;
      }

      await comBackToFrontRef2.set(msg);
      console.log(`✅ [Exp2] Señal ${msg} enviada al frontend`);
      setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 300);
      return;
    }

    // --------- Fin movimiento ---------
    if (msg === "EndMov") {
      // ✅ Cortafuego contra calibración / EndMov viejo
      if (!sweepActive2 || !currentSweepId2 || !receivedFirstCommand2) {
        console.log(
          `⏭️ [Exp2] EndMov ignorado (sweepActive=${sweepActive2}, ` +
          `currentSweepId=${currentSweepId2}, firstCmd=${receivedFirstCommand2})`
        );
        medicionActual2 = { voltage: null, current: null };
        return;
      }

      // pequeño delay para asegurar V/I
      setTimeout(async () => {
        const timestamp = Date.now();
        const measurementId = `meas_${timestamp}`;

        const measurementData = {
          pitchAngle: pitchObjetivoActual2,
          rollAngle: rollObjetivoActual2,
          voltage: medicionActual2.voltage ?? 0,
          current: medicionActual2.current ?? 0,
          sweepId: currentSweepId2,
          timestamp,
          isSaved: false,
        };

        await db.ref(`experiments/Exp2/measurements/${measurementId}`).set(measurementData);
        console.log("✅ [Exp2] Medición guardada:", measurementData);

        await comBackToFrontRef2.set("EndMov");
        medicionActual2 = { voltage: null, current: null };
        setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 800);
      }, 200);

      return;
    }

    if (msg === "ACK") return;
  } catch (err) {
    console.error("❌ [Exp2] Error procesando serial:", err);
  }
});

// ===============================================================
// 🔌 EVENTOS PUERTOS
// ===============================================================
portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
portExp1.on("error", (err) => console.error("❌ Error COM5 (Exp1):", err));

portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
portExp2.on("error", (err) => console.error("❌ Error COM6 (Exp2):", err));

// ===============================================================
// 🧹 CIERRE CONTROLADO
// ===============================================================
process.on("SIGINT", async () => {
  console.log("🧹 Cerrando servidor...");

  await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
  await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
  await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
  await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");

  portExp1.close(() => console.log("🔌 COM5 cerrado"));
  portExp2.close(() => console.log("🔌 COM6 cerrado"));

  setTimeout(() => process.exit(0), 500);
});


*/





























// Prueba de código por usuarios

// import "dotenv/config";
// import admin from "firebase-admin";
// import { createRequire } from "module";
// import { getDatabase } from "firebase-admin/database";
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";

// // ===============================================================
// // 🔧 FIREBASE INIT
// // ===============================================================
// const require = createRequire(import.meta.url);
// const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// console.log("✅ Firebase conectado correctamente (Multi-Usuario con Arduino)");

// const db = getDatabase();

// // ===============================================================
// // 🔌 SERIAL
// // ===============================================================
// const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
// const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
// const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// // ===============================================================
// // 👥 GESTIÓN DE USUARIOS ACTIVOS
// // ===============================================================
// const userStates = new Map(); // uid -> { exp1: {...}, exp2: {...} }

// function getUserState(uid) {
//   if (!userStates.has(uid)) {
//     userStates.set(uid, {
//       exp1: {
//         anguloObjetivo: 0,
//         medicionActual: { voltage: null, current: null }
//       },
//       exp2: {
//         pitchObjetivo: 0,
//         rollObjetivo: 0,
//         medicionActual: { voltage: null, current: null },
//         sweepActive: false,
//         currentSweepId: null,
//         receivedFirstCommand: false
//       }
//     });
//   }
//   return userStates.get(uid);
// }

// // ===============================================================
// // 🔁 RESET CANALES
// // ===============================================================
// const resetChannel = async (ref, label) => {
//   try {
//     await ref.set("x");
//     console.log(`🔁 Canal ${label} reseteado`);
//   } catch (err) {
//     console.error(`❌ Error al resetear canal ${label}:`, err);
//   }
// };

// // ===============================================================
// // 🎧 DETECTAR NUEVOS USUARIOS
// // ===============================================================
// const usersRef = db.ref("users");

// usersRef.on("child_added", (snapshot) => {
//   const uid = snapshot.key;
//   console.log(`👤 Nuevo usuario detectado: ${uid.slice(0, 8)}...`);
//   initializeUserListeners(uid);
// });

// // ===============================================================
// // 🎧 INICIALIZAR LISTENERS POR USUARIO
// // ===============================================================
// function initializeUserListeners(uid) {
//   const state = getUserState(uid);
  
//   // Referencias Firebase por usuario
//   const comFrontToBackRef1 = db.ref(`users/${uid}/Exp1/communication/FrontToBack`);
//   const comBackToFrontRef1 = db.ref(`users/${uid}/Exp1/communication/BackToFront`);
//   const comFrontToBackRef2 = db.ref(`users/${uid}/Exp2/communication/FrontToBack`);
//   const comBackToFrontRef2 = db.ref(`users/${uid}/Exp2/communication/BackToFront`);

//   // Limpieza inicial
//   resetChannel(comFrontToBackRef1, `${uid.slice(0, 8)} Exp1 F→B`);
//   resetChannel(comBackToFrontRef1, `${uid.slice(0, 8)} Exp1 B→F`);
//   resetChannel(comFrontToBackRef2, `${uid.slice(0, 8)} Exp2 F→B`);
//   resetChannel(comBackToFrontRef2, `${uid.slice(0, 8)} Exp2 B→F`);

//   // ============ LISTENER SWEEP STATE EXP2 ============
//   const currentSweepIdRef2 = db.ref(`users/${uid}/Exp2/currentSweepId`);
//   currentSweepIdRef2.on("value", (snap) => {
//     const id = snap.val();
//     state.exp2.currentSweepId = id || null;

//     if (state.exp2.currentSweepId) {
//       state.exp2.sweepActive = true;
//       state.exp2.receivedFirstCommand = false;
//       console.log(`🚦 [${uid.slice(0, 8)}] Exp2 Sweep activo: ${state.exp2.currentSweepId}`);
//     } else {
//       state.exp2.sweepActive = false;
//       state.exp2.receivedFirstCommand = false;
//       console.log(`🛑 [${uid.slice(0, 8)}] Exp2 Sweep inactivo`);
//     }
//   });

//   const sweepsRef2 = db.ref(`users/${uid}/Exp2/sweeps`);
//   sweepsRef2.on("child_changed", (snap) => {
//     const sweep = snap.val();
//     const sweepId = snap.key;

//     if (!sweepId || sweepId !== state.exp2.currentSweepId) return;

//     if (sweep?.status && sweep.status !== "in_progress") {
//       state.exp2.sweepActive = false;
//       state.exp2.receivedFirstCommand = false;
//       console.log(`🏁 [${uid.slice(0, 8)}] Exp2 Sweep ${sweepId} terminado`);
//     }
//   });

//   // ============ LISTENER EXP1 COMANDOS ============
//   comFrontToBackRef1.on("value", async (snapshot) => {
//     const comando = snapshot.val();
//     if (!comando || comando === "x") return;

//     console.log(`📥 [${uid.slice(0, 8)}] Exp1 comando:`, comando);

//     try {
//       if (comando.startsWith("p")) {
//         state.exp1.anguloObjetivo = parseInt(comando.slice(1), 10);
//         console.log(`🎯 [${uid.slice(0, 8)}] Exp1 mover a ${state.exp1.anguloObjetivo}°`);

//         if (portExp1.isOpen) portExp1.write(comando + "\n");
//         await resetChannel(comFrontToBackRef1, `${uid.slice(0, 8)} Exp1 F→B`);
//         return;
//       }

//       if (comando === "n") {
//         console.log(`🛑 [${uid.slice(0, 8)}] Exp1 deteniendo`);
//         if (portExp1.isOpen) portExp1.write("n\n");
//         await resetChannel(comFrontToBackRef1, `${uid.slice(0, 8)} Exp1 F→B`);
//         return;
//       }
//     } catch (err) {
//       console.error(`❌ [${uid.slice(0, 8)}] Exp1 error:`, err);
//     }
//   });

//   // ============ LISTENER EXP2 COMANDOS ============
//   comFrontToBackRef2.on("value", async (snapshot) => {
//     const comando = snapshot.val();
//     if (!comando || comando === "x") return;

//     console.log(`📥 [${uid.slice(0, 8)}] Exp2 comando:`, comando);

//     try {
//       if (comando.startsWith("p")) {
//         state.exp2.pitchObjetivo = parseInt(comando.slice(1), 10);
//         if (state.exp2.sweepActive) state.exp2.receivedFirstCommand = true;

//         console.log(`🎯 [${uid.slice(0, 8)}] Exp2 Pitch = ${state.exp2.pitchObjetivo}°`);
//         if (portExp2.isOpen) portExp2.write(comando + "\n");
//         await resetChannel(comFrontToBackRef2, `${uid.slice(0, 8)} Exp2 F→B`);
//         return;
//       }

//       if (comando.startsWith("r")) {
//         state.exp2.rollObjetivo = parseInt(comando.slice(1), 10);
//         if (state.exp2.sweepActive) state.exp2.receivedFirstCommand = true;

//         console.log(`🎯 [${uid.slice(0, 8)}] Exp2 Roll = ${state.exp2.rollObjetivo}°`);
//         if (portExp2.isOpen) portExp2.write(comando + "\n");
//         await resetChannel(comFrontToBackRef2, `${uid.slice(0, 8)} Exp2 F→B`);
//         return;
//       }

//       if (comando === "n") {
//         console.log(`🛑 [${uid.slice(0, 8)}] Exp2 deteniendo`);
//         if (portExp2.isOpen) portExp2.write("n\n");
//         await resetChannel(comFrontToBackRef2, `${uid.slice(0, 8)} Exp2 F→B`);
//         return;
//       }
//     } catch (err) {
//       console.error(`❌ [${uid.slice(0, 8)}] Exp2 error:`, err);
//     }
//   });

//   console.log(`✅ Listeners inicializados para usuario: ${uid.slice(0, 8)}...`);
// }

// // ===============================================================
// // ⚡ ARDUINO -> FIREBASE (BROADCAST A USUARIO ACTIVO)
// // ===============================================================
// parserExp1.on("data", async (line) => {
//   const msg = line.toString().trim();
//   if (!msg) return;

//   console.log("📡 Arduino Exp1:", msg);

//   // Broadcast a todos los usuarios activos
//   for (const [uid, state] of userStates) {
//     try {
//       if (msg.startsWith("V")) {
//         state.exp1.medicionActual.voltage = parseFloat(msg.slice(1));
//         continue;
//       }

//       if (msg.startsWith("I")) {
//         state.exp1.medicionActual.current = parseFloat(msg.slice(1));
//         continue;
//       }

//       if (msg === "EndMov") {
//         const timestamp = Date.now();
//         const measurementId = `meas_${timestamp}`;

//         const sweepIdSnap = await db.ref(`users/${uid}/Exp1/currentSweepId`).once("value");
//         const sweepId = sweepIdSnap.exists()
//           ? sweepIdSnap.val()
//           : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

//         const measurementData = {
//           angle: state.exp1.anguloObjetivo,
//           voltage: state.exp1.medicionActual.voltage ?? 0,
//           current: state.exp1.medicionActual.current ?? 0,
//           sweepId,
//           timestamp,
//           isSaved: false,
//         };

//         await db.ref(`users/${uid}/Exp1/measurements/${measurementId}`).set(measurementData);
//         console.log(`✅ [${uid.slice(0, 8)}] Exp1 medición guardada:`, measurementData);

//         const comBackToFrontRef1 = db.ref(`users/${uid}/Exp1/communication/BackToFront`);
//         await comBackToFrontRef1.set("EndMov");
//         state.exp1.medicionActual = { voltage: null, current: null };
//         setTimeout(() => resetChannel(comBackToFrontRef1, `${uid.slice(0, 8)} Exp1 B→F`), 800);
//         return;
//       }
//     } catch (err) {
//       console.error(`❌ [${uid.slice(0, 8)}] Exp1 error procesando serial:`, err);
//     }
//   }
// });

// parserExp2.on("data", async (line) => {
//   const msg = line.toString().trim();
//   if (!msg) return;

//   console.log("📡 Arduino Exp2:", msg);

//   for (const [uid, state] of userStates) {
//     try {
//       if (msg.startsWith("V")) {
//         state.exp2.medicionActual.voltage = parseFloat(msg.slice(1));
//         continue;
//       }

//       if (msg.startsWith("I")) {
//         state.exp2.medicionActual.current = parseFloat(msg.slice(1));
//         continue;
//       }

//       if (msg === "PITCH:" || msg === "ROLL:") {
//         if (!state.exp2.sweepActive) {
//           console.log(`⏭️ [${uid.slice(0, 8)}] Ignorando prompt ${msg}`);
//           continue;
//         }

//         const comBackToFrontRef2 = db.ref(`users/${uid}/Exp2/communication/BackToFront`);
//         await comBackToFrontRef2.set(msg);
//         console.log(`✅ [${uid.slice(0, 8)}] Señal ${msg} enviada`);
//         setTimeout(() => resetChannel(comBackToFrontRef2, `${uid.slice(0, 8)} Exp2 B→F`), 300);
//         continue;
//       }

//       if (msg === "EndMov") {
//         if (!state.exp2.sweepActive || !state.exp2.currentSweepId || !state.exp2.receivedFirstCommand) {
//           console.log(`⏭️ [${uid.slice(0, 8)}] EndMov ignorado`);
//           state.exp2.medicionActual = { voltage: null, current: null };
//           continue;
//         }

//         setTimeout(async () => {
//           const timestamp = Date.now();
//           const measurementId = `meas_${timestamp}`;

//           const measurementData = {
//             pitchAngle: state.exp2.pitchObjetivo,
//             rollAngle: state.exp2.rollObjetivo,
//             voltage: state.exp2.medicionActual.voltage ?? 0,
//             current: state.exp2.medicionActual.current ?? 0,
//             sweepId: state.exp2.currentSweepId,
//             timestamp,
//             isSaved: false,
//           };

//           await db.ref(`users/${uid}/Exp2/measurements/${measurementId}`).set(measurementData);
//           console.log(`✅ [${uid.slice(0, 8)}] Exp2 medición guardada:`, measurementData);

//           const comBackToFrontRef2 = db.ref(`users/${uid}/Exp2/communication/BackToFront`);
//           await comBackToFrontRef2.set("EndMov");
//           state.exp2.medicionActual = { voltage: null, current: null };
//           setTimeout(() => resetChannel(comBackToFrontRef2, `${uid.slice(0, 8)}] Exp2 B→F`), 800);
//         }, 200);

//         return;
//       }
//     } catch (err) {
//       console.error(`❌ [${uid.slice(0, 8)}] Exp2 error:`, err);
//     }
//   }
// });

// // ===============================================================
// // 🔌 EVENTOS PUERTOS
// // ===============================================================
// portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
// portExp1.on("error", (err) => console.error("❌ Error COM5 (Exp1):", err));

// portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
// portExp2.on("error", (err) => console.error("❌ Error COM6 (Exp2):", err));

// // ===============================================================
// // 🧹 CIERRE CONTROLADO
// // ===============================================================
// process.on("SIGINT", async () => {
//   console.log("🧹 Cerrando servidor...");

//   for (const uid of userStates.keys()) {
//     const comFrontToBackRef1 = db.ref(`users/${uid}/Exp1/communication/FrontToBack`);
//     const comBackToFrontRef1 = db.ref(`users/${uid}/Exp1/communication/BackToFront`);
//     const comFrontToBackRef2 = db.ref(`users/${uid}/Exp2/communication/FrontToBack`);
//     const comBackToFrontRef2 = db.ref(`users/${uid}/Exp2/communication/BackToFront`);

//     await resetChannel(comFrontToBackRef1, `${uid.slice(0, 8)} Exp1 F→B`);
//     await resetChannel(comBackToFrontRef1, `${uid.slice(0, 8)} Exp1 B→F`);
//     await resetChannel(comFrontToBackRef2, `${uid.slice(0, 8)} Exp2 F→B`);
//     await resetChannel(comBackToFrontRef2, `${uid.slice(0, 8)} Exp2 B→F`);
//   }

//   portExp1.close(() => console.log("🔌 COM5 cerrado"));
//   portExp2.close(() => console.log("🔌 COM6 cerrado"));

//   setTimeout(() => process.exit(0), 500);
// });
















//Usuarios final
// ozzyjames11: comentado termporalmente para probar mi versión
// import "dotenv/config";
// import admin from "firebase-admin";
// import { createRequire } from "module";
// import { getDatabase } from "firebase-admin/database";
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";

// // ===============================================================
// // 🔧 FIREBASE INIT
// // ===============================================================
// const require = createRequire(import.meta.url);
// const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// console.log("✅ Firebase conectado correctamente (Exp1 + Exp2) - MODO UID");

// const db = getDatabase();

// // ===============================================================
// // 🔌 SERIAL
// // ===============================================================
// // Exp1 -> COM5
// const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
// const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// // Exp2 -> COM6
// const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
// const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// // ===============================================================
// // 🧠 ESTADOS (hardware)
// // ===============================================================
// let activeUidExp1 = null;
// let activeUidExp2 = null;

// // Exp1 state
// let anguloObjetivoActual1 = 0;
// let medicionActual1 = { voltage: null, current: null };

// // Exp2 state
// let pitchObjetivoActual2 = 0;
// let rollObjetivoActual2 = 0;
// let medicionActual2 = { voltage: null, current: null };

// // Sweep control Exp2
// let sweepActive2 = false;
// let currentSweepId2 = null;
// let receivedFirstCommand2 = false;

// // ===============================================================
// // 🔁 RESET CANALES
// // ===============================================================
// const resetChannel = async (ref, label) => {
//   try {
//     await ref.set("x");
//     console.log(`🔁 Canal ${label} reseteado`);
//   } catch (err) {
//     console.error(`❌ Error al resetear canal ${label}:`, err);
//   }
// };

// // ===============================================================
// // 👥 DETECTAR USUARIOS Y CONFIGURAR LISTENERS
// // ===============================================================
// const usersRef = db.ref("users");

// // Si ya hay usuarios en DB, también los queremos
// usersRef.on("child_added", (snapshot) => {
//   const uid = snapshot.key;
//   console.log(`👤 Usuario detectado: ${uid}`);
//   initializeUserListeners(uid);
// });

// function initializeUserListeners(uid) {
//   // Refs por usuario
//   const f2b1 = db.ref(`users/${uid}/Exp1/communication/FrontToBack`);
//   const b2f1 = db.ref(`users/${uid}/Exp1/communication/BackToFront`);

//   const f2b2 = db.ref(`users/${uid}/Exp2/communication/FrontToBack`);
//   const b2f2 = db.ref(`users/${uid}/Exp2/communication/BackToFront`);

//   const currentSweepIdRef1 = db.ref(`users/${uid}/Exp1/currentSweepId`);
//   const currentSweepIdRef2 = db.ref(`users/${uid}/Exp2/currentSweepId`);

//   // Limpieza inicial
//   resetChannel(f2b1, `${uid.slice(0, 8)} Exp1 F→B`);
//   resetChannel(b2f1, `${uid.slice(0, 8)} Exp1 B→F`);
//   resetChannel(f2b2, `${uid.slice(0, 8)} Exp2 F→B`);
//   resetChannel(b2f2, `${uid.slice(0, 8)} Exp2 B→F`);

//   // ====== Detectar usuario activo por sweep (turnos) ======
//   currentSweepIdRef1.on("value", (snap) => {
//     const sweepId = snap.val();
  
//     if (sweepId) {
//       activeUidExp1 = uid;
//       console.log(`🧭 [Exp1] Usuario activo ahora: ${uid.slice(0, 8)} (sweep=${sweepId})`);
//     } else {
//       // ✅ liberar Exp1 si este uid era el activo
//       if (activeUidExp1 === uid) {
//         activeUidExp1 = null;
//         console.log(`🛑 [Exp1] Sweep inactivo para uid activo ${uid.slice(0, 8)}`);
//       }
//     }
//   });
  
  

//   currentSweepIdRef2.on("value", (snap) => {
//     const sweepId = snap.val();
//     currentSweepId2 = sweepId || null;

//     if (currentSweepId2) {
//       activeUidExp2 = uid;
//       sweepActive2 = true;
//       receivedFirstCommand2 = false;
//       console.log(`🚦 [Exp2] Usuario activo: ${uid.slice(0, 8)} (sweep=${currentSweepId2})`);
//     } else {
//       // si el sweep se limpia para este uid, desactiva SOLO si era el activo
//       if (activeUidExp2 === uid) {
//         sweepActive2 = false;
//         receivedFirstCommand2 = false;
//         console.log(`🛑 [Exp2] Sweep inactivo para uid activo ${uid.slice(0, 8)}`);
//       }
//     }
//   });

//   // ====== Front -> Arduino Exp1 ======
//   f2b1.on("value", async (snapshot) => {
//     const comando = snapshot.val();
//     if (!comando || comando === "x") return;

//     // Turnos: solo procesa si este uid es el activo de Exp1
//     if (activeUidExp1 && activeUidExp1 !== uid) return;

//     try {
//       if (comando.startsWith("p")) {
//         anguloObjetivoActual1 = parseInt(comando.slice(1), 10);
//         if (portExp1.isOpen) portExp1.write(comando + "\n");
//         await resetChannel(f2b1, `${uid.slice(0, 8)} Exp1 F→B`);
//         return;
//       }

//       if (comando === "n") {
//         if (portExp1.isOpen) portExp1.write("n\n");
//         await resetChannel(f2b1, `${uid.slice(0, 8)} Exp1 F→B`);
//         return;
//       }
//     } catch (err) {
//       console.error(`❌ [${uid.slice(0, 8)}] Exp1 error comando:`, err);
//     }
//   });

//   // ====== Front -> Arduino Exp2 ======
//   f2b2.on("value", async (snapshot) => {
//     const comando = snapshot.val();
//     if (!comando || comando === "x") return;

//     // Turnos: solo procesa si este uid es el activo de Exp2
//     if (activeUidExp2 && activeUidExp2 !== uid) return;

//     try {
//       if (comando.startsWith("p")) {
//         pitchObjetivoActual2 = parseInt(comando.slice(1), 10);
//         if (sweepActive2) receivedFirstCommand2 = true;

//         if (portExp2.isOpen) portExp2.write(comando + "\n");
//         await resetChannel(f2b2, `${uid.slice(0, 8)} Exp2 F→B`);
//         return;
//       }

//       if (comando.startsWith("r")) {
//         rollObjetivoActual2 = parseInt(comando.slice(1), 10);
//         if (sweepActive2) receivedFirstCommand2 = true;

//         if (portExp2.isOpen) portExp2.write(comando + "\n");
//         await resetChannel(f2b2, `${uid.slice(0, 8)} Exp2 F→B`);
//         return;
//       }

//       if (comando === "n") {
//         if (portExp2.isOpen) portExp2.write("n\n");
//         await resetChannel(f2b2, `${uid.slice(0, 8)} Exp2 F→B`);
//         return;
//       }
//     } catch (err) {
//       console.error(`❌ [${uid.slice(0, 8)}] Exp2 error comando:`, err);
//     }
//   });

//   console.log(`✅ Listeners UID inicializados: ${uid.slice(0, 8)}...`);
// }

// // ===============================================================
// // ⚡ ARDUINO -> FIREBASE EXP1
// // ===============================================================
// parserExp1.on("data", async (line) => {
//   const msg = line.toString().trim();
//   if (!msg) return;

//   if (!activeUidExp1) return;

//   try {
//     if (msg.startsWith("V")) {
//       medicionActual1.voltage = parseFloat(msg.slice(1));
//       return;
//     }
//     if (msg.startsWith("I")) {
//       medicionActual1.current = parseFloat(msg.slice(1));
//       return;
//     }

//     if (msg === "EndMov") {
//       const uid = activeUidExp1;
//       const timestamp = Date.now();
//       const measurementId = `meas_${timestamp}`;

//       const sweepIdSnap = await db.ref(`users/${uid}/Exp1/currentSweepId`).once("value");
//       const sweepId = sweepIdSnap.exists() ? sweepIdSnap.val() : null;

//       const measurementData = {
//         angle: anguloObjetivoActual1,
//         voltage: medicionActual1.voltage ?? 0,
//         current: medicionActual1.current ?? 0,
//         sweepId: sweepId,
//         timestamp,
//         isSaved: false,
//       };

//       await db.ref(`users/${uid}/Exp1/measurements/${measurementId}`).set(measurementData);

//       const b2f1 = db.ref(`users/${uid}/Exp1/communication/BackToFront`);
//       await b2f1.set("EndMov");
//       setTimeout(() => resetChannel(b2f1, `${uid.slice(0, 8)} Exp1 B→F`), 800);

//       medicionActual1 = { voltage: null, current: null };
//       return;
//     }

//     if (msg === "ACK") return;
//   } catch (err) {
//     console.error("❌ [Exp1] Error procesando serial:", err);
//   }
// });

// // ===============================================================
// // ⚡ ARDUINO -> FIREBASE EXP2
// // ===============================================================
// parserExp2.on("data", async (line) => {
//   const msg = line.toString().trim();
//   if (!msg) return;

//   if (!activeUidExp2) return;

//   const uid = activeUidExp2;
//   const b2f2 = db.ref(`users/${uid}/Exp2/communication/BackToFront`);

//   try {
//     if (msg.startsWith("V")) {
//       medicionActual2.voltage = parseFloat(msg.slice(1));
//       return;
//     }
//     if (msg.startsWith("I")) {
//       medicionActual2.current = parseFloat(msg.slice(1));
//       return;
//     }

//     if (msg === "PITCH:" || msg === "ROLL:") {
//       if (!sweepActive2) return;
//       await b2f2.set(msg);
//       setTimeout(() => resetChannel(b2f2, `${uid.slice(0, 8)} Exp2 B→F`), 300);
//       return;
//     }

//     if (msg === "EndMov") {
//       if (!sweepActive2 || !currentSweepId2 || !receivedFirstCommand2) {
//         medicionActual2 = { voltage: null, current: null };
//         return;
//       }

//       setTimeout(async () => {
//         const timestamp = Date.now();
//         const measurementId = `meas_${timestamp}`;

//         const measurementData = {
//           pitchAngle: pitchObjetivoActual2,
//           rollAngle: rollObjetivoActual2,
//           voltage: medicionActual2.voltage ?? 0,
//           current: medicionActual2.current ?? 0,
//           sweepId: currentSweepId2,
//           timestamp,
//           isSaved: false,
//         };

//         await db.ref(`users/${uid}/Exp2/measurements/${measurementId}`).set(measurementData);

//         await b2f2.set("EndMov");
//         setTimeout(() => resetChannel(b2f2, `${uid.slice(0, 8)} Exp2 B→F`), 800);

//         medicionActual2 = { voltage: null, current: null };
//       }, 200);

//       return;
//     }

//     if (msg === "ACK") return;
//   } catch (err) {
//     console.error("❌ [Exp2] Error procesando serial:", err);
//   }
// });

// // ===============================================================
// // 🔌 EVENTOS PUERTOS
// // ===============================================================
// portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
// portExp1.on("error", (err) => console.error("❌ Error COM5 (Exp1):", err));

// portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
// portExp2.on("error", (err) => console.error("❌ Error COM6 (Exp2):", err));

// // ===============================================================
// // 🧹 CIERRE
// // ===============================================================
// process.on("SIGINT", async () => {
//   console.log("🧹 Cerrando servidor...");

//   try {
//     if (activeUidExp1) {
//       await resetChannel(db.ref(`users/${activeUidExp1}/Exp1/communication/FrontToBack`), "Exp1 F→B");
//       await resetChannel(db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`), "Exp1 B→F");
//     }
//     if (activeUidExp2) {
//       await resetChannel(db.ref(`users/${activeUidExp2}/Exp2/communication/FrontToBack`), "Exp2 F→B");
//       await resetChannel(db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`), "Exp2 B→F");
//     }
//   } catch (e) {
//     console.error("Error en cierre:", e);
//   }

//   portExp1.close(() => console.log("🔌 COM5 cerrado"));
//   portExp2.close(() => console.log("🔌 COM6 cerrado"));

//   setTimeout(() => process.exit(0), 500);
// });









// modificacion del de github, pero con las rutas nuevas
// import "dotenv/config";
// import admin from "firebase-admin";
// import { createRequire } from "module";
// import { getDatabase } from "firebase-admin/database";
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";

// // ===============================================================
// // 🔧 FIREBASE INIT
// // ===============================================================
// const require = createRequire(import.meta.url);
// const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

// // ID DE USUARIO QUEMADO
// const TARGET_UID = "8qb4yEqxXWcvdIEEXYBgANR57T12";

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// console.log(`✅ Firebase conectado. Usuario: ${TARGET_UID}`);

// const db = getDatabase();

// // ===============================================================
// // 🔌 SERIAL
// // ===============================================================
// // Exp1 -> COM5
// const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
// const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// // Exp2 -> COM6
// const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
// const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// // ===============================================================
// // 📡 FIREBASE REFS (RUTAS ACTUALIZADAS A USERS/UID)
// // ===============================================================
// // Exp1
// const comFrontToBackRef1 = db.ref(`users/${TARGET_UID}/Exp1/communication/FrontToBack`);
// const comBackToFrontRef1 = db.ref(`users/${TARGET_UID}/Exp1/communication/BackToFront`);

// // Exp2
// const comFrontToBackRef2 = db.ref(`users/${TARGET_UID}/Exp2/communication/FrontToBack`);
// const comBackToFrontRef2 = db.ref(`users/${TARGET_UID}/Exp2/communication/BackToFront`);

// // ===============================================================
// // 🧠 ESTADOS TEMP
// // ===============================================================
// // Exp1
// let anguloObjetivoActual1 = 0;
// let medicionActual1 = { voltage: null, current: null };

// // Exp2
// let pitchObjetivoActual2 = 0;
// let rollObjetivoActual2 = 0;
// let medicionActual2 = { voltage: null, current: null };

// // Control sweep Exp2
// let sweepActive2 = false;
// let currentSweepId2 = null;
// let receivedFirstCommand2 = false; 

// // ===============================================================
// // 🔁 RESET CANALES
// // ===============================================================
// const resetChannel = async (ref, label) => {
//   try {
//     await ref.set("x");
//     console.log(`🔁 Canal ${label} reseteado`);
//   } catch (err) {
//     console.error(`❌ Error al resetear canal ${label}:`, err);
//   }
// };

// // limpieza inicial
// (async () => {
//   await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
//   await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
//   await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
//   await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");
// })();

// // ===============================================================
// // 🧠 LISTEN SWEEP STATE (Exp2)
// // ===============================================================
// const currentSweepIdRef2 = db.ref(`users/${TARGET_UID}/Exp2/currentSweepId`);
// currentSweepIdRef2.on("value", (snap) => {
//   const id = snap.val();
//   currentSweepId2 = id || null;

//   if (currentSweepId2) {
//     sweepActive2 = true;
//     receivedFirstCommand2 = false; 
//     console.log(`🚦 [Exp2] Sweep activo: ${currentSweepId2}`);
//   } else {
//     sweepActive2 = false;
//     receivedFirstCommand2 = false;
//     console.log("🛑 [Exp2] Sweep inactivo (currentSweepId null)");
//   }
// });

// const sweepsRef2 = db.ref(`users/${TARGET_UID}/Exp2/sweeps`);
// sweepsRef2.on("child_changed", (snap) => {
//   const sweep = snap.val();
//   const sweepId = snap.key;

//   if (!sweepId || sweepId !== currentSweepId2) return;

//   if (sweep?.status && sweep.status !== "in_progress") {
//     sweepActive2 = false;
//     receivedFirstCommand2 = false;
//     console.log(`🏁 [Exp2] Sweep ${sweepId} terminado con status=${sweep.status}`);
//   }
// });

// // ===============================================================
// // 🧭 FRONT -> ARDUINO EXP1
// // ===============================================================
// comFrontToBackRef1.on("value", async (snapshot) => {
//   const comando = snapshot.val();
//   if (!comando || comando === "x") return;

//   console.log("📥 Comando recibido Exp1:", comando);

//   try {
//     if (comando.startsWith("p")) {
//       anguloObjetivoActual1 = parseInt(comando.slice(1), 10);
//       console.log(`🎯 [Exp1] Mover a ${anguloObjetivoActual1}°`);

//       if (portExp1.isOpen) portExp1.write(comando + "\n");
//       await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
//       return;
//     }

//     if (comando === "n") {
//       console.log("🛑 [Exp1] Deteniendo...");
//       if (portExp1.isOpen) portExp1.write("n\n");
//       await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
//       return;
//     }
//   } catch (err) {
//     console.error("❌ [Exp1] Error procesando comando:", err);
//   }
// });

// // ===============================================================
// // 🧭 FRONT -> ARDUINO EXP2 (p / r)
// // ===============================================================
// comFrontToBackRef2.on("value", async (snapshot) => {
//   const comando = snapshot.val();
//   if (!comando || comando === "x") return;

//   console.log("📥 Comando recibido Exp2:", comando);

//   try {
//     if (comando.startsWith("p")) {
//       pitchObjetivoActual2 = parseInt(comando.slice(1), 10);
//       if (sweepActive2) receivedFirstCommand2 = true;

//       console.log(`🎯 [Exp2] Pitch objetivo = ${pitchObjetivoActual2}°`);
//       if (portExp2.isOpen) portExp2.write(comando + "\n");
//       await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
//       return;
//     }

//     if (comando.startsWith("r")) {
//       rollObjetivoActual2 = parseInt(comando.slice(1), 10);
//       if (sweepActive2) receivedFirstCommand2 = true;

//       console.log(`🎯 [Exp2] Roll objetivo = ${rollObjetivoActual2}°`);
//       if (portExp2.isOpen) portExp2.write(comando + "\n");
//       await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
//       return;
//     }

//     if (comando === "n") {
//       console.log("🛑 [Exp2] Deteniendo...");
//       if (portExp2.isOpen) portExp2.write("n\n");
//       await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
//       return;
//     }
//   } catch (err) {
//     console.error("❌ [Exp2] Error procesando comando:", err);
//   }
// });

// // ===============================================================
// // ⚡ ARDUINO -> FIREBASE EXP1
// // ===============================================================
// parserExp1.on("data", async (line) => {
//   const msg = line.toString().trim();
//   if (!msg) return;

//   console.log("📡 Arduino Exp1:", msg);

//   try {
//     if (msg.startsWith("V")) {
//       medicionActual1.voltage = parseFloat(msg.slice(1));
//       return;
//     }

//     if (msg.startsWith("I")) {
//       medicionActual1.current = parseFloat(msg.slice(1));
//       return;
//     }

//     if (msg === "EndMov") {
//       const timestamp = Date.now();
//       const measurementId = `meas_${timestamp}`;

//       const sweepIdSnap = await db.ref(`users/${TARGET_UID}/Exp1/currentSweepId`).once("value");
//       const sweepId = sweepIdSnap.exists()
//         ? sweepIdSnap.val()
//         : `sweep_${Math.floor(timestamp / 10000) * 10000}`;

//       const measurementData = {
//         angle: anguloObjetivoActual1,
//         voltage: medicionActual1.voltage ?? 0,
//         current: medicionActual1.current ?? 0,
//         sweepId,
//         timestamp,
//         isSaved: false,
//       };

//       await db.ref(`users/${TARGET_UID}/Exp1/measurements/${measurementId}`).set(measurementData);
//       console.log("✅ [Exp1] Medición guardada:", measurementData);

//       await comBackToFrontRef1.set("EndMov");
//       medicionActual1 = { voltage: null, current: null };
//       setTimeout(() => resetChannel(comBackToFrontRef1, "Exp1 BackToFront"), 800);
//       return;
//     }

//     if (msg === "ACK") return;
//   } catch (err) {
//     console.error("❌ [Exp1] Error procesando serial:", err);
//   }
// });

// // ===============================================================
// // ⚡ ARDUINO -> FIREBASE EXP2
// // ===============================================================
// parserExp2.on("data", async (line) => {
//   const msg = line.toString().trim();
//   if (!msg) return;

//   console.log("📡 Arduino Exp2:", msg);

//   try {
//     // --------- Medición ---------
//     if (msg.startsWith("V")) {
//       medicionActual2.voltage = parseFloat(msg.slice(1));
//       return;
//     }

//     if (msg.startsWith("I")) {
//       medicionActual2.current = parseFloat(msg.slice(1));
//       return;
//     }

//     // --------- Prompts (solo si sweep activo) ---------
//     if ((msg === "PITCH:" || msg === "ROLL:")) {
//       if (!sweepActive2) {
//         console.log(`⏭️ [Exp2] Ignorando prompt ${msg} (sin sweep activo)`);
//         return;
//       }

//       await comBackToFrontRef2.set(msg);
//       console.log(`✅ [Exp2] Señal ${msg} enviada al frontend`);
//       setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 300);
//       return;
//     }

//     // --------- Fin movimiento ---------
//     if (msg === "EndMov") {
//       if (!sweepActive2 || !currentSweepId2 || !receivedFirstCommand2) {
//         console.log(
//           `⏭️ [Exp2] EndMov ignorado (sweepActive=${sweepActive2}, ` +
//           `currentSweepId=${currentSweepId2}, firstCmd=${receivedFirstCommand2})`
//         );
//         medicionActual2 = { voltage: null, current: null };
//         return;
//       }

//       // pequeño delay para asegurar V/I
//       setTimeout(async () => {
//         const timestamp = Date.now();
//         const measurementId = `meas_${timestamp}`;

//         const measurementData = {
//           pitchAngle: pitchObjetivoActual2,
//           rollAngle: rollObjetivoActual2,
//           voltage: medicionActual2.voltage ?? 0,
//           current: medicionActual2.current ?? 0,
//           sweepId: currentSweepId2,
//           timestamp,
//           isSaved: false,
//         };

//         await db.ref(`users/${TARGET_UID}/Exp2/measurements/${measurementId}`).set(measurementData);
//         console.log("✅ [Exp2] Medición guardada:", measurementData);

//         await comBackToFrontRef2.set("EndMov");
//         medicionActual2 = { voltage: null, current: null };
//         setTimeout(() => resetChannel(comBackToFrontRef2, "Exp2 BackToFront"), 800);
//       }, 200);

//       return;
//     }

//     if (msg === "ACK") return;
//   } catch (err) {
//     console.error("❌ [Exp2] Error procesando serial:", err);
//   }
// });

// // ===============================================================
// // 🔌 EVENTOS PUERTOS
// // ===============================================================
// portExp1.on("open", () => console.log("✅ Puerto COM5 (Exp1) abierto"));
// portExp1.on("error", (err) => console.error("❌ Error COM5 (Exp1):", err));

// portExp2.on("open", () => console.log("✅ Puerto COM6 (Exp2) abierto"));
// portExp2.on("error", (err) => console.error("❌ Error COM6 (Exp2):", err));

// // ===============================================================
// // 🧹 CIERRE CONTROLADO
// // ===============================================================
// process.on("SIGINT", async () => {
//   console.log("🧹 Cerrando servidor...");

//   await resetChannel(comFrontToBackRef1, "Exp1 FrontToBack");
//   await resetChannel(comBackToFrontRef1, "Exp1 BackToFront");
//   await resetChannel(comFrontToBackRef2, "Exp2 FrontToBack");
//   await resetChannel(comBackToFrontRef2, "Exp2 BackToFront");

//   portExp1.close(() => console.log("🔌 COM5 cerrado"));
//   portExp2.close(() => console.log("🔌 COM6 cerrado"));

//   setTimeout(() => process.exit(0), 500);
// });



// nueva version de G1
// import "dotenv/config";
// import admin from "firebase-admin";
// import { createRequire } from "module";
// import { getDatabase } from "firebase-admin/database";
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";

// // ===============================================================
// // SETUP
// // ===============================================================
// const require = createRequire(import.meta.url);
// const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);
// const TARGET_UID = "8qb4yEqxXWcvdIEEXYBgANR57T12";

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// const db = getDatabase();
// console.log("[SYSTEM] Backend iniciado. Usuario: " + TARGET_UID);

// // ===============================================================
// // ESTADO
// // ===============================================================
// let stateExp1 = {
//   isMoving: false,        
//   targetAngle: 0,
//   voltage: 0,
//   current: 0,
//   lastValidVoltage: 0,
//   lastValidCurrent: 0
// };

// let stateExp2 = {
//   isMoving: false,        
//   currentSweepId: null,
//   pitchTarget: 0,
//   rollTarget: 0,
//   voltage: 0,
//   current: 0,
//   lastValidVoltage: 0,
//   lastValidCurrent: 0,
//   sweepActive: false,
//   receivedFirstCommand: false
// };

// const REF_EXP1 = `users/${TARGET_UID}/Exp1`;
// const REF_EXP2 = `users/${TARGET_UID}/Exp2`;

// // ===============================================================
// // CONFIGURACION SERIAL
// // ===============================================================
// // OJO: Asegúrate que 9600 sea la velocidad real de tu Arduino Sketch
// const portExp1 = new SerialPort({ path: "COM5", baudRate: 9600 });
// const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// const portExp2 = new SerialPort({ path: "COM6", baudRate: 9600 });
// const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// // ===============================================================
// // FUNCIONES AUXILIARES
// // ===============================================================

// // CAMBIO CRÍTICO: Función de escritura mejorada
// function writeToPort(port, command, label) {
//   if (!port.isOpen) {
//     console.log(`[ERROR] ${label} Puerto cerrado. Comando fallido: ${command}`);
//     return;
//   }
  
//   // Agregamos \r\n (Carriage Return + Newline) para asegurar que Arduino entienda el "Enter"
//   const fullCommand = command + "\r\n";
  
//   port.write(fullCommand, (err) => {
//     if (err) {
//       return console.log(`[ERROR] ${label} Fallo al escribir: `, err.message);
//     }
    
//     // Esperamos a que el dato salga del buffer del PC
//     port.drain(() => {
//         console.log(`[TX-DRAIN] ${label} Enviado físicamente: ${command}`);
//     });
//   });
// }

// async function resetFirebaseChannel(ref) {
//   try { await ref.set("x"); } catch (e) {}
// }

// function parseValue(text, typeChar) {
//   try {
//     const regex = new RegExp(`${typeChar}[:\\s]*([0-9]+\\.?[0-9]*)`, 'i');
//     const match = text.match(regex);
//     if (match && match[1]) {
//       const val = parseFloat(match[1]);
//       return isFinite(val) ? val : null;
//     }
//   } catch (e) { return null; }
//   return null;
// }

// // ===============================================================
// // LISTENER FIREBASE -> ARDUINO
// // ===============================================================

// // EXP 1
// db.ref(`${REF_EXP1}/communication/FrontToBack`).on("value", (snap) => {
//   const cmd = snap.val();
//   if (!cmd || cmd === "x") return;

//   console.log(`[RX-FIREBASE] Exp1: ${cmd}`);

//   if (cmd.startsWith("p")) {
//     const angle = parseInt(cmd.slice(1));
//     stateExp1.targetAngle = angle;
//     stateExp1.isMoving = true; 
//     console.log(`[LOGIC] Exp1 -> Arduino: Mover a ${angle}`);
//     writeToPort(portExp1, cmd, "Exp1");
//   } 
//   else if (cmd === "n") {
//     stateExp1.isMoving = false;
//     console.log(`[LOGIC] Exp1 -> Arduino: DETENER`);
//     writeToPort(portExp1, "n", "Exp1");
//   }

//   resetFirebaseChannel(snap.ref);
// });

// // EXP 2
// db.ref(`${REF_EXP2}/currentSweepId`).on("value", (snap) => {
//   const id = snap.val();
//   stateExp2.currentSweepId = id;
//   stateExp2.sweepActive = !!id;
//   if(id) console.log(`[SYSTEM] Exp2 Sweep Activo: ${id}`);
// });

// db.ref(`${REF_EXP2}/communication/FrontToBack`).on("value", (snap) => {
//   const cmd = snap.val();
//   if (!cmd || cmd === "x") return;

//   console.log(`[RX-FIREBASE] Exp2: ${cmd}`);

//   if (cmd.startsWith("p")) {
//     stateExp2.pitchTarget = parseInt(cmd.slice(1));
//     stateExp2.receivedFirstCommand = true;
//     console.log(`[LOGIC] Exp2 -> Arduino: Pitch ${stateExp2.pitchTarget}`);
//     writeToPort(portExp2, cmd, "Exp2");
//   } 
//   else if (cmd.startsWith("r")) {
//     stateExp2.rollTarget = parseInt(cmd.slice(1));
//     stateExp2.receivedFirstCommand = true;
//     console.log(`[LOGIC] Exp2 -> Arduino: Roll ${stateExp2.rollTarget}`);
//     writeToPort(portExp2, cmd, "Exp2");
//   }
//   else if (cmd === "n") {
//     writeToPort(portExp2, "n", "Exp2");
//   }

//   resetFirebaseChannel(snap.ref);
// });

// // ===============================================================
// // LISTENER ARDUINO -> FIREBASE
// // ===============================================================

// // EXP 1
// parserExp1.on("data", (line) => {
//   const msg = line.toString().trim();
//   if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return;

//   // Debug ligero para ver si Arduino responde algo al comando
//   // console.log(`[ARDUINO-1] ${msg}`); 

//   const v = parseValue(msg, "V");
//   if (v !== null) { stateExp1.voltage = v; stateExp1.lastValidVoltage = v; }

//   const i = parseValue(msg, "I");
//   if (i !== null) { stateExp1.current = i; stateExp1.lastValidCurrent = i; }

//   if (msg.includes("EndMov")) {
//     if (!stateExp1.isMoving) {
//         // console.log("[IGNORE] Exp1 EndMov fantasma"); // Comentado para limpiar log
//         return;
//     }

//     console.log("[LOGIC] Exp1 EndMov recibido. Guardando...");
    
//     setTimeout(async () => {
//       const finalV = stateExp1.voltage !== 0 ? stateExp1.voltage : stateExp1.lastValidVoltage;
//       const finalI = stateExp1.current !== 0 ? stateExp1.current : stateExp1.lastValidCurrent;

//       const idSnap = await db.ref(`${REF_EXP1}/currentSweepId`).once("value");
//       const currentId = idSnap.val();

//       if (currentId) {
//         const ts = Date.now();
//         const payload = {
//           angle: stateExp1.targetAngle,
//           voltage: finalV,
//           current: finalI,
//           sweepId: currentId,
//           timestamp: ts,
//           isSaved: false
//         };
//         await db.ref(`${REF_EXP1}/measurements/meas_${ts}`).set(payload);
//         console.log(`[DB] Exp1 Guardado: ${payload.angle}° -> ${payload.voltage}V`);
//       }

//       stateExp1.isMoving = false;
//       await db.ref(`${REF_EXP1}/communication/BackToFront`).set("EndMov");
//       setTimeout(() => resetFirebaseChannel(db.ref(`${REF_EXP1}/communication/BackToFront`)), 500);
//     }, 200);
//   }
// });

// // EXP 2
// parserExp2.on("data", (line) => {
//   const msg = line.toString().trim();
//   if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return;

//   const v = parseValue(msg, "V");
//   if (v !== null) { stateExp2.voltage = v; stateExp2.lastValidVoltage = v; }
  
//   const i = parseValue(msg, "I");
//   if (i !== null) { stateExp2.current = i; stateExp2.lastValidCurrent = i; }

//   if (msg.includes("PITCH:") || msg.includes("ROLL:")) {
//     if (stateExp2.sweepActive || stateExp2.receivedFirstCommand) {
//         const signal = msg.includes("PITCH:") ? "PITCH:" : "ROLL:";
//         console.log(`[SYNC] Exp2 pide ${signal}`);
//         db.ref(`${REF_EXP2}/communication/BackToFront`).set(signal);
//         setTimeout(() => resetFirebaseChannel(db.ref(`${REF_EXP2}/communication/BackToFront`)), 200);
//     }
//   }

//   if (msg.includes("EndMov")) {
//     if (!stateExp2.sweepActive && !stateExp2.receivedFirstCommand) return;

//     setTimeout(async () => {
//         const finalV = stateExp2.voltage !== 0 ? stateExp2.voltage : stateExp2.lastValidVoltage;
//         const finalI = stateExp2.current !== 0 ? stateExp2.current : stateExp2.lastValidCurrent;
        
//         const ts = Date.now();
//         const payload = {
//             pitchAngle: stateExp2.pitchTarget,
//             rollAngle: stateExp2.rollTarget,
//             voltage: finalV,
//             current: finalI,
//             sweepId: stateExp2.currentSweepId,
//             timestamp: ts,
//             isSaved: false
//         };

//         await db.ref(`${REF_EXP2}/measurements/meas_${ts}`).set(payload);
//         console.log(`[DB] Exp2 Guardado. V: ${finalV}`);

//         await db.ref(`${REF_EXP2}/communication/BackToFront`).set("EndMov");
//         setTimeout(() => resetChannel(db.ref(`${REF_EXP2}/communication/BackToFront`)), 500);
//     }, 200);
//   }
// });

// // Eventos
// portExp1.on("open", () => console.log("✅ COM5 (Exp1) ABIERTO"));
// portExp1.on("error", (err) => console.log("❌ Error COM5:", err.message));
// portExp2.on("open", () => console.log("✅ COM6 (Exp2) ABIERTO"));
// portExp2.on("error", (err) => console.log("❌ Error COM6:", err.message));

// process.on("SIGINT", async () => {
//   console.log("\n[SYSTEM] Saliendo...");
//   if(portExp1.isOpen) portExp1.close();
//   if(portExp2.isOpen) portExp2.close();
//   process.exit(0);
// });






// ESTE CODIGO FUE EL DEL VIDEO QUE SI FUNCIONO

// import "dotenv/config";
// import admin from "firebase-admin";
// import { createRequire } from "module";
// import { getDatabase } from "firebase-admin/database";
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";

// // ===============================================================
// // ⚙️ CONFIGURACIÓN DE HARDWARE (¡VERIFICA ESTO!)
// // ===============================================================
// const BAUD_RATE = 9600; // <--- ¡SI TU ARDUINO ESTÁ EN 115200, CAMBIA ESTO!
// const PORT_EXP1 = "COM5";
// const PORT_EXP2 = "COM6";

// const require = createRequire(import.meta.url);
// const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);
// const TARGET_UID = "8qb4yEqxXWcvdIEEXYBgANR57T12";

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// const db = getDatabase();
// console.log(`[SYSTEM] Backend iniciado @ ${BAUD_RATE} baudios.`);

// // ===============================================================
// // 📡 REFERENCIAS FIREBASE (Definidas Globalmente para evitar errores)
// // ===============================================================
// const REF_EXP1 = `users/${TARGET_UID}/Exp1`;
// const REF_EXP2 = `users/${TARGET_UID}/Exp2`;

// const fb_Exp1_Cmd = db.ref(`${REF_EXP1}/communication/FrontToBack`);
// const fb_Exp1_Ack = db.ref(`${REF_EXP1}/communication/BackToFront`);
// const fb_Exp1_Sweep = db.ref(`${REF_EXP1}/currentSweepId`);

// const fb_Exp2_Cmd = db.ref(`${REF_EXP2}/communication/FrontToBack`);
// const fb_Exp2_Ack = db.ref(`${REF_EXP2}/communication/BackToFront`);
// const fb_Exp2_Sweep = db.ref(`${REF_EXP2}/currentSweepId`);

// // ===============================================================
// // 🔌 CONFIGURACIÓN SERIAL
// // ===============================================================
// const portExp1 = new SerialPort({ path: PORT_EXP1, baudRate: BAUD_RATE });
// const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

// const portExp2 = new SerialPort({ path: PORT_EXP2, baudRate: BAUD_RATE });
// const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// // ===============================================================
// // 🧠 ESTADO
// // ===============================================================
// let stateExp1 = { isMoving: false, targetAngle: 0, voltage: 0, current: 0, lastV: 0, lastI: 0 };
// let stateExp2 = { isMoving: false, currentSweepId: null, sweepActive: false, pitchTarget: 0, rollTarget: 0, voltage: 0, current: 0, lastV: 0, lastI: 0, firstCmd: false };

// // ===============================================================
// // 🛠️ FUNCIONES
// // ===============================================================

// // Función de Escritura Segura
// function writeToPort(port, command, label) {
//   if (!port.isOpen) return console.log(`[ERROR] ${label} cerrado.`);
  
//   // IMPORTANTE: Probamos solo con \n para máxima compatibilidad
//   const payload = command + "\n"; 
  
//   port.write(payload, (err) => {
//     if (err) return console.log(`[ERROR-TX] ${label}:`, err.message);
//     port.drain(() => console.log(`[TX] ${label} -> "${command}" enviado.`));
//   });
// }

// // Reset Firebase
// async function resetChannel(ref) {
//   try { await ref.set("x"); } catch(e) {}
// }

// // Parser Numérico (Anti-Basura)
// function parseValue(text, typeChar) {
//   try {
//     const regex = new RegExp(`${typeChar}[:\\s]*([0-9]+\\.?[0-9]*)`, 'i');
//     const match = text.match(regex);
//     return (match && match[1]) ? parseFloat(match[1]) : null;
//   } catch (e) { return null; }
// }

// // ===============================================================
// // 📡 LISTENERS: EXP 1
// // ===============================================================

// fb_Exp1_Cmd.on("value", (snap) => {
//   const cmd = snap.val();
//   if (!cmd || cmd === "x") return;

//   console.log(`[RX-WEB] Exp1: ${cmd}`);

//   if (cmd.startsWith("p")) {
//     stateExp1.targetAngle = parseInt(cmd.slice(1));
//     stateExp1.isMoving = true;
//     writeToPort(portExp1, cmd, "Exp1");
//   } else if (cmd === "n") {
//     stateExp1.isMoving = false;
//     writeToPort(portExp1, "n", "Exp1");
//   }
  
//   resetChannel(snap.ref);
// });

// parserExp1.on("data", (line) => {
//   const msg = line.toString().trim();
//   if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return; // Ignorar basura

//   // Descomenta esto si quieres ver TODO lo que dice el Arduino
//   // console.log(`[ARDUINO-1] ${msg}`); 

//   const v = parseValue(msg, "V");
//   if (v !== null) { stateExp1.voltage = v; stateExp1.lastV = v; }

//   const i = parseValue(msg, "I");
//   if (i !== null) { stateExp1.current = i; stateExp1.lastI = i; }

//   if (msg.includes("EndMov")) {
//     if (!stateExp1.isMoving) return; // Ignorar ecos viejos

//     console.log(`[ARDUINO-1] Fin movimiento detectado.`);
    
//     // Delay de estabilización (200ms)
//     setTimeout(async () => {
//       const finalV = stateExp1.voltage || stateExp1.lastV;
//       const finalI = stateExp1.current || stateExp1.lastI;

//       const snapId = await fb_Exp1_Sweep.once("value");
//       const sweepId = snapId.val();

//       if (sweepId) {
//         const ts = Date.now();
//         const data = {
//           angle: stateExp1.targetAngle,
//           voltage: finalV,
//           current: finalI,
//           sweepId: sweepId,
//           timestamp: ts,
//           isSaved: false
//         };
//         await db.ref(`${REF_EXP1}/measurements/meas_${ts}`).set(data);
//         console.log(`[DB] Guardado Exp1: ${finalV}V @ ${stateExp1.targetAngle}°`);
//       } else {
//         console.log(`[WARN] Exp1 terminó pero no hay Sweep ID.`);
//       }

//       stateExp1.isMoving = false;
//       await fb_Exp1_Ack.set("EndMov");
//       setTimeout(() => resetChannel(fb_Exp1_Ack), 500);
//     }, 200);
//   }
// });

// // ===============================================================
// // 📡 LISTENERS: EXP 2
// // ===============================================================

// fb_Exp2_Sweep.on("value", (snap) => {
//   const id = snap.val();
//   stateExp2.currentSweepId = id;
//   stateExp2.sweepActive = !!id;
//   if(id) {
//       console.log(`[SYSTEM] Exp2 Sweep Activo: ${id}`);
//       stateExp2.firstCmd = false; // Reset al cambiar de sweep
//   }
// });

// fb_Exp2_Cmd.on("value", (snap) => {
//   const cmd = snap.val();
//   if (!cmd || cmd === "x") return;

//   console.log(`[RX-WEB] Exp2: ${cmd}`);

//   if (cmd.startsWith("p")) {
//     stateExp2.pitchTarget = parseInt(cmd.slice(1));
//     stateExp2.firstCmd = true;
//     writeToPort(portExp2, cmd, "Exp2");
//   } else if (cmd.startsWith("r")) {
//     stateExp2.rollTarget = parseInt(cmd.slice(1));
//     stateExp2.firstCmd = true;
//     writeToPort(portExp2, cmd, "Exp2");
//   } else if (cmd === "n") {
//     writeToPort(portExp2, "n", "Exp2");
//   }
  
//   resetChannel(snap.ref);
// });

// parserExp2.on("data", (line) => {
//   const msg = line.toString().trim();
//   if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return;

//   const v = parseValue(msg, "V");
//   if (v !== null) { stateExp2.voltage = v; stateExp2.lastV = v; }

//   const i = parseValue(msg, "I");
//   if (i !== null) { stateExp2.current = i; stateExp2.lastI = i; }

//   // Sincronización
//   if (msg.includes("PITCH:") || msg.includes("ROLL:")) {
//     if (stateExp2.sweepActive || stateExp2.firstCmd) {
//         const signal = msg.includes("PITCH:") ? "PITCH:" : "ROLL:";
//         console.log(`[SYNC] Exp2 pide ${signal}`);
//         fb_Exp2_Ack.set(signal);
//         setTimeout(() => resetChannel(fb_Exp2_Ack), 200);
//     }
//   }

//   // Fin Movimiento
//   if (msg.includes("EndMov")) {
//     if (!stateExp2.sweepActive && !stateExp2.firstCmd) return;

//     console.log(`[ARDUINO-2] Fin movimiento.`);

//     setTimeout(async () => {
//       const finalV = stateExp2.voltage || stateExp2.lastV;
//       const finalI = stateExp2.current || stateExp2.lastI;
      
//       const ts = Date.now();
//       const data = {
//         pitchAngle: stateExp2.pitchTarget,
//         rollAngle: stateExp2.rollTarget,
//         voltage: finalV,
//         current: finalI,
//         sweepId: stateExp2.currentSweepId,
//         timestamp: ts,
//         isSaved: false
//       };

//       await db.ref(`${REF_EXP2}/measurements/meas_${ts}`).set(data);
//       console.log(`[DB] Guardado Exp2: ${finalV}V`);

//       await fb_Exp2_Ack.set("EndMov");
//       setTimeout(() => resetChannel(fb_Exp2_Ack), 500);
//     }, 200);
//   }
// });

// // ===============================================================
// // 🔌 GESTIÓN PUERTOS
// // ===============================================================
// portExp1.on("open", () => console.log(`✅ COM5 Abierto`));
// portExp1.on("error", (err) => console.log(`❌ Error COM5: ${err.message}`));

// portExp2.on("open", () => console.log(`✅ COM6 Abierto`));
// portExp2.on("error", (err) => console.log(`❌ Error COM6: ${err.message}`));

// process.on("SIGINT", async () => {
//   console.log("\n[SYSTEM] Cerrando...");
//   // Aquí usamos las variables globales definidas al inicio, así que NO fallará
//   await resetChannel(fb_Exp1_Cmd);
//   await resetChannel(fb_Exp1_Ack);
//   await resetChannel(fb_Exp2_Cmd);
//   await resetChannel(fb_Exp2_Ack);
  
//   if(portExp1.isOpen) portExp1.close();
//   if(portExp2.isOpen) portExp2.close();
//   process.exit(0);
// });




import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

// ===============================================================
// ⚙️ CONFIGURACIÓN AGRESIVA
// ===============================================================
const BAUD_RATE = 9600; 
const PORT_EXP1 = "COM5";
const PORT_EXP2 = "COM6";
const STARTUP_DELAY = 15000; 
const MIN_MOVE_TIME = 2000;

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);
const TARGET_UID = "8qb4yEqxXWcvdIEEXYBgANR57T12";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();
console.log(`[SYSTEM] Backend (Modo Agresivo) iniciado @ ${BAUD_RATE}`);

// ===============================================================
// 🧠 ESTADO
// ===============================================================
let hardwareExp1Ready = false; 
let hardwareExp2Ready = false;
let cmdStartTime1 = 0;
let cmdStartTime2 = 0;

let stateExp1 = { isMoving: false, targetAngle: 0, voltage: 0, current: 0, lastV: 0, lastI: 0 };
let stateExp2 = { isMoving: false, currentSweepId: null, sweepActive: false, pitchTarget: 0, rollTarget: 0, voltage: 0, current: 0, lastV: 0, lastI: 0, firstCmd: false };

const REF_EXP1 = `users/${TARGET_UID}/Exp1`;
const REF_EXP2 = `users/${TARGET_UID}/Exp2`;

const fb_Exp1_Cmd = db.ref(`${REF_EXP1}/communication/FrontToBack`);
const fb_Exp1_Ack = db.ref(`${REF_EXP1}/communication/BackToFront`);
const fb_Exp1_Sweep = db.ref(`${REF_EXP1}/currentSweepId`);

const fb_Exp2_Cmd = db.ref(`${REF_EXP2}/communication/FrontToBack`);
const fb_Exp2_Ack = db.ref(`${REF_EXP2}/communication/BackToFront`);
const fb_Exp2_Sweep = db.ref(`${REF_EXP2}/currentSweepId`);

// ===============================================================
// 🔌 SERIAL
// ===============================================================
const portExp1 = new SerialPort({ path: PORT_EXP1, baudRate: BAUD_RATE, autoOpen: false });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

const portExp2 = new SerialPort({ path: PORT_EXP2, baudRate: BAUD_RATE, autoOpen: false });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 🛠️ FUNCIONES MEJORADAS
// ===============================================================

function abrirPuertoSeguro(port, label, onReadyCallback) {
    port.open((err) => {
        if (err) return console.log(`[ERROR] No se pudo abrir ${label}: ${err.message}`);
        
        console.log(`✅ ${label} Abierto. CALIBRANDO (${STARTUP_DELAY/1000}s)...`);
        
        setTimeout(() => {
            port.flush((err) => {
                console.log(`🟢 ${label} LISTO. Ignorando 'n' iniciales.`);
                onReadyCallback(true);
            });
        }, STARTUP_DELAY);
    });
}

// NUEVA FUNCIÓN: Envío con insistencia
function writeToPortAggressive(port, command, label, isReady) {
  if (!port.isOpen || !isReady) {
    return console.log(`[BLOQUEADO] ${label} no listo para ${command}`);
  }

  // TRUCO 1: Ignorar comando 'n' para evitar bloqueo del Arduino
  if (command === "n") {
      console.log(`[FILTRO] Comando 'n' (STOP) interceptado y bloqueado para evitar fallos.`);
      return; 
  }
  
  const payload = command + "\n"; 
  
  // TRUCO 2: Doble disparo (Double Tap)
  // Enviamos una vez...
  port.write(payload, (err) => {
    if (err) return console.log(`[ERROR-TX] ${label}:`, err.message);
    port.drain(() => console.log(`[TX-1] ${label} -> "${command}" enviado.`));
    
    // ...y enviamos de nuevo 150ms después por si acaso
    setTimeout(() => {
        port.write(payload, (err) => {
            port.drain(() => console.log(`[TX-2] ${label} -> "${command}" RE-enviado (Seguridad).`));
        });
    }, 150);
  });
}

async function resetChannel(ref) {
  try { await ref.set("x"); } catch(e) {}
}

function parseValue(text, typeChar) {
  try {
    const regex = new RegExp(`${typeChar}[:\\s]*([0-9]+\\.?[0-9]*)`, 'i');
    const match = text.match(regex);
    return (match && match[1]) ? parseFloat(match[1]) : null;
  } catch (e) { return null; }
}

async function limpiarComandosViejos() {
    console.log("🧹 Limpiando Firebase...");
    await resetChannel(fb_Exp1_Cmd);
    await resetChannel(fb_Exp2_Cmd);
}

// ===============================================================
// 📡 EXP 1
// ===============================================================

fb_Exp1_Cmd.on("value", (snap) => {
  const cmd = snap.val();
  if (!cmd || cmd === "x") return;

  if (!hardwareExp1Ready) {
      // Solo limpiamos si es 'n', si es 'p' quizas queramos guardarlo? No, mejor limpiar todo.
      console.log(`[ESPERA] Exp1 ignorando "${cmd}" durante calibración.`);
      return; 
  }

  console.log(`[RX-WEB] Exp1: ${cmd}`);

  if (cmd.startsWith("p")) {
    stateExp1.targetAngle = parseInt(cmd.slice(1));
    stateExp1.isMoving = true;
    cmdStartTime1 = Date.now();
    writeToPortAggressive(portExp1, cmd, "Exp1", hardwareExp1Ready);
  } else if (cmd === "n") {
    // Intentamos detener lógica interna, pero NO enviamos al puerto
    stateExp1.isMoving = false;
    writeToPortAggressive(portExp1, "n", "Exp1", hardwareExp1Ready);
  }
  
  resetChannel(snap.ref);
});

parserExp1.on("data", (line) => {
  const msg = line.toString().trim();
  if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return;

  const v = parseValue(msg, "V");
  if (v !== null) { stateExp1.voltage = v; if(v > 0) stateExp1.lastV = v; }

  const i = parseValue(msg, "I");
  if (i !== null) { stateExp1.current = i; if(i > 0) stateExp1.lastI = i; }

  if (msg.includes("EndMov")) {
    if (!stateExp1.isMoving) return; 

    const elapsed = Date.now() - cmdStartTime1;
    if (elapsed < MIN_MOVE_TIME) {
        console.log(`[IGNORAR] Exp1 EndMov prematuro (${elapsed}ms).`);
        return; 
    }

    console.log(`[ARDUINO-1] Movimiento OK (${elapsed}ms).`);
    
    setTimeout(async () => {
      // Prioridad a V>0, si no LastValid, si no 0 (pero 0.51V nocturno es aceptable)
      const finalV = stateExp1.voltage > 0 ? stateExp1.voltage : stateExp1.lastV;
      const finalI = stateExp1.current > 0 ? stateExp1.current : stateExp1.lastI;

      const snapId = await fb_Exp1_Sweep.once("value");
      const sweepId = snapId.val();

      if (sweepId) {
        const ts = Date.now();
        const data = {
          angle: stateExp1.targetAngle,
          voltage: finalV,
          current: finalI,
          sweepId: sweepId,
          timestamp: ts,
          isSaved: false
        };
        await db.ref(`${REF_EXP1}/measurements/meas_${ts}`).set(data);
        console.log(`[DB] Exp1 Guardado: ${finalV}V`);
      }

      stateExp1.isMoving = false;
      await fb_Exp1_Ack.set("EndMov");
      setTimeout(() => resetChannel(fb_Exp1_Ack), 500);
    }, 500);
  }
});

// ===============================================================
// 📡 EXP 2
// ===============================================================

fb_Exp2_Sweep.on("value", (snap) => {
  const id = snap.val();
  stateExp2.currentSweepId = id;
  stateExp2.sweepActive = !!id;
  if(id) {
      console.log(`[SYSTEM] Exp2 Sweep Activo: ${id}`);
      stateExp2.firstCmd = false;
  }
});

fb_Exp2_Cmd.on("value", (snap) => {
  const cmd = snap.val();
  if (!cmd || cmd === "x") return;

  if (!hardwareExp2Ready) return; 

  console.log(`[RX-WEB] Exp2: ${cmd}`);

  if (cmd.startsWith("p")) {
    stateExp2.pitchTarget = parseInt(cmd.slice(1));
    stateExp2.firstCmd = true;
    stateExp2.isMoving = true;
    cmdStartTime2 = Date.now();
    writeToPortAggressive(portExp2, cmd, "Exp2", hardwareExp2Ready);
  } else if (cmd.startsWith("r")) {
    stateExp2.rollTarget = parseInt(cmd.slice(1));
    stateExp2.firstCmd = true;
    stateExp2.isMoving = true;
    cmdStartTime2 = Date.now();
    writeToPortAggressive(portExp2, cmd, "Exp2", hardwareExp2Ready);
  } else if (cmd === "n") {
    writeToPortAggressive(portExp2, "n", "Exp2", hardwareExp2Ready);
  }
  
  resetChannel(snap.ref);
});

parserExp2.on("data", (line) => {
  const msg = line.toString().trim();
  if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return;

  const v = parseValue(msg, "V");
  if (v !== null) { stateExp2.voltage = v; if(v > 0) stateExp2.lastV = v; }
  
  const i = parseValue(msg, "I");
  if (i !== null) { stateExp2.current = i; if(i > 0) stateExp2.lastI = i; }

  if (msg.includes("PITCH:") || msg.includes("ROLL:")) {
    if (stateExp2.sweepActive || stateExp2.firstCmd) {
        const signal = msg.includes("PITCH:") ? "PITCH:" : "ROLL:";
        fb_Exp2_Ack.set(signal);
        setTimeout(() => resetChannel(fb_Exp2_Ack), 200);
    }
  }

  if (msg.includes("EndMov")) {
    const elapsed = Date.now() - cmdStartTime2;
    if ((!stateExp2.sweepActive && !stateExp2.firstCmd) || !stateExp2.isMoving) return;
    
    if (elapsed < MIN_MOVE_TIME) {
        console.log(`[IGNORAR] Exp2 EndMov prematuro (${elapsed}ms).`);
        return;
    }

    console.log(`[ARDUINO-2] Movimiento OK (${elapsed}ms).`);

    setTimeout(async () => {
      const finalV = stateExp2.voltage > 0 ? stateExp2.voltage : stateExp2.lastV;
      const finalI = stateExp2.current > 0 ? stateExp2.current : stateExp2.lastI;
      
      const ts = Date.now();
      const data = {
        pitchAngle: stateExp2.pitchTarget,
        rollAngle: stateExp2.rollTarget,
        voltage: finalV,
        current: finalI,
        sweepId: stateExp2.currentSweepId,
        timestamp: ts,
        isSaved: false
      };

      await db.ref(`${REF_EXP2}/measurements/meas_${ts}`).set(data);
      console.log(`[DB] Guardado Exp2: ${finalV}V`);

      await fb_Exp2_Ack.set("EndMov");
      setTimeout(() => resetChannel(fb_Exp2_Ack), 500);
    }, 500);
  }
});

// ===============================================================
// INICIO
// ===============================================================

limpiarComandosViejos().then(() => {
    abrirPuertoSeguro(portExp1, "Exp1 (COM5)", (ready) => { hardwareExp1Ready = ready; });
    abrirPuertoSeguro(portExp2, "Exp2 (COM6)", (ready) => { hardwareExp2Ready = ready; });
});

process.on("SIGINT", async () => {
  console.log("\n[SYSTEM] Cerrando...");
  await limpiarComandosViejos();
  if(portExp1.isOpen) portExp1.close();
  if(portExp2.isOpen) portExp2.close();
  process.exit(0);
});