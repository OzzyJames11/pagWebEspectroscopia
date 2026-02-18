import React from 'react';
import { Slider, Typography, Box } from '@mui/material';
import '../../assets/css/Elements/SliderComponent.css';

const SliderComponent = ({ value, onChange, label, min, max, step, disabled, actualAngle }) => {
    const marks = [
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
                    height: 5,
                    // padding: '13px 0',
                    '& .MuiSlider-thumb': {
                        backgroundColor: '#ffffff', // Color del thumb (el círculo que se mueve)
                        border: '2px solid currentColor',
                        width: 18, 
                        height: 18,
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

                    '& .MuiSlider-markLabel': {
                        fontFamily: '"Poppins", sans-serif', // Aplica tu fuente global
                        fontSize: '0.875rem', // Ajusta si los ves muy pequeños (14px)
                        // fontWeight: 500,   // Opcional: si los quieres un poco más gorditos
                    },
                }}
            />
        </Box>
    );
};

export default SliderComponent;