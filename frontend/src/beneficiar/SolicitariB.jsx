import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // Importăm apiClient
import "./SolicitariB.css";

export default function SolicitariB() {
  const [solicitari, setSolicitari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSolicitari = async () => {
      setLoading(true);
      setError('');
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || !currentUser._id) {
          throw new Error("Utilizatorul nu este logat.");
        }
        const { data } = await apiClient.get(`/sesizari/${currentUser._id}`);
        // Sortăm, cele mai noi primele
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSolicitari(data);
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la preluarea solicitărilor!");
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitari();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="solicitari-container">
      <div className="solicitari-header">
        <h1>Solicitările Mele</h1>
        <Link to="/solicitariB/adauga" className="add-solicitare-btn">
          ➕ Adaugă Solicitare
        </Link>
      </div>
      <div className="table-responsive">
        <table className="solicitari-table">
          <thead>
            <tr>
              <th>Titlu</th>
              <th>Descriere</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {solicitari.length > 0 ? (
              solicitari.map((s) => (
                <tr key={s._id}>
                  <td>{s.titlu}</td>
                  <td>{s.descriere}</td>
                  <td>{s.status}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" style={{ textAlign: "center" }}>Nu aveți nicio solicitare înregistrată.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="back-bottom-btn" onClick={() => navigate("/beneficiar")}>
        ⬅ Înapoi
      </button>
    </div>
  );
}