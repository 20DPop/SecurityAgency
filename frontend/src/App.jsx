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
    let content;
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
    return <div>{content}</div>;
  }

  // Componentă ajutătoare pentru a proteja rutele
  function ProtectedRoute({ user, allowedRoles, children }) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <p style={{ padding: "50px", textAlign: "center" }}>Acces interzis.</p>;
    }
    return children;
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
          {/* Ruta principală */}
          <Route path="/" element={currentUser ? <Dashboard user={currentUser} /> : <HomePage />} />
          
          {/* Rutele de Login */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/loginB" element={<LoginPageB onLogin={handleLogin} />} />
          <Route path="/loginP" element={<LoginPageP onLogin={handleLogin} />} />

          {/* --- RUTE PAZNIC --- */}
          <Route path="/pontare/:qrCode" element={
            <ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}>
              <PontarePage />
            </ProtectedRoute>
          }/>
          <Route path="/proces-verbal/:pontajId" element={
            <ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}>
              <ProcesVerbal />
            </ProtectedRoute>
          }/>
          <Route path="/proces-verbal-predare/:pontajId" element={
            <ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}>
              <ProcesVerbalPredarePrimire />
            </ProtectedRoute>
          }/>

          {/* <<<--- ÎNCEPUT MODIFICARE ---<<< */}
          {/* --- DASHBOARD-URI --- */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <AdminDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/beneficiar/dashboard" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar', 'administrator']}>
              <BeneficiarDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/paznic/dashboard" element={
            <ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}>
              <PaznicDashboard />
            </ProtectedRoute>
          }/>
          {/* <<<--- SFÂRȘIT MODIFICARE ---<<< */}
          
          {/* --- SESIZĂRI & SOLICITĂRI (Admin) --- */}
          <Route path="/sesizari" element={<Sesizari sesizari={sesizari} setSesizari={setSesizari} />} />
          <Route path="/sesizare/:id" element={<SesizareDetalii sesizari={sesizari} setSesizari={setSesizari} />} />
          <Route path="/solicitari" element={<Solicitari solicitari={solicitari} setSolicitari={setSolicitari} />} />
          <Route path="/solicitari/:id" element={<SolicitariDetalii solicitari={solicitari} setSolicitari={setSolicitari} />} />

          {/* --- ADMIN --- */}
          <Route path="/adauga-angajat" element={<AdaugaAngajat />} />
          <Route path="/adauga-firma" element={<AdaugaFirma />} />
          <Route path="/urmarire/:id" element={<UrmarireAngajat />} />
          <Route path="/istoric-incidente" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <IstoricIncidente />
            </ProtectedRoute>
          }/>
          <Route path="/documente" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <Documente />
            </ProtectedRoute>
          }/> 
          <Route path="/incidente" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <Incidente />
            </ProtectedRoute>
          }/>
          <Route path="/alocare-paznici" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <AlocarePaznici />
            </ProtectedRoute>
          }/>
          <Route path="/angajati" element={<Angajati />} />
          <Route path="/firmacolaboratoare" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <Firmacolaboratoare />
            </ProtectedRoute>
          }/>
          <Route path="/angajati-in-tura" element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin', 'administrator']}>
              <AngajatiInTura />
            </ProtectedRoute>
          }/>

          <Route path="/raport-eveniment" element={
            <ProtectedRoute user={currentUser} allowedRoles={['paznic', 'administrator']}>
              <RaportEveniment />
            </ProtectedRoute>
          }/>

          {/* --- RUTA ADAUGARE ADMIN/AGENTIE PAZA --- */}
          <Route path="/administrator/adauga-admin" element={
            <ProtectedRoute user={currentUser} allowedRoles={['administrator']}>
              <AdaugaAdmin />
            </ProtectedRoute>
          }/>
        
          {/* --- RUTE BENEFICIAR --- */}
          <Route path="/beneficiar" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <BeneficiarDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/incidenteB" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <IncidenteB />
            </ProtectedRoute>
          }/>
          <Route path="/prezentaAngajati" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <PrezentaAngajati />
            </ProtectedRoute>
          } />
          <Route path="/sesizariB" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <SesizariB sesizari={sesizariBeneficiar} />
            </ProtectedRoute>
          }/>
          <Route path="/adauga-sesizare" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <AdaugaSesizare setSesizari={setSesizariBeneficiar} currentUser={currentUser} />
            </ProtectedRoute>
          }/>
          <Route path="/solicitariB" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <SolicitariB solicitari={solicitariBeneficiar} />
            </ProtectedRoute>
          }/>
          <Route path="/solicitariB/adauga" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <AdaugaSolicitare setSolicitari={setSolicitariBeneficiar} currentUser={currentUser} />
            </ProtectedRoute>
          }/>
          <Route path="/angajatiB" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <AngajatiB />
            </ProtectedRoute>
          }/>
          
          <Route path="/angajatiB/:id" element={
            <ProtectedRoute user={currentUser} allowedRoles={['beneficiar']}>
              <DetaliiAngajatB />
            </ProtectedRoute>
          }/>
          <Route path="/administrator/gestionare-admini" element={
            <ProtectedRoute user={currentUser} allowedRoles={['administrator']}>
              <GestionareAdmini />
            </ProtectedRoute>
          }/>
        </Routes>
      </Router>
    );
  }