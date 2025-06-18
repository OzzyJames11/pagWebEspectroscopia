import "dotenv/config";
import admin from "firebase-admin";
import { createRequire } from "module";
import { getDatabase } from "firebase-admin/database";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log("Firebase conectado correctamente.");

const db = getDatabase();

// Referencia a la clave "Lectures"
const lecturesRef = db.ref("Exp1/data");
const EndMovRef = db.ref("Exp1/BackToFront");

// Configurar la conexión serial con Arduino
const COM_1 = "COM5";
const COM_2 = "COM6";
const COM_3 = "COM7";
const port = new SerialPort({ path: COM_1, baudRate: 9600 });
const port2 = new SerialPort({ path: COM_2, baudRate: 9600 });
const port3 = new SerialPort({ path: COM_3, baudRate: 9600 });

port.on("open", () => {
  console.log("Conexión serial abierta");
});

// Escuchar datos del puerto serial y enviarlos a Firebase
const parser1 = port.pipe(new ReadlineParser());
let cont = 0;
const data1 = {
  voltage: "",
  current: "",
  cont: "",
};
function getData() {
  data1.current = "";
  data1.voltage = "";
  data1.cont = "";
}

const llaveEnviarAngulo = "";

parser1.on("data", (line) => {
  const mensaje = line.toString().trim();
  const choose = mensaje.slice(0, 1);
  const valor = parseFloat(mensaje.slice(1));
  console.log(COM_1, ":", mensaje);

  if (choose === "I") {
    getData();
    data1.current = valor;
  } else if (choose === "V") {
    data1.voltage = valor;
    data1.cont = cont;
    lecturesRef
      .push({
        data1: data1,
        timestamp: admin.database.ServerValue.TIMESTAMP, // Guardar la marca de tiempo
      })
      .then(() => {
        console.log("Datos enviados correctamente", data1);
      })
      .catch((error) => {
        console.error("Error al enviar los datos: ", error);
      });
    cont += 1;
  } else if (mensaje === "EndMov") {
    EndMovRef.set(mensaje, (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------EndMov");
      }
    });
    EndMovRef.set('x', (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------X");
      }
    });
  } else if (mensaje === "PITCH:") {
    EndMovRef.set(mensaje, (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------PITCH");
      }
    });
    EndMovRef.set('x', (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------X");
      }
    }
    );
  }  
  llaveEnviarAngulo === mensaje
});

// Escuchar cambios en "FrontToBack" y enviarlo al Arduino

console.log(llaveEnviarAngulo)

  db.ref("Exp1/FrontToBack").on("value", (snapshot) => {
    const angulo = snapshot.val();
    console.log("////////////////////////////FrontToBack:", angulo);
    if (port.isOpen) {
      port.write(angulo + "\n", (err) => {
        if (err) {
          console.error("Error al enviar datos al Arduino:", err);
        } else {
          console.log("Ángulo enviado al Arduino:", angulo);
        }
      });
    }
  });    




///////////////////////////////////////////////////////////////////////////////////////////////////////////
//Referencia a la clave "Lectures"
const lecturesRef2 = db.ref("Exp2/data");
const EndMovRef2 = db.ref("Exp2/BackToFront");

// Configurar la conexión serial con Arduino

port2.on("open", () => {
  console.log("Conexión serial abierta");
});

// Escuchar datos del puerto serial y enviarlos a Firebase
const parser2 = port2.pipe(new ReadlineParser());
let cont2 = 0;
const data2 = {
  voltage: "",
  current: "",
  cont: "",
};
function getData2() {
  data2.current = "";
  data2.voltage = "";
  data2.cont = "";
}

