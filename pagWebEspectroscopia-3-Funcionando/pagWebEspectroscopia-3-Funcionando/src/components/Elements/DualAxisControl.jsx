import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import '../../assets/css/Elements/SliderComponent.css'; // Usamos el mismo CSS base

const DualAxisControl = ({ 
    axisName, 
    startValue, 
    endValue, 
    setStart, 
    setEnd, 
    min = -30, 
    max = 30, 
    disabled 
}) => {
    
    const marks = [
        { value: -30, label: '-30°' },
        { value: -15, label: '-15°' },
        { value: 0, label: '0°' },
        { value: 15, label: '15°' },
        { value: 30, label: '30°' },
    ];

    const commonSliderSx = {
        color: '#1976d2',
        height: 5,
        padding: '13px 0',
        '& .MuiSlider-thumb': {
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            width: 18, 
            height: 18,
            '&:focus, &:hover, &.Mui-active': { boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)'},
        },
        '& .MuiSlider-markLabel': {
            fontFamily: '"Poppins", sans-serif', 
            fontSize: '0.85rem',
            // fontWeight: 500,
            color: '#666',
            marginTop: '5px',
        },
        '& .MuiSlider-track': { bbackgroundColor: '#1976d2' },
        '& .MuiSlider-rail':  {backgroundColor: '#ccc'},
        // '& .MuiSlider-markLabel': {
        //                 fontFamily: '"Poppins", sans-serif', // Aplica tu fuente global
        //                 fontSize: '0.875rem', // Ajusta si los ves muy pequeños (14px)
        //                 // fontWeight: 500,   // Opcional: si los quieres un poco más gorditos
        //             },
        
    };

    return (
        <Box className="slider-container" sx={{ mb: 3, pb: 2 }}> {/* pb:4 da un poco más de espacio abajo para las marcas */}
            
            {/* ENCABEZADO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}> {/* mb:3 separa más el título de los sliders */}
                <Typography variant="body1" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '1.1rem', color: '#444' }}>
                    {axisName}
                </Typography>
                
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', color: '#666' }}>
                        Start: <span style={{ color: '#1976d2' }}>{startValue}°</span> 
                        &nbsp;&nbsp;|&nbsp;&nbsp; 
                        End: <span style={{ color: '#1976d2'/*, fontWeight: 600*/ }}>{endValue}°</span>
                    </Typography>
                </Box>
            </Box>

            {/* SLIDER 1: START */}
            <Box sx={{ px: 1, mb: 0 }}> {/* px:1 para margen lateral interno, mb:2 separa del slider de abajo */}
                <Slider
                    value={startValue}
                    onChange={(e, v) => setStart(v)}
                    min={min} max={max} step={5}
                    disabled={disabled}
                    valueLabelDisplay="auto"
                    marks={[{value:0, label:''},{value:15, label:''}, {value:-15, label:''},
                        {value:-30, label:''},{value:30, label:''}
                    ]} 
                    sx={commonSliderSx}
                />
                {/* <Typography variant="caption" sx={{ display: 'block', mt: -1, color: '#999', fontSize: '0.7rem', fontFamily: '"Poppins", sans-serif' }}> */}
                    {/* Start Position */}
                {/* </Typography> */}
            </Box>

            {/* SLIDER 2: END */}
            <Box sx={{ px: 1 }}>
                <Slider
                    value={endValue}
                    onChange={(e, v) => setEnd(v)}
                    min={min} max={max} step={5}
                    disabled={disabled}
                    valueLabelDisplay="auto"
                    marks={marks}
                    sx={commonSliderSx}
                />
                {/* La etiqueta "End Position" es opcional, a veces satura, mejor dejar solo las marcas */}
            </Box>
        </Box>
    );
};

export default DualAxisControl;