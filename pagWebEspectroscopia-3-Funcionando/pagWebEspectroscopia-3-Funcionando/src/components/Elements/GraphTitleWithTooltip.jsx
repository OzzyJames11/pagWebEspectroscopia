import React from "react";
import { Typography, Tooltip } from "@mui/material";

const GraphTitleWithTooltip = ({ title, description }) => {
  return (
    <Tooltip title={description} arrow placement="top">
      <Typography variant="h5" sx={{ 
        cursor: 'help',
        borderBottom: '1px dotted',
        display: 'inline-block'
      }}>
        {title}
      </Typography>
    </Tooltip>
  );
};

export default GraphTitleWithTooltip;