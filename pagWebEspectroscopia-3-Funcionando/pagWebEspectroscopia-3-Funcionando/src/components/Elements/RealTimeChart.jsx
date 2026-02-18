import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from "recharts";
import { Box, Typography } from "@mui/material";

// ✅ RUTA CORREGIDA SEGÚN TU INSTRUCCIÓN
import styles from "../../assets/css/Elements/RealTimeChart.module.css";

const getRelativeTimeDetailed = (timestamp, startTime) => {
  if (!timestamp || !startTime) return "0.0s";
  const diff = (timestamp - startTime) / 1000;
  return `${diff.toFixed(1)}s`;
};

const getRelativeTimeInteger = (timestamp, startTime) => {
  if (!timestamp || !startTime) return "0";
  const diff = (timestamp - startTime) / 1000; 
  return Math.floor(diff).toString(); 
};

const CustomTooltip = ({ active, payload, unit, startTime, angleKey, angleLabel }) => {
  if (active && payload && payload.length) {
    const timeStr = getRelativeTimeDetailed(payload[0].payload.timestamp, startTime);
    const dataPoint = payload[0].payload;
    const mainValue = Number(payload[0].value).toFixed(3);

    let angleValue = "--";
    if (angleKey && dataPoint[angleKey] !== undefined) {
        angleValue = dataPoint[angleKey];
    } else if (dataPoint.angle !== undefined) {
        angleValue = dataPoint.angle;
    }

    const labelToShow = angleLabel || "Angle";

    return (
      <Box sx={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #ccc", p: 1, borderRadius: 1, boxShadow: 2 }}>
        <Typography variant="body2" color="text.primary">
          <span style={{ fontWeight: "bold" }}>Time: </span>
          <span>{timeStr}</span>
        </Typography>
        <Typography variant="body2" color="text.primary">
          <span style={{ fontWeight: "bold" }}>{payload[0].name}: </span>
          <span style={{ color: payload[0].stroke }}>{mainValue} {unit}</span>
        </Typography>
        <Typography variant="body2" color="text.primary">
          <span style={{ fontWeight: "bold" }}>{labelToShow}: </span>
          <span>{angleValue}°</span>
        </Typography>
      </Box>
    );
  }
  return null;
};

const RealTimeChart = ({ 
    data, 
    dataKey, 
    color = "#8884d8", 
    yLabel, 
    unit, 
    chartId,
    angleKey, 
    angleLabel,
    customStartTime // ✅ NUEVA PROP: Para forzar el inicio del tiempo
}) => {
  
  // Si nos pasan un tiempo de inicio global, usamos ese. Si no, calculamos el del primer dato.
  const startTime = customStartTime 
    ? Number(customStartTime) 
    : (data.length > 0 ? Number(data[0].timestamp) : 0);

  return (
    <div id={chartId} className={styles.chartContainer} style={{ width: "100%", height: "300px", minHeight: "300px", backgroundColor: "#fff" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 12, bottom: 20 }}
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
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tick) => getRelativeTimeInteger(tick, startTime)}
            style={{ fontSize: "14px" }}
            dy={5}
          >
            <Label value="Time (s)" offset={0} position="insideBottom" style={{ fontSize: '19px', fill: '#666', fontWeight: 600 }} dy={15} />
          </XAxis>
          
          <YAxis 
            type="number"
            // CAMBIO 2: 'width={60}' reserva espacio fijo para números y título.
            width={60} 
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: "insideLeft", 
              // CAMBIO 3: Ajuste fino de posición (dx) para centrarlo en el margen reservado
              dx: -4, 
              style: { textAnchor: 'middle', fill: '#666', fontWeight: 600, fontSize: '19px' } 
            }} 
            style={{ fontSize: "14px" }}
            domain={['auto', 'auto']}
            tickFormatter={(number) => Number(number).toFixed(2)}
          />
          
          <Tooltip 
            content={
                <CustomTooltip 
                    unit={unit} 
                    startTime={startTime} 
                    angleKey={angleKey} 
                    angleLabel={angleLabel}
                />
            } 
          />
          
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