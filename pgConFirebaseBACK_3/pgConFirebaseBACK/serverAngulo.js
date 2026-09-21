// VERSION 3.0
// Se implementó los usuarios (S1 y S2), se manejan independientemente. 
// Toma el UID de la sesión, ya no está el valor quemado

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();
console.log(`[SYSTEM] Backend Multi-Usuario iniciado @ ${BAUD_RATE}`);

// ===============================================================
// 🧠 ESTADO
// ===============================================================
let hardwareExp1Ready = false; 
let hardwareExp2Ready = false;
let cmdStartTime1 = 0;
let cmdStartTime2 = 0;

// Variables para saber QUÉ usuario está usando CADA máquina
let activeUidExp1 = null; 
let activeUidExp2 = null; 

let stateExp1 = { isMoving: false, targetAngle: 0, voltage: 0, current: 0, lastV: 0, lastI: 0 };
let stateExp2 = { isMoving: false, currentSweepId: null, sweepActive: false, pitchTarget: 0, rollTarget: 0, voltage: 0, current: 0, lastV: 0, lastI: 0, firstCmd: false };

// ===============================================================
// 🔌 SERIAL
// ===============================================================
const portExp1 = new SerialPort({ path: PORT_EXP1, baudRate: BAUD_RATE, autoOpen: false });
const parserExp1 = portExp1.pipe(new ReadlineParser({ delimiter: "\n" }));

const portExp2 = new SerialPort({ path: PORT_EXP2, baudRate: BAUD_RATE, autoOpen: false });
const parserExp2 = portExp2.pipe(new ReadlineParser({ delimiter: "\n" }));

// ===============================================================
// 🛠️ FUNCIONES AUXILIARES
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

function writeToPortAggressive(port, command, label, isReady) {
  if (!port.isOpen || !isReady) {
    return console.log(`[BLOQUEADO] ${label} no listo para ${command}`);
  }

  // TRUCO 1: Ignorar comando 'n' para evitar bloqueo del Arduino
  if (command === "n") {
      console.log(`[FILTRO] Comando 'n' (STOP) interceptado.`);
      return; 
  }
  
  const payload = command + "\n"; 
  
  // TRUCO 2: Doble disparo (Double Tap)
  port.write(payload, (err) => {
    if (err) return console.log(`[ERROR-TX] ${label}:`, err.message);
    port.drain(() => console.log(`[TX-1] ${label} -> "${command}" enviado.`));
    
    setTimeout(() => {
        port.write(payload, (err) => {
            port.drain(() => console.log(`[TX-2] ${label} -> "${command}" RE-enviado.`));
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
    console.log("🧹 (Multi-User) Limpieza omitida para seguridad.");
}

// ===============================================================
// 📡 SUPER LISTENER (DETECTA USUARIOS DINÁMICAMENTE)
// ===============================================================
db.ref('users').on('child_changed', (snapshot) => {
  const uid = snapshot.key; 
  const userData = snapshot.val();

  // --- DETECTOR EXP 1 ---
  const cmd1 = userData?.Exp1?.communication?.FrontToBack;
  
  if (cmd1 && cmd1 !== 'x') {
      console.log(`[RX-WEB] Usuario ${uid.slice(0,5)}... a Exp1: ${cmd1}`);
      activeUidExp1 = uid; // Guardamos dueño Exp1

      if (!hardwareExp1Ready) {
          console.log(`[ESPERA] Exp1 ocupado calibrando.`);
      } else {
          if (cmd1.startsWith("p")) {
              stateExp1.targetAngle = parseInt(cmd1.slice(1));
              stateExp1.isMoving = true;
              cmdStartTime1 = Date.now();
              writeToPortAggressive(portExp1, cmd1, "Exp1", hardwareExp1Ready);
          } else if (cmd1 === "n") {
              stateExp1.isMoving = false;
              writeToPortAggressive(portExp1, "n", "Exp1", hardwareExp1Ready);
          }
      }
      resetChannel(db.ref(`users/${uid}/Exp1/communication/FrontToBack`));
  }

  // --- DETECTOR EXP 2 ---
  const cmd2 = userData?.Exp2?.communication?.FrontToBack;
  
  if (cmd2 && cmd2 !== 'x') {
      console.log(`[RX-WEB] Usuario ${uid.slice(0,5)}... a Exp2: ${cmd2}`);
      activeUidExp2 = uid; // Guardamos dueño Exp2

      if (!hardwareExp2Ready) {
           console.log(`[ESPERA] Exp2 ocupado calibrando.`);
      } else {
          if (cmd2.startsWith("p")) {
              stateExp2.pitchTarget = parseInt(cmd2.slice(1));
              stateExp2.firstCmd = true;
              stateExp2.isMoving = true;
              cmdStartTime2 = Date.now();
              writeToPortAggressive(portExp2, cmd2, "Exp2", hardwareExp2Ready);
          } else if (cmd2.startsWith("r")) {
              stateExp2.rollTarget = parseInt(cmd2.slice(1));
              stateExp2.firstCmd = true;
              stateExp2.isMoving = true;
              cmdStartTime2 = Date.now();
              writeToPortAggressive(portExp2, cmd2, "Exp2", hardwareExp2Ready);
          } else if (cmd2 === "n") {
              writeToPortAggressive(portExp2, "n", "Exp2", hardwareExp2Ready);
          }
      }
      resetChannel(db.ref(`users/${uid}/Exp2/communication/FrontToBack`));
  }
});

// ===============================================================
// 📡 SERIAL EXP 1 (RETORNO ARDUINO)
// ===============================================================
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
      const finalV = stateExp1.voltage > 0 ? stateExp1.voltage : stateExp1.lastV;
      const finalI = stateExp1.current > 0 ? stateExp1.current : stateExp1.lastI;

      if (activeUidExp1) {
          // Buscamos sweepId del usuario activo
          const snapId = await db.ref(`users/${activeUidExp1}/Exp1/currentSweepId`).once("value");
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
            // Guardamos en la ruta del usuario activo
            await db.ref(`users/${activeUidExp1}/Exp1/measurements/meas_${ts}`).set(data);
            console.log(`[DB] Guardado Exp1 para ${activeUidExp1.slice(0,5)}: ${finalV}V`);
          }

          stateExp1.isMoving = false;
          await db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`).set("EndMov");
          setTimeout(() => resetChannel(db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`)), 500);
      } else {
          console.log("[ERROR] Exp1 terminó pero no hay usuario activo.");
      }
    }, 500);
  }
});

