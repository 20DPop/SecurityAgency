import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './PrezentaAngajati.css';

export default function PrezentaAngajati() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBeneficiar, setSelectedBeneficiar] = useState("");

  const navigate = useNavigate();

  // Obținem datele utilizatorului logat din localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
  const fetchAngajati = async () => {
    try {
      const token = currentUser?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      const res = await fetch("http://localhost:3000/api/pontaj/angajati-activi-beneficiar", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Eroare la preluarea angajaților activi");

      const data = await res.json();
      setAngajati(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchAngajati();
}, [currentUser]);

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Angajați în lucru - {currentUser.firma}</h1>

      <div className="table-responsive">
        <table className="angajati-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Ora Intrare</th>
            </tr>
          </thead>
          <tbody>
            {angajati.length > 0 ? (
              angajati.map((p) => (
                <tr key={p._id}>
                  <td>{p.paznicId?.nume}</td>
                  <td>{p.paznicId?.prenume}</td>
                  <td>{p.paznicId?.email}</td>
                  <td>{p.paznicId?.telefon}</td>
                  <td>{new Date(p.ora_intrare).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Niciun angajat nu este în lucru acum pentru firma ta.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Buton Înapoi */}
      <button className="back-bottom-btn" onClick={() => window.history.back()}>
        ⬅ Înapoi
      </button>
    </div>
  );
}
