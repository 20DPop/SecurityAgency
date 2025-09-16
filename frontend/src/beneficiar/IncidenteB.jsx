import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./IncidenteB.css";

export default function IncidenteB() {
  const [incidente, setIncidente] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ asta lipsea

  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  // Fetch incidente
  const fetchIncidente = async () => {
    try {
      if (!token) throw new Error("Utilizator neautentificat!");
      const res = await axios.get("http://localhost:3000/api/incidente/beneficiar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidente(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Eroare la încărcarea incidentelor.");
    }
  };

  useEffect(() => {
    fetchIncidente();
  }, []);

  // Șterge incident
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/incidente/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIncidente();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Eroare la ștergere.");
    }
  };

  // Restabilire incident
  const handleRestabilire = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/incidente/${id}/restabilire`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIncidente();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Eroare la restabilire.");
    }
  };

  return (
    <div className="incidente-container">
      <h1>Incidente - Firma mea</h1>
      {error && <p className="error-message">{error}</p>}

      {incidente.length === 0 ? (
        <p>Nu există incidente raportate pentru firma ta.</p>
      ) : (
        <div className="incidente-list">
          {incidente.map((inc) => (
            <div
              key={inc._id}
              className="incident-card"
              style={{ backgroundColor: inc.restabilit ? "#d4edda" : "#f8d7da" }}
            >
              <div>
                <b>{inc.titlu}</b> - {inc.punctDeLucru}
              </div>
              <div style={{ marginTop: "5px" }}>
                {!inc.restabilit && (
                  <button className="restabilire-btn" onClick={() => handleRestabilire(inc._id)}>
                    Restabilire
                  </button>
                )}
                <button className="delete-btn" onClick={() => handleDelete(inc._id)}>
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="back-bottom-btn" onClick={() => navigate(-1)}>
        Înapoi
      </button>
    </div>
  );
}
