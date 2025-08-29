import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './admin/Header';
import HomePage from './admin/HomePage';
import LoginPage from './admin/LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import Sesizari from './admin/Sesizari';
import SesizareDetalii from './admin/SesizareDetalii';
import Solicitari from './admin/Solicitari';
import SolicitariDetalii from './admin/SolicitariDatalii';
import BeneficiarDashboard from './beneficiar/BeneficiarDashboard';
import LoginPageB from './beneficiar/LoginPageB';
import SesizariB from './beneficiar/SesizariB';
import AdaugaSesizare from './beneficiar/AdaugaSesizare';
import SolicitariB from './beneficiar/SolicitariB';
import AdaugaSolicitare from './beneficiar/AdaugaSolicitare';
import PaznicDashboard from './paznic/PaznicDashboard';
import LoginPageP from './paznic/LoginPageP';
import AdministratorDashboard from './administrator/AdministratorDashboard';
import AdaugaAngajat from "./admin/AdaugaAngajat";
import AdaugaFirma from "./admin/AdaugaFirma";
import PontarePage from './paznic/PontarePage';

function Dashboard({ user }) {
  let content;

  // Logica este simplă: fiecare rol vede DOAR dashboard-ul său principal.
  // Navigarea pentru administrator se face prin link-urile din AdministratorDashboard.
  switch (user.role) {
    case 'administrator':
      content = <AdministratorDashboard />;
      break;
    case 'admin':
      content = <AdminDashboard />;
      break;
    case 'beneficiar':
      content = <BeneficiarDashboard />;
      break;
    case 'paznic':
      content = <PaznicDashboard />;
      break;
    default:
      content = (
        <p style={{ padding: '50px', textAlign: 'center' }}>
          Rol necunoscut.
        </p>
      );
  }

  return <div>{content}</div>;
}

// --- Componenta Principală App ---
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
      { id: 1, titlu: "Solicitare exemplu", data: "14/08/2025", firma: "Firma A", descriere: "O defecțiune a fost raportată la sistemul de supraveghere video de la poarta de nord.", pasi: "S-a contactat firma de mentenanță.", dataFinalizare: null }
    ],
    inCurs: [
      { id: 2, titlu: "Incident minor", data: "13/08/2025", firma: "Firma B", descriere: "Un vizitator neînregistrat a încercat să intre în clădire.", pasi: "Agentul de pază a reținut persoana și a anunțat poliția.", dataFinalizare: null }
    ],
    rezolvata: [
      { id: 3, titlu: "Alarmă falsă", data: "12/08/2025", firma: "Firma A", descriere: "Alarma de incendiu a pornit din cauza aburului de la bucătărie.", pasi: "S-a resetat sistemul de alarmă.", dataFinalizare: "12/08/2025" }
    ]
  });

  const [sesizariBeneficiar, setSesizariBeneficiar] = useState([]);
  const [solicitariBeneficiar, setSolicitariBeneficiar] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <Router>
      <Header user={currentUser} onLogout={handleLogout} />
      <Routes>
        {/* Ruta principală care afișează dashboard-ul corect în funcție de rol */}
        <Route path="/" element={currentUser ? <Dashboard user={currentUser} /> : <HomePage />} />
        
        {/* Rutele de Login */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/loginB" element={<LoginPageB onLogin={handleLogin} />} />
        <Route path="/loginP" element={<LoginPageP onLogin={handleLogin} />} />

        {/* ✅ Ruta pentru Pontare */}
        <Route 
          path="/pontare" 
          element={
            currentUser && currentUser.role === "paznic" 
              ? <PontarePage /> 
              : <p style={{ padding: "50px", textAlign: "center" }}>
                  Acces interzis.
                </p>
          } 
        />

        {/* --- SESIZĂRI --- */}
        <Route 
          path="/admin/dashboard" 
          element={currentUser?.role === 'administrator' ? <AdminDashboard /> : <p>Acces interzis. Doar pentru Administrator.</p>} 
        />
        <Route 
          path="/beneficiar/dashboard" 
          element={currentUser?.role === 'administrator' ? <BeneficiarDashboard /> : <p>Acces interzis. Doar pentru Administrator.</p>} 
        />

        {/* --- SOLICITĂRI --- */}
        <Route 
          path="/solicitari" 
          element={<Solicitari solicitari={solicitari} setSolicitari={setSolicitari} />} 
        />
        <Route 
          path="/solicitari/:id" 
          element={<SolicitariDetalii solicitari={solicitari} setSolicitari={setSolicitari} />} 
        />

        {/* --- ADMIN --- */}
        <Route path="/adauga-angajat" element={<AdaugaAngajat />} />
        <Route path="/adauga-firma" element={<AdaugaFirma />} />

        {/* --- BENEFICIAR --- */}
        <Route 
          path="/beneficiar" 
          element={
            currentUser && currentUser.role === "beneficiar" 
              ? <BeneficiarDashboard /> 
              : <p style={{ padding: "50px", textAlign: "center" }}>
                  Acces interzis.
                </p>
          } 
        />

        <Route
          path="/sesizariB"
          element={
            currentUser && currentUser.role === "beneficiar"
              ? <SesizariB 
                  sesizari={sesizariBeneficiar} 
                  setSesizari={setSesizariBeneficiar} 
                  currentUser={currentUser} 
                />
              : <p style={{ padding: "50px", textAlign: "center" }}>
                  Acces interzis.
                </p>
          }
        />
        <Route
          path="/adauga-sesizare"
          element={
            currentUser && currentUser.role === "beneficiar"
              ? <AdaugaSesizare 
                  setSesizari={setSesizariBeneficiar} 
                  currentUser={currentUser} 
                />
              : <p style={{ padding: "50px", textAlign: "center" }}>
                  Acces interzis.
                </p>
          }
        />

        {/* --- SOLICITĂRI BENEFICIAR --- */}
        <Route
          path="/solicitariB"
          element={
            currentUser && currentUser.role === "beneficiar"
              ? <SolicitariB solicitari={solicitariBeneficiar} /> 
              : <p style={{ padding: "50px", textAlign: "center" }}>
                  Acces interzis.
                </p>
          }
        />
        <Route
          path="/adauga-solicitare"
          element={
            currentUser && currentUser.role === "beneficiar"
              ? <AdaugaSolicitare 
                  setSolicitari={setSolicitariBeneficiar} 
                  currentUser={currentUser} 
                />
              : <p style={{ padding: "50px", textAlign: "center" }}>
                  Acces interzis.
                </p>
          }
        />
      </Routes>
    </Router>
  );
}