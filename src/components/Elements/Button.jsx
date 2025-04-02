import React from 'react';
import '../../assets/css/Elements/Button.css'; // Importar el archivo CSS

const Button = ({ 
    children, 
    onClick, 
    variant = 'contained', 
    color = 'primary', 
    fullWidth = false, 
    align = 'left', 
    disabled = false,
    marginTop = 0, // Nueva prop para el margen superior
    marginBottom = 0, // Nueva prop para el margen inferior
    extraClass = '', // Nueva prop para clases adicionales
}) => {
    // Clases CSS dinámicas basadas en las props
    const buttonClass = `button ${variant} ${color} ${fullWidth ? 'full-width' : ''} ${extraClass}`;

    return (
        <div 
            className={`button-container ${align}`} 
            style={{ 
                marginTop: `${marginTop * 8}px`, // Aplicar margen superior
                marginBottom: `${marginBottom * 8}px`, // Aplicar margen inferior
                width: fullWidth ? '100%' : 'auto' 
            }}
        >
            <button 
                className={buttonClass}
                onClick={onClick}
                disabled={disabled}
            >
                {children}
            </button>
        </div>
    );
};

export default Button;