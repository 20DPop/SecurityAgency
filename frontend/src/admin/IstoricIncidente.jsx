import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./IstoricIncidente.css";

export default function IstoricIncidente() {
  const [istoric, setIstoric] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIstoric = async () => {
      setLoading(true);
      setError("");
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get("/incidente/istoric");
        // Sortăm pentru a afișa incidentele cele mai noi primele
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIstoric(data);
      } catch (err) {
        setError("Nu s-a putut încărca istoricul incidentelor.");
      } finally {
        setLoading(false);
      }
    };

    fetchIstoric();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă istoricul...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="istoric-container">
      <h1>📜 Istoric Incidente</h1>
      
      {istoric.length > 0 ? (
        <div className="istoric-list">
          {istoric.map((inc) => (
            <div key={inc._id} className={`istoric-card ${inc.restabilit ? "verde" : "rosu"}`}>
              {inc.titlu} – <b>{inc.punctDeLucru}</b>
              <div style={{fontSize: '0.8em', color: '#555', marginTop: '5px'}}>
                Data: {new Date(inc.createdAt).toLocaleString('ro-RO')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{textAlign: 'center'}}>Nu există incidente în istoric.</p>
      )}

      <button className="back-bottom-btn" onClick={() => navigate(-1)}>
        ⬅ Înapoi
      </button>
    </div>
  );
}