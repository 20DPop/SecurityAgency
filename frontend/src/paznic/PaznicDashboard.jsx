import React from "react";
import { Link } from "react-router-dom";
import "./PaznicDashboard.css";

const apkUrl = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_BASE_URL}/downloads/VigilentSecurity.apk`
  : `/downloads/VigilentSecurity.apk`;

export default function PaznicDashboard() {
  const qrCodePlaceholder = "scaneaza-un-cod-qr";

  return (
    <div className="paznic-dashboard">
      <main>
        <h1 className="page-title">Panou de Control Agent de Securitate</h1>

        <div className="cards-container">

          <Link to={`/pontare/${qrCodePlaceholder}`} className="card link-card">
            <span style={{ fontSize: "2rem" }}>🕒</span>
            <p>Pontare</p>
          </Link>

          <Link to="/raport-eveniment" className="card link-card">
            <span style={{ fontSize: "2rem" }}>🚨</span>
            <p>Raport de Eveniment</p>
          </Link>

          <Link to="/proces-verbal/nou" className="card link-card">
            <span style={{ fontSize: "2rem" }}>📄</span>
            <p>Proces Verbal Intervenție</p>
          </Link>

          <a
            href={apkUrl}
            className="card link-card"
            download="VigilentSecurity.apk"
          >
            <span style={{ fontSize: "2rem" }}>📱</span>
            <p>Aplicație Pontare</p>
          </a>

        </div>
      </main>
    </div>
  );
}