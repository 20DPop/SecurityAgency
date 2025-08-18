import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SesizareDetalii.css';

export default function SesizareDetalii({ sesizari, setSesizari }) {
  const { id } = useParams(); // Preia ID-ul din URL
  const [sesizare, setSesizare] = useState(null);
  const [pasiRezolvare, setPasiRezolvare] = useState('');
  const [statusInitial, setStatusInitial] = useState('');

  useEffect(() => {
    let foundSesizare = null;
    let foundStatus = '';

    // Caută sesizarea în toate categoriile
    for (const key in sesizari) {
      const item = sesizari[key].find(s => s.id === parseInt(id));
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
  }, [id, sesizari]);

  const handleSave = () => {
    // Funcție pentru a actualiza starea globală a sesizărilor
    const updatedSesizari = { ...sesizari };
    const sesizareIndex = updatedSesizari[statusInitial].findIndex(s => s.id === parseInt(id));

    if (sesizareIndex > -1) {
      updatedSesizari[statusInitial][sesizareIndex].pasi = pasiRezolvare;
      setSesizari(updatedSesizari);
      alert('Pașii de rezolvare au fost salvați!');
    }
  };

  if (!sesizare) {
    return (
      <div className="detalii-container">
        <h1>Sesizare negăsită</h1>
        <Link to="/sesizari" className="back-btn">Înapoi la listă</Link>
      </div>
    );
  }

  return (
    <div className="detalii-container">
      <h1>Detalii Sesizare #{sesizare.id}</h1>
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
            placeholder="Introduceți pașii efectuați pentru rezolvarea sesizării..."
          ></textarea>
        </div>

        <div className="butoane-container">
          <Link to="/sesizari" className="back-btn">Înapoi</Link>
          <button onClick={handleSave} className="save-btn">Salvare</button>
        </div>
      </div>
    </div>
  );
}