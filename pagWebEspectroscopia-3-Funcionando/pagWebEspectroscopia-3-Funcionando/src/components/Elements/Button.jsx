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
    marginTop = 0, 
    marginBottom = 0, 
    extraClass = '', 
    startIcon = null, // <--- NUEVA PROP: Recibe el ícono izquierdo
    endIcon = null    // <--- NUEVA PROP: Recibe el ícono derecho (opcional)
}) => {
    // Clases CSS dinámicas basadas en las props
    const buttonClass = `button ${variant} ${color} ${fullWidth ? 'full-width' : ''} ${extraClass}`;

    return (
        <div 
            className={`button-container ${align}`} 
            style={{ 
                marginTop: `${marginTop * 8}px`, 
                marginBottom: `${marginBottom * 8}px`, 
                width: fullWidth ? '100%' : 'auto' 
            }}
        >
            <button 
                className={buttonClass}
                onClick={onClick}
                disabled={disabled}
                // AGREGAMOS ESTILOS FLEX PARA ALINEAR ÍCONO Y TEXTO
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px' // Espacio entre el ícono y el texto
                }}
            >
                {/* Si existe startIcon, lo mostramos dentro de un span para evitar deformaciones */}
                {startIcon && (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        {startIcon}
                    </span>
                )}

                {children}

                {/* Soporte para endIcon por si lo usas en el futuro */}
                {endIcon && (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        {endIcon}
                    </span>
                )}
            </button>
        </div>
    );
};

export default Button;