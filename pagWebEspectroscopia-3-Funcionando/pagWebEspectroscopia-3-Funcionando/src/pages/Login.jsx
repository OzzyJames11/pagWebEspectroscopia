import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Redux/Actions/authActions'; // ✅ Solo usamos login del backend
import { useNavigate, Link } from 'react-router-dom';
import '../assets/css/Login.css';
import image from '../assets/img/estudiantes.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Redirige si ya está logueado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(email, password));
      setAlertMessage(''); // Limpiar errores previos
    } catch (error) {
      // Captura error del backend o Redux
      console.error('Login error:', error);

      if (error.response?.status === 401) {
        setAlertMessage('Invalid credentials. Please try again.');
      } else {
        setAlertMessage(
          error.response?.data?.message ||
            'Login failed. Please try again later.'
        );
      }
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
        <button
          type="submit"
          className="login-button"
          onClick={handleLogin}
        >
          Login
        </button>

        <div className="create-account">
          <span style={{ color: '#007bff' }}>Don't you have an account? </span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>

      <div className="login-image">
        <img src={image} alt="Login" />
      </div>
    </div>
  );
};

export default Login;
