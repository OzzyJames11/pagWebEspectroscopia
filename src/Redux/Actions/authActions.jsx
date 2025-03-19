import { signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../components/firebase/firebaseConfig';

export const loginSuccess = (user) => ({
    type: 'LOGIN_SUCCESS',
    payload: user,
});

export const logoutSuccess = () => ({
    type: 'LOGOUT_SUCCESS',
});

export const login = (email, password) => async (dispatch) => {
    try {
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
