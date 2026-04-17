import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Avatar, IconButton, Tooltip, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home, LocalHospital, Login, Logout, Event } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../Redux/Actions/authActions.jsx';
import styles from '../../assets/css/headerLinks.module.css';

const HeaderLinks = ({ divider, closeDrawer }) => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // const handleLogout = () => {
  // dispatch(logout());
  // closeDrawer?.();
  // navigate('/'); // Redirige al Home
  // };
  // const handleLogout = () => {
  //   // Si hay datos en peligro, advertimos antes de cerrar sesión
  //   if (window.datosEnPeligro) {
  //     const confirmar = window.confirm(
  //       "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi cierras sesión ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
  //     );
  //     if (!confirmar) return; // Si cancela, detenemos el logout
      
  //     window.datosEnPeligro = false; // Liberamos la variable
  //   }

  //   // Si todo está bien o aceptó, cerramos sesión normalmente
  //   dispatch(logout());
  //   closeDrawer?.();
  //   navigate('/'); 
  // };

  // const interceptarNavegacion = (e) => {
  //   // Revisamos si el Subsistema1 dejó la advertencia activada
  //   if (window.datosEnPeligro) {
  //     const confirmar = window.confirm(
  //       "⚠️ TIENES DATOS SIN GUARDAR.\n\nSi sales ahora, los datos se borrarán permanentemente.\n¿Estás seguro de salir?"
  //     );
  
  //     if (!confirmar) {
  //       e.preventDefault(); // Magia: Esto cancela el clic y evita que React Router cambie la página
  //       return;
  //     }
  //     // Si el usuario acepta perder los datos, limpiamos la variable para dejarlo salir
  //     window.datosEnPeligro = false;
  //   }
  
  //   // Si no hay peligro o el usuario aceptó, cerramos el menú lateral (tu código original)
  //   closeDrawer?.();
  // };
  const handleLogout = () => {
    // 🛑 PRIORIDAD 1: BARRIDO EN PROGRESO (Bloqueo Total)
    if (window.barridoEnProgreso) {
      window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the sweeping is finished before logging out.");
      return; 
    }

    // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR (Pregunta)
    if (window.datosEnPeligro) {
      const confirmar = window.confirm(
        "⚠️ UNSAVED DATA.\n\nIf you logout now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
      );
      if (!confirmar) return; 
      window.datosEnPeligro = false; 
    }

    dispatch(logout());
    closeDrawer?.();
    navigate('/'); 
  };

  const interceptarNavegacion = (e) => {
    // 🛑 PRIORIDAD 1: BARRIDO EN PROGRESO (Bloqueo Total)
    if (window.barridoEnProgreso) {
      window.alert("⚠️ EXPERIMENT IN PROGRESS\n\nPlease wait until the sweeping is finished before leaving the page.");
      e.preventDefault(); 
      return;
    }

    // ⚠️ PRIORIDAD 2: DATOS SIN GUARDAR (Pregunta)
    if (window.datosEnPeligro) {
      const confirmar = window.confirm(
        "⚠️ UNSAVED DATA.\n\nIf you leave now, unsaved data will be permanently deleted.\nAre you sure you want to exit?"
      );
      if (!confirmar) {
        e.preventDefault(); 
        return;
      }
      window.datosEnPeligro = false;
    }
  
    closeDrawer?.();
  };

  return (
    <Box className={styles.navContainer}>
      <Box className={styles.navLink}>
        <Link onClick={interceptarNavegacion} to="/" className={styles.navLink}>
          <Button className={styles.button}>
            <Home className={styles.icons} />
            <span className={styles.items}>Home</span>
          </Button>
        </Link>
        {divider && <Divider className={styles.divider} />}

        <Link onClick={interceptarNavegacion} to="/experiments/experimentchooser" className={styles.navLink}>
          <Button className={styles.button}>
            <LocalHospital className={styles.icons} />
            <span className={styles.items}>Experiment</span>
          </Button>
        </Link>
        {divider && <Divider className={styles.divider} />}

        {/* Solo mostrar si el usuario está autenticado */}
        {isAuthenticated && (
          <>
            <Link onClick={interceptarNavegacion} to="/calendarizacion" className={styles.navLink}>
              <Button className={styles.button}>
                <Event className={styles.icons} />
                <span className={styles.items}>Scheduling</span>
              </Button>
            </Link>
            {divider && <Divider className={styles.divider} />}
          </>
        )}
      </Box>

      {/* Sección de usuario o login */}
      {isAuthenticated ? (
        <Box className={styles.userSection}>
          <Tooltip title={user?.displayName || user?.email}>
            <Avatar className={styles.avatar}>{getInitials()}</Avatar>
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
        <Link onClick={interceptarNavegacion} to="/login" className={styles.navLink}>
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