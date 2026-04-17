// Codigo que funciona correctamente, voy a probar una nueva version
// import html2canvas from 'html2canvas';

// // Helper: Formato numérico Excel ES (2 decimales fijos) - Usado para tiempos o métricas calculadas
// const fmtNum = (num, decimals = 2) => {
//   if (num === undefined || num === null || isNaN(num)) return "";
//   return Number(num).toFixed(decimals).replace('.', ',');
// };

// // Helper: Valor en bruto (TODOS los decimales) pero con coma decimal para Excel
// const rawNum = (num) => {
//   if (num === undefined || num === null || isNaN(num)) return "";
//   return String(num).replace('.', ',');
// };

// const triggerDownload = (content, filename, mimeType) => {
//   const blob = new Blob(["\uFEFF" + content], { type: mimeType });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

// // === FUNCIÓN PRINCIPAL ===
// export const exportData = (data, type, subsystem = 'Exp1', format = 'csv', customStartTime = null) => {
//   try {
//     if (!data || data.length === 0) {
//       alert("⚠️ No hay datos para exportar.");
//       return;
//     }

//     const separator = format === 'csv' ? ';' : '\t';
//     const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
//     const ext = format === 'csv' ? '.csv' : '.txt';
    
//     // TIEMPO RELATIVO:
//     // Si viene customStartTime (para Axis 2), lo usamos. Si no, usamos el del primer dato.
//     const t0 = customStartTime !== null ? customStartTime : data[0].timestamp;
    
//     let headers = [];
//     let mapRow = null;
//     let filenamePrefix = "";

//     switch (type) {
//       // === GRÁFICOS DE VOLTAJE ===
//       case 'chart_voltage':
//       case 'volt':
//         filenamePrefix = `${subsystem}_Voltage`;
        
//         if (subsystem === 'Exp1') {
//             headers = ["Time(s)", "Voltage(V)", "Angle(deg)"];
//             mapRow = (d) => [
//                 fmtNum((d.timestamp - t0) / 1000, 2), 
//                 rawNum(d.voltage), 
//                 d.angle ?? 0
//             ];
//         } else {
//             headers = ["Time(s)", "Voltage(V)", "Azimuth(deg)", "Zenith(deg)"];
//             mapRow = (d) => [
//                 fmtNum((d.timestamp - t0) / 1000, 2), 
//                 rawNum(d.voltage), 
//                 d.pitchAngle ?? 0,
//                 d.rollAngle ?? 0
//             ];
//         }
//         break;

//       // === GRÁFICOS DE CORRIENTE ===
//       case 'chart_current':
//       case 'curr':
//         filenamePrefix = `${subsystem}_Current`;
        
//         if (subsystem === 'Exp1') {
//             headers = ["Time(s)", "Current(A)", "Angle(deg)"];
//             mapRow = (d) => [
//                 fmtNum((d.timestamp - t0) / 1000, 2), 
//                 rawNum(d.current), 
//                 d.angle ?? 0
//             ];
//         } else {
//             headers = ["Time(s)", "Current(A)", "Azimuth(deg)", "Zenith(deg)"];
//             mapRow = (d) => [
//                 fmtNum((d.timestamp - t0) / 1000, 2),
//                 rawNum(d.current), 
//                 d.pitchAngle ?? 0,
//                 d.rollAngle ?? 0
//             ];
//         }
//         break;

//       // === REPORTE COMPLETO ===
//       case 'full_report':
//       default:
//         filenamePrefix = `${subsystem}_Full_Report`;
        
