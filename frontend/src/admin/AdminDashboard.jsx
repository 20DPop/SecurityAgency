import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <main>
        <h1 className="page-title ">Home</h1>
        <div className="cards-container">

          <Link to="/solicitari" className="card link-card">📄<p>Solicitări</p></Link>

          <Link to="/alocare-paznici" className="card link-card">👥<p>Alocare Paznici</p></Link>
          <Link to="/incidente" className="card link-card">🚨<p>Incidente</p></Link>
          {/* <div className="card">👤<p>Angajați</p></div> */}
          <Link to="/angajati" className="card link-card">👤<p>Angajați</p></Link>
          <Link to="/adauga-angajat" className="card link-card">➕<p>Adăugare Angajat</p></Link>
          <Link to="/angajati-in-tura" className="card link-card">✅<p>Prezență Angajați</p></Link>
          <Link to="/firmacolaboratoare" className="card link-card">🏢<p>Firme colaboratoare</p></Link>
          <Link to="/adauga-firma" className="card link-card">💼<p>Adăugare Firmă</p></Link>
          <Link to="/documente" className="card link-card">📂<p>Documente</p></Link>
        </div>
      </main>
    </div>
  );
}
