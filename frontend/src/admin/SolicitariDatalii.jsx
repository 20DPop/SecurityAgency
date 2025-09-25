import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './SolicitariDetalii.css';

export default function SolicitariDetalii({ solicitari, setSolicitari }) {
  const { id } = useParams();
  const [sesizare, setSesizare] = useState(null);
  const [pasiRezolvare, setPasiRezolvare] = useState('');
  const [statusInitial, setStatusInitial] = useState('');

useEffect(() => {
  let foundSesizare = null;
  let foundStatus = '';

  for (const key in solicitari) {
    const item = solicitari[key].find(s => s.id === id || s._id === id);
    if (item) {
      foundSesizare = item;
      foundStatus = key;
      break;
    }
  }

  if (foundSesizare) {
    setSesizare(foundSesizare);
    setPasiRezolvare(foundSesizare.pasi || '');
    setStatusInitial(foundStatus);
  } else {
    // Dacă nu găsește în state, ia direct de la backend
    axios.get(`http://localhost:3000/api/sesizari`)
      .then(res => {
        const toate = res.data.map(s => ({
          id: s._id,
          titlu: s.titlu,
          descriere: s.descriere,
          firma: s.createdByBeneficiaryId?.profile?.nume_companie || "—",
          status: s.status,
          pasi: s.pasiRezolvare || "",
          data: s.createdAt ? s.createdAt.slice(0,10) : "—",
          dataFinalizare: s.dataFinalizare
        }));

        const ses = toate.find(s => s.id === id);
        if (ses) {
          setSesizare(ses);
          setPasiRezolvare(ses.pasi || '');
          setStatusInitial(ses.status);
        }
      })
      .catch(err => console.error(err));
  }
}, [id, solicitari]);


  const handleSave = async () => {
    if (!sesizare) return;

    try {
      await axios.patch(`http://localhost:3000/api/sesizari/${sesizare.id || sesizare._id}`, {
        pasiRezolvare
      });

      const updatedsolicitari = { ...solicitari };
      const index = updatedsolicitari[statusInitial].findIndex(s => s.id === sesizare.id || s._id === sesizare._id);
      if (index > -1) {
        updatedsolicitari[statusInitial][index].pasi = pasiRezolvare;
        setSolicitari(updatedsolicitari);
      }

      alert("Pașii de rezolvare au fost salvați!");
    } catch (error) {
      console.error(error);
      alert("Nu s-au putut salva pașii de rezolvare.");
    }
  };

  if (!sesizare) {
    return (
      <div className="detalii-container">
        <h1>Solicitare negăsită</h1>
        <Link to="/solicitari" className="back-btn">Înapoi la listă</Link>
      </div>
    );
  }

  return (
    <div className="detalii-container">
      <h1>Detalii Solicitare #{sesizare.id || sesizare._id}</h1>
      <div className="detalii-card">
        <p><strong>Titlu:</strong> {sesizare.titlu}</p>
        <p><strong>Descriere:</strong> {sesizare.descriere}</p>
        <p><strong>Firma:</strong> {sesizare.firma}</p>
        <p><strong>Data creare:</strong> {sesizare.data}</p>
        <p><strong>Data finalizare:</strong> {sesizare.dataFinalizare
          ? new Date(sesizare.dataFinalizare).toLocaleString('ro-RO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '—'}
        </p>

        <div className="pasi-rezolvare">
          <label htmlFor="pasi"><strong>Pași de rezolvare:</strong></label>
          <textarea
            id="pasi"
            rows="6"
            value={pasiRezolvare}
            onChange={(e) => setPasiRezolvare(e.target.value)}
            placeholder="Introduceți pașii efectuați pentru rezolvarea solicitarii..."
          ></textarea>
        </div>

        <div className="butoane-container">
          <Link to="/solicitari" className="back-btn">Înapoi</Link>
          <button onClick={handleSave} className="save-btn">Salvare</button>
        </div>
      </div>
    </div>
  );
}
