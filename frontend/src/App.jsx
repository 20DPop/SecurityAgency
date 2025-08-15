import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import Sesizari from './components/Sesizari';
import SesizareDetalii from './components/SesizareDetalii';
import Solicitari  from './components/Solicitari';
import SolicitariDetalii from './components/SolicitariDatalii';

function Dashboard({ user, onLogout }) {
  let content;

  switch (user.role) {
    case 'administrator':
      content = <AdminDashboard/>
      break;
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

    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sesizari, setSesizari] = useState({
    prelucrata: [
      { id: 1, titlu: "Sesizare exemplu", data: "14/08/2025", firma: "Firma A", descriere: "O defecțiune a fost raportată la sistemul de supraveghere video de la poarta de nord.", pasi: "S-a contactat firma de mentenanță.", dataFinalizare: null }
    ],
    inCurs: [
      { id: 2, titlu: "Incident minor", data: "13/08/2025", firma: "Firma B", descriere: "Un vizitator neînregistrat a încercat să intre în clădire.", pasi: "Agentul de pază a reținut persoana și a anunțat poliția.", dataFinalizare: null }
    ],
    rezolvata: [
      { id: 3, titlu: "Alarmă falsă", data: "12/08/2025", firma: "Firma A", descriere: "Alarma de incendiu a pornit din cauza aburului de la bucătărie.", pasi: "S-a resetat sistemul de alarmă.", dataFinalizare: "12/08/2025" }
    ]
  });
  const [solicitari, setSolicitari] = useState({
    prelucrata: [
      { id: 1, titlu: "Sesizare exemplu", data: "14/08/2025", firma: "Firma A", descriere: "O defecțiune a fost raportată la sistemul de supraveghere video de la poarta de nord.", pasi: "S-a contactat firma de mentenanță.", dataFinalizare: null }
    ],
    inCurs: [
      { id: 2, titlu: "Incident minor", data: "13/08/2025", firma: "Firma B", descriere: "Un vizitator neînregistrat a încercat să intre în clădire.", pasi: "Agentul de pază a reținut persoana și a anunțat poliția.", dataFinalizare: null }
    ],
    rezolvata: [
      { id: 3, titlu: "Alarmă falsă", data: "12/08/2025", firma: "Firma A", descriere: "Alarma de incendiu a pornit din cauza aburului de la bucătărie.", pasi: "S-a resetat sistemul de alarmă.", dataFinalizare: "12/08/2025" }
    ]
  });

  // La pornirea aplicației, verificăm dacă există user salvat în localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user)); // salvare în localStorage
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser"); // ștergere din localStorage
  };

  return (
    <Router>
      <Header user={currentUser} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Dashboard user={currentUser} /> : <HomePage />}
        />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        {/* Pasăm starea și funcția de setare către componente */}
        <Route 
          path="/sesizari" 
          element={<Sesizari sesizari={sesizari} setSesizari={setSesizari} />} 
        />
        {/* Adăugăm noua rută pentru detalii */}
        <Route 
          path="/sesizare/:id" 
          element={<SesizareDetalii sesizari={sesizari} setSesizari={setSesizari} />} 
        />
        <Route 
          path="/solicitari" 
          element={<Solicitari solicitari={solicitari} setSolicitari={setSolicitari} />} 
        />
        {/* Adăugăm noua rută pentru detalii */}
        <Route 
          path="/solicitari/:id" 
          element={<SolicitariDetalii solicitari={solicitari} setSolicitari={setSolicitari} />} 
        />
      </Routes>
    </Router>
  );
}