// ===============================================================
// 📡 SERIAL EXP 2 (RETORNO ARDUINO)
// ===============================================================
parserExp2.on("data", (line) => {
  const msg = line.toString().trim();
  if (!msg || /[\x00-\x1F\x7F-\x9F]/.test(msg)) return;

  const v = parseValue(msg, "V");
  if (v !== null) { stateExp2.voltage = v; if(v > 0) stateExp2.lastV = v; }
  
  const i = parseValue(msg, "I");
  if (i !== null) { stateExp2.current = i; if(i > 0) stateExp2.lastI = i; }

  // Handshake
  if (msg.includes("PITCH:") || msg.includes("ROLL:")) {
    if ((stateExp2.sweepActive || stateExp2.firstCmd) && activeUidExp2) {
        const signal = msg.includes("PITCH:") ? "PITCH:" : "ROLL:";
        db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set(signal);
        setTimeout(() => resetChannel(db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`)), 200);
    }
  }

  // Fin Movimiento
  if (msg.includes("EndMov")) {
    const elapsed = Date.now() - cmdStartTime2;
    if (!stateExp2.isMoving) return;
    
    if (elapsed < MIN_MOVE_TIME) {
        console.log(`[IGNORAR] Exp2 EndMov prematuro (${elapsed}ms).`);
        return;
    }

    console.log(`[ARDUINO-2] Movimiento OK (${elapsed}ms).`);

    setTimeout(async () => {
      const finalV = stateExp2.voltage > 0 ? stateExp2.voltage : stateExp2.lastV;
      const finalI = stateExp2.current > 0 ? stateExp2.current : stateExp2.lastI;
      
      if (activeUidExp2) {
          const snapId = await db.ref(`users/${activeUidExp2}/Exp2/currentSweepId`).once("value");
          const sweepId = snapId.val();

          if (sweepId) {
             const ts = Date.now();
             const data = {
                pitchAngle: stateExp2.pitchTarget,
                rollAngle: stateExp2.rollTarget,
                voltage: finalV,
                current: finalI,
                sweepId: sweepId,
                timestamp: ts,
                isSaved: false
             };
             // Guardamos en la ruta del usuario activo (CORREGIDO: Exp2)
             await db.ref(`users/${activeUidExp2}/Exp2/measurements/meas_${ts}`).set(data);
             console.log(`[DB] Guardado Exp2 para ${activeUidExp2.slice(0,5)}: ${finalV}V`);
          }

          stateExp2.isMoving = false;
          await db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("EndMov");
          setTimeout(() => resetChannel(db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`)), 500);
      } else {
          console.log("[ERROR] Exp2 terminó pero no hay usuario activo.");
      }
    }, 500);
  }
});

// ===============================================================
// INICIO
// ===============================================================

abrirPuertoSeguro(portExp1, "Exp1 (COM5)", (ready) => { hardwareExp1Ready = ready; });
abrirPuertoSeguro(portExp2, "Exp2 (COM6)", (ready) => { hardwareExp2Ready = ready; });

process.on("SIGINT", async () => {
  console.log("\n[SYSTEM] Cerrando...");
  if(portExp1.isOpen) portExp1.close();
  if(portExp2.isOpen) portExp2.close();
  process.exit(0);
});


