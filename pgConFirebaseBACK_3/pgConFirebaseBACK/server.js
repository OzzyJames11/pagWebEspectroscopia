// // MODIFICAR COMPLETAMENTE

// import "dotenv/config";
// import admin from "firebase-admin";
// import { createRequire } from "module";
// import { getDatabase } from "firebase-admin/database";

// const require = createRequire(import.meta.url);
// const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// console.log("Firebase conectado correctamente.");

// const db = getDatabase();
// const ref = db.ref("nature/fruits");

// ref.on("child_added", (snapshot) => {
//   console.log("Nuevo dato recibido:", snapshot.val());
// });



import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";

// 1. IMPORTAR TUS NUEVOS MÓDULOS
import './index.js'; // Esto despierta a los Arduinos y abre los puertos
import { iniciarSubsistema1 } from './subsistems/subsistema1.js'; // Importamos la lógica del Exp 1
import { iniciarSubsistema2 } from './subsistems/subsistema2.js';
import { iniciarSubsistema3 } from "./subsistems/subsistema3.js";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

// 2. INICIALIZAR FIREBASE (Conexión segura de Administrador)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("[Firebase] Conectado correctamente al servidor.");

const db = getDatabase(); // Sacamos la referencia de la base de datos

// 3. ARRANCAR LOS SUBSISTEMAS
// Aquí le "entregamos" la base de datos conectada a tu subsistema
iniciarSubsistema1(db);

// Cuando tengas el Exp 2 y Exp 3 listos, solo los agregas aquí abajo:
iniciarSubsistema2(db);
iniciarSubsistema3(db);

console.log("\n=========================================");
console.log("🚀 BACKEND DEL LABORATORIO EN LÍNEA 🚀");
console.log("=========================================\n");