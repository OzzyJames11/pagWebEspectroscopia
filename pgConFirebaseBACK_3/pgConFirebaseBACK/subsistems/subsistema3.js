// CODIGO ORIGINAL, FUNCIONA 100%
// import { enviarComandoAArduino, arduinoEvents } from "../index.js";

// const userListenersExp3 = new Map();

// let activeUidExp3 = null;
// let firmwareReadyExp3 = false;
// let arranqueSilenciado3 = false;

// // ==================== VARIABLES MODIFICABLES ====================
// const AREA = 0.5;
// const VOC = 20;
// const ISC = 7;
// // ================================================================

// let stateExp3 = {
//   isCleaning: false,
//   voltage: 0,
//   current: 0,
//   lastV: 0,
//   lastI: 0,
//   pitch: 0,
//   lastPitch: 0,
//   panelStatus: "dirty", 
//   currentCleaningId: null,
//   lastLiveWrite: 0,
//   lastCommandTime: 0,
//   dirtyData: null,
// };

// function nowTs() {
//   return Date.now();
// }

// function parseNumber(regex, text) {
//   const match = text.match(regex);
//   return match ? parseFloat(match[1]) : null;
// }

// async function escribirLiveExp3(db, uid, force = false) {
//   if (!uid) return;

//   const ts = nowTs();
//   if (!force && ts - stateExp3.lastLiveWrite < 300) return;

//   stateExp3.lastLiveWrite = ts;

//   await db.ref(`users/${uid}/Exp3/live`).set({
//     pitch: Number.isFinite(stateExp3.pitch) ? stateExp3.pitch : stateExp3.lastPitch,
//     voltage: Number.isFinite(stateExp3.voltage) ? stateExp3.voltage : stateExp3.lastV,
//     current: Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI,
//     panelStatus: stateExp3.panelStatus,
//     isCleaning: stateExp3.isCleaning,
//     timestamp: ts,
//   });
// }

// async function procesarComandoExp3(db, uid, comando) {
//   if (!comando || comando === "x") return;

//   activeUidExp3 = uid;
//   console.log(`[Firebase -> Arduino 3] Usuario ${uid.slice(0, 5)} mandó: ${comando}`);

//   try {
//     if (comando === "c") {
//       if (stateExp3.isCleaning) {
//         console.log("[Subsistema3] Limpieza ya en progreso. Se ignora nuevo 'c'.");
//         return;
//       }

//       stateExp3.isCleaning = true;
//       stateExp3.panelStatus = "cleaning";
//       stateExp3.currentCleaningId = `clean_${Date.now()}`;

//       await Promise.all([
//         db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING"),
//         db.ref(`users/${uid}/Exp3/currentCleaningId`).set(stateExp3.currentCleaningId),
//         db.ref(`users/${uid}/Exp3/cleanings/${stateExp3.currentCleaningId}`).set({
//           status: "in_progress",
//           startedAt: Date.now(),
//           panelStatusBefore: "dirty",
//         }),
//       ]);

//       await escribirLiveExp3(db, uid, true);
//       enviarComandoAArduino("3", "c");
//       return;
//     }

//     // y y n quedan manuales/compatibles, pero no deben usarse automáticos desde el front
//     if (comando === "y") {
//       if (stateExp3.isCleaning) {
//         console.warn("[Subsistema3] Se ignoró 'y' porque hay limpieza en curso.");
//         return;
//       }

//       stateExp3.isCleaning = false;
//       stateExp3.panelStatus = "dirty";
//       stateExp3.currentCleaningId = null;

//       await db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING");
//       enviarComandoAArduino("3", "y");
//       return;
//     }

//     if (comando === "n") {
//       if (stateExp3.isCleaning) {
//         console.warn("[Subsistema3] Se ignoró 'n' porque cortar limpieza puede dejar el relé activo.");
//         return;
//       }

//       await db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING");
//       enviarComandoAArduino("3", "n");
//       return;
//     }

//     if (comando === "s") {
//       enviarComandoAArduino("3", "s");
//       return;
//     }

//     console.warn(`[Subsistema3] Comando no reconocido: ${comando}`);
//   } catch (error) {
//     console.error("[Subsistema3] Error procesando comando:", error);
//   } finally {
//     await db.ref(`users/${uid}/Exp3/communication/FrontToBack`).set("x");
//   }
// }

