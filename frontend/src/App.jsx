import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './admin/Header';
import HomePage from './admin/HomePage';
import LoginPage from './admin/LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import Sesizari from './admin/Sesizari';
import SesizareDetalii from './admin/SesizareDetalii';
import Solicitari  from './admin/Solicitari';
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
import ProcesVerbal from './documents/ProcesVerbal'; 

// --- Componenta Dashboard (Helper) Corectată ---
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
      content = <p style={{ padding: '50px', textAlign: 'center' }}>Rol necunoscut.</p>;
  }

  return (
    <div>
      {content}
    </div>
  );
}

// --- Componenta Principală App ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sesizari, setSesizari] = useState({ prelucrata: [], inCurs: [], rezolvata: [] });
  const [solicitari, setSolicitari] = useState({ prelucrata: [], inCurs: [], rezolvata: [] });
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
        
        {/* Rutele generale pentru Admin */}
        <Route path="/sesizari" element={<Sesizari sesizari={sesizari} setSesizari={setSesizari} />} />
        <Route path="/sesizare/:id" element={<SesizareDetalii sesizari={sesizari} setSesizari={setSesizari} />} />
        <Route path="/solicitari" element={<Solicitari solicitari={solicitari} setSolicitari={setSolicitari} />} />
        <Route path="/solicitari/:id" element={<SolicitariDetalii solicitari={solicitari} setSolicitari={setSolicitari} />} />
        <Route path="/adauga-angajat" element={<AdaugaAngajat />} />
        <Route path="/adauga-firma" element={<AdaugaFirma />} />

        {/* Rutele pentru Beneficiar (protejate simplu) */}
        <Route path="/beneficiar" element={ currentUser?.role === "beneficiar" ? <BeneficiarDashboard /> : <p>Acces interzis.</p> } />
        <Route path="/sesizariB" element={ currentUser?.role === "beneficiar" ? <SesizariB sesizari={sesizariBeneficiar} setSesizari={setSesizariBeneficiar} /> : <p>Acces interzis.</p> } />
        <Route path="/adauga-sesizare" element={ currentUser?.role === "beneficiar" ? <AdaugaSesizare setSesizari={setSesizariBeneficiar} /> : <p>Acces interzis.</p> } />
        <Route path="/solicitariB" element={ currentUser?.role === "beneficiar" ? <SolicitariB solicitari={solicitariBeneficiar} /> : <p>Acces interzis.</p> } />
        <Route path="/adauga-solicitare" element={ currentUser?.role === "beneficiar" ? <AdaugaSolicitare setSolicitari={setSolicitariBeneficiar} /> : <p>Acces interzis.</p> } />

        {/* Ruta pentru Proces Verbal */}
        <Route path="/proces-verbal/:pontajId" element={<ProcesVerbal />} />

        {/* --- RUTE SPECIALE PENTRU VIZUALIZARE (ADMINISTRATOR) --- */}
        {/* Acestea corespund butoanelor "Vezi ca..." */}
        <Route 
          path="/admin/dashboard" 
          element={currentUser?.role === 'administrator' ? <AdminDashboard /> : <p>Acces interzis. Doar pentru Administrator.</p>} 
        />
        <Route 
          path="/beneficiar/dashboard" 
          element={currentUser?.role === 'administrator' ? <BeneficiarDashboard /> : <p>Acces interzis. Doar pentru Administrator.</p>} 
        />
        <Route 
          path="/paznic/dashboard" 
          element={currentUser?.role === 'administrator' ? <PaznicDashboard /> : <p>Acces interzis. Doar pentru Administrator.</p>} 
        />

      </Routes>
    </Router>
  );
}