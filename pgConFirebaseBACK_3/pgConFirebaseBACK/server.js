import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("Firebase conectado correctamente.");

const db = getDatabase();
const ref = db.ref("nature/fruits");

ref.on("child_added", (snapshot) => {
  console.log("Nuevo dato recibido:", snapshot.val());
});
