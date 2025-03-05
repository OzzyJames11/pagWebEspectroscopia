import React from 'react';
import { Container } from '@mui/material'; // Importa Container desde @mui/material
import { styled } from '@mui/system'; // Importa styled para crear estilos
import classnames from 'classnames'; // Importa classnames para combinar clases

// Define los estilos usando styled
const StyledContainer = styled(Container)(({ theme }) => ({
    padding: '1rem',
    minWidth: '360px',
}));

// Componente funcional
const CustomContainer = (props) => {
    const {
        children,
        className,
        ...rest
    } = props;

    // Combina las clases
    const classesContainer = classnames({
        [StyledContainer]: true, // Aplica los estilos de StyledContainer
        [className]: className, // Aplica las clases adicionales pasadas como prop
    });

    return (
        <StyledContainer
            {...rest} // Pasa las props restantes
            className={classesContainer} // Aplica las clases combinadas
        >
            {children} {/* Renderiza el contenido hijo */}
        </StyledContainer>
    );
};

export default CustomContainer; // Exporta el componente