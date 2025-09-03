// frontend/src/pages/Beneficiar/AngajatiB.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AngajatiB.css";

export default function AngajatiB() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  const fetchAngajati = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (!token) {
        setError("Nu ești autentificat.");
        setLoading(false);
        return;
      }
      const res = await axios.get("http://localhost:3000/api/users/beneficiar/angajati", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sortează alfabetic după nume
      const angajatiSortati = res.data.sort((a, b) => a.nume.localeCompare(b.nume));
      setAngajati(angajatiSortati);

    } catch (err) {
      console.error("Eroare la încărcarea angajaților beneficiarului:", err);
      setError("Eroare la încărcarea angajaților. Asigură-te că ești logat ca beneficiar.");
    } finally {
      setLoading(false);
    }
  };
  fetchAngajati();
}, []);

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="angajatiB-container">
      <h1>Angajații mei</h1>
      <div className="table-responsive">
        <table className="angajatiB-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Email</th>
              <th>Detalii</th>
            </tr>
          </thead>
          <tbody>
            {angajati.map((a) => (
              <tr key={a._id}>
                <td>{a.nume}</td>
                <td>{a.prenume}</td>
                <td>{a.email}</td>
                <td>
                  <Link to={`/angajatiB/${a._id}`} className="detalii-btn">
                    Detalii
                  </Link>
                </td>
              </tr>
            ))}
            {angajati.length === 0 && (
              <tr>
                <td colSpan="4">Nu ai angajați alocați.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>Înapoi</button>
    </div>
  );
}
