// Cale: frontend/src/pages/PrezentaAngajati.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './PrezentaAngajati.css';

export default function PrezentaAngajati() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("prezenta"); // "prezenta" sau "istoric"
  const [istoricPontaje, setIstoricPontaje] = useState([]);
  const [selectedPaznic, setSelectedPaznic] = useState(null);
  const [searchName, setSearchName] = useState("");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Prezență angajați activi
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

  // Istoric pontaje ultimele 30 de zile
  useEffect(() => {
    const fetchIstoric = async () => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/pontaj/istoric-30zile-beneficiar", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Eroare la preluarea istoricului pontajelor");

        const data = await res.json();
        setIstoricPontaje(data);

      } catch (err) {
        console.error(err);
      }
    };

    if (view === "istoric") fetchIstoric();
  }, [view, currentUser]);

  const filteredAngajati = angajati;

  const pazniciUnici = Array.from(
    new Set(
      istoricPontaje
        .filter(p => p.paznicId?.nume.toLowerCase().includes(searchName.toLowerCase()))
        .map(p => p.paznicId._id)
    )
  );

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Angajați {currentUser?.firma}</h1>

      {/* Radio buttons vizualizare */}
      <div className="view-options">
        <label>
          <input
            type="radio"
            name="view"
            value="prezenta"
            checked={view === "prezenta"}
            onChange={() => setView("prezenta")}
          />
          Prezență angajați
        </label>
        <label>
          <input
            type="radio"
            name="view"
            value="istoric"
            checked={view === "istoric"}
            onChange={() => { setView("istoric"); setSelectedPaznic(null); setSearchName(""); }}
          />
          Istoric prezență angajați
        </label>
      </div>

      {/* Vizualizare Prezență */}
      {view === "prezenta" && (
        <div className="table-responsive">
          <table className="angajati-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Ora Intrare</th>
                <th>Locație</th>
              </tr>
            </thead>
            <tbody>
              {filteredAngajati.length > 0 ? filteredAngajati.map((p) => (
                <tr key={p._id}>
                  <td>{p.paznicId?.nume}</td>
                  <td>{p.paznicId?.prenume}</td>
                  <td>{p.paznicId?.email}</td>
                  <td>{p.paznicId?.telefon}</td>
                  <td>{new Date(p.ora_intrare).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-urmarire"
                      onClick={() => navigate(`/urmarire/${p.paznicId?._id}`)}
                    >
                      📍 Urmărire
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Niciun angajat în lucru acum.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Vizualizare Istoric */}
      {view === "istoric" && !selectedPaznic && (
        <div className="table-responsive">
          {/* Căutare după nume */}
          <div className="filter-container">
            <label htmlFor="searchName">Caută după nume: </label>
            <input
              id="searchName"
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <table className="angajati-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Alege</th>
              </tr>
            </thead>
            <tbody>
              {pazniciUnici.length > 0 ? pazniciUnici.map(paznicId => {
                const p = istoricPontaje.find(i => i.paznicId._id === paznicId);
                return (
                  <tr key={paznicId}>
                    <td>{p.paznicId?.nume}</td>
                    <td>{p.paznicId?.prenume}</td>
                    <td>
                      <button className="btn-alege" onClick={() => setSelectedPaznic(paznicId)}>
                        Alege
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    Nicio pontare în ultimele 30 de zile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalii pontaje paznic selectat */}
      {selectedPaznic && (
        <div className="table-responsive">
          <button onClick={() => setSelectedPaznic(null)} className="back-btn">
            ⬅ Înapoi la lista paznicilor
          </button>
          <table className="angajati-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Companie</th>
              </tr>
            </thead>
            <tbody>
              {istoricPontaje
                .filter(p => p.paznicId._id === selectedPaznic)
                .map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(p.ora_intrare).toLocaleString()}</td>
                    <td>{p.ora_iesire ? new Date(p.ora_iesire).toLocaleString() : "-"}</td>
                    <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buton Înapoi */}
      {!selectedPaznic && (
        <button className="back-bottom-btn" onClick={() => window.history.back()}>
          ⬅ Înapoi
        </button>
      )}
    </div>
  );
}
