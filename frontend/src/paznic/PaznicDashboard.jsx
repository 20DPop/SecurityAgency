import React from "react";
import { Link } from "react-router-dom";
import "./PaznicDashboard.css";

export default function PaznicDashboard() {
  // Am eliminat ID-urile de test, deoarece acum suntem conectați la backend.
  // QR Code-ul va fi scanat și va furniza un ID real.
  const qrCodePlaceholder = "scaneaza-un-cod-qr";

  return (
    <div className="paznic-dashboard">
      <main>
        <h1 className="page-title">Panou de Control Paznic</h1>
        <div className="cards-container">
          {/* Acest link va funcționa când se scanează un QR code care duce la o adresă de tip /pontare/some-qr-id */}
          <Link to={`/pontare/${qrCodePlaceholder}`} className="card link-card">
            <span style={{fontSize: '2rem'}}>🕒</span>
            <p>Pontare</p>
          </Link>
          
          <Link to="/raport-eveniment" className="card link-card">
            <span style={{fontSize: '2rem'}}>🚨</span>
            <p>Raport de Eveniment</p>
          </Link>

          {/* Paznicul creează Procesul Verbal de Intervenție manual, la nevoie */}
          <Link to={`/proces-verbal/nou`} className="card link-card">
            <span style={{fontSize: '2rem'}}>📄</span>
            <p>Proces Verbal Intervenție</p>
          </Link>
        </div>
      </main>
    </div>
  );
}