// export function iniciarSubsistema3(db) {
//   console.log("🟢 Subsistema 3 (COM7) escuchando a Firebase...");
//   // --- NUEVO: Silenciar el Arduino desde el backend al arrancar ---
//     enviarComandoAArduino("3", "n");

//   // =========================================================
//   // 1. ESCUCHAR USUARIOS Y CONECTAR LISTENER SOLO A FrontToBack
//   // =========================================================
//   db.ref("users").on("child_added", (snapshot) => {
//     const uid = snapshot.key;
//     if (!uid) return;
//     if (userListenersExp3.has(uid)) return;

//     const frontRef = db.ref(`users/${uid}/Exp3/communication/FrontToBack`);

//     const callback = async (snap) => {
//       const comando = snap.val();
//       await procesarComandoExp3(db, uid, comando);
//     };

//     frontRef.on("value", callback);
//     userListenersExp3.set(uid, { ref: frontRef, callback });

//     // console.log(`[Subsistema3] Listener directo conectado para usuario ${uid.slice(0, 5)}`);
//   });

//   // =========================================================
//   // 2. ESCUCHAR AL ARDUINO (Serial -> Firebase)
//   // =========================================================
//   arduinoEvents.on("datos_3", async (mensaje) => {
//     try {
//       const parsedV = parseNumber(/V[:\s]*([+-]?\d+(?:\.\d+)?)/i, mensaje);
//       if (parsedV !== null) {
//         stateExp3.voltage = parsedV;
//         if (parsedV > 0) stateExp3.lastV = parsedV;
//       }

//       const parsedI = parseNumber(/I[:\s]*([+-]?\d+(?:\.\d+)?)/i, mensaje);
//       if (parsedI !== null) {
//         stateExp3.current = parsedI;
//         stateExp3.lastI = parsedI;
//       }

//       const parsedPitch = parseNumber(/Pitch actual:\s*([+-]?\d+(?:\.\d+)?)/i, mensaje);
//       if (parsedPitch !== null) {
//         stateExp3.pitch = parsedPitch;
//         stateExp3.lastPitch = parsedPitch;
//       }

//       if (mensaje.includes("Panel sucio")) {
//         stateExp3.panelStatus = "dirty";
//       }

//       if (mensaje.includes("Panel limpio")) {
//         stateExp3.panelStatus = "clean";
//       }

//       if (activeUidExp3) {
//         await escribirLiveExp3(db, activeUidExp3);
//       }

//       // if (mensaje.includes("Sistema iniciado")) {
//       //   firmwareReadyExp3 = true;
//       //   stateExp3.isCleaning = false;
//       //   await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

//       //   if (activeUidExp3) {
//       //     await escribirLiveExp3(db, activeUidExp3, true);
//       //   }
//       //   return;
//       // }
//       if (mensaje.includes("Sistema iniciado")) {
//         // NUEVO: Silenciar al arrancar el backend para no llenar el log
//         if (!arranqueSilenciado3) {
//           console.log("[Arduino 3] Setup físico terminado. Enviando 'n' para silenciar...");
//           enviarComandoAArduino("3", "n");
//           arranqueSilenciado3 = true;
//         }

//         firmwareReadyExp3 = true;
//         stateExp3.isCleaning = false;
//         await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

//         if (activeUidExp3) {
//           await escribirLiveExp3(db, activeUidExp3, true);
//         }
//         return;
//       }
      

//       if (mensaje.includes("EndMov")) {
//         if (!firmwareReadyExp3) return;

//         if (stateExp3.isCleaning && activeUidExp3) {
//           const finalV = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
//           const finalI = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
//           const finalPitch = Number.isFinite(stateExp3.pitch) ? stateExp3.pitch : stateExp3.lastPitch;
//           const cleaningId =
//             stateExp3.currentCleaningId ||
//             (await db.ref(`users/${activeUidExp3}/Exp3/currentCleaningId`).once("value")).val();

//           const ts = Date.now();

//           await db.ref(`users/${activeUidExp3}/Exp3/measurements/meas_${ts}`).set({
//             pitch: finalPitch,
//             voltage: finalV,
//             current: finalI,
//             panelStatus: stateExp3.panelStatus,
//             cleaningId: cleaningId || null,
//             timestamp: ts,
//             isSaved: false,
//           });

//           if (cleaningId) {
//             await db.ref(`users/${activeUidExp3}/Exp3/cleanings/${cleaningId}`).update({
//               status: "completed",
//               completedAt: ts,
//               panelStatusAfter: stateExp3.panelStatus,
//             });
//           }

