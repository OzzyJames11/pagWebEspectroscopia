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






























//Nuevas correcciones 

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

