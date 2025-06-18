import { getDatabase, ref, set } from "firebase/database";
import { app } from "./firebaseConfig"; // Asegúrate de importar tu configuración de Firebase

function actualizarAngulo(msg) {
  try {
    const db = getDatabase(app);
    const docRef = ref(db, "anguloObjetivo");
    set(docRef, msg)
      .then(() => {
        alert("Ángulo actualizado correctamente");
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
    console.log(`Mensaje enviado: ${msg}`);
  } catch (error) {
    console.error("Error al enviar datos seriales:", error);
  }
}

export default actualizarAngulo;
