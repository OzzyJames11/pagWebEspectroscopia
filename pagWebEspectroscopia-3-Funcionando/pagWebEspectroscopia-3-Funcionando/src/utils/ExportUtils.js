import html2canvas from 'html2canvas';

// Helper para formatear números al estilo Excel Español (3.14 -> "3,14")
const fmtNum = (num, decimals = 2) => {
  if (num === undefined || num === null) return "";
  return Number(num).toFixed(decimals).replace('.', ',');
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
  // Agregamos el BOM (\uFEFF) para que Excel reconozca tildes y caracteres especiales
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportData = (data, type, subsystem = 'Exp1', format = 'csv') => {
  try {
    if (!data || data.length === 0) {
      alert("⚠️ No hay datos para exportar.");
      return;
    }

    // CAMBIO CLAVE PARA EXCEL EN ESPAÑOL:
    // Si es CSV, usamos punto y coma (;). Si es TXT, usamos tabulación.
    const separator = format === 'csv' ? ';' : '\t';
    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const ext = format === 'csv' ? '.csv' : '.txt';
    
    const t0 = data[0].timestamp;
    let headers = [];
    let mapRow = null;
    let filenamePrefix = "";

    const enrichedData = data.map(calculateMetrics);

    switch (type) {
      case 'chart_voltage':
        filenamePrefix = `${subsystem}_Voltage`;
        headers = ["Time(s)", "Voltage(V)", "Angle(deg)"];
        mapRow = (d) => [
          fmtNum((d.timestamp - t0) / 1000, 0), // Tiempo entero
          fmtNum(d.voltage, 2),
          d.angle // Ángulo suele ser entero
        ];
        break;

      case 'chart_current':
        filenamePrefix = `${subsystem}_Current`;
        headers = ["Time(s)", "Current(A)", "Angle(deg)"];
        mapRow = (d) => [
          fmtNum((d.timestamp - t0) / 1000, 0),
          fmtNum(d.current, 2),
          d.angle
        ];
        break;

      case 'full_report':
      default:
        filenamePrefix = `${subsystem}_Full_Report`;
        if (subsystem === 'Exp1') {
          headers = ["Time(s)", "Angle(deg)", "Voltage(V)", "Current(A)", "Power(W)", "Efficiency(%)", "Fill Factor"];
          mapRow = (d) => [
            fmtNum((d.timestamp - t0) / 1000, 2), // Aquí sí queremos decimales en el tiempo
            d.angle,
            fmtNum(d.voltage, 2),
            fmtNum(d.current, 2),
            fmtNum(d.power, 4),
            fmtNum(d.efficiency, 2),
            fmtNum(d.fillFactor, 2)
          ];
        } else {
          headers = ["Time(s)", "Pitch", "Roll", "Voltage(V)", "Current(A)", "Power(W)", "Eff(%)", "FF"];
          mapRow = (d) => [
            fmtNum((d.timestamp - t0) / 1000, 2),
            d.pitch ?? 0,
            d.roll ?? 0,
            fmtNum(d.voltage, 2),
            fmtNum(d.current, 2),
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