
// Analizar para borrar proximamente

import React from 'react';
import classNames from 'classnames'; // Importa classnames para combinar clases
import styles from '../../assets/css/image.module.css'; // Importa los estilos CSS

// Componente funcional Image
const Image = (props) => {
    const {
        src,
        alt,
        width,
        height,
        style,
        className,
    } = props;

    // Combina las clases
    const imageClasses = classNames(styles.img, className); // Aplica la clase 'img' y las clases adicionales

    return (
        <img
            src={src} // Ruta de la imagen
            alt={alt} // Texto alternativo
            width={width} // Ancho de la imagen
            height={height} // Altura de la imagen
            className={imageClasses} // Aplica las clases combinadas
            style={style} // Estilos adicionales
        />
    );
};

export default Image; // Exporta el componente