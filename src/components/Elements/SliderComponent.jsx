// import React from 'react';
// import { Slider, Typography, Box } from '@mui/material';
// import '../../assets/css/Elements/SliderComponent.css';

// const SliderComponent = ({ value, onChange, label, min, max, step}) => {
//     return (
//         <Box className="slider-container">
//             <Typography variant="body1" gutterBottom>{label}: {value}°</Typography>
//             <Slider
//                 value={value}
//                 onChange={onChange}
//                 min={min}
//                 max={max}
//                 step={step}
//                 valueLabelDisplay="auto"
//             />
//         </Box>
//     );
// };

// export default SliderComponent;

import React from 'react';
import { Slider, Typography, Box } from '@mui/material';
import '../../assets/css/Elements/SliderComponent.css';

const SliderComponent = ({ value, onChange, label, min, max, step, disabled, actualAngle }) => {
    const marks = [
        {
          value: -45,
          label: '-45°',
        },
        {
          value: -30,
          label: '-30°',
        },
        {
          value: -15,
          label: '-15°',
        },
        {
          value: 0,
          label: '0°',
        },
        {
          value: 15,
          label: '15°',
        },
        {
          value: 30,
          label: '30°',
        },
        {
          value: 45,
          label: '45°',
        },
      ];
      
      
    return (
        <Box className="slider-container">
            <Typography variant="body1" gutterBottom >{label}: {actualAngle}°</Typography>
            <Slider
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                valueLabelDisplay="auto"
                marks={marks}
                sx={{
                    color: '#1976d2', // Color del slider
                    '& .MuiSlider-thumb': {
                        backgroundColor: '#1976d2', // Color del thumb (el círculo que se mueve)
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)', // Sombra al hacer hover
                        },
                    },
                    '& .MuiSlider-track': {
                        backgroundColor: '#1976d2', // Color de la línea activa
                    },
                    '& .MuiSlider-rail': {
                        backgroundColor: '#ccc', // Color de la línea inactiva
                    },
                }}
            />
        </Box>
    );
};

export default SliderComponent;