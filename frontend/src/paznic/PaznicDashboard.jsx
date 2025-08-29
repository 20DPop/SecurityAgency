// Cale: src/paznic/PaznicDashboard.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./PaznicDashboard.css";

export default function PaznicDashboard() {
  // Am adăugat ID-uri de test pentru a simula navigarea
  const testQrCode = "post-principal-intrarea-A";
  const testPontajId = "pontaj-12345"; // ID de test pentru procesul verbal

  return (
    <div className="paznic-dashboard">
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">
          {/* Link-ul pentru pontare este deja corect */}
          <Link to={`/pontare/${testQrCode}`} className="card link-card">
            ⚠️<p>Pontare</p>
          </Link>
          
          {/* --- LINK MODIFICAT --- */}
          {/* Acum duce la ruta corectă și include un ID de test */}
          <Link to={`/proces-verbal/${testPontajId}`} className="card link-card">
            📄<p>Procese Verbale</p>
          </Link>
        </div>
      </main>
    </div>
  );
}