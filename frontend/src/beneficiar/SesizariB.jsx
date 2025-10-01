import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // Importăm apiClient
import "./SesizariB.css";

export default function SesizariB() {
  const [sesizari, setSesizari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSesizari = async () => {
        setLoading(true);
        setError('');
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || !currentUser._id) {
                throw new Error("Utilizatorul nu este logat.");
            }
            // Folosim ruta care aduce sesizările pentru un anume beneficiar
            const { data } = await apiClient.get(`/sesizari/${currentUser._id}`);
            // Sortăm sesizările, cele mai noi primele
            data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setSesizari(data);
        } catch (err) {
            setError(err.response?.data?.message || "Nu s-au putut încărca sesizările.");
        } finally {
            setLoading(false);
        }
    };
    fetchSesizari();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case "preluată": return "Preluată";
      case "inCurs": return "În Curs de Rezolvare";
      case "rezolvata": return "Rezolvată";
      default: return status;
    }
  };
  
  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="sesizari-container">
      <button className="back-to-dash-btn" onClick={() => navigate("/beneficiar")}>
        ← Înapoi la Home
      </button>
      <div className="sesizari-header">
        <h1>Sesizările Mele</h1>
        <button className="add-sesizare-btn" onClick={() => navigate("/adauga-sesizare")}>
          + Adaugă Sesizare
        </button>
      </div>
      <div className="sesizari-list">
        {sesizari.length === 0 ? (
          <p>Nu ați trimis nicio sesizare încă.</p>
        ) : (
          sesizari.map((s) => (
            <div className="sesizare-card" key={s._id}>
              <h3>{s.titlu}</h3>
              <p>{s.descriere}</p>
              <p><strong>Data:</strong> {new Date(s.createdAt).toLocaleString('ro-RO')}</p>
              <p><strong>Status:</strong> {getStatusLabel(s.status)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}