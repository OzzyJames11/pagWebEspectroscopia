export const generateTXT = ({
    filename = "datos.txt",
    sections = [],
    metadata = [],
  }) => {
    let content = "";
  
    // Metadatos (como el ángulo actual, fecha, etc.)
    if (metadata.length > 0) {
      metadata.forEach(({ label, value }) => {
        content += `${label}: ${value}\n`;
      });
      content += "\n";
    }
  
    // Secciones (cada una representa un gráfico o conjunto de datos)
    sections.forEach(({ title, headers, data }) => {
      content += `${title}\n`;
      content += headers.join("\t") + "\n";
      data.forEach((row) => {
        content += row.join("\t") + "\n";
      });
      content += "\n";
    });
  
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };