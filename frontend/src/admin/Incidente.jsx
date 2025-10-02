import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./Incidente.css";

export default function Incidente() {
  const [firme, setFirme] = useState([]);
  const [incidente, setIncidente] = useState([]);
  const [selectedFirmaId, setSelectedFirmaId] = useState("");
  const [selectedPunct, setSelectedPunct] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchFirme = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/users/beneficiari");
      setFirme(data);
    } catch (err) {
      setError("Nu s-au putut încărca firmele.");
    }
  }, []);

  const fetchIncidente = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/incidente");
      // Afișăm doar incidentele care nu sunt (încă) în istoric
      setIncidente(data.filter(inc => !inc.istoric));
    } catch (err) {
      setError("Nu s-au putut încărca incidentele.");
    }
  }, []);

  useEffect(() => {
    fetchFirme();
    fetchIncidente();
  }, [fetchFirme, fetchIncidente]);

  const handleSave = async () => {
    if (!selectedFirmaId || !selectedPunct) {
      alert("Selectați compania și punctul de lucru!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const firmaSelectata = firme.find(f => f._id === selectedFirmaId);
      const payload = {
        titlu: `Incident la ${firmaSelectata.profile?.nume_companie}`,
        descriere: "Buton de panică activat de admin",
        companieId: selectedFirmaId,
        punctDeLucru: selectedPunct,
      };
      const { data: newIncident } = await apiClient.post("/incidente", payload);
      setIncidente(prev => [...prev, newIncident]);
      setShowForm(false);
      setSelectedFirmaId("");
      setSelectedPunct("");
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la salvarea incidentului.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestabilire = async (id) => {
    try {
      const { data: incidentNou } = await apiClient.post(`/incidente/${id}/restabilire`);
      
      // Actualizăm starea pentru a reflecta schimbarea ambelor incidente
      setIncidente(prev => {
        // Marcăm incidentul vechi ca fiind istoric și îl pregătim de eliminare
        const updatedOld = prev.find(inc => inc._id === id);
        if (updatedOld) updatedOld.istoric = true;
        // Adăugăm incidentul nou, de restabilire
        return [...prev.filter(inc => inc._id !== id), updatedOld, incidentNou].filter(Boolean);
      });

      alert("Incidentul a fost marcat ca restabilit. Va fi mutat în istoric în 10 secunde.");

      // După 10 secunde, eliminăm ambele din vizualizarea curentă și redirecționăm
      setTimeout(() => {
        setIncidente(prev => prev.filter(inc => inc._id !== id && inc._id !== incidentNou._id));
        navigate("/istoric-incidente");
      }, 10000);
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la restabilirea incidentului.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sunteți sigur că doriți să ștergeți acest incident?")) return;
    try {
      await apiClient.delete(`/incidente/${id}`);
      setIncidente(prev => prev.filter(inc => inc._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la ștergerea incidentului.");
    }
  };

  const firmaSelectata = firme.find(f => f._id === selectedFirmaId);
  const puncteLucru = firmaSelectata?.profile?.punct_de_lucru || [];

  return (
    <div className="incidente-container">
      <h1>Incidente Active</h1>
      {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

      <div style={{ display: "flex", gap: "10px", flexWrap: 'wrap' }}>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>{showForm ? ' ascunde formular' : '➕ Adaugă incident'}</button>
        <button className="history-btn" style={{backgroundColor: '#6c757d', color: 'white'}} onClick={() => navigate("/istoric-incidente")}>📜 Istoric Incidente</button>
      </div>

      {showForm && (
        <div className="incident-form">
          <div className="form-group">
            <label>Companie</label>
            <select value={selectedFirmaId} onChange={(e) => { setSelectedFirmaId(e.target.value); setSelectedPunct(''); }}>
              <option value="">-- Selectează compania --</option>
              {firme.map(firma => (
                <option key={firma._id} value={firma._id}>
                  {firma.profile?.nume_companie}
                </option>
              ))}
            </select>
          </div>

          {selectedFirmaId && (
            <div className="form-group">
              <label>Punct de lucru</label>
              <select value={selectedPunct} onChange={(e) => setSelectedPunct(e.target.value)} disabled={!puncteLucru.length}>
                <option value="">-- Selectează punctul de lucru --</option>
                {puncteLucru.map((punct, i) => <option key={i} value={punct}>{punct}</option>)}
              </select>
            </div>
          )}

          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Se salvează..." : "💾 Salvează Incident"}
          </button>
        </div>
      )}

      <div className="incidente-list">
        {incidente.filter(inc => !inc.istoric).length > 0 ? (
          incidente.filter(inc => !inc.istoric).map((inc) => {
            const firma = firme.find(f => f._id === inc.companieId);
            return (
              <div key={inc._id} className="incident-card" style={{ backgroundColor: inc.restabilit ? "#d4edda" : "#f8d7da" }}>
                {inc.titlu} - <b>{inc.punctDeLucru}</b> - <b>{firma?.profile?.nume_companie || "Necunoscut"}</b>
                <div style={{ marginTop: "10px", display: 'flex', gap: '10px' }}>
                  {!inc.restabilit && (
                    <button className="restabilire-btn" onClick={() => handleRestabilire(inc._id)}>♻ Restabilire</button>
                  )}
                  <button className="delete-btn" onClick={() => handleDelete(inc._id)} style={{ backgroundColor: "#dc3545", color: "white" }}>🗑️ Șterge</button>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{textAlign: 'center', marginTop: '20px'}}>Nu există incidente active.</p>
        )}
      </div>

      <button className="back-bottom-btn" onClick={() => navigate(-1)}>⬅ Înapoi</button>
    </div>
  );
}