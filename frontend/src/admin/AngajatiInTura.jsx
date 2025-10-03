import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
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

  // Fetch angajați activi
  useEffect(() => {
    const fetchAngajati = async () => {
      setLoading(true);
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get("/pontaj/angajati-activi");
        setAngajati(data);

        const firmeUnice = Array.from(
          new Set(data.map((p) => p.beneficiaryId?.profile?.nume_companie).filter(Boolean))
        );
        setBeneficiari(firmeUnice);
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la preluarea angajaților activi");
      } finally {
        setLoading(false);
      }
    };

    fetchAngajati();
  }, []); // Am scos `token` din dependențe, apiClient îl gestionează

  // Fetch istoric pontaje
  useEffect(() => {
    const fetchIstoric = async () => {
      if (view === "istoric") {
        setLoading(true); // Arată loading când schimbăm pe istoric
        try {
          // <-- MODIFICARE: Folosim apiClient
          const { data } = await apiClient.get("/pontaj/istoric-60zile");
          setIstoricPontaje(data);

          const firmeUnice = Array.from(
            new Set(data.map((p) => p.beneficiaryId?.profile?.nume_companie).filter(Boolean))
          );
          setBeneficiari(firmeUnice);
        } catch (err) {
          setError(err.response?.data?.message || "Eroare la preluarea istoricului");
        } finally {
            setLoading(false);
        }
      }
    };

    fetchIstoric();
  }, [view]); // Se reapelează doar când se schimbă `view`

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
      .map((p) => p.paznicId?._id)
      .filter(Boolean) // elimină null / undefined
  )
);


  // --- GENERARE PDF ---
  const handleDownloadPDF = () => {
    if (!selectedPaznic) return;

    const paznicData = istoricPontaje.find(p => p.paznicId?._id === selectedPaznic);
    if (!paznicData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Istoric prezenta angajat", 14, 20);
    doc.setFontSize(12);
    doc.text(`Nume: ${paznicData.paznicId?.nume} ${paznicData.paznicId?.prenume}`, 14, 30);
    doc.text(`Data descarcarii: ${new Date().toLocaleDateString('ro-RO')}`, 14, 36);

    const tableData = istoricPontaje
      .filter(p => p.paznicId?._id === selectedPaznic && (!selectedBeneficiar || p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar))
      .map(p => [
        new Date(p.ora_intrare).toLocaleDateString('ro-RO'),
        new Date(p.ora_intrare).toLocaleTimeString('ro-RO'),
        p.ora_iesire ? new Date(p.ora_iesire).toLocaleTimeString('ro-RO') : "-",
        p.beneficiaryId?.profile?.nume_companie || "N/A"
      ]);

    autoTable(doc, {
      startY: 45,
      head: [["Data", "Check-in", "Check-out", "Companie"]],
      body: tableData,
    });

    doc.save(`${paznicData.paznicId?.nume}_${paznicData.paznicId?.prenume}_istoric.pdf`);
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Gestionare Prezență Angajați</h1>

      <div className="view-options">
        <div>
          <label><input type="radio" name="view" value="prezenta" checked={view === "prezenta"} onChange={() => { setView("prezenta"); setSelectedPaznic(null); }} /> Prezență curentă</label>
        </div>
        <div>
          <label><input type="radio" name="view" value="istoric" checked={view === "istoric"} onChange={() => { setView("istoric"); setSelectedPaznic(null); }} /> Istoric prezență</label>
        </div>
        {(view === "prezenta" || view === "istoric") && !selectedPaznic && (
          <div className="filter-container">
            <label htmlFor="beneficiarSelect">Filtrează după firmă: </label>
            <select id="beneficiarSelect" value={selectedBeneficiar} onChange={(e) => setSelectedBeneficiar(e.target.value)}>
              <option value="">Toate firmele</option>
              {beneficiari.map((firma, idx) => (<option key={idx} value={firma}>{firma}</option>))}
            </select>
          </div>
        )}
      </div>

      {view === "prezenta" && !selectedPaznic && (
        <div className="table-responsive">
          <table className="angajati-table">
            <thead>
              <tr><th>Nume</th><th>Prenume</th><th>Email</th><th>Telefon</th><th>Beneficiar</th><th>Ora Intrare</th><th>Locație</th></tr>
            </thead>
            <tbody>
              {filteredAngajati.length > 0 ? (
                filteredAngajati.map((p) => (
                  <tr key={p._id}>
                    <td>{p.paznicId?.nume}</td><td>{p.paznicId?.prenume}</td><td>{p.paznicId?.email}</td><td>{p.paznicId?.telefon}</td>
                    <td>{p.beneficiaryId?.profile?.nume_companie}</td><td>{new Date(p.ora_intrare).toLocaleString('ro-RO')}</td>
                    <td><button className="btn-urmarire" onClick={() => navigate(`/urmarire/${p.paznicId?._id}`)}>📍 Urmărire</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{ textAlign: "center" }}>Niciun angajat în tură.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "istoric" && !selectedPaznic && (
        <div className="table-responsive">
          <table className="angajati-table">
            <thead>
              <tr><th>Nume</th><th>Prenume</th><th>Ultima Companie</th><th>Vezi Istoric</th></tr>
            </thead>
            <tbody>
              {pazniciUnici.length > 0 ? (
                pazniciUnici.map((paznicId) => {
                  const p = istoricPontaje.find((i) => i.paznicId?._id === paznicId);
                  return (
                    <tr key={paznicId}>
                      <td>{p.paznicId?.nume}</td><td>{p.paznicId?.prenume}</td>
                      <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                      <td><button className="btn-alege" onClick={() => setSelectedPaznic(paznicId)}>Alege</button></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" style={{ textAlign: "center" }}>Nicio pontare în ultimele 60 de zile.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedPaznic && (
        <div className="table-responsive">
          <button onClick={handleDownloadPDF} className="download-btn">⬇ Descarcă PDF</button>
          <button onClick={() => setSelectedPaznic(null)} className="back-btn" style={{position: 'static', marginLeft: '10px'}}>⬅ Înapoi la listă</button>
          <table className="angajati-table" style={{marginTop: '10px'}}>
            <thead>
              <tr><th>Data</th><th>Check-in</th><th>Check-out</th><th>Companie</th></tr>
            </thead>
            <tbody>
              {istoricPontaje
                .filter(p => p.paznicId?._id === selectedPaznic && (!selectedBeneficiar || p.beneficiaryId?.profile?.nume_companie === selectedBeneficiar))
                .map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.ora_intrare).toLocaleDateString('ro-RO')}</td>
                    <td>{new Date(p.ora_intrare).toLocaleTimeString('ro-RO')}</td>
                    <td>{p.ora_iesire ? new Date(p.ora_iesire).toLocaleTimeString('ro-RO') : "-"}</td>
                    <td>{p.beneficiaryId?.profile?.nume_companie}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {!selectedPaznic && <button className="back-bottom-btn" onClick={() => navigate(-1)}>⬅ Înapoi</button>}
    </div>
  );
}