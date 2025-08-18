import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Sesizari.css";

export default function Sesizari({ sesizari, setSesizari }) {
  const [termenCautare, setTermenCautare] = useState("");

  const mutaSesizare = (id, from, to) => {
    const item = sesizari[from].find(s => s.id === id);
    setSesizari(prev => ({
      ...prev,
      [from]: prev[from].filter(s => s.id !== id),
      [to]: [...prev[to], item]
    }));
  };

  const coloane = [
    { key: "prelucrata", label: "Prelucrată" },
    { key: "inCurs", label: "În curs de rezolvare" },
    { key: "rezolvata", label: "Rezolvată" }
  ];

  const sesizariFiltrate = {};
  for (const key in sesizari) {
    sesizariFiltrate[key] = sesizari[key].filter(s =>
      s.firma.toLowerCase().includes(termenCautare.toLowerCase())
    );
  }

  return (
    <div className="sesizari-container">
      {/* Buton Înapoi */}
      <div style={{ marginBottom: "15px" }}>
        <Link to="/" className="back-btn">
          ⬅ Înapoi
        </Link>
      </div>

      <h1>Sesizări</h1>
      <div className="search-section">
        <input
          type="text"
          placeholder="Caută după firmă..."
          value={termenCautare}
          onChange={(e) => setTermenCautare(e.target.value)}
        />
      </div>
      <div className="sesizari-grid">
        {coloane.map((col, index) => (
          <div className="sesizari-column" key={col.key}>
            <h2>{col.label}</h2>
            <table>
              <thead>
                <tr>
                  <th>Titlu</th>
                  <th>Data</th>
                  <th>Firma</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {sesizariFiltrate[col.key].map(s => (
                  <tr key={s.id}>
                    <td>{s.titlu}</td>
                    <td>{s.data}</td>
                    <td>{s.firma}</td>
                    <td>
                      <div className="actiuni-container">
                        <div className="butoane-mutare">
                          {index > 0 && (
                            <button onClick={() => mutaSesizare(s.id, col.key, coloane[index - 1].key)}>
                              ⬅
                            </button>
                          )}
                          {index < coloane.length - 1 && (
                            <button onClick={() => mutaSesizare(s.id, col.key, coloane[index + 1].key)}>
                              ➡
                            </button>
                          )}
                        </div>
                        <Link to={`/sesizare/${s.id}`} className="detalii-btn">
                          Detalii
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
