import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../Redux/Actions/authActions';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Register.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institution, setInstitution] = useState(''); // opcional
  const [country, setCountry] = useState('');         // opcional
  const [alertMessage, setAlertMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match");
      return;
    }

    try {
      const name = `${firstName} ${lastName}`;

      // 🔹 role_id fijo para "estudiante"
      const userData = {
        name,
        email,
        password,
        institution: institution || null,
        country: country || null,
        role_id: 2, // 👈 siempre será estudiante
      };

      await dispatch(register(userData));
      navigate("/login");
    } catch (error) {
      console.error("Error en el registro:", error);
      setAlertMessage(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 style={{ color: '#000000' }}>Create an Account</h2>

        {/* Mensaje de error */}
        {alertMessage && (
          <div className="register-alert">
            <p style={{ color: 'red', marginBottom: '1rem' }}>{alertMessage}</p>
          </div>
        )}

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="register-input"
        />

        {/* Campos opcionales */}
        <input
          type="text"
          placeholder="Institution (optional)"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="register-input"
        />
        <input
          type="text"
          placeholder="Country (optional)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="register-input"
        />

        {/* 👇 Se eliminó el campo de selección de rol */}

        <button
          type="submit"
          className="register-button"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;
