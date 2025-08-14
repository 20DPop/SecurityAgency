import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';

function Dashboard({ user, onLogout }) {
  let content;

  switch (user.role) {
    case 'admin':
      content = <AdminDashboard />;
      break;
    case 'collaborator':
      content = <h2 style={{ padding: '50px', textAlign: 'center' }}>
        Bun venit, {user.name}! (Portal Colaborator)
      </h2>;
      break;
    case 'guard':
      content = <h3 style={{ padding: '50px', textAlign: 'center' }}>
        Bine ai venit, {user.name}! (Portal Paznic)
      </h3>;
      break;
    default:
      content = <p style={{ padding: '50px', textAlign: 'center' }}>
        Rol necunoscut.
      </p>;
  }

  return (
    <div>
      {content}
      {/* <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={onLogout}>Deconectare</button>
      </div> */}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <Header user={currentUser} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              <Dashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <HomePage />
            )
          }
        />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
}
