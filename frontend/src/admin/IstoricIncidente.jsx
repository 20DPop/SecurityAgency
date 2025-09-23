import React, { useEffect, useState } from "react";
import axios from "axios";
import "./IstoricIncidente.css";

export default function IstoricIncidente() {
  const [istoric, setIstoric] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIstoric = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await axios.get("http://localhost:3000/api/incidente/istoric", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIstoric(res.data);
      } catch (err) {
        console.error("Eroare la încărcarea istoricului:", err);
        setError("Nu s-a putut încărca istoricul incidentelor.");
      }
    };

    fetchIstoric();
  }, []);

  return (
    <div className="istoric-container">
      <h1>📜 Istoric incidente</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="istoric-list">
        {istoric.map((inc, i) => (
          <div
            key={i}
            className={`istoric-card ${inc.restabilit ? "verde" : "rosu"}`}
          >
            {inc.titlu} – <b>{inc.punctDeLucru}</b>
          </div>
        ))}
      </div>

      <button className="back-bottom-btn" onClick={() => window.history.back()}>
        ⬅ Înapoi
      </button>
    </div>
  );
}
