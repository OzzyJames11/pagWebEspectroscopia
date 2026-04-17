// // agregar todas las unidades
// export const SUBSISTEMA3_COLUMNS = [
//     "Angle \n(deg)",
//     "Voltage \n(V)",
//     "Current \n(I)",
//     "Efficiency \n(%)",
//     "Fill Factor"
// ];

// export const PAGE_TITLES = {
//     MAIN_TITLE: "Cleaning Subsystem",
//     DESCRIPTION: "This subsystem monitors and manages the cleaning status of solar panels to ensure optimal performance.",
//     SAVE_BUTTON: "Save",
//     DOWNLOAD_GRAPHS_BUTTON: "Download All Graphs",
//     DOWNLOAD_1_GRAPH: "Download Graph",
//     BACK_BUTTON: "Go Back",
//     CAMERA_TITLE: "Live Camera",
//     VOLTAGE_VS_TIME_TITLE: "Voltage vs Time",
//     CURRENT_VS_TIME_TITLE: "Current vs Time",
//     SUBSYSTEM_STATUS_TITLE: "Subsystem Status",
//     CURRENT_STATUS_LABEL: "Current Status:",
//     CLEAN_BUTTON: "Clean",
// };

// export const GRAPH_DESCRIPTIONS = {
//     VOLTAGE_VS_TIME: "Shows how voltage changes over time. Peaks indicate maximum power generation.",
//     CURRENT_VS_TIME: "Displays current fluctuations. Stable values suggest consistent performance.",
//     // Espacio para agregar mas descripciones para los graficos
// };

// Subsistema3Strings.jsx

// 1. Centralización de Títulos de Columna
export const SUBSISTEMA3_COLUMNS = [
    "Angle \n(deg)",
    "Voltage \n(V)",
    "Current \n(I)",
    "Efficiency \n(%)",
    "Fill Factor"
];

// 2. Centralización de todos los títulos de la página (Keys añadidas para el frontend)
export const PAGE_TITLES = {
    MAIN_TITLE: "Cleaning Subsystem",
    DESCRIPTION: "This subsystem monitors and manages the cleaning status of solar panels to ensure optimal performance.",
    SAVE_BUTTON_NEW: "SAVE DATA",        // Key añadida
    SAVE_BUTTON_SAVED: "ALL DATA SAVED", // Key añadida
    DOWNLOAD_1_GRAPH: "Download Graph",
    BACK_BUTTON: "Go Back",
    CAMERA_TITLE: "Live Camera",
    VOLTAGE_VS_TIME_TITLE: "Voltage vs Time", // Key añadida (Se usa en TooltipHeader del JSX)
    CURRENT_VS_TIME_TITLE: "Current vs Time", // Key añadida (Se usa en TooltipHeader del JSX)
    SUBSYSTEM_STATUS_TITLE: "Subsystem Status",
    CURRENT_STATUS_LABEL: "Current Status:",
    CLEAN_BUTTON: "Clean",
    MEASUREMENTS_TABLE_TITLE: "Measurements Table", // Key añadida
    GRAPH_COMPARISON_VOLTAGE_TITLE: "Latest Test: Voltage Comparison (V)", // Key añadida
    GRAPH_COMPARISON_CURRENT_TITLE: "Latest Test: Current Comparison (A)", // Key añadida
    PITCH_ACTUAL_LABEL: "Pitch actual:", // Key añadida
    DOWNLOAD_GRAPHS_BUTTON: "Download All Data",
};

// 3. Centralización de descripciones de gráficos (Modificado para frontend)
export const GRAPH_DESCRIPTIONS = {
    COMPARISON_VOLTAGE: "Compares Voltage before and after the most recent cleaning.", // Key modificada
    COMPARISON_CURRENT: "Compares Current before and after the most recent cleaning.", // Key modificada
    // Espacio para agregar mas descripciones para los graficos
};