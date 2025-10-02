// frontend/src/pages/AngajatiInTura.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./AngajatiInTura.css";

export default function AngajatiInTura() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [beneficiari, setBeneficiari] = useState([]);
  const [selectedBeneficiar, setSelectedBeneficiar] = useState("");
  const [view, setView] = useState("prezenta");
  const [istoricPontaje, setIstoricPontaje] = useState([]);
  const [selectedPaznic, setSelectedPaznic] = useState(null);

  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  // Fetch angajati activi
  useEffect(() => {
    const fetchAngajati = async () => {
      try {
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/pontaj/angajati-activi", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Eroare la preluarea angajaților activi");

        const data = await res.json();
        setAngajati(data);

        const firmeUnice = Array.from(
          new Set(data.map((p) => p.beneficiaryId?.profile?.nume_companie).filter(Boolean))
        );
        setBeneficiari(firmeUnice);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAngajati();
  }, [token]);

  // Fetch istoric pontaje ultimele 60 zile
  useEffect(() => {
    const fetchIstoric = async () => {
      try {
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/pontaj/istoric-60zile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Eroare la preluarea istoricului pontajelor");

        const data = await res.json();
        setIstoricPontaje(data);

        const firmeUnice = Array.from(
          new Set(data.map((p) => p.beneficiaryId?.profile?.nume_companie).filter(Boolean))
        );
        setBeneficiari(firmeUnice);
      } catch (err) {
        console.error(err);
      }
    };

    if (view === "istoric") fetchIstoric();
  }, [view, token]);

  // Filtrare angajati activi
  const filteredAngajati = selectedBeneficiar
  ? angajati.filter(
      (p) => p.paznicId && p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar
    )
  : angajati.filter((p) => p.paznicId);

  // Filtrare paznici istoric
  const pazniciUnici = Array.from(
  new Set(
    istoricPontaje
      .filter(
        (p) =>
          p.paznicId &&
          (!selectedBeneficiar || p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar)
      )
      .map((p) => p.paznicId._id)
  )
  );

  // --- GENERARE PDF ---
  const handleDownloadPDF = () => {
    if (!selectedPaznic) return;

    const paznicData = istoricPontaje.find(p => p.paznicId?._id === selectedPaznic);
    if (!paznicData) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("Istoric prezenta angajat", 14, 20);

    // Info angajat
    doc.setFontSize(12);
    doc.text(`Nume: ${paznicData.paznicId?.nume}`, 14, 30);
    doc.text(`Prenume: ${paznicData.paznicId?.prenume}`, 14, 36);
    doc.text(`Firma: ${paznicData.beneficiaryId?.profile?.nume_companie}`, 14, 42);
    doc.text(`Data descarcarii: ${new Date().toLocaleDateString()}`, 14, 48);

    // Tabel istoric pontaje
    const tableData = istoricPontaje
      .filter(
        p =>
          p.paznicId?._id === selectedPaznic &&
          (!selectedBeneficiar || p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar)
      )
      .map(p => [
        new Date(p.createdAt).toLocaleDateString(),
        new Date(p.ora_intrare).toLocaleTimeString(),
        p.ora_iesire ? new Date(p.ora_iesire).toLocaleTimeString() : "-",
        p.beneficiaryId?.profile?.nume_companie
      ]);

    autoTable(doc, {
      startY: 55,
      head: [["Data", "Check-in", "Check-out", "Companie"]],
      body: tableData,
    });

    doc.save(`${paznicData.paznicId?.nume}_${paznicData.paznicId?.prenume}_istoric.pdf`);
  };

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Gestionare Angajați</h1>

      {/* Opțiuni vizualizare */}
      <div className="view-options">
        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          <label>
            <input
              type="radio"
              name="view"
              value="prezenta"
              checked={view === "prezenta"}
              onChange={() => { setView("prezenta"); setSelectedPaznic(null); }}
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
                <option key={firma || `firma-${idx}`} value={firma || ""}>
                  {firma || "N/A"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          <label>
            <input
              type="radio"
              name="view"
              value="istoric"
              checked={view === "istoric"}
              onChange={() => { setView("istoric"); setSelectedPaznic(null); }}
            />
            Istoric prezență angajați
          </label>
        </div>
      </div>

      {/* Prezență */}
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
                filteredAngajati.map((p, idx) => (
                  <tr key={p._id || `angajat-${p.paznicId?._id || idx}`}>
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

      {/* Istoric */}
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
                pazniciUnici.map((paznicId, idx) => {
                  const p = istoricPontaje.find((i) => i.paznicId?._id === paznicId);
                  return (
                    <tr key={paznicId || `paznic-${idx}`}>
                      <td>{p?.paznicId?.nume}</td>
                      <td>{p?.paznicId?.prenume}</td>
                      <td>{p?.beneficiaryId?.profile?.nume_companie}</td>
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
                    Nicio pontare în ultimele 60 de zile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalii paznic + PDF */}
      {selectedPaznic && (
        <div className="table-responsive">
          <button onClick={handleDownloadPDF} className="download-btn">
            ⬇ Descarcă PDF
          </button>
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
                    p.paznicId?._id === selectedPaznic &&
                    (!selectedBeneficiar ||
                      p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar)
                )
                .map((p, idx) => (
                  <tr key={p._id || `istoric-${p.paznicId?._id || idx}`}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(p.ora_intrare).toLocaleTimeString()}</td>
                    <td>{p.ora_iesire ? new Date(p.ora_iesire).toLocaleTimeString() : "-"}</td>
                    <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buton înapoi */}
      {!selectedPaznic && (
        <button className="back-bottom-btn" onClick={() => window.history.back()}>
          ⬅ Înapoi
        </button>
      )}
    </div>
  );
}
