import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../components/firebase/firebaseConfig';

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

export const logout = () => async (dispatch) => {
    try {
        await signOut(auth);
        dispatch(logoutSuccess());
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Error al cerrar sesión: ' + error.message);
    }
};
