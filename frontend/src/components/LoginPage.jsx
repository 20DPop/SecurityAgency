import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importă useNavigate
import './LoginPage.css';
import axios from 'axios';
import users from '../users.json'; // Importă direct fișierul JSON

// LoginPage primește o funcție onLogin ca prop
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook pentru a redirecționa

    const handleLogin = async (event) => {
    event.preventDefault();
    try {
    
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        'http://localhost:3000/api/auth/login', 
        { email, password }, 
        config
      );

      onLogin(data); 
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Introdu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Introdu parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}