parser2.on("data", (line) => {
  const mensaje2 = line.toString().trim();
  const choose = mensaje2.slice(0, 1);
  const valor = parseFloat(mensaje2.slice(1));
  console.log(COM_2, ":", mensaje2);

  if (choose === "I") {
    getData2();
    data2.current = valor;
  } else if (choose === "V") {
    data2.voltage = valor;
    data2.cont = cont2;
    lecturesRef2
      .push({
        data1: data2,
        timestamp: admin.database.ServerValue.TIMESTAMP, // Guardar la marca de tiempo
      })
      .then(() => {
        console.log("Datos enviados correctamente", data2);
      })
      .catch((error) => {
        console.error("Error al enviar los datos: ", error);
      });
    cont2 += 1;
  } else if (mensaje2 === "EndMov") {
    EndMovRef2.set(mensaje2, (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------EndMov");
      }
    });
    EndMovRef2.set('x', (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------EndMov");
      }
    });
  }else if (mensaje2 === "PITCH:") {
    EndMovRef2.set(mensaje2, (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------PITCH");
      }
    });
    EndMovRef2.set('x', (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------EndMov");
      }
    });
  } else if (mensaje2 === "ROLL:") {
    EndMovRef2.set(mensaje2, (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------ROLL");
      }
    });
    EndMovRef2.set('x', (error) => {
      if (error) {
        console.error("Error al escribir en Firebase:", error);
      } else {
        console.log("-------------EndMov");
      }
    });
  }
});

// Escuchar cambios en "FrontToBack" y enviarlo al Arduino
db.ref("Exp2/FrontToBack").on("value", (snapshot) => {
  const angulo = snapshot.val();
  console.log("////////////////////////////FrontToBack:", angulo);

  if (port2.isOpen) {
    port2.write(angulo + "\n", (err) => {
      if (err) {
        console.error("Error al enviar datos al Arduino:", err);
      } else {
        console.log("Ángulo enviado al Arduino:", angulo);
      }
    });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// // Referencia a la clave "Lectures"
const lecturesRef3 = db.ref("Exp3/data");
const EndMovRef3 = db.ref("Exp3/BackToFront");

// // Configurar la conexión serial con Arduino

port3.on("open", () => {
   console.log("Conexión serial abierta");
 });

// // Escuchar datos del puerto serial y enviarlos a Firebase
 const parser3 = port3.pipe(new ReadlineParser());
 let cont3 = 0;
 const data3 = {
   voltage: "",
   current: "",
   cont: "",
 };
 function getData3() {
   data3.current = "";
   data3.voltage = "";
   data3.cont = "";
 }

 parser3.on("data", (line) => {
   const mensaje3 = line.toString().trim();
   const choose = mensaje3.slice(0, 1);
   const valor = parseFloat(mensaje3.slice(1));
   console.log(COM_3, ":", mensaje3);

   if (choose === "I") {
     getData3();
     data3.current = valor;
   } else if (choose === "V") {
     data3.voltage = valor;
     data3.cont = cont3;
     lecturesRef3
       .push({
         data1: data3,
         timestamp: admin.database.ServerValue.TIMESTAMP, // Guardar la marca de tiempo
       })
       .then(() => {
         console.log("Datos enviados correctamente", data3);
       })
       .catch((error) => {
         console.error("Error al enviar los datos: ", error);
       });
     cont3 += 1;
   } else if (mensaje3 === "EndMov") {
     EndMovRef3.set(mensaje3, (error) => {
       if (error) {
         console.error("Error al escribir en Firebase:", error);
       } else {
         console.log("-------------EndMov");
       }
     });
     EndMovRef3.set('x', (error) => {
       if (error) {
         console.error("Error al escribir en Firebase:", error);
       } else {
         console.log("-------------EndMov");
       }
     });
   }
 });

// // Escuchar cambios en "FrontToBack" y enviarlo al Arduino
 db.ref("Exp3/FrontToBack").on("value", (snapshot) => {
   const angulo = snapshot.val();
   console.log("////////////////////////////FrontToBack:", angulo);

   if (port3.isOpen) {
     port3.write(angulo + "\n", (err) => {
       if (err) {
         console.error("Error al enviar datos al Arduino:", err);
       } else {
         console.log("Ángulo enviado al Arduino:", angulo);
       }
     });
   }
 });