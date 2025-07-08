import {
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebaseConfig.js';

// Acción login exitoso
export const loginSuccess = (user) => ({
  type: 'LOGIN_SUCCESS',
  payload: {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
  },
});

// Acción logout
export const logoutSuccess = () => ({
  type: 'LOGOUT_SUCCESS',
});

// LOGIN CON CORREO Y CONTRASEÑA
export const login = (email, password) => async (dispatch) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert('Please verify your email before logging in.');
      await signOut(auth);
      return;
    }

    dispatch(loginSuccess(user));
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.message);
    alert('Error al iniciar sesión: ' + error.message);
  }
};

// LOGIN CON GOOGLE
export const loginWithGoogle = () => async (dispatch) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    dispatch(loginSuccess(user));
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error.message);
    alert('Error al iniciar sesión con Google: ' + error.message);
  }
};

// LOGOUT
export const logout = () => async (dispatch) => {
  try {
    await signOut(auth);
    dispatch(logoutSuccess());
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
    alert('Error al cerrar sesión: ' + error.message);
  }
};

// REGISTRO CON EMAIL (requiere verificación)
export const registerWithEmail = (firstName, lastName, email, password, navigate) => async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    await sendEmailVerification(user);
    alert('A verification email has been sent. Please check your inbox.');

    await signOut(auth); // Salir para forzar verificación previa
    navigate('/login');
  } catch (error) {
    console.error('Error al registrar:', error.message);
    alert('Error al registrar: ' + error.message);
  }
};

// RESET PASSWORD
export const resetPassword = (email) => async () => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert('Se ha enviado un correo para restablecer la contraseña.');
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error.message);
    alert('Error al restablecer la contraseña: ' + error.message);
  }
};
