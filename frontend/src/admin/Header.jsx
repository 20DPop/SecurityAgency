import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

// Header primește informația despre utilizator (user) și funcția de logout
export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Apelează funcția de logout din App.jsx
    navigate('/'); // Redirecționează la pagina principală
  };

  return (
    <header className="header">
      <img 
    src="/logo.png"  // înlocuiește cu calea reală către logo
    alt="Logo Security" 
    className="logo"
  />
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          // Dacă există un utilizator logat, afișează numele și butonul de Logout
          <>
            {/* <span style={{ margin: '0 15px', color: 'white' }}>Salut, {user.name}</span> */}
            <button onClick={handleLogoutClick} className="login-btn">
              Log Out
            </button>
          </>
        ) : (
          // Altfel, afișează butonul de Log In
          <Link to="/login" className="login-btn">
            Log In
          </Link>
        )}
      </nav>
    </header>
  );
}