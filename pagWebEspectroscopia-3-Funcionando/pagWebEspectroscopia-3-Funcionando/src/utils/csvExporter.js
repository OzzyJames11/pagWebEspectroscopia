/**
 * Genera contenido CSV a partir de datos estructurados
 * @param {Array} data - Datos a exportar
 * @param {Array} labels - Etiquetas para el eje X (tiempo)
 * @param {Array} datasets - Conjuntos de datos (voltaje, corriente, etc.)
 * @returns {string} Contenido CSV formateado
 */
export const generateGraphCSV = (data, labels, datasets) => {
    const headers = ['Time', ...datasets.map(d => d.label)].join(',');
    const rows = labels.map((label, index) => {
      const values = datasets.map(dataset => dataset.data[index] || '');
      return [label, ...values].join(',');
    });
    
    return [headers, ...rows].join('\n');
  };
  
  /**
   * Descarga un archivo CSV
   * @param {string} csvContent - Contenido del CSV
   * @param {string} fileName - Nombre del archivo
   */
  export const downloadCSV = (csvContent, fileName = 'data.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };