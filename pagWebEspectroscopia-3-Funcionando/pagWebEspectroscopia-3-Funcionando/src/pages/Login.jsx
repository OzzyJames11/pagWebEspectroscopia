import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginWithGoogle, resetPassword } from '../Redux/Actions/authActions.jsx';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../assets/css/Login.css';
import image from '../assets/img/estudiantes.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Usamos una función wrapper para capturar errores personalizados
            await dispatch(login(email, password));
        } catch (error) {
            // Mensaje personalizado si no ha verificado su correo
            if (error.code === 'auth/email-not-verified') {
                setAlertMessage('Please verify your email before logging in.');
            } else {
                setAlertMessage('Login failed. Please check your credentials or try again later.');
            }
        }
    };

    const handleGoogleLogin = () => {
        dispatch(loginWithGoogle());
    };

    const handleResetPassword = () => {
        const emailPrompt = prompt('Enter your email to reset password:');
        if (emailPrompt) {
            dispatch(resetPassword(emailPrompt));
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Sign in</h2>

                {/* Alerta visual */}
                {alertMessage && (
                    <div className="login-alert">
                        <p style={{ color: 'red', marginBottom: '1rem' }}>{alertMessage}</p>
                    </div>
                )}

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

                <div className="forgot-password">
                    <button className="forgot-password-button" onClick={handleResetPassword}>
                        Forgot Password?
                    </button>
                </div>

                <div className="create-account">
                    <span style={{ color: '#007bff' }}>Don't you have an account? </span>
                    <Link to="/register">Create an account</Link>
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