//           stateExp3.isCleaning = false;

//           await db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("EndMov");
//           setTimeout(() => {
//             db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("x");
//           }, 500);

//           await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");
//           await escribirLiveExp3(db, activeUidExp3, true);
//         }
//         return;
//       }

//       if (mensaje.includes("Sistema finalizado")) {
//         stateExp3.isCleaning = false;
//         await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

//         if (activeUidExp3) {
//           await escribirLiveExp3(db, activeUidExp3, true);
//         }
//       }
//     } catch (error) {
//       console.error("[Subsistema3] Error procesando mensaje serial:", error);
//     }
//   });
// }




// PRIMER INTENTO CON MODIFICACIONES PUNTUALES, FUNCIONA, PERO SE VA POR ERROR UNA Y-N
// import { enviarComandoAArduino, arduinoEvents } from "../index.js";

// const userListenersExp3 = new Map();

// let activeUidExp3 = null;
// let firmwareReadyExp3 = false;
// let arranqueSilenciado3 = false;

// // ==================== VARIABLES MODIFICABLES ====================
// const AREA = 0.5;
// const VOC = 20;
// const ISC = 7;
// // ================================================================

// let stateExp3 = {
//   isCleaning: false,
//   voltage: 0,
//   current: 0,
//   lastV: 0,
//   lastI: 0,
//   pitch: 0,
//   lastPitch: 0,
//   panelStatus: "dirty", 
//   currentCleaningId: null,
//   currentMeasId: null, 
//   lastLiveWrite: 0,
//   lastCommandTime: 0,
// };

// function nowTs() {
//   return Date.now();
// }

// function parseNumber(regex, text) {
//   const match = text.match(regex);
//   return match ? parseFloat(match[1]) : null;
// }

// async function escribirLiveExp3(db, uid, force = false) {
//   if (!uid) return;

//   const ts = nowTs();
//   if (!force && ts - stateExp3.lastLiveWrite < 300) return;

//   stateExp3.lastLiveWrite = ts;

//   await db.ref(`users/${uid}/Exp3/live`).set({
//     pitch: Number.isFinite(stateExp3.pitch) ? stateExp3.pitch : stateExp3.lastPitch,
//     voltage: Number.isFinite(stateExp3.voltage) ? stateExp3.voltage : stateExp3.lastV,
//     current: Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI,
//     panelStatus: stateExp3.panelStatus,
//     isCleaning: stateExp3.isCleaning,
//     timestamp: ts,
//   });
// }

// async function procesarComandoExp3(db, uid, comando) {
//   if (!comando || comando === "x") return;

//   activeUidExp3 = uid;
//   console.log(`[Firebase -> Arduino 3] Usuario ${uid.slice(0, 5)} mandó: ${comando}`);

//   try {
//     // if (comando === "c") {
//     //   if (stateExp3.isCleaning) {
//     //     console.log("[Subsistema3] Limpieza ya en progreso. Se ignora nuevo 'c'.");
//     //     return;
//     //   }

//     //   stateExp3.isCleaning = true;
//     //   stateExp3.panelStatus = "cleaning";
//     //   stateExp3.currentCleaningId = `clean_${Date.now()}`;

//     //   await Promise.all([
//     //     db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING"),
//     //     db.ref(`users/${uid}/Exp3/currentCleaningId`).set(stateExp3.currentCleaningId),
//     //     db.ref(`users/${uid}/Exp3/cleanings/${stateExp3.currentCleaningId}`).set({
//     //       status: "in_progress",
//     //       startedAt: Date.now(),
//     //       panelStatusBefore: "dirty",
//     //     }),
//     //   ]);

//     //   await escribirLiveExp3(db, uid, true);
//     //   enviarComandoAArduino("3", "c");
//     //   return;
//     // }
//     // if (comando === "c") {
//     //   if (stateExp3.isCleaning) {
//     //     console.log("[Subsistema3] Limpieza ya en progreso. Se ignora nuevo 'c'.");
//     //     return;
//     //   }

//     //   stateExp3.isCleaning = true;
//     //   stateExp3.panelStatus = "cleaning";
//     //   stateExp3.currentCleaningId = `clean_${Date.now()}`;

