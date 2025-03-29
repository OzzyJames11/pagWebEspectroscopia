import React from 'react';
import { Button, Divider, Avatar, IconButton, Tooltip, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home, LocalHospital, Login, Logout } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../Redux/Actions/authActions.jsx';
import styles from '../../assets/css/headerLinks.module.css';

const HeaderLinks = ({ divider, closeDrawer }) => {
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();

    // Obtener las iniciales del usuario
    const getInitials = () => {
        if (user?.displayName) {
            const [firstName, lastName] = user.displayName.split(' ');
            return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const handleLogout = () => {
        dispatch(logout());
        closeDrawer();
    };

    return (
        <Box className={styles.navContainer}>
            {/* Botones de navegación */}
            <Box className={styles.navLinks}>
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
            </Box>

            {/* Sección de usuario o botón de inicio de sesión */}
            {isAuthenticated ? (
                <Box className={styles.userSection}>
                    <Tooltip title={user?.displayName || user?.email}>
                        <Avatar className={styles.avatar}>
                            {getInitials()}
                        </Avatar>
                    </Tooltip>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.displayName || 'Usuario'}</span>
                        <span className={styles.userEmail}>{user?.email}</span>
                    </div>
                    <Tooltip title="Cerrar sesión">
                        <IconButton onClick={handleLogout} className={styles.logoutButton}>
                            <Logout />
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : (
                <Link onClick={closeDrawer} to="/login" className={styles.navLink}>
                    <Button className={styles.button}>
                        <Login className={styles.icons} />
                        <span className={styles.items}>Login</span>
                    </Button>
                </Link>
            )}
        </Box>
    );
};

export default HeaderLinks;
