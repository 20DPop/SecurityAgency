// Cale: frontend/src/beneficiar/TraseuIstoric.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

export default function TraseuIstoric() {
  const { pontajId } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Verificare seeUpdates
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (currentUser.seeUpdates !== 1) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: '16px'
      }}>
        <h2 style={{ color: '#e74c3c' }}>⚠️ Funcție indisponibilă</h2>
        <p style={{ color: '#666' }}>Această funcție nu este disponibilă momentan.</p>
        <button onClick={() => navigate(-1)} style={{
          padding: '10px 20px', cursor: 'pointer', borderRadius: '6px',
          border: 'none', backgroundColor: '#007bff', color: '#fff'
        }}>
          ⬅ Înapoi
        </button>
      </div>
    );
  }

  useEffect(() => {
    const fetchTraseu = async () => {
      try {
        const { data } = await apiClient.get(`/pontaj/traseu-istoric/${pontajId}`);
        setDate(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Eroare la încărcarea traseului.');
      } finally {
        setLoading(false);
      }
    };
    fetchTraseu();
  }, [pontajId]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', fontSize: '16px' }}>
      Se încarcă traseul...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'red' }}>
      <p>{error}</p>
      <button onClick={() => navigate(-1)} style={{
        marginTop: '16px', padding: '10px 20px', cursor: 'pointer',
        borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: '#fff'
      }}>
        ⬅ Înapoi
      </button>
    </div>
  );

  const oraIntrare = date.oraIntrare
    ? new Date(date.oraIntrare).toLocaleString('ro-RO')
    : 'N/A';
  const oraIesire = date.oraIesire
    ? new Date(date.oraIesire).toLocaleString('ro-RO')
    : 'N/A';

  const durataMs = new Date(date.oraIesire) - new Date(date.oraIntrare);
  const durataOre = Math.floor(durataMs / (1000 * 60 * 60));
  const durataMinute = Math.floor((durataMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div style={{
      maxWidth: '800px', margin: '30px auto',
      padding: '0 20px', fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{
          padding: '8px 14px', backgroundColor: '#6c757d', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
        }}>
          ⬅ Înapoi
        </button>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>
          🗺️ Traseu Tură
        </h1>
      </div>

      {/* Info tură */}
      <div style={{
        background: '#f8f9fa', borderRadius: '10px', padding: '20px',
        marginBottom: '24px', border: '1px solid #eee'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {date.paznic && (
              <tr>
                <td style={{ padding: '8px 0', color: '#666', width: '160px' }}>👤 Paznic:</td>
                <td style={{ fontWeight: 'bold' }}>{date.paznic.nume} {date.paznic.prenume}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>🕐 Check-in:</td>
              <td style={{ fontWeight: 'bold' }}>{oraIntrare}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>🕕 Check-out:</td>
              <td style={{ fontWeight: 'bold' }}>{oraIesire}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>⏱️ Durata:</td>
              <td style={{ fontWeight: 'bold' }}>{durataOre}h {durataMinute}min</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>📍 Puncte GPS:</td>
              <td style={{ fontWeight: 'bold' }}>{date.totalPuncte}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Harta */}
      <p style={{ fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
        Traseul parcurs:
      </p>

      {date.hartaURL ? (
        <img
          src={date.hartaURL}
          alt="Harta traseu paznic"
          style={{
            width: '100%', borderRadius: '10px',
            border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      ) : (
        <div style={{
          padding: '40px', textAlign: 'center',
          backgroundColor: '#ffeaea', borderRadius: '10px', color: '#e74c3c'
        }}>
          ⚠️ Nu există date GPS pentru această tură.
        </div>
      )}

      {date.hartaURL && (
        <p style={{ color: '#999', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
          ⭐ = Punct de start &nbsp;&nbsp;&nbsp; 🔴 = Punct final &nbsp;&nbsp;&nbsp; Linia roșie = traseul parcurs
        </p>
      )}
    </div>
  );
}