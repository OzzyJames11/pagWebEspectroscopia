import {
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
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
export const registerWithEmail = (firstName, lastName, email, password, navigate) => {
  return async (dispatch) => {
    try {
      // Crear usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enviar correo de verificación
      await sendEmailVerification(user);

      // Cerrar sesión hasta que verifique
      await signOut(auth);

      alert("Account created successfully. Please verify your email before logging in.");

      // Opcional: guardar datos en Redux o Firestore si lo usas
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: { email: user.email, firstName, lastName }
      });

      // Redirigir al login
      navigate("/login");

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Try another one.");
      } else {
        alert("Error creating account: " + error.message);
      }
      dispatch({ type: "REGISTER_FAIL", payload: error.message });
    }
  };
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
