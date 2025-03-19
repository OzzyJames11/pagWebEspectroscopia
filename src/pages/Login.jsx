import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, loginWithGoogle } from '../Redux/Actions/authActions';
import '../assets/css/Login.css';
import image from '../assets/img/estudiantes.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    // Iniciar sesión con correo y contraseña
    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(login(email, password));
    };

    // Iniciar sesión con Google
    const handleGoogleLogin = () => {
        dispatch(loginWithGoogle());
    };

    return (
        <div className="login-container">
            {/* Cuadro de login alineado a la izquierda */}
            <div className="login-form">
                <h2>Sign in</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                />
                <button type="submit" className="login-button" onClick={handleLogin}>
                    Login
                </button>

                {/* Crear cuenta */}
                <div className="create-account">
                    <span>Don't have an account? </span>
                    <a href="/register">Create an account</a>
                </div>

                {/* Botón para iniciar sesión con Google */}
                <div className="social-login">
                    <button className="google-button" onClick={handleGoogleLogin}>
                        Sign in with Google
                    </button>
                </div>
            </div>

            {/* Imagen alineada a la derecha */}
            <div className="login-image">
                <img src={image} alt="Login" />
            </div>
        </div>
    );
};

export default Login;
