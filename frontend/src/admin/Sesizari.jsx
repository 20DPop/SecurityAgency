import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // Importăm instanța centralizată
import "./Sesizari.css";

export default function Sesizari() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sesizari, setSesizari] = useState({
    preluată: [],
    inCurs: [],
    rezolvata: []
  });
  const [termenCautare, setTermenCautare] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSesizari = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await apiClient.get("/sesizari");

        const toate = data.map(s => ({
          id: s._id,
          titlu: s.titlu,
          firma: s.createdByBeneficiaryId?.profile?.nume_companie || "N/A",
          status: s.status,
          data: s.createdAt ? new Date(s.createdAt).toLocaleDateString('ro-RO') : "N/A",
        }));

        const grouped = {
          preluată: toate.filter(s => s.status === "preluată"),
          inCurs: toate.filter(s => s.status === "inCurs"),
          rezolvata: toate.filter(s => s.status === "rezolvata")
        };
        setSesizari(grouped);
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-au putut încărca datele.");
      } finally {
        setLoading(false);
      }
    };
    fetchSesizari();
  }, []);

  const mutaSesizare = async (id, from, to) => {
    if (!window.confirm("Sunteți sigur că doriți să schimbați statusul?")) return;

    try {
      await apiClient.patch(`/sesizari/${id}/status`, { status: to });
      setSesizari(prev => {
        const itemToMove = prev[from].find(s => s.id === id);
        if (!itemToMove) return prev;
        return {
          ...prev,
          [from]: prev[from].filter(s => s.id !== id),
          [to]: [...prev[to], { ...itemToMove, status: to }]
        };
      });
      alert("Status actualizat cu succes!");
    } catch (err) {
      alert(`Eroare: ${err.response?.data?.message || "Nu s-a putut actualiza statusul."}`);
    }
  };

  const coloane = [
    { key: "preluată", label: "Prelucrată" },
    { key: "inCurs", label: "În Curs de Rezolvare" },
    { key: "rezolvata", label: "Rezolvată" }
  ];

  const sesizariFiltrate = {};
  for (const key in sesizari) {
    sesizariFiltrate[key] = sesizari[key].filter(s =>
      s.firma.toLowerCase().includes(termenCautare.toLowerCase())
    );
  }
  
  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Se încarcă sesizările...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Eroare: {error}</div>;

  return (
    <div className="sesizari-container">
      <div style={{ marginBottom: "15px" }}>
        <button className="back-btn" style={{position: 'static', backgroundColor: '#6c757d', color: 'white'}} onClick={() => navigate(-1)}>
          ⬅ Înapoi
        </button>
      </div>

      <h1>Panou Sesizări</h1>
      <div className="search-section">
        <input type="text" placeholder="Caută după firmă..." value={termenCautare} onChange={(e) => setTermenCautare(e.target.value)} />
      </div>
      <div className="sesizari-grid">
        {coloane.map((col, index) => (
          <div className="sesizari-column" key={col.key}>
            <h2>{col.label}</h2>
            <table>
              <thead>
                <tr><th>Titlu</th><th>Data</th><th>Firma</th><th>Acțiuni</th></tr>
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
                          {index > 0 && <button onClick={() => mutaSesizare(s.id, col.key, coloane[index - 1].key)}>⬅</button>}
                          <Link to={`/sesizare/${s.id}`} className="detalii-btn">Detalii</Link>
                          {index < coloane.length - 1 && <button onClick={() => mutaSesizare(s.id, col.key, coloane[index + 1].key)}>➡</button>}
                        </div>
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