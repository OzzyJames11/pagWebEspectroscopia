// agregar todas las unidades
// export const SUBSISTEMA2_COLUMNS = [
//     "Zenith Angle (°)",
//     "Azimuth Angle (°)",
//     "Voltage 1",
//     "Voltage 2",
//     "Current 1",
//     "Current 2",
//     "Efficiency 1",
//     "Efficiency 2",
//     "Fill Factor 1",
//     "Fill Factor 2"
// ];
export const SUBSISTEMA2_COLUMNS = [
    "Zenith Angle (°)",
    "Azimuth Angle (°)",
    "Voltage",
    "Current",
    "Efficiency",
    "Fill Factor",
];

export const PAGE_TITLES = {
    MAIN_TITLE: "Panel Subsystem (2 Rotations)",
    DESCRIPTION: "This subsystem manages dual-axis rotation of solar panels to optimize sun tracking. It measures real-time voltage (V) and current (A) outputs at each angle position, then calculates two key performance metrics: Energy conversion efficiency (%) and Fill Factor (quality indicator of the solar cells).",
    SAVE_BUTTON: "Save",
    MOVE_BUTTON: "Move",
    DOWNLOAD_GRAPHS_BUTTON: "Download All Graphs",
    DOWNLOAD_1_GRAPH: "Download Graph",
    BACK_BUTTON: "Go Back",
    CAMERA_TITLE: "Live Camera",
    VOLTAGE_VS_TIME_TITLE: "Voltage vs Time",
    CURRENT_VS_TIME_TITLE: "Current vs Time",
};

export const GRAPH_DESCRIPTIONS = {
    VOLTAGE_VS_TIME: "Shows how voltage changes over time. Peaks indicate maximum power generation.",
    CURRENT_VS_TIME: "Displays current fluctuations. Stable values suggest consistent performance.",
    // Espacio para agregar mas descripciones para los graficos
};