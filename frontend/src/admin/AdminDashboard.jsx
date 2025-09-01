import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">

          <Link to="/solicitari" className="card link-card">📄<p>Solicitări</p></Link>

          <Link to="/alocare-paznici" className="card link-card">👥<p>Alocare Paznici</p></Link>
          <Link to="/incidente" className="card link-card">🚨<p>Incidente</p></Link>
          {/* <div className="card">👤<p>Angajați</p></div> */}
          <Link to="/angajati" className="card link-card">👤<p>Angajați</p></Link>
          <Link to="/adauga-angajat" className="card link-card">➕<p>Adăugare Angajat</p></Link>

          <div className="card">✅<p>Prezență Angajați</p></div>
          <Link to="/firmacolabolatoare" className="card link-card">🏢<p>Firme colaboratoare</p></Link>
          <Link to="/adauga-firma" className="card link-card">💼<p>Adăugare Firmă</p></Link>
          
        </div>
      </main>
    </div>
  );
}
