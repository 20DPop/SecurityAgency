import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./IncidenteB.css";

export default function IncidenteB() {
  const [incidente, setIncidente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidente = async () => {
      setLoading(true);
      setError('');
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get("/incidente/beneficiar");
        // Sortăm incidentele, cele mai noi primele
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIncidente(data);
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la încărcarea incidentelor.");
      } finally {
        setLoading(false);
      }
    };
    fetchIncidente();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="incidente-container">
      <h1>Incidente Raportate la Firma Mea</h1>
      
      {incidente.length === 0 ? (
        <p style={{textAlign: 'center'}}>Nu există incidente raportate pentru firma ta.</p>
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
                <div style={{fontSize: '0.8em', color: '#555', marginTop: '5px'}}>
                  Data: {new Date(inc.createdAt).toLocaleString('ro-RO')}
                </div>
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