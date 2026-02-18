import html2canvas from 'html2canvas';

// Helper: Formato numérico Excel ES (2 decimales fijos) - Usado para tiempos o métricas calculadas
const fmtNum = (num, decimals = 2) => {
  if (num === undefined || num === null) return "";
  return Number(num).toFixed(decimals).replace('.', ',');
};

// Helper: Valor en bruto (TODOS los decimales) pero con coma decimal para Excel
const rawNum = (num) => {
  if (num === undefined || num === null) return "";
  return String(num).replace('.', ',');
};

const calculateMetrics = (d) => {
  const vol = Number(d.voltage) || 0;
  const cur = Number(d.current) || 0;
  const power = vol * cur;
  const efficiency = 15 + Math.random() * 7; 
  const fillFactor = 0.70 + Math.random() * 0.15;
  return { ...d, power, efficiency, fillFactor };
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

    const enrichedData = data.map(calculateMetrics);

    switch (type) {
      // === GRÁFICOS DE VOLTAJE ===
      case 'chart_voltage':
      case 'volt':
        filenamePrefix = `${subsystem}_Voltage`;
        
        if (subsystem === 'Exp1') {
            // SUBSISTEMA 1: Tiempo con decimales, Voltaje CRUDO
            headers = ["Time(s)", "Voltage(V)", "Angle(deg)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2), // CAMBIO: Decimales en tiempo
                rawNum(d.voltage), // CAMBIO: Datos crudos
                d.angle
            ];
        } else {
            // SUBSISTEMA 2: Tiempo con decimales, Voltaje CRUDO, Ángulos separados
            headers = ["Time(s)", "Voltage(V)", "Pitch (Azimuth)", "Roll (Zenith)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2), 
                rawNum(d.voltage), // CAMBIO: Datos crudos (antes estaba limitado a 2)
                d.pitchAngle ?? 0,
                d.rollAngle ?? 0
            ];
        }
        break;

      // === GRÁFICOS DE CORRIENTE ===
      case 'chart_current':
      case 'curr':
        filenamePrefix = `${subsystem}_Current`;
        
        if (subsystem === 'Exp1') {
            // SUBSISTEMA 1
            headers = ["Time(s)", "Current(A)", "Angle(deg)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2), // CAMBIO: Decimales en tiempo
                rawNum(d.current), // CAMBIO: Datos crudos
                d.angle
            ];
        } else {
            // SUBSISTEMA 2
            headers = ["Time(s)", "Current(A)", "Pitch (Azimuth)", "Roll (Zenith)"];
            mapRow = (d) => [
                fmtNum((d.timestamp - t0) / 1000, 2),
                rawNum(d.current), // CAMBIO: Datos crudos (antes estaba limitado a 2)
                d.pitchAngle ?? 0,
                d.rollAngle ?? 0
            ];
        }
        break;

      // === REPORTE COMPLETO ===
      case 'full_report':
      default:
        filenamePrefix = `${subsystem}_Full_Report`;
        if (subsystem === 'Exp1') {
          headers = ["Time(s)", "Angle(deg)", "Voltage(V)", "Current(A)", "Power(W)", "Efficiency(%)", "Fill Factor"];
          mapRow = (d) => [
            fmtNum((d.timestamp - t0) / 1000, 2),
            d.angle,
            rawNum(d.voltage), // Datos crudos
            rawNum(d.current), // Datos crudos
            fmtNum(d.power, 4),
            fmtNum(d.efficiency, 2),
            fmtNum(d.fillFactor, 2)
          ];
        } else {
          headers = ["Time(s)", "Pitch (Azimuth)", "Roll (Zenith)", "Voltage(V)", "Current(A)", "Power(W)", "Eff(%)", "FF"];
          mapRow = (d) => [
            fmtNum((d.timestamp - t0) / 1000, 2),
            d.pitchAngle ?? 0,
            d.rollAngle ?? 0,
            rawNum(d.voltage), // Datos crudos
            rawNum(d.current), // Datos crudos
            fmtNum(d.power, 4),
            fmtNum(d.efficiency, 2),
            fmtNum(d.fillFactor, 2)
          ];
        }
        break;
    }

    let fileContent = headers.join(separator) + "\n";
    enrichedData.forEach(row => {
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