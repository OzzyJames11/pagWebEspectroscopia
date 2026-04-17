/*import { enviarComandoAArduino, arduinoEvents } from '../index.js';

let stateExp2 = { isMoving: false, targetPitch: 0, targetRoll: 0, voltage: 0, current: 0 };
let activeUidExp2 = null;
let arranqueSilenciado = false;

export function iniciarSubsistema2(db) {
    console.log("🔵 Subsistema 2 (COM6) activo - Barrido en L");

    // 1. ESCUCHAR A FIREBASE (Comandos desde el Slider/Botón)
    db.ref('users').on('child_changed', (snapshot) => {
        const uid = snapshot.key;
        const userData = snapshot.val();
        const comando = userData?.Exp2?.communication?.FrontToBack;

        if (comando && comando !== 'x') {
            activeUidExp2 = uid;
            
            if (comando.startsWith('p') || comando.startsWith('r')) {
                stateExp2.isMoving = true;
                // Actualizar objetivos locales para el guardado de datos
                if(comando.startsWith('p')) stateExp2.targetPitch = parseFloat(comando.slice(1));
                if(comando.startsWith('r')) stateExp2.targetRoll = parseFloat(comando.slice(1));
                
                enviarComandoAArduino('2', comando); 
            } 
            else if (comando === 'y' || comando === 'n') {
                if (comando === 'n') stateExp2.isMoving = false;
                enviarComandoAArduino('2', comando);
                db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");
            }
            db.ref(`users/${uid}/Exp2/communication/FrontToBack`).set('x');
        }
    });

    // 2. ESCUCHAR AL ARDUINO (Confirmación de llegada y Sensores)
    arduinoEvents.on('datos_2', async (mensaje) => {
        // Capturar Voltaje (V) y Corriente (I) [cite: 147, 149]
        const matchV = mensaje.match(/V[:\s]*([\d.]+)/i);
        if (matchV) stateExp2.voltage = parseFloat(matchV[1]);

        const matchI = mensaje.match(/I[:\s]*([\d.]+)/i);
        if (matchI) stateExp2.current = parseFloat(matchI[1]);

        if (mensaje.includes("Sistema iniciado...") && !arranqueSilenciado) {
            enviarComandoAArduino('2', 'n'); 
            arranqueSilenciado = true;
            return;
        }

        // Cuando el motor se detiene y llega al ángulo [cite: 157, 181]
        if (mensaje.includes("EndMov")) {
            if (!arranqueSilenciado) return;

            if (stateExp2.isMoving && activeUidExp2) {
                const snapId = await db.ref(`users/${activeUidExp2}/Exp2/currentSweepId`).once("value");
                const sweepId = snapId.val();

                if (sweepId) {
                    const ts = Date.now();
                    await db.ref(`users/${activeUidExp2}/Exp2/measurements/meas_${ts}`).set({
                        pitch: stateExp2.targetPitch,
                        roll: stateExp2.targetRoll,
                        voltage: stateExp2.voltage,
                        current: stateExp2.current,
                        sweepId: sweepId,
                        timestamp: ts,
                        isSaved: false 
                    });
                }

                stateExp2.isMoving = false;
                // Notificar al Front para que envíe el siguiente paso del barrido en L
                await db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("EndMov");
                setTimeout(() => db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("x"), 500);
            } else {
                db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
            }
        }
    });
}*/











//Correcto pero falta barrido

// import { enviarComandoAArduino, arduinoEvents } from '../index.js';

// let stateExp2 = { isMoving: false, targetPitch: 0, targetRoll: 0, voltage: 0, current: 0, lastV: 0, lastI: 0 };
// let activeUidExp2 = null;
// let arranqueSilenciado = false;

// export function iniciarSubsistema2(db) {
//     console.log("🔵 Subsistema 2 (COM6) escuchando a Firebase...");

//     // =========================================================
//     // 1. ESCUCHAR A FIREBASE (React -> FrontToBack)
//     // =========================================================
//     db.ref('users').on('child_changed', (snapshot) => {
//         const uid = snapshot.key;
//         const userData = snapshot.val();
//         const comando = userData?.Exp2?.communication?.FrontToBack;

//         if (comando && comando !== 'x') {
//             console.log(`[Firebase -> Arduino 2] Usuario ${uid.slice(0,5)} mandó: ${comando}`);
//             activeUidExp2 = uid;
            
//             if (comando.startsWith('p') || comando.startsWith('r')) {
//                 stateExp2.isMoving = true;
//                 if(comando.startsWith('p')) stateExp2.targetPitch = parseFloat(comando.slice(1));
//                 if(comando.startsWith('r')) stateExp2.targetRoll = parseFloat(comando.slice(1));
                
