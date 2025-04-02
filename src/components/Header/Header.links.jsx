import React from 'react';
import { Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    Home,
    LocalHospital,
} from '@mui/icons-material'; // Íconos
import styles from '../../assets/css/headerLinks.module.css'; // Importa los estilos de HeaderLinks

const HeaderLinks = ({ divider, closeDrawer }) => {
    return (
        <>
            {/* Enlace a Inicio */}
            <Link onClick={closeDrawer} to="/" className={styles.navLink}>
                <Button className={styles.button}>
                    <Home className={styles.icons} />
                    <span className={styles.items}>Home</span>
                </Button>
            </Link>
            {divider && <Divider className={styles.divider} />}

            {/* Enlace a Experimentos */}
            <Link onClick={closeDrawer} to="/experiments/experimentchooser" className={styles.navLink}>
                <Button className={styles.button}>
                    <LocalHospital className={styles.icons} />
                    <span className={styles.items}>Experiment</span>
                </Button>
            </Link>
            {divider && <Divider className={styles.divider} />}
        </>
    );
};

export default HeaderLinks;

