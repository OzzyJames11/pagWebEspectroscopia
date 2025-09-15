// Importación envío de datos - COMENTAR TODO ESTE BLOQUE
// import {
//   getDatabase,
//   ref,
//   set,
//   get,
//   onValue,
//   onChildAdded,
//   remove,
// } from "firebase/database";
// import app from "../../firebaseConfig.js";

const Subsistema1 = () => {
  // ... código anterior ...

  // COMENTAR: Inicialización de la base de datos de Firebase
  // const db = getDatabase(app);

  // 🔹 Obtener ángulo del panel una sola vez al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // COMENTAR: Referencia a Firebase
        // const dbRef = ref(db, "Exp1/FrontToBack");
        // const snapshot = await get(dbRef);
        
        // REEMPLAZAR CON: Llamada a tu API backend
        // const response = await fetch('tu-backend-url/api/angle');
        // const data = await response.json();
        
        // if (snapshot.exists()) {
        //   setactualPanelAngle(snapshot.val() || "");
        // } else {
        //   console.warn("No se encontraron datos para 'anguloObjetivo'");
        // }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []); // ✅ Eliminar [db] de las dependencias

  // 🔹 Obtener inputs una sola vez al montar el componente
  useEffect(() => {
    const fetchDataInputs = async () => {
      try {
        // COMENTAR: Referencia a Firebase
        // const dbRef = ref(db, "Lectures");
        // const snapshot = await get(dbRef);
        
        // REEMPLAZAR CON: Llamada a tu API backend
        // const response = await fetch('tu-backend-url/api/inputs');
        // const data = await response.json();
        
        // if (snapshot.exists()) {
        //   setInputs(snapshot.val() || "");
        // } else {
        //   console.warn("No se encontraron datos para 'Lectures'");
        // }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchDataInputs();
  }, []); // ✅ Eliminar [db] de las dependencias

  // 🔹 Escuchar cambios en tiempo real - COMENTAR TODO ESTE useEffect
  useEffect(() => {
    // COMENTAR: Listener de Firebase
    // const dbRef = ref(db, "Exp1/data");
    // const unsubscribe = onChildAdded(dbRef, (snapshot) => {
    //   console.log(`Nuevo valor agregado - Clave: ${snapshot.key}`, snapshot.val());
    //   const newData = snapshot.val();
    //   setCorrienteData((prev) => [...prev.slice(-20), newData.data1.current]);
    //   setVoltajeData((prev) => [...prev.slice(-20), newData.data1.voltage]);
    //   setContadorLabels((prev) => [...prev.slice(-20), newData.data1.cont]);
    //   setvoltajeValue_1(newData.data1.voltage);
    //   setcorrienteValue_1(newData.data1.current);
    // });

    // REEMPLAZAR CON: WebSocket o polling a tu backend
    // Ejemplo con WebSocket:
    // const ws = new WebSocket('ws://tu-backend-url/ws');
    // ws.onmessage = (event) => {
    //   const newData = JSON.parse(event.data);
    //   // Actualizar estados con newData
    // };
    // return () => ws.close();

    return () => {}; // unsubscribe(); // 🔄 COMENTAR la limpieza de Firebase
  }, []); // ✅ Eliminar [db] de las dependencias

  //Lectura de BackToFront - COMENTAR TODO ESTE useEffect
  useEffect(() => {
    // COMENTAR: Listener de Firebase
    // const dbRef = ref(db, "Exp1/BackToFront");
    // const unsubscribe = onValue(dbRef, (snapshot) => {
    //   if (snapshot.exists()) {
    //     const mensaje = snapshot.val();
    //     console.log("Mensaje recibidooo:", mensaje);
    //     if (mensaje === "EndMov") {
    //       setIsSliderDisabled_1(false);
    //       setIsMoveButtonDisabled_1(false);
    //       setIsTextDisabled_1(false);
    //       setIsGuardarLecturaDisabled_1(false);
    //     } else if (mensaje === "PITCH:") {
    //       console.log(mensaje)
    //       setEnviarAngulo(true);
    //     }
    //   }
    // });

    // REEMPLAZAR CON: WebSocket o endpoint específico de tu backend
    return () => {}; // unsubscribe(); // 🔄 COMENTAR la limpieza de Firebase
  }, []); // ✅ Eliminar [db] de las dependencias

  // ... código anterior ...

  //Acciones al presionar el Boton Move (Envío de dato de ángulo)
  const envioDatos = async () => {
    if (enviarAngulo) {
      setIsSliderDisabled_1(true);
      setIsMoveButtonDisabled_1(true);
      setIsGuardarLecturaDisabled_1(true);
      setIsTextDisabled_1(true);
      setactualPanelAngle(angulo);
      try {
        const msg = "p" + angulo;
        
        // COMENTAR: Envío a Firebase
        // const db = getDatabase(app);
        // const docRef = ref(db, "Exp1/FrontToBack");
        // set(docRef, msg).catch((error) => {
        //   alert("Error: " + error.message);
        // });

        // REEMPLAZAR CON: Envío a tu backend
        // const response = await fetch('tu-backend-url/api/move', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ angle: angulo, message: msg })
        // });

        console.log(`Mensaje enviado: ${msg}`);
        setEnviarAngulo(false);
      } catch (error) {
        console.error("Error al enviar datos:", error);
      }
    }
  };

  //Envio de señal para 1 hora - COMENTAR
  const change1hour = async () => {
    try {
      const msg = "s";
      
      // COMENTAR: Envío a Firebase
      // const db = getDatabase(app);
      // const docRef = ref(db, "Exp1/FrontToBack");
      // set(docRef, msg).catch((error) => {
      //   alert("Error: " + error.message);
      // });

      // REEMPLAZAR CON: Envío a tu backend
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
    // hacerCambio(); // COMENTAR si también usa Firebase
  };

  //Envío de señal de envío cada 5 segundos - COMENTAR
  const change5sec = async () => {
    try {
      const msg = "y";
      
      // COMENTAR: Envío a Firebase
      // const db = getDatabase(app);
      // const docRef = ref(db, "Exp1/FrontToBack");
      // set(docRef, msg).catch((error) => {
      //   alert("Error: " + error.message);
      // });

      // REEMPLAZAR CON: Envío a tu backend
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  //Envío de señal para parar de enviar ángulos - COMENTAR
  const noEnviarNuevoAngulo = async () => {
    try {
      const signal1hour = "n";
      
      // COMENTAR: Envío a Firebase
      // const db = getDatabase(app);
      // const docRef = ref(db, "Exp1/FrontToBack");
      // set(docRef, signal1hour).catch((error) => {
      //   alert("Error: " + error.message);
      // });

      // REEMPLAZAR CON: Envío a tu backend
      console.log(`Mensaje enviado: ${signal1hour}`);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  //Envío de señal para parar de enviar ángulos - COMENTAR
  const hacerCambio = async () => {
    try {
      const msg = "x";
      
      // COMENTAR: Envío a Firebase
      // const db = getDatabase(app);
      // const docRef = ref(db, "Exp1/FrontToBack");
      // set(docRef, msg).catch((error) => {
      //   alert("Error: " + error.message);
      // });

      // REEMPLAZAR CON: Envío a tu backend
      console.log(`Mensaje enviado: ${msg}`);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  //Eliminar datos - COMENTAR
  const eliminarDatos = async () => {
    // COMENTAR: Eliminación en Firebase
    // const dbRef = ref(db, "Exp1/data");
    // try {
    //   await remove(dbRef);
    //   console.log("Datos eliminados exitosamente.");
    // } catch (error) {
    //   console.error("Error al eliminar los datos: ", error);
    // }

    // REEMPLAZAR CON: Eliminación en tu backend
    // const response = await fetch('tu-backend-url/api/data', {
    //   method: 'DELETE'
    // });
  };

  // ... resto del código ...
};

export default Subsistema1;