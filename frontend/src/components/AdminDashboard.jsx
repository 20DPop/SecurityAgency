import React from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        {/* <div className="logo">
          <span role="img" aria-label="shield">🛡️</span> SECURITY AGENCY
        </div> */}
      </header>
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">
          <div className="card">⚠️<p>Sesizări</p></div>
          <div className="card">📄<p>Solicitări</p></div>
          <div className="card">🚨<p>Incidente</p></div>
          <div className="card">👤<p>Angajați</p></div>
          <div className="card">➕<p>Adăugare Angajat</p></div>
          <div className="card">✅<p>Prezență Angajați</p></div>
          <div className="card">🏢<p>Firme colaboratoare</p></div>
          <div className="card">💼<p>Adăugare firmă colaboratoare</p></div>
        </div>
      </main>
    </div>
  );
}
