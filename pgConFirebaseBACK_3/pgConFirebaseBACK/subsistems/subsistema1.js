// import { enviarComandoAArduino, arduinoEvents } from '../index.js';

// let stateExp1 = { isMoving: false, targetAngle: 0, voltage: 0, current: 0, lastV: 0, lastI: 0 };
// let activeUidExp1 = null; 
// let arranqueSilenciado = false; 
// let cmdStartTime1 = 0;

// export function iniciarSubsistema1(db) {
//     console.log("🟢 Subsistema 1 (COM5) escuchando a Firebase...");

//     // =========================================================
//     // 1. ESCUCHAR A FIREBASE (Las órdenes del React)
//     // Coincide exactamente con tu imagen: users -> UID -> Exp1 -> communication -> FrontToBack
//     // =========================================================
//     db.ref('users').on('child_changed', (snapshot) => {
//         const uid = snapshot.key; // Esto extrae el "8qb4yEqxXWcvdIEEXYBgANR57T12"
//         const userData = snapshot.val();
        
//         const comando = userData?.Exp1?.communication?.FrontToBack;

//         if (comando && comando !== 'x') {
//             console.log(`[Firebase -> Arduino 1] Usuario ${uid.slice(0,5)} mandó: ${comando}`);
//             activeUidExp1 = uid; 
            
//             if (comando.startsWith('p')) {
//                 stateExp1.targetAngle = parseInt(comando.slice(1));
//                 stateExp1.isMoving = true;
//                 cmdStartTime1 = Date.now();
//                 enviarComandoAArduino('1', comando);
//             } 
//             else if (comando === 'y' || comando === 'n') {
//                 if (comando === 'n') stateExp1.isMoving = false;
//                 enviarComandoAArduino('1', comando);
                
//                 // Aquí usamos el nodo público para bloquear el Chooser
//                 if (comando === 'n') {
//                     db.ref(`estado_general/Exp1/hardwareStatus`).set("CALIBRATING");
//                 }
//             }
            
//             // Limpiamos la variable para que quede en "x" como en tu imagen
//             db.ref(`users/${uid}/Exp1/communication/FrontToBack`).set('x');
//         }
//     });

//     // =========================================================
//     // 2. ESCUCHAR AL ARDUINO (Y responder en BackToFront)
//     // =========================================================
//     arduinoEvents.on('datos_1', async (mensaje) => {
        
//         const matchV = mensaje.match(/V[:\s]*([0-9]+\\.?[0-9]*)/i);
//         if (matchV) {
//             stateExp1.voltage = parseFloat(matchV[1]);
//             if (stateExp1.voltage > 0) stateExp1.lastV = stateExp1.voltage;
//         }

//         const matchI = mensaje.match(/I[:\s]*([0-9]+\\.?[0-9]*)/i);
//         if (matchI) {
//             stateExp1.current = parseFloat(matchI[1]);
//             if (stateExp1.current > 0) stateExp1.lastI = stateExp1.current;
//         }

//         if (mensaje.includes("EndMov")) {
            
//             if (!arranqueSilenciado) {
//                 console.log("[Arduino 1] Arranque listo. Enviando 'n' para silenciar...");
//                 enviarComandoAArduino('1', 'n');
//                 // Arduino listo, actualizamos el letrero público
//                 db.ref(`estado_general/Exp1/hardwareStatus`).set("READY");
//                 arranqueSilenciado = true;
//                 return;
//             }

//             if (stateExp1.isMoving && activeUidExp1) {
//                 const elapsed = Date.now() - cmdStartTime1;
//                 if (elapsed < 2000) return; 

//                 console.log(`[Arduino 1] Llegó a ${stateExp1.targetAngle}°. Guardando datos...`);
                
//                 const finalV = stateExp1.voltage > 0 ? stateExp1.voltage : stateExp1.lastV;
//                 const finalI = stateExp1.current > 0 ? stateExp1.current : stateExp1.lastI;

//                 // Coincide con tu imagen: currentSweepId
//                 const snapId = await db.ref(`users/${activeUidExp1}/Exp1/currentSweepId`).once("value");
//                 const sweepId = snapId.val();

//                 if (sweepId) {
//                     const ts = Date.now();
//                     const data = {
//                         angle: stateExp1.targetAngle,
//                         voltage: finalV,
//                         current: finalI,
//                         sweepId: sweepId,
//                         timestamp: ts,
//                         isSaved: false 
//                     };
//                     // Coincide con tu imagen: measurements/meas_...
//                     await db.ref(`users/${activeUidExp1}/Exp1/measurements/meas_${ts}`).set(data);
//                 }

//                 stateExp1.isMoving = false;

//                 // Respondemos exactamente en BackToFront
//                 await db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`).set("EndMov");
//                 setTimeout(() => {
//                     db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`).set("x");
//                 }, 500);
//             }
//         }
//     });
// }




import { enviarComandoAArduino, arduinoEvents } from '../index.js';

let stateExp1 = { isMoving: false, targetAngle: 0, voltage: 0, current: 0, lastV: 0, lastI: 0 };
let activeUidExp1 = null; 
let arranqueSilenciado = false; 
let cmdStartTime1 = 0;

