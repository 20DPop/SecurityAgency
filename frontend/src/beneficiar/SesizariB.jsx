import React from "react";
import { useNavigate } from "react-router-dom";
import "./SesizariB.css"; // Vom modifica și acest fișier

export default function SesizariB({ sesizari }) { // Nu mai avem nevoie de setSesizari și currentUser aici
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
    <div className="sesizari-container">
      {/* Butonul de "Înapoi" care duce la dashboard */}
      <button className="back-to-dash-btn" onClick={() => navigate("/beneficiar")}>
        ← Înapoi la Home
      </button>

      <div className="sesizari-header">
        <h1>Sesizările mele</h1>
        {/* Butonul care duce la pagina de adăugare */}
        <button className="add-sesizare-btn" onClick={() => navigate("/adauga-sesizare")}>
          + Adaugă sesizare
        </button>
      </div>

      {/* Lista sesizărilor rămâne la fel */}
      <div className="sesizari-list">
        {sesizari.length === 0 ? (
          <p>Nu ai trimis nicio sesizare încă.</p>
        ) : (
          sesizari.map((s) => (
            <div className="sesizare-card" key={s.id}>
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