//     //   // 🚨 NUEVO: CAPTURA DE DATOS SUCIOS ANTES DE LIMPIAR Y CÁLCULOS
//     //   const Vo = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
//     //   const Io = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
//     //   const Po = Vo * Io;
//     //   const Eo = Po / (800 * AREA);
//     //   const FFo = Po / (VOC * ISC);
      
//     //   stateExp3.dirtyData = { Vo, Io, Po, Eo, FFo };
//     //   console.log(`[Subsistema3] Datos sucios capturados: Vo=${Vo}, Io=${Io}`);

//     //   await Promise.all([
//     //     db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING"),
//     //     db.ref(`users/${uid}/Exp3/currentCleaningId`).set(stateExp3.currentCleaningId),
//     //     db.ref(`users/${uid}/Exp3/cleanings/${stateExp3.currentCleaningId}`).set({
//     //       status: "in_progress",
//     //       startedAt: Date.now(),
//     //       panelStatusBefore: "dirty",
//     //     }),
//     //   ]);

//     //   await escribirLiveExp3(db, uid, true);
//     //   enviarComandoAArduino("3", "c");
//     //   return;
//     // }
//     if (comando === "c") {
//       if (stateExp3.isCleaning) {
//         console.log("[Subsistema3] Limpieza ya en progreso. Se ignora nuevo 'c'.");
//         return;
//       }

//       stateExp3.isCleaning = true;
//       stateExp3.panelStatus = "cleaning";
//       stateExp3.currentCleaningId = `clean_${Date.now()}`;
      
//       // 🚨 CÁLCULOS INICIALES (DIRTY)
//       const Vo = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
//       const Io = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
//       const Po = Vo * Io;
//       const Eo = Po / (800 * AREA);
//       const FFo = Po / (VOC * ISC);
      
//       const ts = Date.now();
//       stateExp3.currentMeasId = `meas_${ts}`;

//       await Promise.all([
//         db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING"),
//         db.ref(`users/${uid}/Exp3/currentCleaningId`).set(stateExp3.currentCleaningId),
//         db.ref(`users/${uid}/Exp3/cleanings/${stateExp3.currentCleaningId}`).set({
//           status: "in_progress",
//           startedAt: Date.now(),
//           panelStatusBefore: "dirty",
//         }),
//         // 🚨 GUARDAMOS INMEDIATAMENTE EL REGISTRO SUCIO PARA LA TABLA
//         db.ref(`users/${uid}/Exp3/measurements/${stateExp3.currentMeasId}`).set({
//           angle: 10,
//           Vo: Vo,
//           Io: Io,
//           Po: Po,
//           Eo: Eo,
//           FFo: FFo,
//           Vf: null,
//           If: null,
//           Pf: null,
//           Ef: null,
//           FFf: null,
//           timestamp: ts,
//           isSaved: false,
//           status: "in_progress"
//         })
//       ]);

//       await escribirLiveExp3(db, uid, true);
//       enviarComandoAArduino("3", "c");
//       return;
//     }

//     // y y n quedan manuales/compatibles, pero no deben usarse automáticos desde el front
//     if (comando === "y") {
//       if (stateExp3.isCleaning) {
//         console.warn("[Subsistema3] Se ignoró 'y' porque hay limpieza en curso.");
//         return;
//       }

//       stateExp3.isCleaning = false;
//       stateExp3.panelStatus = "dirty";
//       stateExp3.currentCleaningId = null;

//       await db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING");
//       enviarComandoAArduino("3", "y");
//       return;
//     }

//     if (comando === "n") {
//       if (stateExp3.isCleaning) {
//         console.warn("[Subsistema3] Se ignoró 'n' porque cortar limpieza puede dejar el relé activo.");
//         return;
//       }

//       await db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING");
//       enviarComandoAArduino("3", "n");
//       return;
//     }

//     if (comando === "s") {
//       enviarComandoAArduino("3", "s");
//       return;
//     }

//     console.warn(`[Subsistema3] Comando no reconocido: ${comando}`);
//   } catch (error) {
//     console.error("[Subsistema3] Error procesando comando:", error);
//   } finally {
//     await db.ref(`users/${uid}/Exp3/communication/FrontToBack`).set("x");
//   }
// }

// export function iniciarSubsistema3(db) {
//   console.log("🟢 Subsistema 3 (COM7) escuchando a Firebase...");
//   // --- NUEVO: Silenciar el Arduino desde el backend al arrancar ---
//     enviarComandoAArduino("3", "n");

