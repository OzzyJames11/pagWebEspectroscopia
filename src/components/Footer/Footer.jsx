import React from 'react';
import { Image } from '..'; // Importa Container, Typography e Image
import Grid2 from '@mui/material/Grid2'; // Importa Grid2 correctamente
import { styled } from '@mui/system'; // Importa styled y shouldForwardProp
import logoEpn from '../../assets/img/logo-epn.png'; // Importa la imagen del logo
import { FooterStrings } from '../../assets/Strings'; // Importa los textos del footer
import styles from '../../assets/css/footer.module.css';; // Importa el archivo CSS desde la ruta correcta

import { Typography } from '@mui/material';


// Crea un componente Grid2 personalizado que no propague la prop `item` al DOM
const CustomGrid2 = styled(Grid2, {
    shouldForwardProp: (prop) => prop !== 'item', // Evita que la prop `item` se propague al DOM
})(({ theme }) => ({
    // Aquí puedes agregar estilos personalizados si es necesario
}));

const Footer = () => {
    const { labelDirection, directionStreet, directionCity, labelPhone, phone, labelMail, mail, footerText } = FooterStrings;

    return (
        <footer className={styles.footer}> {/* Aplica la clase CSS aquí */}
            <div className={styles.content}> {/* Contenedor del contenido */}
                <CustomGrid2 container justifyContent="center" spacing={4}>
                    {/* Logo */}
                    <CustomGrid2 item xs={12} sm={12} md={3} className={styles.logo}> {/* Aplica la clase CSS aquí */}
                        <Image
                            src={logoEpn} // Ruta de la imagen
                            alt="Logo EPN" // Texto alternativo
                            width={174} // Ancho de la imagen
                            height={106} // Altura de la imagen
                            style={{ display: 'block' }} // Estilos adicionales
                        />
                    </CustomGrid2>

                    {/* Dirección */}
                    <CustomGrid2 item xs={12} sm={4} md={3}>
                        <Typography align="left" variant="subtitle2" gutterBottom>
                            {labelDirection}
                        </Typography>
                        <Typography align="left" variant="body2" gutterBottom>
                            {directionStreet}
                        </Typography>
                        <Typography align="left" variant="body2">
                            {directionCity}
                        </Typography>
                    </CustomGrid2>

                    {/* Teléfono */}
                    <CustomGrid2 item xs={12} sm={4} md={3}>
                        <Typography variant="subtitle2" gutterBottom>
                            {labelPhone}
                        </Typography>
                        <Typography variant="body2">
                            {phone}
                        </Typography>
                    </CustomGrid2>

                    {/* Correo Electrónico */}
                    <CustomGrid2 item xs={12} sm={4} md={3}>
                        <Typography variant="subtitle2" gutterBottom>
                            {labelMail}
                        </Typography>
                        <Typography variant="body2">
                            {mail}
                        </Typography>
                    </CustomGrid2>
                </CustomGrid2>
            </div>

            {/* Derechos de Autor */}
            <div className={styles.coppyRight}> {/* Aplica la clase CSS aquí */}
                <Typography align="center" variant="body2">
                    {footerText}
                </Typography>
                <Typography  align="center" variant="body2">
                    Powered by OzzyJames11
                </Typography>
            </div>
        </footer>
    );
};

export default Footer;
