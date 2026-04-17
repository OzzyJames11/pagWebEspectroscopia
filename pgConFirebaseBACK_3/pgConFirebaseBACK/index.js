// CODIGO QUE FUNCIONA BIEN

// import { SerialPort } from 'serialport';
// import { ReadlineParser } from '@serialport/parser-readline';
// import readline from 'readline';

// // Configura aquí tus puertos. El número de la izquierda es el ID que usarás al escribir.
// const configPuertos = {
//     '1': 'COM5', 
//     '2': 'COM6',
//     '3': 'COM7'
// };

// const puertosActivos = {};

// // 1. Inicializar los puertos seriales
// for (const [id, path] of Object.entries(configPuertos)) {
//     const port = new SerialPort({ 
//         path: path, 
//         baudRate: 9600 // Asegúrate de que coincida con el Serial.begin() de tus Arduinos
//     }, (err) => {
//         if (err) {
//             console.error(`[Error] No se pudo abrir ${path}: ${err.message}`);
//         } else {
//             console.log(`[Éxito] Conectado a Arduino ${id} en ${path}`);
//         }
//     });

//     // Usar un parser para leer las líneas completas (hasta que el Arduino envíe un salto de línea)
//     const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

//     // Escuchar los datos que entran
//     parser.on('data', (data) => {
//         console.log(`[Arduino ${id} - ${path}] dice: ${data}`);
//     });

//     puertosActivos[id] = port;
// }

// // 2. Interfaz para leer lo que escribes en la consola de Node.js
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// console.log("\nEscribe un comando (ej. '1n' para enviar 'n' al COM1):");

// rl.on('line', (input) => {
//     // Validar que el input tenga al menos 2 caracteres
//     if (input.length < 2) {
//         console.log("Comando muy corto. Usa el formato: [ID del puerto][Mensaje]");
//         return;
//     }

//     const id = input.charAt(0); // El primer carácter es el ID (1, 2 o 3)
//     const mensaje = input.substring(1); // El resto es el mensaje (ej. 'n', 'encender', etc.)

//     if (puertosActivos[id] && puertosActivos[id].isOpen) {
//         // Enviar el mensaje al Arduino correspondiente
//         puertosActivos[id].write(mensaje + '\n', (err) => {
//             if (err) {
//                 console.error(`Error enviando a Arduino ${id}:`, err.message);
//             } else {
//                 console.log(`-> Mensaje '${mensaje}' enviado correctamente a Arduino ${id}`);
//             }
//         });
//     } else {
//         console.log(`El puerto con ID '${id}' no está disponible o no existe.`);
//     }
// });




// PARA PROBAR: 
// CODIGO ANTERIOR MODIFICADO

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import readline from 'readline';
import { EventEmitter } from 'events';

// ✅ NUEVO: Intercomunicador para los subsistemas
export const arduinoEvents = new EventEmitter(); 

const configPuertos = {
    '1': 'COM5', 
    '2': 'COM6',
    '3': 'COM7'
};

const puertosActivos = {};

