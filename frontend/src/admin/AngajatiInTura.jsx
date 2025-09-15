// Cale: frontend/src/pages/AngajatiInTura.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AngajatiInTura.css";

export default function AngajatiInTura() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [beneficiari, setBeneficiari] = useState([]);
  const [selectedBeneficiar, setSelectedBeneficiar] = useState("");
  const [view, setView] = useState("prezenta"); // "prezenta" sau "istoric"
  const [istoricPontaje, setIstoricPontaje] = useState([]);
  const [selectedPaznic, setSelectedPaznic] = useState(null);

  const navigate = useNavigate();

  // Fetch angajati activi (prezență)
  useEffect(() => {
    const fetchAngajati = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/pontaj/angajati-activi", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Eroare la preluarea angajaților activi");

        const data = await res.json();
        setAngajati(data);

        const firmeUnice = Array.from(
          new Set(
            data.map((p) => p.beneficiaryId?.profile?.nume_companie).filter(Boolean)
          )
        );
        setBeneficiari(firmeUnice);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAngajati();
  }, []);

  // Fetch istoric pontaje ultimele 30 de zile
  useEffect(() => {
    const fetchIstoric = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/pontaj/istoric-30zile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Eroare la preluarea istoricului pontajelor");

        const data = await res.json();
        setIstoricPontaje(data);

        const firmeUnice = Array.from(
          new Set(
            data.map((p) => p.beneficiaryId?.profile?.nume_companie).filter(Boolean)
          )
        );
        setBeneficiari(firmeUnice);
      } catch (err) {
        console.error(err);
      }
    };

    if (view === "istoric") fetchIstoric();
  }, [view]);

  // Filtrare angajati activi
  const filteredAngajati = selectedBeneficiar
    ? angajati.filter(
        (p) => p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar
      )
    : angajati;

  // Filtrare paznici istoric
  const pazniciUnici = Array.from(
    new Set(
      istoricPontaje
        .filter(
          (p) =>
            !selectedBeneficiar ||
            p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar
        )
        .map((p) => p.paznicId._id)
    )
  );

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Gestionare Angajați</h1>

      {/* Bara de opțiuni (pe același rând) */}
      <div className="view-options">
        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          <label>
            <input
              type="radio"
              name="view"
              value="prezenta"
              checked={view === "prezenta"}
              onChange={() => {
                setView("prezenta");
                setSelectedPaznic(null);
              }}
            />
            Prezență angajați
          </label>
        </div>

        {(view === "prezenta" || view === "istoric") && !selectedPaznic && (
          <div className="filter-container">
            <label htmlFor="beneficiarSelect">Filtrează după firmă: </label>
            <select
              id="beneficiarSelect"
              value={selectedBeneficiar}
              onChange={(e) => setSelectedBeneficiar(e.target.value)}
            >
              <option value="">Toate firmele</option>
              {beneficiari.map((firma, idx) => (
                <option key={idx} value={firma}>
                  {firma}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div style={{ flexGrow: 1, alignright: 4, textAlign: 'center'  }}>
          <label>
            <input
              type="radio"
              name="view"
              value="istoric"
              checked={view === "istoric"}
              onChange={() => {
                setView("istoric");
                setSelectedPaznic(null);
              }}
            />
            Istoric prezență angajați
          </label>
        </div>
      </div>

      {/* Vizualizare Prezență */}
      {view === "prezenta" && !selectedPaznic && (
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
                <th>Locație</th>
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
                    <td>
                      <button
                        className="btn-urmarire"
                        onClick={() => navigate(`/urmarire/${p.paznicId?._id}`)}
                      >
                        📍 Urmărire
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Niciun angajat nu este în tură acum pentru acest beneficiar.
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
          <table className="angajati-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Nume Companie</th>
                <th>Alege</th>
              </tr>
            </thead>
            <tbody>
              {pazniciUnici.length > 0 ? (
                pazniciUnici.map((paznicId) => {
                  const p = istoricPontaje.find((i) => i.paznicId._id === paznicId);
                  return (
                    <tr key={paznicId}>
                      <td>{p.paznicId?.nume}</td>
                      <td>{p.paznicId?.prenume}</td>
                      <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                      <td>
                        <button
                          className="btn-alege"
                          onClick={() => setSelectedPaznic(paznicId)}
                        >
                          Alege
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
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
                .filter(
                  (p) =>
                    p.paznicId._id === selectedPaznic &&
                    (!selectedBeneficiar ||
                      p.beneficiaryId?.profile?.nume_companie ===
                        selectedBeneficiar)
                )
                .map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(p.ora_intrare).toLocaleString()}</td>
                    <td>
                      {p.ora_iesire
                        ? new Date(p.ora_iesire).toLocaleString()
                        : "-"}
                    </td>
                    <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buton Înapoi standard */}
      {!selectedPaznic && (
        <button className="back-bottom-btn" onClick={() => window.history.back()}>
          ⬅ Înapoi
        </button>
      )}
    </div>
  );
}