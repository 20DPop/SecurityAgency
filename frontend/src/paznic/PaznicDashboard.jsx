import React from "react";
import { Link } from "react-router-dom";
import "./PaznicDashboard.css";

export default function PaznicDashboard() {
  return (
    <div className="paznic-dashboard">
      <main>
        <h1 className="page-title">Home</h1>
        <div className="cards-container">
          <Link to="/pontare" className="card link-card">⚠️<p>Pontare</p></Link>
          <Link to="/proceseverbale" className="card link-card">📄<p>Procese Verbale</p></Link>
          {/* <div className="card">📄<p>Solicitări</p></div> */}
        </div>
      </main>
    </div>
  );
}
