import React from "react";
import { Link } from "react-router-dom";
import "./BeneficiarDashboard.css";

export default function BeneficiarDashboard() {
  return (
    <div className="beneficiar-dashboard">
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">

          <Link to="/solicitariB" className="card link-card">📄<p>Solicitări</p></Link>
          {/* <div className="card">📄<p>Solicitări</p></div> */}
          <Link to="/incidenteB" className="card link-card">🚨<p>Incidente</p></Link>
          {/* <div className="card">🚨<p>Incidente</p></div> */}
          <Link to="/angajatiB" className="card link-card">👤<p>Angajați</p></Link>
          {/* <div className="card">✅<p>Prezență Angajați</p></div> */}
          <Link to="/prezentaAngajati" className="card link-card">✅<p>Prezență Angajați</p></Link>
        </div>
      </main>
    </div>
  );
}
