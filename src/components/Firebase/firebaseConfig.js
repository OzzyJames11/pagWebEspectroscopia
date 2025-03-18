import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAcB6-Px7vRohmd9JwI2yanC7Kw2fM-73E',
  authDomain: 'login-63a7c.firebaseapp.com',
  projectId: 'login-63a7c',
  storageBucket: 'login-63a7c.appspot.com',
  messagingSenderId: '416755317055',
  appId: '1:416755317055:web:e7e2d40be922814dcb3b8a',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar autenticación
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
