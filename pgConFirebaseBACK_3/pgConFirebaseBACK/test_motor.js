// BORRAR, este codigo es solo de prueba

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

// CONFIGURA AQUÍ TU PUERTO
const PORT = "COM5"; 
const BAUD = 9600;

console.log(`Abriendo ${PORT} a ${BAUD}...`);
const port = new SerialPort({ path: PORT, baudRate: BAUD });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
    console.log("✅ Puerto abierto. ESPERANDO 10 SEGUNDOS (Para que termine Calibración)...");

    // CAMBIO: Aumentamos de 3000 a 10000 ms
    setTimeout(() => {
        console.log("🟢 ENVIANDO COMANDO DE PRUEBA: p10");
        
        // Probamos enviar solo \n (ya que vimos que tu Arduino responde a eso)
        port.write("p10\n", (err) => {
        if (err) return console.log("Error escribiendo:", err.message);
        console.log("Comando enviado.");
        });

    }, 10000); // <--- AQUÍ ESTÁ LA CLAVE
});

parser.on("data", (data) => {
  console.log(`RESPUESTA ARDUINO: ${data.trim()}`);
});