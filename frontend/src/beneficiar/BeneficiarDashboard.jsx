// Cale: frontend/src/beneficiar/BeneficiarDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./BeneficiarDashboard.css";

export default function BeneficiarDashboard() {
  // ✅ Verificăm dacă beneficiarul are acces la funcția GPS
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const areAccesGPS = currentUser.seeUpdates === 1;

  return (
    <div className="beneficiar-dashboard">
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">

          <Link to="/solicitariB" className="card link-card">📄<p>Solicitări</p></Link>
          <Link to="/incidenteB" className="card link-card">🚨<p>Incidente</p></Link>
          <Link to="/angajatiB" className="card link-card">👤<p>Angajați</p></Link>
          <Link to="/prezentaAngajati" className="card link-card">✅<p>Prezență Angajați</p></Link>

          {/* ✅ Card GPS - vizibil DOAR dacă seeUpdates === 1 */}
          {areAccesGPS && (
            <Link to="/traseu-live-list" className="card link-card">
              🗺️<p>Urmărire Traseu Live</p>
            </Link>
          )}

        </div>
      </main>
    </div>
  );
}