//         if (subsystem === 'Exp1') {
//           // SUBSISTEMA 1: Eliminado Power, se mapean Eff y FF reales
//           headers = ["Time(s)", "Angle(deg)", "Voltage(V)", "Current(A)", "Efficiency(%)", "Fill Factor"];
//           mapRow = (d) => [
//             fmtNum((d.timestamp - t0) / 1000, 2),
//             d.angle ?? 0,
//             rawNum(d.voltage), 
//             rawNum(d.current), 
//             fmtNum((d.efficiency * 100) || 0, 2), // Multiplicado por 100 para mostrar porcentaje
//             fmtNum(d.fillFactor || 0, 4)          // 4 decimales para mayor precisión en FF
//           ];
//         } else {
//           // SUBSISTEMA 2: Eliminado Power, se mapean Eff y FF reales
//           headers = ["Time(s)", "Azimuth(deg)", "Zenith(deg)", "Voltage(V)", "Current(A)", "Efficiency(%)", "Fill Factor"];
//           mapRow = (d) => [
//             fmtNum((d.timestamp - t0) / 1000, 2),
//             d.pitchAngle ?? 0,
//             d.rollAngle ?? 0,
//             rawNum(d.voltage), 
//             rawNum(d.current), 
//             fmtNum((d.efficiency * 100) || 0, 2), // Multiplicado por 100 para mostrar porcentaje
//             fmtNum(d.fillFactor || 0, 4)          // 4 decimales para mayor precisión en FF
//           ];
//         }
//         break;
//     }

//     let fileContent = headers.join(separator) + "\n";
    
//     // Iteramos directamente sobre 'data', que ya trae los valores reales desde Firebase
//     data.forEach(row => {
//       fileContent += mapRow(row).join(separator) + "\n";
//     });

//     const timestampStr = new Date().toISOString().slice(0,19).replace(/:/g,"-");
//     triggerDownload(fileContent, `${filenamePrefix}_${timestampStr}${ext}`, mimeType);

//   } catch (error) {
//     console.error("Error exportando:", error);
//     alert("❌ Error al generar el archivo.");
//   }
// };

// export const downloadChartAsImage = async (elementId, filename) => {
//   const element = document.getElementById(elementId);
//   if (!element) {
//     alert(`Error: No se encuentra el gráfico (${elementId})`);
//     return;
//   }
//   try {
//     const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
//     const image = canvas.toDataURL("image/png");
//     const link = document.createElement("a");
//     link.href = image;
//     link.download = `${filename}.png`;
//     link.click();
//   } catch (error) {
//     console.error("Error capturando imagen:", error);
//     alert("No se pudo descargar la imagen.");
//   }
// };





// Implementacion para que funcione en data summary
import html2canvas from 'html2canvas';

// Helper: Formato numérico Excel ES (2 decimales fijos) - Usado para tiempos o métricas calculadas
const fmtNum = (num, decimals = 2) => {
  if (num === undefined || num === null || isNaN(num)) return "";
  return Number(num).toFixed(decimals).replace('.', ',');
};

// Helper: Valor en bruto (TODOS los decimales) pero con coma decimal para Excel
const rawNum = (num) => {
  if (num === undefined || num === null || isNaN(num)) return "";
  return String(num).replace('.', ',');
};