// 1. Inicializar los puertos seriales
for (const [id, path] of Object.entries(configPuertos)) {
    const port = new SerialPort({ 
        path: path, 
        baudRate: 9600 
    }, (err) => {
        if (err) {
            console.error(`[Error] No se pudo abrir ${path}: ${err.message}`);
        } else {
            console.log(`[Éxito] Conectado a Arduino ${id} en ${path}`);
        }
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    // Escuchar los datos
    parser.on('data', (data) => {
        const mensaje = data.trim();
        if(!mensaje) return;

        console.log(`[Arduino ${id}] dice: ${mensaje}`);
        // ✅ NUEVO: Transmitir al backend modular correspondiente
        arduinoEvents.emit(`datos_${id}`, mensaje);
    });

    puertosActivos[id] = port;
}

// 2. Función Exportada de ESCRITURA DIRECTA (Minimalista)
export function enviarComandoAArduino(id, mensaje) {
    if (puertosActivos[id] && puertosActivos[id].isOpen) {
        puertosActivos[id].write(mensaje + '\n', (err) => {
            if (err) console.error(`[Error] Fallo al enviar a Arduino ${id}:`, err.message);
        });
        return true;
    }
    return false;
}

// 3. Interfaz de consola manual (Para tus pruebas en VSCode)
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// console.log("\nEscribe un comando (ej. '1n' para enviar 'n' al COM1):");
// rl.on('line', (input) => {
//     if (input.length < 2) return console.log("Formato incorrecto. Usa: [ID][Mensaje]");
//     const id = input.charAt(0);
//     const mensaje = input.substring(1);

//     if(enviarComandoAArduino(id, mensaje)) {
//         console.log(`-> Mensaje manual '${mensaje}' enviado a Arduino ${id}`);
//     } else {
//         console.log(`El puerto '${id}' no está disponible.`);
//     }
// });
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\nEscribe un comando (ej. '1n' para enviar 'n' al COM1):");
rl.on('line', (input) => {
    const comando = input.trim();
    
    // 🚀 NUEVO: Interceptar la orden de apagado del Watchdog
    if (comando === "APAGAR_SISTEMA") {
        console.log("\n[Backend] Orden de Watchdog recibida. Ejecutando rutina de seguridad...");
        process.emit('SIGINT'); // 👈 ¡MAGIA! Esto simula exactamente tu Ctrl+C
        return;
    }

    if (comando.length < 2) return console.log("Formato incorrecto. Usa: [ID][Mensaje]");
    const id = comando.charAt(0);
    const mensaje = comando.substring(1);

    if(enviarComandoAArduino(id, mensaje)) {
        console.log(`-> Mensaje manual '${mensaje}' enviado a Arduino ${id}`);
    } else {
        console.log(`El puerto '${id}' no está disponible.`);
    }
});

// ==========================================================
// 4. CIERRE SEGURO BASADO EN EVENTOS (ESPERA INTELIGENTE)
// ==========================================================
let cerrando = false; 

process.on('SIGINT', () => {
    if (cerrando) return;
    cerrando = true;
    console.log("\n[Sistema] Apagando... Enviando paneles a posición de reposo (5°)...");

    let promesasCierre = [];

    for (const id in puertosActivos) {
        if (puertosActivos[id].isOpen) {
            
            let p = new Promise((resolve) => {
                
                // 1. Timeout de seguridad (15 segundos) por si un motor se atasca físicamente
                let fallbackTimer = setTimeout(() => {
                    console.log(`[Sistema-Alerta] Arduino ${id} tardó demasiado. Forzando cierre.`);
                    cerrarYResolver();
                }, 15000);

                // Función maestra para cerrar el puerto y terminar la promesa
                const cerrarYResolver = () => {
                    clearTimeout(fallbackTimer); // Cancelamos el cronómetro de seguridad
                    if (puertosActivos[id].isOpen) {
                        puertosActivos[id].close();
                        console.log(`[Sistema] Puerto de Arduino ${id} cerrado correctamente.`);
                    }
                    // Dejamos de escuchar a este Arduino para no causar errores
                    arduinoEvents.removeListener(`datos_${id}`, checkApagado);
                    resolve();
                };

                // 2. El oyente (Listener) que espera la palabra mágica del Arduino
                const checkApagado = (mensaje) => {
                    // Si el Arduino confirma que terminó su movimiento o se apagó
                    if (mensaje.includes("Sistema finalizado...") || mensaje.includes("EndMov")) {
                        console.log(`[Sistema] Arduino ${id} confirmó posición de reposo.`);
                        // Le damos 100 milisegundos de respiro para que termine de vaciar su buffer serial y cerramos
                        setTimeout(cerrarYResolver, 100);
                    }
                };

                // Conectamos el oyente al intercomunicador
                arduinoEvents.on(`datos_${id}`, checkApagado);

                // 3. Enviamos la orden de reposo
                puertosActivos[id].write('n\n');
                console.log(`[Sistema] Señal 'n' enviada a Arduino ${id}. Esperando confirmación de hardware...`);
            });

            promesasCierre.push(p);
        }
    }

    // 4. Cuando ABSOLUTAMENTE TODOS los arduinos hayan respondido (o superado el timeout)
    Promise.all(promesasCierre).then(() => {
        console.log("\n=======================================================");
        console.log("🛑 Todos los paneles en reposo. Apagado completo. 🛑");
        console.log("=======================================================\n");
        process.exit(0);
    });
});