//                 enviarComandoAArduino('2', comando);
//             } 
//             else if (comando === 'y' || comando === 'n') {
//                 if (comando === 'n') stateExp2.isMoving = false;
//                 enviarComandoAArduino('2', comando);
                
//                 // Bloqueamos el Chooser mientras el motor se calibra o va a reposo
//                 db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");
//             }
            
//             db.ref(`users/${uid}/Exp2/communication/FrontToBack`).set('x');
//         }
//     });

//     // =========================================================
//     // 2. ESCUCHAR AL ARDUINO (Y responder en BackToFront)
//     // =========================================================
//     arduinoEvents.on('datos_2', async (mensaje) => {
        
//         // Expresiones regulares para Voltaje y Corriente
//         const matchV = mensaje.match(/V[:\s]*([\d.]+)/i);
//         if (matchV) {
//             stateExp2.voltage = parseFloat(matchV[1]);
//             if (stateExp2.voltage > 0) stateExp2.lastV = stateExp2.voltage;
//         }

//         const matchI = mensaje.match(/I[:\s]*([\d.]+)/i);
//         if (matchI) {
//             stateExp2.current = parseFloat(matchI[1]);
//             if (stateExp2.current > 0) stateExp2.lastI = stateExp2.current;
//         }

        
//         // ✅ GATILLO DE ARRANQUE (Igual que Sub1)
//         if (mensaje.includes("Sistema iniciado...") && !arranqueSilenciado) {
//             console.log("[Arduino 2] Setup físico terminado. Enviando 'n' para silenciar y llevar a reposo...");
//             enviarComandoAArduino('2', 'n'); 
//             arranqueSilenciado = true;
//             return;
//         }

//         // LÓGICA DE FIN DE MOVIMIENTO (CORREGIDA)
//         // Ahora escucha tanto EndMov (barridos) como Sistema finalizado (reposo/apagado)
//         if (mensaje.includes("EndMov") || mensaje.includes("Sistema finalizado...")) {
            
//             // Ignoramos basura inicial
//             if (!arranqueSilenciado) return;

//             // Caso A: Llegada a un ángulo del barrido (Normalmente usa EndMov)
//             if (stateExp2.isMoving && activeUidExp2 && mensaje.includes("EndMov")) {
//                 console.log(`[Arduino 2] Posición alcanzada. Guardando datos...`);
                
//                 const finalV = stateExp2.voltage > 0 ? stateExp2.voltage : stateExp2.lastV;
//                 const finalI = stateExp2.current > 0 ? stateExp2.current : stateExp2.lastI;

//                 const snapId = await db.ref(`users/${activeUidExp2}/Exp2/currentSweepId`).once("value");
//                 const sweepId = snapId.val();

//                 if (sweepId) {
//                     const ts = Date.now();
//                     await db.ref(`users/${activeUidExp2}/Exp2/measurements/meas_${ts}`).set({
//                         pitch: stateExp2.targetPitch,
//                         roll: stateExp2.targetRoll,
//                         voltage: finalV,
//                         current: finalI,
//                         sweepId: sweepId,
//                         timestamp: ts,
//                         isSaved: false 
//                     });
//                 }

//                 stateExp2.isMoving = false;

//                 // Avisamos a React que el movimiento terminó
//                 await db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("EndMov");
//                 setTimeout(() => {
//                     db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("x");
//                 }, 500);
//             } 
//             // Caso B: El panel terminó de llegar a su posición de reposo o finalizó el programa
//             else {
//                 console.log("[Arduino 2] Panel en posición de reposo. Hardware libre y READY.");
//                 // Habilitamos el botón en el ExperimentChooser
//                 db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
//             }
//         }
//     });
// }











//version final claude
//igual funciona bien pero no funciona el barrido
// import { enviarComandoAArduino, arduinoEvents } from '../index.js';

// // =========================================================
// // ESTADO INTERNO DEL SUBSISTEMA 2
// // =========================================================
// let stateExp2 = {
//     isMoving:    false,
//     targetPitch: 0,
//     targetRoll:  0,
//     voltage:     0,
//     current:     0,
//     lastV:       0,
//     lastI:       0,
// };

// let activeUidExp2    = null;
// let arranqueSilenciado2 = false;

// // =========================================================
// // FUNCIÓN PRINCIPAL DEL SUBSISTEMA 2
// // =========================================================
// export function iniciarSubsistema2(db) {
//     console.log("🟢 Subsistema 2 (COM6) escuchando a Firebase...");