// ==================== VARIABLES MODIFICABLES ====================
const AREA_EXP1 = 1; 
const VOC_EXP1 = 20;
const ISC_EXP1 = 7;

export function iniciarSubsistema1(db) {
    console.log("🟢 Subsistema 1 (COM5) escuchando a Firebase...");

    // =========================================================
    // 1. ESCUCHAR A FIREBASE (React -> FrontToBack)
    // =========================================================
    db.ref('users').on('child_changed', (snapshot) => {
        const uid = snapshot.key; 
        const userData = snapshot.val();
        
        const comando = userData?.Exp1?.communication?.FrontToBack;

        if (comando && comando !== 'x') {
            console.log(`[Firebase -> Arduino 1] Usuario ${uid.slice(0,5)} mandó: ${comando}`);
            activeUidExp1 = uid; 
            
            if (comando.startsWith('p')) {
                stateExp1.targetAngle = parseInt(comando.slice(1));
                stateExp1.isMoving = true;
                cmdStartTime1 = Date.now();
                enviarComandoAArduino('1', comando);
            } 
            else if (comando === 'y' || comando === 'n') {
                if (comando === 'n') stateExp1.isMoving = false; // Se detiene el movimiento de barrido
                enviarComandoAArduino('1', comando);
                
                // if (comando === 'n') {
                    // Bloqueamos el Chooser mientras el motor regresa a 0
                    db.ref(`estado_general/Exp1/hardwareStatus`).set("CALIBRATING");
                // }
            }
            
            db.ref(`users/${uid}/Exp1/communication/FrontToBack`).set('x');
        }
    });

    // =========================================================
    // 2. ESCUCHAR AL ARDUINO (Y responder en BackToFront)
    // =========================================================
    arduinoEvents.on('datos_1', async (mensaje) => {
        
        // Expresiones regulares seguras
        const matchV = mensaje.match(/V[:\s]*([\d.]+)/i);
        if (matchV) {
            stateExp1.voltage = parseFloat(matchV[1]);
            if (stateExp1.voltage > 0) stateExp1.lastV = stateExp1.voltage;
        }

        const matchI = mensaje.match(/I[:\s]*([\d.]+)/i);
        if (matchI) {
            stateExp1.current = parseFloat(matchI[1]);
            if (stateExp1.current > 0) stateExp1.lastI = stateExp1.current;
        }

        // ✅ NUEVO GATILLO DE ARRANQUE: 
        // Esperamos a que el Arduino nos diga que terminó su calibración física a 0°
        if (mensaje.includes("Sistema iniciado...") && !arranqueSilenciado) {
            console.log("[Arduino 1] Setup físico terminado. Enviando 'n' para silenciar y llevar a 5°...");
            enviarComandoAArduino('1', 'n'); // Lo mandamos a reposo
            arranqueSilenciado = true;
            return;
        }

        // LÓGICA DE FIN DE MOVIMIENTO
        if (mensaje.includes("EndMov")) {
            
            // Ignoramos el EndMov "fantasma" que suelta el Arduino con la basura inicial
            if (!arranqueSilenciado) return;

            // Caso A: Fin de movimiento de un barrido pedido por usuario
            if (stateExp1.isMoving && activeUidExp1) {
                console.log(`[Arduino 1] Llegó a ${stateExp1.targetAngle}°. Guardando datos: V=${stateExp1.voltage}, I=${stateExp1.current}`);
                
                const finalV = stateExp1.voltage > 0 ? stateExp1.voltage : stateExp1.lastV;
                const finalI = stateExp1.current > 0 ? stateExp1.current : stateExp1.lastI;

                // CÁLCULOS REALES
                const efficiency = (finalV * finalI) / (800 * AREA_EXP1);
                const fillFactor = (finalV * finalI) / (VOC_EXP1 * ISC_EXP1);
                console.log(`[Arduino 1] Guardando: V=${finalV}, I=${finalI}, E=${efficiency.toFixed(4)}, FF=${fillFactor.toFixed(4)}`);

                const snapId = await db.ref(`users/${activeUidExp1}/Exp1/currentSweepId`).once("value");
                const sweepId = snapId.val();

                if (sweepId) {
                    const ts = Date.now();
                    const data = {
                        angle: stateExp1.targetAngle,
                        voltage: finalV,
                        current: finalI,
                        efficiency: efficiency, // Guardado en Firebase
                        fillFactor: fillFactor, // Guardado en Firebase
                        sweepId: sweepId,
                        timestamp: ts,
                        isSaved: false 
                    };
                    await db.ref(`users/${activeUidExp1}/Exp1/measurements/meas_${ts}`).set(data);
                }

                stateExp1.isMoving = false;

                // Avisamos a React que pase al siguiente ángulo
                await db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`).set("EndMov");
                setTimeout(() => {
                    db.ref(`users/${activeUidExp1}/Exp1/communication/BackToFront`).set("x");
                }, 500);
            } 
            // Caso B: El Arduino terminó de llegar a su posición de reposo (5°) por una orden 'n'
            else {
                console.log("[Arduino 1] Panel en posición de reposo (5°). Hardware libre y READY.");
                db.ref(`estado_general/Exp1/hardwareStatus`).set("READY");
            }
        }
    });
}