// CODIGO CORRECTO

// import React from "react";
// import {
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
// } from "recharts";
// import { Box, Typography } from "@mui/material";

// // Función auxiliar para tooltip
// const getRelativeTimeDetailed = (timestamp, startTime) => {
//   if (!timestamp || !startTime) return "0.0s";
//   const diff = (timestamp - startTime) / 1000;
//   return `${diff.toFixed(1)}s`;
// };

// // Función para eje X (Enteros)
// const getRelativeTimeInteger = (timestamp, startTime) => {
//   if (!timestamp || !startTime) return "0";
//   const diff = (timestamp - startTime) / 1000; 
//   return Math.floor(diff).toString(); 
// };

// // --- TOOLTIP PERSONALIZADO CORREGIDO ---
// const CustomTooltip = ({ active, payload, label, unit, startTime }) => {
//   if (active && payload && payload.length) {
//     const timeStr = getRelativeTimeDetailed(label, startTime);
//     return (
//       <Box sx={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #ccc", p: 1, borderRadius: 1, boxShadow: 2 }}>
//         {/* Fila 1: Tiempo */}
//         <Typography variant="body2" color="text.primary">
//           <span style={{ fontWeight: "bold" }}>Time: </span>
//           <span>{timeStr}</span>
//         </Typography>
        
//         {/* Fila 2: Valor */}
//         <Typography variant="body2" color="text.primary">
//           <span style={{ fontWeight: "bold" }}>{payload[0].name}: </span>
//           <span style={{ color: payload[0].stroke }}>{payload[0].value} {unit}</span>
//         </Typography>
//       </Box>
//     );
//   }
//   return null;
// };

// const RealTimeChart = ({ data, dataKey, color = "#8884d8", yLabel, unit, chartId }) => {
//   const startTime = data.length > 0 ? data[0].timestamp : 0;

//   return (
//     // CAMBIO 1: Eliminamos el padding del div contenedor para que se pegue al borde
//     <div id={chartId} style={{ width: "100%", height: "300px", minHeight: "300px", backgroundColor: "#fff" }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <AreaChart
//           data={data}
//           // CAMBIO 2: Ajustamos márgenes. 'left: -20' acerca el eje Y al borde izquierdo.
//           margin={{ top: 10, right: 10, left: -2, bottom: 20 }}
//         >
//           <defs>
//             <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor={color} stopOpacity={0.8} />
//               <stop offset="95%" stopColor={color} stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
//           <XAxis
//             dataKey="timestamp"
//             tickFormatter={(tick) => getRelativeTimeInteger(tick, startTime)}
//             // Tamaño de los números en el eje X (tiempo)
//             style={{ fontSize: "14px" }}
//             interval="preserveStartEnd"
//             dy={5}
//           >
//             <Label value="Time (s)" offset={0} position="insideBottom" style={{ fontSize: '19px', fill: '#666', fontWeight: 600 }} dy={15} />
//           </XAxis>
          
//           <YAxis 
//             // CAMBIO 3: 'dx' mueve el texto horizontalmente. Valores negativos lo acercan al eje.
//             // 'offset' controla la separación base.
//             label={{ 
//               value: yLabel, 
//               angle: -90, 
//               position: "insideLeft", 
//               dx: 10, // <--- ESTO ACERCA EL TÍTULO VERTICAL AL EJE
//               style: { textAnchor: 'middle', fill: '#666', fontWeight: 600, fontSize: '19px' } 
//             }} 
//             // Tamaño de los números en el eje Y (V o I)
//             style={{ fontSize: "14px" }}
//             domain={['auto', 'auto']} 
//           />
          
//           <Tooltip content={<CustomTooltip unit={unit} startTime={startTime} />} />
          
//           <Area
//             type="monotone"
//             dataKey={dataKey}
//             stroke={color}
//             fillOpacity={1}
//             fill={`url(#color${dataKey})`}
//             animationDuration={300}
//             isAnimationActive={true}
//             name={dataKey === "voltage" ? "Voltage" : "Current"}
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default RealTimeChart;



// CÓDIGO INCORRECTO, volver a la versión anterior
import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from "recharts";
import { Box, Typography } from "@mui/material";

// Helper para tiempo detallado en Tooltip
const getRelativeTimeDetailed = (timestamp, startTime) => {
  if (!timestamp || !startTime) return "0.0s";
  const diff = (timestamp - startTime) / 1000;
  return `${diff.toFixed(1)}s`;
};

// Helper para tiempo entero en Eje X
const getRelativeTimeInteger = (timestamp, startTime) => {
  if (!timestamp || !startTime) return "0";
  const diff = (timestamp - startTime) / 1000; 
  return Math.floor(diff).toString(); 
};

const CustomTooltip = ({ active, payload, label, unit, startTime }) => {
  if (active && payload && payload.length) {
    const timeStr = getRelativeTimeDetailed(label, startTime);
    return (
      <Box sx={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #ccc", p: 1, borderRadius: 1, boxShadow: 2 }}>
        <Typography variant="body2" color="text.primary">
          <span style={{ fontWeight: "bold" }}>Time: </span>
          <span>{timeStr}</span>
        </Typography>
        <Typography variant="body2" color="text.primary">
          <span style={{ fontWeight: "bold" }}>{payload[0].name}: </span>
          <span style={{ color: payload[0].stroke }}>{payload[0].value} {unit}</span>
        </Typography>
      </Box>
    );
  }
  return null;
};

const RealTimeChart = ({ data, dataKey, color = "#8884d8", yLabel, unit, chartId }) => {
  // 1. PROTECCIÓN: Si no hay datos, mostramos un mensaje en lugar de romper la gráfica
  if (!data || data.length === 0) {
    return (
      <div id={chartId} style={{ 
          width: "100%", height: "300px", 
          backgroundColor: "#f5f5f5", 
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "8px", border: "1px dashed #ccc"
      }}>
        <Typography variant="body2" color="text.secondary">
          No data to display yet
        </Typography>
      </div>
    );
  }

  const startTime = data[0].timestamp;

  return (
    // 2. CORRECCIÓN WIDTH: Usamos 99% en lugar de 100% para evitar bucles de redimensionamiento
    // que causan el error "width(-1)" en algunos navegadores.
    <div id={chartId} style={{ width: "99%", height: "300px", minHeight: "300px", backgroundColor: "#fff" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => getRelativeTimeInteger(tick, startTime)}
            style={{ fontSize: "12px" }}
            interval="preserveStartEnd"
            dy={5}
          >
            <Label value="Time (s)" offset={0} position="insideBottom" style={{ fontSize: '12px', fill: '#666', fontWeight: 600 }} />
          </XAxis>
          
          <YAxis 
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: "insideLeft", 
              dx: 10, 
              style: { textAnchor: 'middle', fill: '#666', fontWeight: 600, fontSize: '12px' } 
            }} 
            style={{ fontSize: "12px" }}
            domain={['auto', 'auto']} 
          />
          
          <Tooltip content={<CustomTooltip unit={unit} startTime={startTime} />} />
          
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fillOpacity={1}
            fill={`url(#color${dataKey})`}
            animationDuration={300}
            isAnimationActive={true}
            name={dataKey === "voltage" ? "Voltage" : "Current"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;