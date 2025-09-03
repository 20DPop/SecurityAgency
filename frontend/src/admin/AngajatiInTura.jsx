import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './AngajatiInTura.css';

export default function AngajatiInTura() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [beneficiari, setBeneficiari] = useState([]);
  const [selectedBeneficiar, setSelectedBeneficiar] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAngajati = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/pontaj/angajati-activi", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Eroare la preluarea angajaților activi");

        const data = await res.json();
        setAngajati(data);

        // Extragem firmele unice (beneficiari) pentru select
        const firmeUnice = Array.from(new Set(data.map(p => p.beneficiaryId?.profile?.nume_companie).filter(Boolean)));
        setBeneficiari(firmeUnice);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAngajati();
  }, []);

  // Filtrare după beneficiar selectat
  const filteredAngajati = selectedBeneficiar
    ? angajati.filter(p => p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar)
    : angajati;

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Angajați aflați în tură</h1>

      {/* Bara de filtrare */}
      <div className="filter-container">
        <label htmlFor="beneficiarSelect">Filtrează după firmă: </label>
        <select
          id="beneficiarSelect"
          value={selectedBeneficiar}
          onChange={(e) => setSelectedBeneficiar(e.target.value)}
        >
          <option value="">Toate firmele</option>
          {beneficiari.map((firma, idx) => (
            <option key={idx} value={firma}>{firma}</option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <div className="table-responsive">
        <table className="angajati-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Beneficiar</th>
              <th>Ora Intrare</th>
            </tr>
          </thead>
          <tbody>
            {filteredAngajati.length > 0 ? (
              filteredAngajati.map((p) => (
                <tr key={p._id}>
                  <td>{p.paznicId?.nume}</td>
                  <td>{p.paznicId?.prenume}</td>
                  <td>{p.paznicId?.email}</td>
                  <td>{p.paznicId?.telefon}</td>
                  <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                  <td>{new Date(p.ora_intrare).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Niciun angajat nu este în tură acum pentru acest beneficiar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="back-bottom-btn" onClick={() => window.history.back()}>
        ⬅ Înapoi
      </button>
    </div>
  );
}
