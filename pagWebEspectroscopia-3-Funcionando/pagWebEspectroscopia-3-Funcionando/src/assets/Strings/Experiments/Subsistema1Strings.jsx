// agregar todas las unidades
export const SUBSISTEMA1_COLUMNS = [
    "Zenith Angle (°)",
    "Voltage",
    "Current",
    "Efficiency",
    "Fill Factor"
];

export const PAGE_TITLES = {
    MAIN_TITLE: "Panel Subsystem (1 Rotation)",
    DESCRIPTION: "This subsystem controls the rotation of a solar panel along a single axis. It measures real-time voltage (V) and current (A) outputs at each angle position, then calculates two key performance metrics: Energy conversion efficiency (%) and Fill Factor (quality indicator of the solar cells).",
    SAVE_BUTTON: "Save",
    MOVE_BUTTON: "Move",
    DOWNLOAD_GRAPHS_BUTTON: "Download All Graphs",
    DOWNLOAD_1_GRAPH: "Download Graph",
    BACK_BUTTON: "Go Back",
    CAMERA_TITLE: "Live Camera",
    VOLTAGE_VS_TIME_TITLE: "Voltage vs Time",
    CURRENT_VS_TIME_TITLE: "Current vs Time",
};

export const SUBSISTEMA1_TOOLTIPS = {
    // Agregar solo tooltips específicos que no están en COMMON_TOOLTIPS
    //[SUBSISTEMA1_COLUMNS[X]]: "Solar panel tilt angle in degrees relative to zenith (vertical axis)",
};

export const GRAPH_DESCRIPTIONS = {
    VOLTAGE_VS_TIME: "Shows how voltage changes over time. Peaks indicate maximum power generation.",
    CURRENT_VS_TIME: "Displays current fluctuations. Stable values suggest consistent performance.",
    // Espacio para agregar mas descripciones para los graficos
};