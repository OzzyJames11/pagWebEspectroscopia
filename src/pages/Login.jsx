import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginWithGoogle } from '../Redux/Actions/authActions.jsx';
import { useNavigate } from 'react-router-dom'; // Importar
import '../assets/css/Login.css';
import image from '../assets/img/estudiantes.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Hook para navegación
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    // Redirigir si el usuario está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirigir al home
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(login(email, password));
    };

    const handleGoogleLogin = () => {
        dispatch(loginWithGoogle());
    };


    return (
        <div className="login-container">
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

                <div className="create-account">
                    <span style={{ color: '#007bff' }}>Don't you have an account? </span>
                    <a href="/register">Create an account</a>
                </div>

                <div className="social-login">
                    <button className="google-button" onClick={handleGoogleLogin}>
                        Sign in with Google
                    </button>
                </div>
            </div>

            <div className="login-image">
                <img src={image} alt="Login" />
            </div>
        </div>
    );
};

export default Login;
