import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SolicitariDetalii.css';

export default function SolicitariDetalii({ solicitari, setSolicitari }) {
  const { id } = useParams(); // Preia ID-ul din URL
  const [sesizare, setSesizare] = useState(null);
  const [pasiRezolvare, setPasiRezolvare] = useState('');
  const [statusInitial, setStatusInitial] = useState('');

  useEffect(() => {
    let foundSesizare = null;
    let foundStatus = '';

    // Caută sesizarea în toate categoriile
    for (const key in solicitari) {
      const item = solicitari[key].find(s => s.id === parseInt(id));
      if (item) {
        foundSesizare = item;
        foundStatus = key;
        break;
      }
    }

    if (foundSesizare) {
      setSesizare(foundSesizare);
      setPasiRezolvare(foundSesizare.pasi || ''); // Inițializează cu pașii existenți
      setStatusInitial(foundStatus); // Salvează statusul inițial
    }
  }, [id, solicitari]);

  const handleSave = () => {
    // Funcție pentru a actualiza starea globală a sesizărilor
    const updatedsolicitari = { ...solicitari };
    const sesizareIndex = updatedsolicitari[statusInitial].findIndex(s => s.id === parseInt(id));

    if (sesizareIndex > -1) {
      updatedsolicitari[statusInitial][sesizareIndex].pasi = pasiRezolvare;
      setSolicitari(updatedsolicitari);
      alert('Pașii de rezolvare au fost salvați!');
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
      <h1>Detalii Solicitare #{sesizare.id}</h1>
      <div className="detalii-card">
        <p><strong>Titlu:</strong> {sesizare.titlu}</p>
        <p><strong>Descriere:</strong> {sesizare.descriere}</p>
        <p><strong>Firma:</strong> {sesizare.firma}</p>
        <p><strong>Data creare:</strong> {sesizare.data}</p>
        <p><strong>Data finalizare:</strong> {statusInitial === 'rezolvata' ? sesizare.dataFinalizare : '—'}</p>

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