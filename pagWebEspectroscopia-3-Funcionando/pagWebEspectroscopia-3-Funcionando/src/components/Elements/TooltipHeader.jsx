import React from "react";
import { Tooltip, Typography } from "@mui/material";
//import "../../../src/assets/css/Elements/TooltipStyles.css";

const TooltipHeader = ({ title, tooltip }) => {
    return (
      <Tooltip 
        title={tooltip || ""}
        arrow
        placement="top"
        enterDelay={300}
        leaveDelay={200}
      >
        <Typography 
          variant="subtitle1" 
          component="span" 
          sx={{ 
            fontWeight: 'bold',
            cursor: 'help',
            borderBottom: '1px dotted',
            '&:hover': {
              borderBottomColor: 'text.primary'
            }
          }}
        >
          {title}
        </Typography>
      </Tooltip>
    );
  };
  
  export default TooltipHeader;