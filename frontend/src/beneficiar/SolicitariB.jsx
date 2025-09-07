import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SolicitariB.css";
import { useNavigate } from "react-router-dom";


export default function SolicitariB() {
  const navigate = useNavigate();
  const [solicitari, setSolicitari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // utilizatorul logat
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchSolicitari = async () => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch(
          `http://localhost:3000/api/sesizari/${currentUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Eroare la preluarea solicitărilor!");

        const data = await res.json();

        const solicitariMapped = data.map((s) => ({
          _id: s._id,
          titlu: s.titlu,
          descriere: s.descriere,
          status: s.status,
        }));

        setSolicitari(solicitariMapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitari();
  }, [currentUser]);

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare: {error}</div>;

  return (
    <div className="solicitari-container">

      <div className="solicitari-header">
        <h1>Solicitările mele</h1>
        <Link to="/solicitariB/adauga" className="adauga-btn">
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
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Nu ai nicio solicitare.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        className="back-bottom-btn"
        onClick={() => navigate("/beneficiar")}
      >
        ⬅ Înapoi
      </button>
    </div>
  );
}