//   // =========================================================
//   // 1. ESCUCHAR USUARIOS Y CONECTAR LISTENER SOLO A FrontToBack
//   // =========================================================
//   db.ref("users").on("child_added", (snapshot) => {
//     const uid = snapshot.key;
//     if (!uid) return;
//     if (userListenersExp3.has(uid)) return;

//     const frontRef = db.ref(`users/${uid}/Exp3/communication/FrontToBack`);

//     const callback = async (snap) => {
//       const comando = snap.val();
//       await procesarComandoExp3(db, uid, comando);
//     };

//     frontRef.on("value", callback);
//     userListenersExp3.set(uid, { ref: frontRef, callback });

//     // console.log(`[Subsistema3] Listener directo conectado para usuario ${uid.slice(0, 5)}`);
//   });

//   // =========================================================
//   // 2. ESCUCHAR AL ARDUINO (Serial -> Firebase)
//   // =========================================================
//   arduinoEvents.on("datos_3", async (mensaje) => {
//     try {
//       const parsedV = parseNumber(/V[:\s]*([+-]?\d+(?:\.\d+)?)/i, mensaje);
//       if (parsedV !== null) {
//         stateExp3.voltage = parsedV;
//         if (parsedV > 0) stateExp3.lastV = parsedV;
//       }

//       const parsedI = parseNumber(/I[:\s]*([+-]?\d+(?:\.\d+)?)/i, mensaje);
//       if (parsedI !== null) {
//         stateExp3.current = parsedI;
//         stateExp3.lastI = parsedI;
//       }

//       const parsedPitch = parseNumber(/Pitch actual:\s*([+-]?\d+(?:\.\d+)?)/i, mensaje);
//       if (parsedPitch !== null) {
//         stateExp3.pitch = parsedPitch;
//         stateExp3.lastPitch = parsedPitch;
//       }

//       if (mensaje.includes("Panel sucio")) {
//         stateExp3.panelStatus = "dirty";
//       }

//       if (mensaje.includes("Panel limpio")) {
//         stateExp3.panelStatus = "clean";
//       }

//       if (activeUidExp3) {
//         await escribirLiveExp3(db, activeUidExp3);
//       }

//       // if (mensaje.includes("Sistema iniciado")) {
//       //   firmwareReadyExp3 = true;
//       //   stateExp3.isCleaning = false;
//       //   await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

//       //   if (activeUidExp3) {
//       //     await escribirLiveExp3(db, activeUidExp3, true);
//       //   }
//       //   return;
//       // }
//       if (mensaje.includes("Sistema iniciado")) {
//         // NUEVO: Silenciar al arrancar el backend para no llenar el log
//         if (!arranqueSilenciado3) {
//           console.log("[Arduino 3] Setup físico terminado. Enviando 'n' para silenciar...");
//           enviarComandoAArduino("3", "n");
//           arranqueSilenciado3 = true;
//         }

//         firmwareReadyExp3 = true;
//         stateExp3.isCleaning = false;
//         await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

//         if (activeUidExp3) {
//           await escribirLiveExp3(db, activeUidExp3, true);
//         }
//         return;
//       }
      

//       // if (mensaje.includes("EndMov")) {
//       //   if (!firmwareReadyExp3) return;

//       //   if (stateExp3.isCleaning && activeUidExp3) {
//       //     const finalV = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
//       //     const finalI = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
//       //     const finalPitch = Number.isFinite(stateExp3.pitch) ? stateExp3.pitch : stateExp3.lastPitch;
//       //     const cleaningId =
//       //       stateExp3.currentCleaningId ||
//       //       (await db.ref(`users/${activeUidExp3}/Exp3/currentCleaningId`).once("value")).val();

//       //     const ts = Date.now();

//       //     await db.ref(`users/${activeUidExp3}/Exp3/measurements/meas_${ts}`).set({
//       //       pitch: finalPitch,
//       //       voltage: finalV,
//       //       current: finalI,
//       //       panelStatus: stateExp3.panelStatus,
//       //       cleaningId: cleaningId || null,
//       //       timestamp: ts,
//       //       isSaved: false,
//       //     });

//       //     if (cleaningId) {
//       //       await db.ref(`users/${activeUidExp3}/Exp3/cleanings/${cleaningId}`).update({
//       //         status: "completed",
//       //         completedAt: ts,
//       //         panelStatusAfter: stateExp3.panelStatus,
//       //       });
//       //     }

//       //     stateExp3.isCleaning = false;

