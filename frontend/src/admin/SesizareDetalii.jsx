import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import './SesizareDetalii.css';

export default function SesizareDetalii() {
  const { id } = useParams();
  const [sesizare, setSesizare] = useState(null);
  const [pasiRezolvare, setPasiRezolvare] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSesizare = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get(`/sesizari`); // Preluăm toate
        const gasit = data.find(s => s._id === id); // Căutăm
        if (gasit) {
            const item = {
                id: gasit._id,
                titlu: gasit.titlu,
                descriere: gasit.descriere,
                firma: gasit.createdByBeneficiaryId?.profile?.nume_companie || "N/A",
                status: gasit.status,
                pasi: gasit.pasiRezolvare || "",
                data: new Date(gasit.createdAt).toLocaleDateString('ro-RO'),
                dataFinalizare: gasit.dataFinalizare
            };
            setSesizare(item);
            setPasiRezolvare(item.pasi);
        } else {
            setError("Sesizarea nu a fost găsită.");
        }
      } catch (err) {
        setError("Eroare la preluarea detaliilor sesizării.");
      } finally {
        setLoading(false);
      }
    };
    fetchSesizare();
  }, [id]);

  const handleSave = async () => {
    if (!sesizare) return;
    setLoading(true);
    try {
      await apiClient.patch(`/sesizari/${id}`, { pasiRezolvare });
      alert('Pașii de rezolvare au fost salvați cu succes!');
      navigate("/sesizari");
    } catch (err) {
      alert(`Eroare: ${err.response?.data?.message || "Nu s-au putut salva."}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="detalii-container">
      <h1>Detalii Sesizare #{sesizare.id}</h1>
      <div className="detalii-card">
        <p><strong>Titlu:</strong> {sesizare.titlu}</p>
        <p><strong>Descriere:</strong> {sesizare.descriere}</p>
        <p><strong>Firma:</strong> {sesizare.firma}</p>
        <p><strong>Status:</strong> {sesizare.status}</p>
        <p><strong>Data creare:</strong> {sesizare.data}</p>
        <p><strong>Data finalizare:</strong> {sesizare.dataFinalizare ? new Date(sesizare.dataFinalizare).toLocaleString('ro-RO') : '—'}</p>

        <div className="pasi-rezolvare">
          <label htmlFor="pasi"><strong>Pași de rezolvare:</strong></label>
          <textarea id="pasi" rows="6" value={pasiRezolvare} onChange={(e) => setPasiRezolvare(e.target.value)} placeholder="Introduceți pașii..."></textarea>
        </div>

        <div className="butoane-container">
          <Link to="/sesizari" className="back-btn">Înapoi</Link>
          <button onClick={handleSave} className="save-btn" disabled={loading}>{loading ? 'Se salvează...' : 'Salvează'}</button>
        </div>
      </div>
    </div>
  );
}