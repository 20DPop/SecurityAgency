import React from "react";
import { Link } from "react-router-dom";
import "./BeneficiarDashboard.css";

export default function BeneficiarDashboard() {
  return (
    <div className="beneficiar-dashboard">
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">
          <Link to="/sesizariB" className="card link-card">⚠️<p>Sesizări</p></Link>
          <Link to="/solicitariB" className="card link-card">📄<p>Solicitări</p></Link>
          {/* <div className="card">📄<p>Solicitări</p></div> */}
          <div className="card">🚨<p>Incidente</p></div>
          <div className="card">👤<p>Angajați</p></div>
          <div className="card">✅<p>Prezență Angajați</p></div>
        </div>
      </main>
    </div>
  );
}
