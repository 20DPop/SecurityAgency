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
import ProcesVerbal from './documents/ProcesVerbal';
import AlocarePaznici from './admin/AlocarePaznici'; 
import Angajati from "./admin/Angajati";
import Firmacolaboratoare from "./admin/Firmacolaboratoare";
import PrezentaAngajati from './beneficiar/PrezentaAngajati';
import AngajatiInTura from './admin/AngajatiInTura';
import ProcesVerbalPredarePrimire from './paznic/ProcesVerbalPredarePrimire';
import AngajatiB from "./beneficiar/AngajatiB";
import DetaliiAngajatB from "./beneficiar/AngajatBDetalii";
import UrmarireAngajat from './admin/UrmarireAngajat';
import RaportEveniment from './paznic/RaportEveniment';
import Incidente from './admin/Incidente';
import IncidenteB from './beneficiar/IncidenteB';
import IstoricIncidente from './admin/IstoricIncidente';
import Documente from './admin/Documente';
import AdaugaAdmin  from './administrator/AdaugaAdmin';
import GestionareAdmini from './administrator/GestionareAdmini';

function Dashboard({ user }) {
  switch (user.role) {
    case 'administrator': return <AdministratorDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'beneficiar': return <BeneficiarDashboard />;
    case 'paznic': return <PaznicDashboard />;
    default: return <p style={{ padding: '50px', textAlign: 'center' }}>Rol necunoscut.</p>;
  }
}

function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user || !allowedRoles.includes(user.role)) {
    return <p style={{ padding: "50px", textAlign: "center" }}>Acces interzis.</p>;
  }
  return children;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  // Stările pentru sesizări/solicitări sunt gestionate acum în componentele respective
  
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
        {/* Rute Publice */}
        <Route path="/" element={currentUser ? <Dashboard user={currentUser} /> : <HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/loginB" element={<LoginPageB onLogin={handleLogin} />} />
        <Route path="/loginP" element={<LoginPageP onLogin={handleLogin} />} />

        {/* --- DASHBOARD-URI PROTEJATE --- */}
        <Route path="/admin/dashboard" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/beneficiar/dashboard" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><BeneficiarDashboard /></ProtectedRoute>} />
        <Route path="/paznic/dashboard" element={<ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}><PaznicDashboard /></ProtectedRoute>} />
        
        {/* --- RUTE ADMINISTRATOR --- */}
        <Route path="/administrator/adauga-admin" element={<ProtectedRoute user={currentUser} allowedRoles={['administrator']}><AdaugaAdmin /></ProtectedRoute>} />
        <Route path="/administrator/gestionare-admini" element={<ProtectedRoute user={currentUser} allowedRoles={['administrator']}><GestionareAdmini /></ProtectedRoute>} />

        {/* --- RUTE ADMIN --- */}
        <Route path="/adauga-angajat" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><AdaugaAngajat /></ProtectedRoute>} />
        <Route path="/adauga-firma" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><AdaugaFirma /></ProtectedRoute>} />
        <Route path="/alocare-paznici" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><AlocarePaznici /></ProtectedRoute>} />
        <Route path="/angajati" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><Angajati /></ProtectedRoute>} />
        <Route path="/firmacolaboratoare" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><Firmacolaboratoare /></ProtectedRoute>} />
        <Route path="/angajati-in-tura" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><AngajatiInTura /></ProtectedRoute>} />
        <Route path="/incidente" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><Incidente /></ProtectedRoute>} />
        <Route path="/istoric-incidente" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><IstoricIncidente /></ProtectedRoute>} />
        <Route path="/documente" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><Documente /></ProtectedRoute>} />
        <Route path="/solicitari" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><Solicitari /></ProtectedRoute>} />
        <Route path="/solicitari/:id" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><SolicitariDetalii /></ProtectedRoute>} />
        {/* Am eliminat rutele duplicate pentru sesizări, deoarece 'Solicitari' face același lucru */}
        <Route path="/sesizari" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><Solicitari /></ProtectedRoute>} />
        <Route path="/sesizare/:id" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}><SolicitariDetalii /></ProtectedRoute>} />

        {/* --- RUTE BENEFICIAR --- */}
        <Route path="/incidenteB" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><IncidenteB /></ProtectedRoute>} />
        <Route path="/prezentaAngajati" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><PrezentaAngajati /></ProtectedRoute>} />
        <Route path="/solicitariB" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><SolicitariB /></ProtectedRoute>} />
        <Route path="/solicitariB/adauga" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}><AdaugaSolicitare /></ProtectedRoute>} />
        <Route path="/sesizariB" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><SesizariB /></ProtectedRoute>} />
        <Route path="/adauga-sesizare" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}><AdaugaSesizare /></ProtectedRoute>} />
        <Route path="/angajatiB" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><AngajatiB /></ProtectedRoute>} />
        <Route path="/angajatiB/:id" element={<ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}><DetaliiAngajatB /></ProtectedRoute>} />
        <Route path="/urmarire/:id" element={<ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator', 'beneficiar']}><UrmarireAngajat /></ProtectedRoute>} />

        {/* --- RUTE PAZNIC --- */}
        <Route path="/pontare/:qrCode" element={<ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}><PontarePage /></ProtectedRoute>} />
        <Route path="/proces-verbal/:pontajId" element={<ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}><ProcesVerbal /></ProtectedRoute>} />
        <Route path="/proces-verbal-predare/:pontajId" element={<ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}><ProcesVerbalPredarePrimire /></ProtectedRoute>} />
        <Route path="/raport-eveniment" element={<ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}><RaportEveniment /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}