//       //     await db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("EndMov");
//       //     setTimeout(() => {
//       //       db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("x");
//       //     }, 500);

//       //     await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");
//       //     await escribirLiveExp3(db, activeUidExp3, true);
//       //   }
//       //   return;
//       // }
//       // if (mensaje.includes("EndMov")) {
//       //   if (!firmwareReadyExp3) return;

//       //   if (stateExp3.isCleaning && activeUidExp3) {
//       //     // 🚨 NUEVO: CAPTURA DE DATOS LIMPIOS Y CÁLCULOS
//       //     const Vf = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
//       //     const If = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
//       //     const Pf = Vf * If;
//       //     const Ef = Pf / (800 * AREA);
//       //     const FFf = Pf / (VOC * ISC);

//       //     const ts = Date.now();
          
//       //     // Recuperamos los datos sucios guardados previamente
//       //     const dirty = stateExp3.dirtyData || { Vo: 0, Io: 0, Po: 0, Eo: 0, FFo: 0 };

//       //     await db.ref(`users/${activeUidExp3}/Exp3/measurements/meas_${ts}`).set({
//       //       angle: 10, // Quemado a 10 grados como solicitaste
//       //       Vo: dirty.Vo,
//       //       Io: dirty.Io,
//       //       Eo: dirty.Eo,
//       //       FFo: dirty.FFo,
//       //       Vf: Vf,
//       //       If: If,
//       //       Ef: Ef,
//       //       FFf: FFf,
//       //       timestamp: ts,
//       //       isSaved: false,
//       //     });

//       //     // Limpiamos el estado temporal
//       //     stateExp3.dirtyData = null;
//       //     stateExp3.isCleaning = false;

//       //     await db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("EndMov");
//       //     setTimeout(() => {
//       //       db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("x");
//       //     }, 500);

//       //     await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");
//       //     await escribirLiveExp3(db, activeUidExp3, true);
//       //   }
//       //   return;
//       // }
//       if (mensaje.includes("EndMov")) {
//         if (!firmwareReadyExp3) return;

//         if (stateExp3.isCleaning && activeUidExp3) {
//           // 🚨 CÁLCULOS FINALES (CLEAN)
//           const Vf = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
//           const If = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
//           const Pf = Vf * If;
//           const Ef = Pf / (800 * AREA);
//           const FFf = Pf / (VOC * ISC);

//           const cleaningId = stateExp3.currentCleaningId;
//           const measId = stateExp3.currentMeasId;
//           const ts = Date.now();

//           // 🚨 ACTUALIZAMOS EL REGISTRO CON LOS DATOS FINALES
//           if (measId) {
//             await db.ref(`users/${activeUidExp3}/Exp3/measurements/${measId}`).update({
//               Vf: Vf,
//               If: If,
//               Pf: Pf,
//               Ef: Ef,
//               FFf: FFf,
//               status: "completed"
//             });
//           }

//           if (cleaningId) {
//             await db.ref(`users/${activeUidExp3}/Exp3/cleanings/${cleaningId}`).update({
//               status: "completed",
//               completedAt: ts,
//               panelStatusAfter: stateExp3.panelStatus,
//             });
//           }

//           stateExp3.isCleaning = false;

//           await db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("EndMov");
//           setTimeout(() => {
//             db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("x");
//           }, 500);

//           await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");
//           await escribirLiveExp3(db, activeUidExp3, true);
//         }
//         return;
//       }

//       if (mensaje.includes("Sistema finalizado")) {
//         stateExp3.isCleaning = false;
//         await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

//         if (activeUidExp3) {
//           await escribirLiveExp3(db, activeUidExp3, true);
//         }
//       }
//     } catch (error) {
//       console.error("[Subsistema3] Error procesando mensaje serial:", error);
//     }
//   });
// }



// NUEVO, SIN REVISAR
import { enviarComandoAArduino, arduinoEvents } from "../index.js";

// ==================== VARIABLES MODIFICABLES ====================
const AREA = 0.5;
const VOC = 20;
const ISC = 7;
// ================================================================

const userListenersExp3 = new Map();

let activeUidExp3 = null;
let firmwareReadyExp3 = false;
let arranqueSilenciado3 = false;

