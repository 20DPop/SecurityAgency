import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // Importăm apiClient
import './PrezentaAngajati.css';

export default function PrezentaAngajati() {
  const [angajatiActivi, setAngajatiActivi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("prezenta");
  const [istoricPontaje, setIstoricPontaje] = useState([]);
  const [selectedPaznicId, setSelectedPaznicId] = useState(null);
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAngajatiActivi = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get("/pontaj/angajati-activi-beneficiar");
        setAngajatiActivi(data);
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la preluarea angajaților activi.");
      } finally {
        setLoading(false);
      }
    };
    if (view === "prezenta") {
        fetchAngajatiActivi();
    }
  }, [view]);

  useEffect(() => {
    const fetchIstoric = async () => {
      if (view === "istoric") {
        setLoading(true);
        setError('');
        try {
          const { data } = await apiClient.get("/pontaj/istoric-60zile-beneficiar");
          setIstoricPontaje(data);
        } catch (err) {
          setError(err.response?.data?.message || "Eroare la preluarea istoricului.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchIstoric();
  }, [view]);

  const pazniciUniciIstoric = Array.from(
    new Set(istoricPontaje.map(p => p.paznicId._id))
  ).map(id => istoricPontaje.find(p => p.paznicId._id === id));

  const filteredPazniciIstoric = pazniciUniciIstoric.filter(p => 
    p.paznicId?.nume.toLowerCase().includes(searchName.toLowerCase()) || 
    p.paznicId?.prenume.toLowerCase().includes(searchName.toLowerCase())
  );
  
  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>Eroare: {error}</div>;

  return (
    <div className="angajati-container">
      <h1>Prezență Angajați</h1>
      <div className="view-options">
        <label><input type="radio" name="view" value="prezenta" checked={view === "prezenta"} onChange={() => setView("prezenta")}/> Prezență curentă</label>
        <label><input type="radio" name="view" value="istoric" checked={view === "istoric"} onChange={() => { setView("istoric"); setSelectedPaznicId(null); setSearchName(""); }}/> Istoric prezență</label>
      </div>

      {view === "prezenta" && (
        <div className="table-responsive">
          <table className="angajati-table">
            <thead>
              <tr><th>Nume</th><th>Prenume</th><th>Ora Intrare</th><th>Locație</th></tr>
            </thead>
            <tbody>
              {angajatiActivi.length > 0 ? angajatiActivi.map((p) => (
                <tr key={p._id}>
                  <td>{p.paznicId?.nume}</td>
                  <td>{p.paznicId?.prenume}</td>
                  <td>{new Date(p.ora_intrare).toLocaleString('ro-RO')}</td>
                  <td><button className="btn-urmarire" onClick={() => navigate(`/urmarire/${p.paznicId?._id}`)}>📍 Urmărire</button></td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: "center" }}>Niciun angajat în tură acum.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "istoric" && !selectedPaznicId && (
        <div className="table-responsive">
          <div className="filter-container">
            <label htmlFor="searchName">Caută după nume: </label>
            <input id="searchName" type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          </div>
          <table className="angajati-table">
            <thead>
              <tr><th>Nume</th><th>Prenume</th><th>Vezi Istoric</th></tr>
            </thead>
            <tbody>
              {filteredPazniciIstoric.length > 0 ? filteredPazniciIstoric.map(p => (
                  <tr key={p.paznicId._id}>
                    <td>{p.paznicId?.nume}</td>
                    <td>{p.paznicId?.prenume}</td>
                    <td><button className="btn-alege" onClick={() => setSelectedPaznicId(p.paznicId._id)}>Alege</button></td>
                  </tr>
                )) : (
                <tr><td colSpan="3" style={{ textAlign: "center" }}>Nicio pontare în ultimele 60 de zile.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedPaznicId && (
        <div className="table-responsive">
          <button onClick={() => setSelectedPaznicId(null)} className="back-btn" style={{position: 'static', marginBottom: '10px'}}>⬅ Înapoi la lista paznicilor</button>
          <table className="angajati-table">
            <thead>
              <tr><th>Data</th><th>Check-in</th><th>Check-out</th></tr>
            </thead>
            <tbody>
              {istoricPontaje
                .filter(p => p.paznicId._id === selectedPaznicId)
                .sort((a, b) => new Date(b.ora_intrare) - new Date(a.ora_intrare))
                .map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.ora_intrare).toLocaleDateString('ro-RO')}</td>
                    <td>{new Date(p.ora_intrare).toLocaleString('ro-RO')}</td>
                    <td>{p.ora_iesire ? new Date(p.ora_iesire).toLocaleString('ro-RO') : "-"}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!selectedPaznicId && <button className="back-bottom-btn" onClick={() => navigate(-1)}>⬅ Înapoi</button>}
    </div>
  );
}