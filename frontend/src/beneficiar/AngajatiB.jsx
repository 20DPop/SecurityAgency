import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./AngajatiB.css";

export default function AngajatiB() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAngajati = async () => {
      setLoading(true);
      setError('');
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get("/users/beneficiar/angajati");
        
        // Sortează alfabetic după nume
        const angajatiSortati = data.sort((a, b) => a.nume.localeCompare(b.nume));
        setAngajati(angajatiSortati);
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la încărcarea angajaților.");
      } finally {
        setLoading(false);
      }
    };
    fetchAngajati();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă lista angajaților...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="angajatiB-container">
      <h1>Angajații Alocați Firmei Mele</h1>
      <div className="table-responsive">
        <table className="angajatiB-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Email</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {angajati.length > 0 ? (
              angajati.map((a) => (
                <tr key={a._id}>
                  <td>{a.nume}</td>
                  <td>{a.prenume}</td>
                  <td>{a.email}</td>
                  <td>
                    <Link to={`/angajatiB/${a._id}`} className="detalii-btn">
                      Vezi Detalii
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center'}}>Nu aveți angajați alocați momentan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="back-btn" onClick={() => navigate(-1)}>Înapoi</button>
    </div>
  );
}