let stateExp3 = {
  isCleaning: false,
  voltage: 0,
  current: 0,
  lastV: 0,
  lastI: 0,
  pitch: 0,
  lastPitch: 0,
  panelStatus: "dirty", // dirty | clean | cleaning
  currentCleaningId: null,
  currentMeasId: null, // <-- NUEVO: Para enlazar los datos sucios y limpios en la tabla
  lastLiveWrite: 0,
};

function nowTs() {
  return Date.now();
}

function parseNumber(regex, text) {
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : null;
}

async function escribirLiveExp3(db, uid, force = false) {
  if (!uid) return;

  const ts = nowTs();
  if (!force && ts - stateExp3.lastLiveWrite < 300) return;

  stateExp3.lastLiveWrite = ts;

  await db.ref(`users/${uid}/Exp3/live`).set({
    pitch: Number.isFinite(stateExp3.pitch) ? stateExp3.pitch : stateExp3.lastPitch,
    voltage: Number.isFinite(stateExp3.voltage) ? stateExp3.voltage : stateExp3.lastV,
    current: Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI,
    panelStatus: stateExp3.panelStatus,
    isCleaning: stateExp3.isCleaning,
    timestamp: ts,
  });
}

async function procesarComandoExp3(db, uid, comando) {
  if (!comando || comando === "x") return;

  activeUidExp3 = uid;
  console.log(`[Firebase -> Arduino 3] Usuario ${uid.slice(0, 5)} mandó: ${comando}`);

  try {
    if (comando === "c") {
      if (stateExp3.isCleaning) {
        console.log("[Subsistema3] Limpieza ya en progreso. Se ignora nuevo 'c'.");
        return;
      }

      stateExp3.isCleaning = true;
      stateExp3.panelStatus = "cleaning";
      stateExp3.currentCleaningId = `clean_${Date.now()}`;
      
      // 🚨 CÁLCULOS INICIALES (DIRTY)
      const Vo = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
      const Io = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
      const Po = Vo * Io;
      const Eo = (800 * AREA) > 0 ? Po / (800 * AREA) : 0;
      const FFo = (VOC * ISC) > 0 ? Po / (VOC * ISC) : 0;
      
      const ts = Date.now();
      stateExp3.currentMeasId = `meas_${ts}`;

      await Promise.all([
        db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING"),
        db.ref(`users/${uid}/Exp3/currentCleaningId`).set(stateExp3.currentCleaningId),
        db.ref(`users/${uid}/Exp3/cleanings/${stateExp3.currentCleaningId}`).set({
          status: "in_progress",
          startedAt: Date.now(),
          panelStatusBefore: "dirty",
        }),
        // 🚨 CREAMOS EL REGISTRO EN LA TABLA CON LOS DATOS SUCIOS
        db.ref(`users/${uid}/Exp3/measurements/${stateExp3.currentMeasId}`).set({
          angle: 10,
          Vo: Vo,
          Io: Io,
          Eo: Eo,
          FFo: FFo,
          Vf: null,
          If: null,
          Ef: null,
          FFf: null,
          timestamp: ts,
          isSaved: false,
          status: "in_progress"
        })
      ]);

      await escribirLiveExp3(db, uid, true);
      enviarComandoAArduino("3", "c");
      return;
    }

    if (comando === "y") {
      if (stateExp3.isCleaning) {
        console.warn("[Subsistema3] Se ignoró 'y' porque hay limpieza en curso.");
        return;
      }
      stateExp3.isCleaning = false;
      stateExp3.panelStatus = "dirty";
      stateExp3.currentCleaningId = null;

      await db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING");
      enviarComandoAArduino("3", "y");
      return;
    }

    if (comando === "n") {
      if (stateExp3.isCleaning) {
        console.warn("[Subsistema3] Se ignoró 'n' porque cortar limpieza puede dejar el relé activo.");
        return;
      }
      await db.ref(`estado_general/Exp3/hardwareStatus`).set("CALIBRATING");
      enviarComandoAArduino("3", "n");
      return;
    }

    if (comando === "s") {
      enviarComandoAArduino("3", "s");
      return;
    }

    console.warn(`[Subsistema3] Comando no reconocido: ${comando}`);
  } catch (error) {
    console.error("[Subsistema3] Error procesando comando:", error);
  } finally {
    await db.ref(`users/${uid}/Exp3/communication/FrontToBack`).set("x");
  }
}