const triggerDownload = (content, filename, mimeType) => {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// === FUNCIÓN PRINCIPAL ===
export const exportData = (data, type, subsystem = 'Exp1', format = 'csv', customStartTime = null) => {
  try {
    if (!data || data.length === 0) {
      alert("⚠️ No hay datos para exportar.");
      return;
    }

    const separator = format === 'csv' ? ';' : '\t';
    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const ext = format === 'csv' ? '.csv' : '.txt';
    
    // TIEMPO RELATIVO:
    // Si viene customStartTime (para Axis 2), lo usamos. Si no, usamos el del primer dato.
    const t0 = customStartTime !== null ? customStartTime : data[0].timestamp;
    
    let headers = [];
    let mapRow = null;
    let filenamePrefix = "";

    switch (type) {
      // === GRÁFICOS DE VOLTAJE ===
      case 'chart_voltage':
      case 'volt':
        filenamePrefix = `${subsystem}_Voltage`;
        
        if (subsystem === 'Exp1') {
            headers = ["Time(s)", "Voltage(V)", "Angle(deg)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2), 
                rawNum(d.voltage), 
                d.angle ?? 0
            ];
        } else {
            headers = ["Time(s)", "Voltage(V)", "Azimuth(deg)", "Zenith(deg)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2), 
                rawNum(d.voltage), 
                d.pitch ?? d.pitchAngle ?? 0,
                d.roll ?? d.rollAngle ?? 0
            ];
        }
        break;

      // === GRÁFICOS DE CORRIENTE ===
      case 'chart_current':
      case 'curr':
        filenamePrefix = `${subsystem}_Current`;
        
        if (subsystem === 'Exp1') {
            headers = ["Time(s)", "Current(A)", "Angle(deg)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2), 
                rawNum(d.current), 
                d.angle ?? 0
            ];
        } else {
            headers = ["Time(s)", "Current(A)", "Azimuth(deg)", "Zenith(deg)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2),
                rawNum(d.current), 
                d.pitch ?? d.pitchAngle ?? 0,
                d.roll ?? d.rollAngle ?? 0
            ];
        }
        break;

      // === REPORTE COMPLETO ===
      case 'full_report':
      default:
        filenamePrefix = `${subsystem}_Full_Report`;
        
        if (subsystem === 'Exp1') {
          headers = ["Time(s)", "Angle(deg)", "Voltage(V)", "Current(A)", "Efficiency(%)", "Fill Factor"];
          mapRow = (d) => [
            fmtNum((d.timestamp - t0) / 1000, 2), d.angle ?? 0, rawNum(d.voltage), rawNum(d.current), 
            fmtNum((d.efficiency * 100) || 0, 2), fmtNum(d.fillFactor || 0, 4)
          ];
        } else if (subsystem === 'Exp2') {
          headers = ["Time(s)", "Azimuth(deg)", "Zenith(deg)", "Voltage(V)", "Current(A)", "Efficiency(%)", "Fill Factor"];
          mapRow = (d) => [
            fmtNum((d.timestamp - t0) / 1000, 2), d.pitch ?? d.pitchAngle ?? 0, d.roll ?? d.rollAngle ?? 0, rawNum(d.voltage), rawNum(d.current), 
            fmtNum((d.efficiency * 100) || 0, 2), fmtNum(d.fillFactor || 0, 4)
          ];
        } else if (subsystem === 'Exp3') {
          // 1. Cabeceras sin Time(s)
          headers = ["Angle(deg)", "Dirty Voltage(V)", "Dirty Current(A)", "Dirty Eff(%)", "Dirty FF", "Clean Voltage(V)", "Clean Current(A)", "Clean Eff(%)", "Clean FF"];
          // 2. mapRow sin el cálculo de tiempo
          mapRow = (d) => [
            d.angle ?? 0, // El ángulo es el primer dato ahora
            rawNum(d.Vo), rawNum(d.Io), fmtNum((d.Eo * 100) || 0, 2), fmtNum(d.FFo || 0, 4),
            rawNum(d.Vf), rawNum(d.If), fmtNum((d.Ef * 100) || 0, 2), fmtNum(d.FFf || 0, 4)
          ];
        } else if (subsystem === 'Exp4') {
          headers = ["Integration Time(ms)", "Date"];
          mapRow = (d) => [
             d.integrationTime ?? 0, new Date(d.timestamp).toLocaleString("es-ES")
          ];
        } else if (subsystem === 'Exp4_Filters') {
          headers = ["Date", "Reference(%)", "Yellow Filter(%)", "Blue Filter(%)", "Red Filter(%)"];
          mapRow = (d) => [
            new Date(d.timestamp).toLocaleString("es-ES"), fmtNum(d.referencia, 2), fmtNum(d.filtroAmarillo, 2), fmtNum(d.filtroAzul, 2), fmtNum(d.filtroRojo, 2)
          ];
        }
        break;
    }

    let fileContent = headers.join(separator) + "\n";
    
    // Iteramos directamente sobre 'data', que ya trae los valores reales desde Firebase
    data.forEach(row => {
      fileContent += mapRow(row).join(separator) + "\n";
    });

    const timestampStr = new Date().toISOString().slice(0,19).replace(/:/g,"-");
    triggerDownload(fileContent, `${filenamePrefix}_${timestampStr}${ext}`, mimeType);

  } catch (error) {
    console.error("Error exportando:", error);
    alert("❌ Error al generar el archivo.");
  }
};

export const downloadChartAsImage = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert(`Error: No se encuentra el gráfico (${elementId})`);
    return;
  }
  try {
    const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${filename}.png`;
    link.click();
  } catch (error) {
    console.error("Error capturando imagen:", error);
    alert("No se pudo descargar la imagen.");
  }
};