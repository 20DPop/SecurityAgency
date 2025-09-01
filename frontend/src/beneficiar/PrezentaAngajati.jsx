import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PrezentaAngajati.css';

export default function PrezentaAngajati() {
  const [paznici, setPaznici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaznic, setSelectedPaznic] = useState(null);

  const getAuthConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!userInfo || !userInfo.token) throw new Error("Neautentificat!");
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
  };

  useEffect(() => {
    const fetchPaznici = async () => {
      try {
        const config = getAuthConfig();
        const res = await axios.get('http://localhost:3000/api/pontaj/active-by-beneficiar', config);
        setPaznici(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Eroare la preluarea paznicilor.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaznici();
  }, []);

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p>Eroare: {error}</p>;

  return (
    <div className="prezenta-container">
      <h1>Paznici activi</h1>
      <table className="prezenta-table">
        <thead>
          <tr>
            <th>Nume</th>
            <th>Prenume</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {paznici.length > 0 ? (
            paznici.map(p => (
              <tr key={p._id}>
                <td>{p.nume}</td>
                <td>{p.prenume}</td>
                <td>
                  <button onClick={() => setSelectedPaznic(p)}>Urmărește</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>Nu există paznici activi.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedPaznic && (
        <div className="map-container">
          <h2>Urmărire în timp real: {selectedPaznic.nume} {selectedPaznic.prenume}</h2>
          <iframe
            title="Harta Paznic"
            width="100%"
            height="400"
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${selectedPaznic.locationHistory.slice(-1)[0]?.latitude || 0},${selectedPaznic.locationHistory.slice(-1)[0]?.longitude || 0}`}
          />
          <button onClick={() => setSelectedPaznic(null)}>Închide harta</button>
        </div>
      )}
    </div>
  );
}