export function iniciarSubsistema3(db) {
  console.log("🟢 Subsistema 3 (COM7) escuchando a Firebase...");
  enviarComandoAArduino("3", "n");

  db.ref("users").on("child_added", (snapshot) => {
    const uid = snapshot.key;
    if (!uid) return;
    if (userListenersExp3.has(uid)) return;

    const frontRef = db.ref(`users/${uid}/Exp3/communication/FrontToBack`);

    const callback = async (snap) => {
      const comando = snap.val();
      await procesarComandoExp3(db, uid, comando);
    };

    frontRef.on("value", callback);
    userListenersExp3.set(uid, { ref: frontRef, callback });
  });

  arduinoEvents.on("datos_3", async (mensaje) => {
    try {
      const parsedV = parseNumber(/V[:\s]*([+-]?\d+(?:\.\d+)?)/i, mensaje);
      if (parsedV !== null) {
        stateExp3.voltage = parsedV;
        if (parsedV > 0) stateExp3.lastV = parsedV;
      }

      const parsedI = parseNumber(/I[:\s]*([+-]?\d+(?:\.\d+)?)/i, mensaje);
      if (parsedI !== null) {
        stateExp3.current = parsedI;
        stateExp3.lastI = parsedI;
      }

      const parsedPitch = parseNumber(/Pitch actual:\s*([+-]?\d+(?:\.\d+)?)/i, mensaje);
      if (parsedPitch !== null) {
        stateExp3.pitch = parsedPitch;
        stateExp3.lastPitch = parsedPitch;
      }

      if (mensaje.includes("Panel sucio")) {
        stateExp3.panelStatus = "dirty";
      }

      if (mensaje.includes("Panel limpio")) {
        stateExp3.panelStatus = "clean";
      }

      if (activeUidExp3) {
        await escribirLiveExp3(db, activeUidExp3);
      }

      if (mensaje.includes("Sistema iniciado")) {
        if (!arranqueSilenciado3) {
          console.log("[Arduino 3] Setup físico terminado. Enviando 'n' para silenciar...");
          enviarComandoAArduino("3", "n");
          arranqueSilenciado3 = true;
        }

        firmwareReadyExp3 = true;
        stateExp3.isCleaning = false;
        await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

        if (activeUidExp3) {
          await escribirLiveExp3(db, activeUidExp3, true);
        }
        return;
      }

      if (mensaje.includes("EndMov")) {
        if (!firmwareReadyExp3) return;

        if (stateExp3.isCleaning && activeUidExp3) {
          // 🚨 CÁLCULOS FINALES (CLEAN) AL TERMINAR LA SECUENCIA
          const Vf = stateExp3.voltage > 0 ? stateExp3.voltage : stateExp3.lastV;
          const If = Number.isFinite(stateExp3.current) ? stateExp3.current : stateExp3.lastI;
          const Pf = Vf * If;
          const Ef = (800 * AREA) > 0 ? Pf / (800 * AREA) : 0;
          const FFf = (VOC * ISC) > 0 ? Pf / (VOC * ISC) : 0;

          const cleaningId = stateExp3.currentCleaningId || (await db.ref(`users/${activeUidExp3}/Exp3/currentCleaningId`).once("value")).val();
          const measId = stateExp3.currentMeasId;
          const ts = Date.now();

          // 🚨 ACTUALIZAMOS EL REGISTRO DE LA TABLA CON LOS DATOS FINALES
          if (measId) {
             await db.ref(`users/${activeUidExp3}/Exp3/measurements/${measId}`).update({
               Vf: Vf,
               If: If,
               Ef: Ef,
               FFf: FFf,
               status: "completed"
             });
          }

          if (cleaningId) {
            await db.ref(`users/${activeUidExp3}/Exp3/cleanings/${cleaningId}`).update({
              status: "completed",
              completedAt: ts,
              panelStatusAfter: stateExp3.panelStatus,
            });
          }

          stateExp3.isCleaning = false;

          await db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("EndMov");
          setTimeout(() => {
            db.ref(`users/${activeUidExp3}/Exp3/communication/BackToFront`).set("x");
          }, 500);

          await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");
          await escribirLiveExp3(db, activeUidExp3, true);
        }
        return;
      }

      if (mensaje.includes("Sistema finalizado")) {
        stateExp3.isCleaning = false;
        await db.ref(`estado_general/Exp3/hardwareStatus`).set("READY");

        if (activeUidExp3) {
          await escribirLiveExp3(db, activeUidExp3, true);
        }
      }
    } catch (error) {
      console.error("[Subsistema3] Error procesando mensaje serial:", error);
    }
  });
}





