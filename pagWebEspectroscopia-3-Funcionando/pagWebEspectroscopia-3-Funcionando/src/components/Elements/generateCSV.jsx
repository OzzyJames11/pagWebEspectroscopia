export const generateCSV = (selectedData, columnsMap) => {
    let csvContent = "data:text/csv;charset=utf-8,";

    selectedData.forEach(({ title, data, key }) => {
        const columns = columnsMap[key]; // Obtener las columnas correspondientes al subsistema
        if (!columns || !data || data.length === 0) return; // Si no hay columnas o datos, omitir

        // Agregar el título del subsistema
        csvContent += `\n${title}\n`;

        // Agregar las columnas
        csvContent += `${columns.join(",")}\n`;

        // Agregar los datos
        data.forEach(row => {
            const rowData = columns.map(column => row[column] || ""); // Mapear cada columna a su valor
            csvContent += `${rowData.join(",")}\n`;
        });
    });

    return csvContent;
};