//     // =========================================================
//     // 1. ESCUCHAR A FIREBASE (React -> FrontToBack)
//     // =========================================================
//     db.ref('users').on('child_changed', (snapshot) => {
//         const uid      = snapshot.key;
//         const userData = snapshot.val();
//         const comando  = userData?.Exp2?.communication?.FrontToBack;

//         if (comando && comando !== 'x') {
//             console.log(`[Firebase -> Arduino 2] Usuario ${uid.slice(0,5)} mandó: ${comando}`);
//             activeUidExp2 = uid;

//             // --- BARRIDO: formato "p<pitch>r<roll>" (ej: "p10r-15") ---
//             // El Arduino espera primero el pitch y luego el roll en forma secuencial.
//             // Enviamos 'p<valor>' y, tras 400ms para que el Arduino procese y entre en
//             // esperandoRoll, enviamos 'r<valor>'.
//             if (comando.startsWith('p') && comando.includes('r')) {
//                 const matchPitch = comando.match(/^p([-\d.]+)r/);
//                 const matchRoll  = comando.match(/r([-\d.]+)$/);

//                 if (matchPitch && matchRoll) {
//                     stateExp2.targetPitch = parseFloat(matchPitch[1]);
//                     stateExp2.targetRoll  = parseFloat(matchRoll[1]);
//                     stateExp2.isMoving    = true;

//                     enviarComandoAArduino('2', `p${stateExp2.targetPitch}`);
//                     setTimeout(() => {
//                         enviarComandoAArduino('2', `r${stateExp2.targetRoll}`);
//                     }, 400);

//                     console.log(`[Subsistema 2] Moviendo a Pitch=${stateExp2.targetPitch}°, Roll=${stateExp2.targetRoll}°`);
//                 } else {
//                     console.warn(`[Subsistema 2] Formato inválido: "${comando}"`);
//                 }
//             }

//             // --- RESET / FINALIZAR ---
//             else if (comando === 'y' || comando === 'n') {
//                 if (comando === 'n') stateExp2.isMoving = false;
//                 enviarComandoAArduino('2', comando);
//                 // Bloqueamos el Chooser mientras el motor se calibra o va a reposo
//                 db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");
//             }

//             db.ref(`users/${uid}/Exp2/communication/FrontToBack`).set('x');
//         }
//     });

//     // =========================================================
//     // 2. ESCUCHAR AL ARDUINO 2
//     // =========================================================
//     arduinoEvents.on('datos_2', async (mensaje) => {

//         // --- Voltaje ---
//         const matchV = mensaje.match(/V[:\s]*([\d.]+)/i);
//         if (matchV) {
//             stateExp2.voltage = parseFloat(matchV[1]);
//             if (stateExp2.voltage > 0) stateExp2.lastV = stateExp2.voltage;
//         }

//         // --- Corriente ---
//         const matchI = mensaje.match(/I[:\s]*([\d.]+)/i);
//         if (matchI) {
//             stateExp2.current = parseFloat(matchI[1]);
//             if (stateExp2.current > 0) stateExp2.lastI = stateExp2.current;
//         }

//         // --- GATILLO DE ARRANQUE ---
//         //
//         // HAY DOS CAMINOS según quién llama al Arduino:
//         //
//         // CAMINO 1 - Encendido físico (setup):
//         //   Arduino imprime "Sistema iniciado..." → enviamos 'n' → va a reposo (5°)
//         //   → imprime "Sistema finalizado..." → Caso B pone READY
//         //   Esto pasa UNA sola vez al encender el backend.
//         //
//         // CAMINO 2 - Usuario entra al experimento ('y'):
//         //   Arduino llama resetearSistema() → calibrar() → imprime "Calibración completada"
//         //   → loop entra en PITCH: esperando ángulos (ya está listo para barridos)
//         //   "Sistema iniciado..." NO se imprime en este camino.
//         //   → ponemos READY directamente, sin enviar 'n' (el panel ya está calibrado y esperando)
//         //
//         if (mensaje.includes("Sistema iniciado...") && !arranqueSilenciado2) {
//             console.log("[Arduino 2] Setup físico terminado. Enviando 'n' para llevar a reposo...");
//             enviarComandoAArduino('2', 'n');
//             arranqueSilenciado2 = true;
//             return;
//         }

//         if (mensaje.includes("Calibración completada") && arranqueSilenciado2) {
//             // Camino 2: el usuario entró ('y'), el Arduino terminó de calibrar
//             // y ya está en PITCH: listo para recibir ángulos. Ponemos READY sin mover nada.
//             console.log("[Arduino 2] Recalibración completada. Hardware READY — esperando barrido.");
//             db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
//             return;
//         }

//         // --- FIN DE MOVIMIENTO ---
//         // EndMov     → el motor llegó al ángulo objetivo de un barrido
//         // Sistema finalizado... → el panel llegó a su posición de reposo (tras una orden 'n')
//         if (mensaje.includes("EndMov") || mensaje.includes("Sistema finalizado...")) {

//             // Ignoramos mensajes previos al arranque completo
//             if (!arranqueSilenciado2) return;

//             // CASO A: Fin de un punto del barrido pedido por el usuario
//             if (stateExp2.isMoving && activeUidExp2 && mensaje.includes("EndMov")) {
//                 const finalV = stateExp2.voltage > 0 ? stateExp2.voltage : stateExp2.lastV;
//                 const finalI = stateExp2.current > 0 ? stateExp2.current : stateExp2.lastI;

//                 console.log(`[Arduino 2] Llegó a Pitch=${stateExp2.targetPitch}°, Roll=${stateExp2.targetRoll}°. V=${finalV}, I=${finalI}`);

//                 const snapId  = await db.ref(`users/${activeUidExp2}/Exp2/currentSweepId`).once("value");
//                 const sweepId = snapId.val();

//                 if (sweepId) {
//                     const ts = Date.now();
//                     await db.ref(`users/${activeUidExp2}/Exp2/measurements/meas_${ts}`).set({
//                         pitch:     stateExp2.targetPitch,
//                         roll:      stateExp2.targetRoll,
//                         voltage:   finalV,
//                         current:   finalI,
//                         sweepId:   sweepId,
//                         timestamp: ts,
//                         isSaved:   false,
//                     });
//                 }

//                 stateExp2.isMoving = false;

//                 // Avisamos a React que este punto terminó → pasar al siguiente ángulo
//                 await db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("EndMov");
//                 setTimeout(() => {
//                     db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("x");
//                 }, 500);
//             }

//             // CASO B: Panel llegó a reposo (tras orden 'n') o apagado del sistema
//             else if (!stateExp2.isMoving) {
//                 console.log("[Arduino 2] Panel en posición de reposo. Hardware libre y READY.");
//                 db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
//             }
//         }
//     });
// }







//version chatgpt, Barrido funcional

// import { enviarComandoAArduino, arduinoEvents } from '../index.js';

// let stateExp2 = {
//   isMoving: false,
//   targetPitch: 0,
//   targetRoll: 0,
//   pendingRoll: null,
//   waitingForRollPrompt: false,
//   voltage: 0,
//   current: 0,
//   lastV: 0,
//   lastI: 0,
// };

// let activeUidExp2 = null;
// let arranqueSilenciado = false;

// function parseCombinedCommand(comando) {
//   // Formato esperado desde React: "p10|r5"
//   const match = comando.match(/^p(-?\d+)\|r(-?\d+)$/i);
//   if (!match) return null;

//   return {
//     pitch: parseInt(match[1], 10),
//     roll: parseInt(match[2], 10),
//   };
// }

// export function iniciarSubsistema2(db) {
//   console.log("🟢 Subsistema 2 (COM6) escuchando a Firebase...");

//   // =========================================================
//   // 1. ESCUCHAR A FIREBASE (React -> FrontToBack)
//   // =========================================================
//   db.ref('users').on('child_changed', async (snapshot) => {
//     const uid = snapshot.key;
//     const userData = snapshot.val();

//     const comando = userData?.Exp2?.communication?.FrontToBack;

//     if (!comando || comando === 'x') return;

//     console.log(`[Firebase -> Arduino 2] Usuario ${uid.slice(0, 5)} mandó: ${comando}`);
//     activeUidExp2 = uid;

//     try {
//       const parsed = parseCombinedCommand(comando);

//       // Movimiento normal de un punto (pitch, roll)
//       if (parsed) {
//         stateExp2.targetPitch = parsed.pitch;
//         stateExp2.targetRoll = parsed.roll;
//         stateExp2.pendingRoll = parsed.roll;
//         stateExp2.waitingForRollPrompt = true;
//         stateExp2.isMoving = true;

//         await db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");

//         // Primero SIEMPRE enviamos pitch
//         enviarComandoAArduino('2', `p${parsed.pitch}`);
//       }
//       // Despertar / recalibrar / reposo
//       else if (comando === 'y' || comando === 'n') {
//         stateExp2.isMoving = false;
//         stateExp2.pendingRoll = null;
//         stateExp2.waitingForRollPrompt = false;

//         await db.ref(`estado_general/Exp2/hardwareStatus`).set("CALIBRATING");
//         enviarComandoAArduino('2', comando);
//       }
//       // Compatibilidad manual opcional
//       else if (/^p-?\d+$/i.test(comando) || /^r-?\d+$/i.test(comando) || comando === 's') {
//         enviarComandoAArduino('2', comando);
//       }
//       else {
//         console.warn(`[Subsistema2] Comando no reconocido: ${comando}`);
//       }
//     } catch (error) {
//       console.error("[Subsistema2] Error procesando comando:", error);
//     } finally {
//       await db.ref(`users/${uid}/Exp2/communication/FrontToBack`).set('x');
//     }
//   });

//   // =========================================================
//   // 2. ESCUCHAR AL ARDUINO (Serial -> Firebase)
//   // =========================================================
//   arduinoEvents.on('datos_2', async (mensaje) => {
//     try {
//       // ------------------------------
//       // Parsear voltaje y corriente
//       // ------------------------------
//       const matchV = mensaje.match(/V[:\s]*([+-]?\d+(?:\.\d+)?)/i);
//       if (matchV) {
//         stateExp2.voltage = parseFloat(matchV[1]);
//         if (stateExp2.voltage > 0) stateExp2.lastV = stateExp2.voltage;
//       }

//       const matchI = mensaje.match(/I[:\s]*([+-]?\d+(?:\.\d+)?)/i);
//       if (matchI) {
//         stateExp2.current = parseFloat(matchI[1]);
//         stateExp2.lastI = stateExp2.current;
//       }

//       // ------------------------------
//       // Arranque inicial del Arduino
//       // ------------------------------
//       if (mensaje.includes("Sistema iniciado...") && !arranqueSilenciado) {
//         console.log("[Arduino 2] Setup físico terminado. Enviando 'n' para dejarlo en reposo...");
//         enviarComandoAArduino('2', 'n');
//         arranqueSilenciado = true;
//         return;
//       }

//       // ------------------------------
//       // El Arduino pide el ROLL
//       // ------------------------------
//       if (mensaje.includes("ROLL:") && stateExp2.waitingForRollPrompt && stateExp2.pendingRoll !== null) {
//         console.log(`[Arduino 2] Solicita roll. Enviando r${stateExp2.pendingRoll}`);
//         enviarComandoAArduino('2', `r${stateExp2.pendingRoll}`);
//         stateExp2.waitingForRollPrompt = false;
//         return;
//       }

//       // ------------------------------
//       // Fin de movimiento
//       // ------------------------------
//       if (mensaje.includes("EndMov")) {
//         if (!arranqueSilenciado) return;

//         if (stateExp2.isMoving && activeUidExp2) {
//           console.log(
//             `[Arduino 2] Punto alcanzado Pitch=${stateExp2.targetPitch}°, Roll=${stateExp2.targetRoll}°`
//           );

//           const finalV = stateExp2.voltage > 0 ? stateExp2.voltage : stateExp2.lastV;
//           const finalI = Number.isFinite(stateExp2.current) ? stateExp2.current : stateExp2.lastI;

//           const snapId = await db.ref(`users/${activeUidExp2}/Exp2/currentSweepId`).once("value");
//           const sweepId = snapId.val();

//           if (sweepId) {
//             const ts = Date.now();
//             const data = {
//               pitch: stateExp2.targetPitch,
//               roll: stateExp2.targetRoll,
//               voltage: finalV,
//               current: finalI,
//               sweepId,
//               timestamp: ts,
//               isSaved: false,
//             };

//             await db.ref(`users/${activeUidExp2}/Exp2/measurements/meas_${ts}`).set(data);
//           }

//           stateExp2.isMoving = false;
//           stateExp2.pendingRoll = null;
//           stateExp2.waitingForRollPrompt = false;

//           await db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("EndMov");
//           setTimeout(() => {
//             db.ref(`users/${activeUidExp2}/Exp2/communication/BackToFront`).set("x");
//           }, 500);

//           await db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
//         } else {
//           await db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
//         }
//       }

//       // ------------------------------
//       // Reposo final confirmado
//       // ------------------------------
//       if (mensaje.includes("Sistema finalizado...")) {
//         console.log("[Arduino 2] Panel en reposo. Hardware READY.");
//         stateExp2.isMoving = false;
//         stateExp2.pendingRoll = null;
//         stateExp2.waitingForRollPrompt = false;
//         await db.ref(`estado_general/Exp2/hardwareStatus`).set("READY");
//       }
//     } catch (error) {
//       console.error("[Subsistema2] Error procesando mensaje serial:", error);
//     }
//   });
// }







//nueva version

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

