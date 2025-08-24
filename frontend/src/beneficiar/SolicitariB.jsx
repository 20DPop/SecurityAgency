import React from "react";
import { useNavigate } from "react-router-dom";
import "./SolicitariB.css"; // Vom crea acest fișier imediat

export default function SolicitariB({ solicitari }) {
  const navigate = useNavigate();

  const getStatusLabel = (status) => {
    switch (status) {
      case "inCurs": return "În curs de prelucrare";
      case "inRezolvare": return "În rezolvare";
      case "finalizata": return "Finalizată";
      default: return "Necunoscut";
    }
  };

  return (
    <div className="solicitari-container">
      {/* Butonul fixat de "Înapoi" care duce la dashboard */}
      <button className="back-to-dash-btn" onClick={() => navigate("/beneficiar")}>
        ← Înapoi la Home
      </button>

      <div className="solicitari-header">
        <h1>Solicitările mele</h1>
        {/* Butonul care duce la pagina de adăugare */}
        <button className="add-solicitare-btn" onClick={() => navigate("/adauga-solicitare")}>
          + Adaugă solicitare
        </button>
      </div>

      {/* Lista solicitărilor */}
      <div className="solicitari-list">
        {solicitari.length === 0 ? (
          <p>Nu ai trimis nicio solicitare încă.</p>
        ) : (
          solicitari.map((s) => (
            <div className="solicitare-card" key={s.id}>
              <h3>{s.titlu}</h3>
              <p>{s.descriere}</p>
              <p><strong>Data:</strong> {s.data}</p>
              <p><strong>Status:</strong> {getStatusLabel(s.status)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}