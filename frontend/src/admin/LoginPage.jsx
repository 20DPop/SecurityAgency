import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import './LoginPage.css';
import PasswordInput from '../components/PasswordInput'; // <-- MODIFICARE: Folosim componenta de parolă

export default function LoginPage({ onLogin }) {
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
      // <-- MODIFICARE: Folosim apiClient, fără config și URL complet
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
              required
              className="form-input"
            />
          </div>
          
          {/* <-- MODIFICARE: Înlocuim input-ul de parolă cu componenta PasswordInput */}
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