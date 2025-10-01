import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import './SolicitariDetalii.css';

// Am redenumit componenta pentru a se potrivi cu importul din App.jsx
export default function SolicitariDetalii({ solicitari, setSolicitari }) {
  const { id } = useParams();
  const [solicitare, setSolicitare] = useState(null);
  const [pasiRezolvare, setPasiRezolvare] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const findSolicitareInProps = () => {
      if (!solicitari) return null;
      for (const key in solicitari) {
        const item = solicitari[key].find(s => s.id === id);
        if (item) return item;
      }
      return null;
    };

    const fetchSolicitare = async () => {
      setLoading(true);
      setError('');
      try {
        // <-- MODIFICARE: Preluăm toate sesizările prin apiClient
        const { data } = await apiClient.get('/sesizari');
        const gasit = data.find(s => s._id === id);
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
          setSolicitare(item);
          setPasiRezolvare(item.pasi);
        } else {
          setError("Solicitarea nu a fost găsită.");
        }
      } catch (err) {
        setError("Eroare la preluarea detaliilor solicitării.");
      } finally {
        setLoading(false);
      }
    };

    const itemFromProps = findSolicitareInProps();
    if (itemFromProps) {
      setSolicitare(itemFromProps);
      setPasiRezolvare(itemFromProps.pasi || '');
      setLoading(false);
    } else {
      fetchSolicitare(); // Caută pe server dacă nu găsește în props
    }
  }, [id, solicitari]);

  const handleSave = async () => {
    if (!solicitare) return;
    setLoading(true);
    try {
      // <-- MODIFICARE: Folosim apiClient pentru a salva
      await apiClient.patch(`/sesizari/${solicitare.id}`, { pasiRezolvare });

      // Actualizăm starea globală (dacă setSolicitari este disponibil)
      if (setSolicitari && solicitare.status) {
          setSolicitari(prev => {
              const updatedSolicitari = { ...prev };
              const index = updatedSolicitari[solicitare.status].findIndex(s => s.id === solicitare.id);
              if (index > -1) {
                updatedSolicitari[solicitare.status][index].pasi = pasiRezolvare;
              }
              return updatedSolicitari;
          });
      }
      
      alert("Pașii de rezolvare au fost salvați!");
      navigate('/solicitari');
    } catch (error) {
      alert("Nu s-au putut salva pașii de rezolvare.");
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă detaliile...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  // Afișăm un mesaj dacă solicitarea nu a fost găsită deloc
  if (!solicitare) {
    return (
      <div className="detalii-container">
        <h1>Solicitare negăsită</h1>
        <Link to="/solicitari" className="back-btn">Înapoi la listă</Link>
      </div>
    );
  }

  return (
    <div className="detalii-container">
      <h1>Detalii Solicitare #{solicitare.id}</h1>
      <div className="detalii-card">
        <p><strong>Titlu:</strong> {solicitare.titlu}</p>
        <p><strong>Descriere:</strong> {solicitare.descriere}</p>
        <p><strong>Firma:</strong> {solicitare.firma}</p>
        <p><strong>Data creare:</strong> {solicitare.data}</p>
        <p><strong>Data finalizare:</strong> {solicitare.dataFinalizare ? new Date(solicitare.dataFinalizare).toLocaleString('ro-RO') : '—'}</p>

        <div className="pasi-rezolvare">
          <label htmlFor="pasi"><strong>Pași de rezolvare:</strong></label>
          <textarea id="pasi" rows="6" value={pasiRezolvare} onChange={(e) => setPasiRezolvare(e.target.value)} placeholder="Introduceți pașii efectuați..."></textarea>
        </div>

        <div className="butoane-container">
          <Link to="/solicitari" className="back-btn">Înapoi</Link>
          <button onClick={handleSave} className="save-btn" disabled={loading}>
            {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
  );
}