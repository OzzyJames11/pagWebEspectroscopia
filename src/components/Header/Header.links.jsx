import React from 'react';
import { Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home, LocalHospital, Login } from '@mui/icons-material';
import styles from '../../assets/css/headerLinks.module.css';

const HeaderLinks = ({ divider, closeDrawer }) => {
    return (
        <>
            <Link onClick={closeDrawer} to="/" className={styles.navLink}>
                <Button className={styles.button}>
                    <Home className={styles.icons} />
                    <span className={styles.items}>Home</span>
                </Button>
            </Link>
            {divider && <Divider className={styles.divider} />}

            <Link onClick={closeDrawer} to="/experiments/experimentchooser" className={styles.navLink}>
                <Button className={styles.button}>
                    <LocalHospital className={styles.icons} />
                    <span className={styles.items}>Experiment</span>
                </Button>
            </Link>
            {divider && <Divider className={styles.divider} />}

            {/* Nuevo botón para Login */}
            <Link onClick={closeDrawer} to="/login" className={styles.navLink}>
                <Button className={styles.button}>
                    <Login className={styles.icons} />
                    <span className={styles.items}>Login</span>
                </Button>
            </Link>
            {divider && <Divider className={styles.divider} />}
        </>
    );
};

export default HeaderLinks;
