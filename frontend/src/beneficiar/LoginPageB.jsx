import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // Importăm apiClient
import PasswordInput from '../components/PasswordInput'; // Importăm componenta de parolă
import './LoginPageB.css';

export default function LoginPageB({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Folosim apiClient pentru a face cererea de login
      const { data } = await apiClient.post('/auth/login', { email, password });
      
      onLogin(data); 
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Log In Beneficiar</h2>
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
              required
              className="form-input"
            />
          </div>
          
          <PasswordInput
            label="Parolă"
            id="password"
            name="password"
            placeholder="Introdu parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />

          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Se conectează...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}