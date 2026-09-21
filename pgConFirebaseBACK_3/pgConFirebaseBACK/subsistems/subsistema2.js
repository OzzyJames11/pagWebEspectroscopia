import { enviarComandoAArduino, arduinoEvents } from '../index.js';

// ==================== CONSTANTES MODIFICABLES ====================
const AREA_EXP2 = 1;
const VOC_EXP2 = 20;
const ISC_EXP2 = 7;
// =================================================================

let stateExp2 = {
  isMoving: false,
  targetPitch: 0,
  targetRoll: 0,
  pendingRoll: null,
  waitingForRollPrompt: false,
  voltage: 0,
  current: 0,
  lastV: 0,
  lastI: 0,
};

let activeUidExp2 = null;
let arranqueSilenciado = false;

// Guardamos listeners para no duplicarlos
const userListenersExp2 = new Map();

function parseCombinedCommand(comando) {
  const match = comando.match(/^p(-?\d+)\|r(-?\d+)$/i);
  if (!match) return null;

  return {
    pitch: parseInt(match[1], 10),
    roll: parseInt(match[2], 10),
  };
}

async function procesarComandoExp2(db, uid, comando) {
  if (!comando || comando === 'x') return;

  console.log(`[Firebase -> Arduino 2] Usuario ${uid.slice(0, 5)} mandó: ${comando}`);
  activeUidExp2 = uid;

  try {
    const parsed = parseCombinedCommand(comando);

    if (parsed) {
      stateExp2.targetPitch = parsed.pitch;
      stateExp2.targetRoll = parsed.roll;
      stateExp2.pendingRoll = parsed.roll;
      stateExp2.waitingForRollPrompt = true;
      stateExp2.isMoving = true;

      await db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");

      // Primero enviamos pitch
      enviarComandoAArduino('2', `p${parsed.pitch}`);
    }
    else if (comando === 'y' || comando === 'n') {
      stateExp2.isMoving = false;
      stateExp2.pendingRoll = null;
      stateExp2.waitingForRollPrompt = false;

      await db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");
      enviarComandoAArduino('2', comando);
    }
    else if (/^p-?\d+$/i.test(comando) || /^r-?\d+$/i.test(comando) || comando === 's') {
      enviarComandoAArduino('2', comando);
    }
    else {
      console.warn(`[Subsistema2] Comando no reconocido: ${comando}`);
    }
  } catch (error) {
    console.error("[Subsistema2] Error procesando comando:", error);
  } finally {
    await db.ref(`users/${uid}/Exp2/communication/FrontToBack`).set('x');
  }
}

export function iniciarSubsistema2(db) {
  console.log("🟢 Subsistema 2 (COM6) escuchando a Firebase...");

  // =========================================================
  // 1. ESCUCHAR USUARIOS Y CONECTAR LISTENER SOLO A FrontToBack
  // =========================================================
  db.ref('users').on('child_added', (snapshot) => {
    const uid = snapshot.key;
    if (!uid) return;

    // Si ya tiene listener, no lo volvemos a crear
    if (userListenersExp2.has(uid)) return;

    const frontRef = db.ref(`users/${uid}/Exp2/communication/FrontToBack`);

    const callback = async (snap) => {
      const comando = snap.val();
      await procesarComandoExp2(db, uid, comando);
    };

    frontRef.on('value', callback);
    userListenersExp2.set(uid, { ref: frontRef, callback });

    // console.log(`[Subsistema2] Listener directo conectado para usuario ${uid.slice(0, 5)}`);
  });

  // =========================================================
  // 2. ESCUCHAR AL ARDUINO (Serial -> Firebase)
  // =========================================================
  arduinoEvents.on('datos_2', async (mensaje) => {
    try {
      const matchV = mensaje.match(/V[:\s]*([+-]?\d+(?:\.\d+)?)/i);
      if (matchV) {
        stateExp2.voltage = parseFloat(matchV[1]);
        if (stateExp2.voltage > 0) stateExp2.lastV = stateExp2.voltage;
      }

      const matchI = mensaje.match(/I[:\s]*([+-]?\d+(?:\.\d+)?)/i);
      if (matchI) {
        stateExp2.current = parseFloat(matchI[1]);
        stateExp2.lastI = stateExp2.current;
      }

      if (mensaje.includes("Sistema iniciado...") && !arranqueSilenciado) {
        console.log("[Arduino 2] Setup físico terminado. Enviando 'n' para dejarlo en reposo...");
        enviarComandoAArduino('2', 'n');
        arranqueSilenciado = true;
        return;
      }

      if (mensaje.includes("ROLL:") && stateExp2.waitingForRollPrompt && stateExp2.pendingRoll !== null) {
        console.log(`[Arduino 2] Solicita roll. Enviando r${stateExp2.pendingRoll}`);
        enviarComandoAArduino('2', `r${stateExp2.pendingRoll}`);
        stateExp2.waitingForRollPrompt = false;
        return;
      }

      if (mensaje.includes("EndMov")) {
        if (!arranqueSilenciado) return;

        if (stateExp2.isMoving && activeUidExp2) {
          console.log(
            `[Arduino 2] Punto alcanzado Pitch=${stateExp2.targetPitch}°, Roll=${stateExp2.targetRoll}°`
          );

          const finalV = stateExp2.voltage > 0 ? stateExp2.voltage : stateExp2.lastV;
          const finalI = Number.isFinite(stateExp2.current) ? stateExp2.current : stateExp2.lastI;

          // CÁLCULOS REALES
          const power = finalV * finalI;
          const efficiency = (800 * AREA_EXP2) > 0 ? power / (800 * AREA_EXP2) : 0;
          const fillFactor = (VOC_EXP2 * ISC_EXP2) > 0 ? power / (VOC_EXP2 * ISC_EXP2) : 0;

          const snapId = await db.ref(`users/${activeUidExp2}/Exp2/currentSweepId`).once("value");
          const sweepId = snapId.val();

          if (sweepId) {
            const ts = Date.now();
            const data = {
              pitch: stateExp2.targetPitch,
              roll: stateExp2.targetRoll,
              voltage: finalV,
              current: finalI,
              efficiency: efficiency, // Guardado en Firebase
              fillFactor: fillFactor, // Guardado en Firebase
              sweepId,
              timestamp: ts,
              isSaved: false,
            };

            await db.ref(`users/${activeUidExp2}/Exp2/measurements/meas_${ts}`).set(data);
          }

          stateExp2.isMoving = false;
          stateExp2.pendingRoll = null;
          stateExp2.waitingForRollPrompt = false;

          await db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("EndMov");
          setTimeout(() => {
            db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("x");
          }, 500);

          await db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
        } else {
          await db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
        }
      }

      if (mensaje.includes("Sistema finalizado...")) {
        console.log("[Arduino 2] Panel en reposo. Hardware READY.");
        stateExp2.isMoving = false;
        stateExp2.pendingRoll = null;
        stateExp2.waitingForRollPrompt = false;
        await db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
      }
    } catch (error) {
      console.error("[Subsistema2] Error procesando mensaje serial:", error);
    }
  });
}

