import { signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../components/firebase/firebaseConfig.js';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

export const loginSuccess = (user) => ({
    type: 'LOGIN_SUCCESS',
    payload: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "", // Evitar undefined
    },
});

export const logoutSuccess = () => ({
    type: 'LOGOUT_SUCCESS',
});

export const login = (email, password) => async (dispatch) => {
    try {
        console.log("Iniciando sesión con:", email);  // Verificar llamadas repetidas
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        dispatch(loginSuccess(user));
    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
        alert('Error al iniciar sesión: ' + error.message);
    }
};


export const loginWithGoogle = () => async (dispatch) => {
    try {
        // USAR LA INSTANCIA EXPORTADA DESDE firebaseConfig.js
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        dispatch(loginSuccess(user));
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error.message);
        alert('Error al iniciar sesión con Google: ' + error.message);
    }
};

export const logout = () => async (dispatch) => {
    try {
        await signOut(auth);
        dispatch(logoutSuccess());
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Error al cerrar sesión: ' + error.message);
    }
};

export const registerWithEmail = (firstName, lastName, email, password, navigate) => async (dispatch) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Actualizar nombre y apellido en Firebase
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
        });

        // Solo enviar los datos mínimos del usuario a Redux para evitar exceso de información
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: `${firstName} ${lastName}`,
        };

        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });

        // Redirigir al home de manera segura
        navigate('/');
    } catch (error) {
        console.error('Error al registrar:', error.message);
        alert('Error al registrar: ' + error.message);
    }
};

export const resetPassword = (email) => async () => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Se ha enviado un correo para restablecer la contraseña.');
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error.message);
        alert('Error al restablecer la contraseña: ' + error.message);
    }
};