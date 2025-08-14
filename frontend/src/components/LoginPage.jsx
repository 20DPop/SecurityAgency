import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importă useNavigate
import './LoginPage.css';
import users from '../users.json'; // Importă direct fișierul JSON

// LoginPage primește o funcție onLogin ca prop
export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook pentru a redirecționa

  const handleLogin = (event) => {
    event.preventDefault(); // Oprește reîncărcarea paginii

    // Caută utilizatorul în lista importată
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      // Dacă utilizatorul este găsit, apelează funcția onLogin din App.jsx
      onLogin(foundUser);
      // Și redirecționează utilizatorul către pagina principală
      navigate('/');
    } else {
      // Dacă nu, afișează o eroare
      setError('Username sau parolă incorectă!');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Username</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              placeholder="Introdu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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